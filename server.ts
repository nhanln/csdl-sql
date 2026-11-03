import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

app.use(express.json());

// Khởi tạo Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint kiểm tra trạng thái
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Hàm trợ giúp gọi Gemini với cơ chế Retry khi gặp lỗi tạm thời (503/429) và Timeout 12s
async function callGeminiWithRetry(prompt: string, systemInstruction: string, retries = 1): Promise<string> {
  if (!aiClient) {
    throw new Error('NO_API_KEY');
  }

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 12000)
      );

      const generatePromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { systemInstruction },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      return response.text || '';
    } catch (err: any) {
      const isTransient = err?.message?.includes('503') || 
                          err?.message?.includes('UNAVAILABLE') || 
                          err?.message?.includes('429') ||
                          err?.message?.includes('TIMEOUT');
      if (attempt <= retries && isTransient) {
        console.warn(`[Gemini API] Lỗi tạm thời (lần ${attempt}), đang thử lại sau 1s...`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      throw err;
    }
  }
  return '';
}

// 1. API Giải thích câu lệnh SQL chi tiết
app.post('/api/gemini/explain', async (req, res) => {
  try {
    const { sql, schemaInfo, context } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'Cần cung cấp câu lệnh SQL.' });
    }

    if (!aiClient) {
      return res.json({
        explanation: `### Phân tích câu lệnh SQL (Chế độ ngoại tuyến)\n\n\`\`\`sql\n${sql}\n\`\`\`\n\n**Thứ tự xử lý logic của RDBMS:**\n1. **FROM / JOIN**: Đọc các bảng và kết nối dữ liệu\n2. **WHERE**: Lọc các dòng thỏa mãn điều kiện\n3. **GROUP BY**: Gom nhóm dữ liệu\n4. **HAVING**: Lọc các nhóm\n5. **SELECT**: Trích xuất các cột cần lấy\n6. **ORDER BY**: Sắp xếp kết quả\n7. **LIMIT**: Giới hạn số lượng dòng hiển thị`
      });
    }

    const prompt = `Bạn là một Giáo sư Cơ sở Dữ liệu & Senior Database Architect hàng đầu.
Nhiệm vụ của bạn là giải thích câu lệnh SQL sau cho học viên bằng tiếng Việt một cách trực quan, dễ hiểu và chuẩn mực sư phạm:

CÂU LỆNH SQL:
\`\`\`sql
${sql}
\`\`\`

${schemaInfo ? `THÔNG TIN LƯỢC ĐỒ BẢNG (SCHEMA):\n${schemaInfo}\n` : ''}
${context ? `NGỮ CẢNH / BÀI HỌC:\n${context}\n` : ''}

YÊU CẦU ĐẦU RA:
1. **Mục đích tổng quan**: Tóm tắt trong 1-2 câu câu lệnh này làm gì, dữ liệu trả về là gì.
2. **Thứ tự thực thi logic (Logical Query Processing Order)**: Giải thích quy trình xử lý của RDBMS (FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT).
3. **Giải thích từng mệnh đề/thành phần**: Đi sâu vào các bảng liên quan, điều kiện lọc, biểu thức tổng hợp hoặc các hàm đặc biệt.
4. **Đánh giá hiệu năng & Lưu ý thực tế (Index, Performance)**: Có dùng Full Table Scan không, cần index nào, lưu ý gì trong môi trường Production.

Hãy định dạng kết quả bằng Markdown đẹp mắt, có bullet points và code blocks rõ ràng.`;

    try {
      const text = await callGeminiWithRetry(prompt, 'Bạn là chuyên gia sư phạm SQL nhiệt tình, giải thích bằng tiếng Việt thân thiện, chuẩn xác kỹ thuật.');
      return res.json({ explanation: text });
    } catch (aiErr: any) {
      // Fallback sư phạm thông minh nếu API bận đột xuất
      console.warn('[Gemini Explain Fallback]', aiErr?.message);
      return res.json({
        explanation: `### Phân tích câu lệnh SQL\n\n\`\`\`sql\n${sql}\n\`\`\`\n\n**1. Mục đích câu lệnh:**\nCâu lệnh thực hiện trích xuất dữ liệu từ các bảng trong cơ sở dữ liệu dựa trên các điều kiện lọc và sắp xếp được khai báo.\n\n**2. Thứ tự thực thi logic (Logical Execution Order):**\n- **FROM / JOIN**: Xác định nguồn bảng dữ liệu cần lấy.\n- **WHERE**: Lọc bản ghi đơn lẻ thoả điều kiện trước khi gom nhóm.\n- **SELECT**: Lấy các cột dữ liệu theo danh sách khai báo.\n- **ORDER BY**: Sắp xếp kết quả trả về theo thứ tự mong muốn.\n- **LIMIT**: Cắt lấy số lượng bản ghi chỉ định.\n\n*Hệ thống Gemini AI đang bận tạm thời, phân tích tự động đã được kích hoạt.*`
      });
    }
  } catch (error: any) {
    console.error('Error in /api/gemini/explain:', error);
    return res.status(500).json({
      error: 'Không thể giải thích câu lệnh SQL vào lúc này.',
      details: error?.message || String(error),
    });
  }
});

// 2. API Chẩn đoán lỗi cú pháp và logic SQL
app.post('/api/gemini/diagnose', async (req, res) => {
  try {
    const { sql, error: sqlError, schemaInfo, challengePrompt } = req.body;
    if (!sql || !sqlError) {
      return res.status(400).json({ error: 'Cần cung cấp câu lệnh SQL và thông báo lỗi.' });
    }

    if (!aiClient) {
      return res.json({
        diagnosis: `### Phát hiện lỗi SQL:\n\n**Lỗi từ SQLite WASM:** \`${sqlError}\`\n\n**Gợi ý kiểm tra nhanh:**\n- Kiểm tra tên cột hoặc bảng có gõ sai chính tả không.\n- Kiểm tra dấu phẩy thừa/thiếu giữa các cột trong mệnh đề SELECT.\n- Kiểm tra ngoặc đóng/mở \`()\` hoặc dấu nháy đơn \`'...\` trong chuỗi ký tự.\n- Trong SQLite, chuỗi ký tự dùng nháy đơn \`'text'\`, tên cột có thể dùng ngoặc vuông hoặc nháy kép.`
      });
    }

    const prompt = `Bạn là một Trợ giảng SQL thông minh. Học viên đang gặp lỗi khi chạy truy vấn trên SQLite.
Hãy chẩn đoán lỗi, giải thích nguyên nhân và hướng dẫn học viên sửa lỗi một cách sư phạm.

CÂU TRUY VẤN CỦA HỌC VIÊN:
\`\`\`sql
${sql}
\`\`\`

THÔNG BÁO LỖI HỆ THỐNG TRẢ VỀ:
\`\`\`
${sqlError}
\`\`\`

${challengePrompt ? `ĐỀ BÀI ĐANG THỰC HIỆN:\n${challengePrompt}\n` : ''}
${schemaInfo ? `THÔNG TIN BẢNG DỮ LIỆU:\n${schemaInfo}\n` : ''}

YÊU CẦU ĐẦU RA:
1. **Vị trí & Loại lỗi**: Lỗi cú pháp (Syntax error), lỗi tên bảng/cột không tồn tại (No such column/table), hay lỗi ràng buộc/hàm?
2. **Nguyên nhân cốt lõi**: Giải thích bằng ngôn ngữ dễ hiểu tại sao máy tính không hiểu câu lệnh này.
3. **Cách khắc phục**: Hướng dẫn cụ thể kèm đoạn mã sửa lại chuẩn xác.`;

    try {
      const text = await callGeminiWithRetry(prompt, 'Bạn là trợ giảng lập trình SQLite tận tâm, chỉ dẫn rõ ràng, ấm áp và dễ hiểu.');
      return res.json({ diagnosis: text });
    } catch (aiErr: any) {
      return res.json({
        diagnosis: `### Chẩn đoán lỗi: \`${sqlError}\`\n\n**Nguyên nhân thường gặp:**\n- Kiểm tra chính tả tên bảng và cột (phân biệt dấu gạch dưới \`_\` và chữ hoa/thường).\n- Kiểm tra các dấu phẩy phân cách giữa các trường trong \`SELECT\`.\n- Nếu lỗi liên quan đến \`GROUP BY\`, đảm bảo các cột không nằm trong hàm tổng hợp phải được khai báo trong \`GROUP BY\`.\n- Dấu chuỗi ký tự phải là nháy đơn: \`'Giá trị'\`.`
      });
    }
  } catch (error: any) {
    console.error('Error in /api/gemini/diagnose:', error);
    return res.status(500).json({
      error: 'Không thể chẩn đoán lỗi lúc này.',
      details: error?.message || String(error),
    });
  }
});

// 3. API Gợi ý hướng tư duy theo 3 cấp độ (Socratic Tutoring Hints)
app.post('/api/gemini/hint', async (req, res) => {
  try {
    const { level = 1, challengeTitle, challengePrompt, userSql, schemaInfo } = req.body;

    const defaultHints = [
      '💡 Gợi ý cấp độ 1: Xác định bảng dữ liệu chính cần truy vấn và điều kiện lọc ban đầu với mệnh đề WHERE.',
      '🔍 Gợi ý cấp độ 2: Bạn cần kết nối các bảng bằng INNER JOIN hoặc LEFT JOIN dựa trên khoá ngoại, sau đó sử dụng GROUP BY nếu cần tính tổng hợp.',
      '🚀 Gợi ý cấp độ 3: Khung câu lệnh tham khảo: `SELECT cot_1, COUNT(*) FROM bang_a JOIN bang_b ON bang_a.id = bang_b.a_id WHERE dieu_kien GROUP BY cot_1 ORDER BY ...;`'
    ];

    if (!aiClient) {
      return res.json({
        hint: defaultHints[Math.min(Math.max(Number(level) - 1, 0), 2)]
      });
    }

    const levelDescriptions = {
      1: 'Cấp độ 1 (Tư duy khái quát): Đặt câu hỏi kích thích suy nghĩ, chỉ ra bảng nào cần dùng và luồng dữ liệu chính. TUYỆT ĐỐI KHÔNG đưa ra code hoàn chỉnh.',
      2: 'Cấp độ 2 (Mệnh đề & Hàm then chốt): Chỉ ra cụ thể các từ khóa SQL cần sử dụng (ví dụ: LEFT JOIN, GROUP BY, HAVING, AVG, COALESCE) và điều kiện nối bảng.',
      3: 'Cấp độ 3 (Khung Pseudo-SQL): Cung cấp khung sườn truy vấn mẫu (skeleton/pseudo-code) có chỗ trống điền vào để học viên tự hoàn thiện nốt.',
    };

    const targetDesc = levelDescriptions[level as 1 | 2 | 3] || levelDescriptions[1];

    const prompt = `Bạn là Trợ lý Giáo dục SQL theo phương pháp Socratic.
Học viên đang làm bài tập SQL và yêu cầu gợi ý:

BÀI TẬP: "${challengeTitle}"
YÊU CẦU ĐỀ BÀI:
${challengePrompt}

CÂU LỆNH HIỆN TẠI CỦA HỌC VIÊN:
\`\`\`sql
${userSql || '(Học viên chưa viết gì)'}
\`\`\`

LƯỢC ĐỒ CƠ SỞ DỮ LIỆU:
${schemaInfo}

CẤP ĐỘ GỢI Ý YÊU CẦU: ${targetDesc}

Hãy trả về gợi ý ngắn gọn, súc tích (dưới 150 từ), truyền cảm hứng và giúp người học tự khám phá kiến thức.`;

    try {
      const text = await callGeminiWithRetry(prompt, 'Bạn là chuyên gia sư phạm khích lệ tư duy giải quyết vấn đề của học viên.');
      return res.json({ hint: text });
    } catch (aiErr: any) {
      return res.json({
        hint: defaultHints[Math.min(Math.max(Number(level) - 1, 0), 2)]
      });
    }
  } catch (error: any) {
    console.error('Error in /api/gemini/hint:', error);
    return res.status(500).json({
      error: 'Không thể tạo gợi ý lúc này.',
      details: error?.message || String(error),
    });
  }
});

// 4. API AI SQL Mentor Chat (Hỏi đáp kiến thức tự do)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, schemaInfo, currentSql } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages phải là một mảng.' });
    }

    if (!aiClient) {
      return res.json({
        reply: 'Chào bạn! Mình là AI SQL Mentor. Chế độ ngoại tuyến hiện đang hoạt động. Bạn có thể hỏi về các cú pháp SQL căn bản hoặc cấu hình API Key để trò chuyện trực tiếp cùng Gemini AI!'
      });
    }

    const systemPrompt = `Bạn là "SQL Master Mentor" - một chuyên gia Cơ sở dữ liệu và Giảng viên SQL hàng đầu tại Việt Nam.
Tính cách của bạn: Nhiệt tình, thân thiện, giải thích cực kỳ mạch lạc bằng tiếng Việt, kèm ví dụ SQLite trực quan.
Bạn nắm vững từ cơ bản (SELECT, WHERE, JOIN, GROUP BY) đến nâng cao (Window Functions, CTE, Recursive CTE, B-Tree Indexes, ACID, Query Execution Plans, Query Optimization).

${schemaInfo ? `THÔNG TIN CƠ SỞ DỮ LIỆU HIỆN TẠI TRONG ỨNG DỤNG:\n${schemaInfo}\n` : ''}
${currentSql ? `CÂU SQL ĐANG MỞ TRONG EDITOR:\n\`\`\`sql\n${currentSql}\n\`\`\`\n` : ''}

Hãy trả lời súc tích, định dạng markdown đẹp mắt, dùng bảng hoặc code snippet khi cần.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({ reply: response.text });
    } catch (aiErr: any) {
      console.warn('[Gemini Chat Fallback]', aiErr?.message);
      return res.json({
        reply: 'Chào bạn! Mình là AI SQL Mentor. Hệ thống AI đang có lượng truy cập tăng vọt. Trong lúc chờ, bạn có thể thực hành các bài tập trong lộ trình hoặc tra cứu bảng cú pháp trong mục **Tra cứu** phía trên thanh công cụ nhé!'
      });
    }
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({
      error: 'Lỗi khi trò chuyện cùng AI Mentor.',
      details: error?.message || String(error),
    });
  }
});

// Khởi chạy Server kết hợp Vite middleware
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SQL Master Server] Running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
