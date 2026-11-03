import React, { useState } from 'react';
import { X, Code, Globe, FileText, Check, Copy, ExternalLink, Cpu } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cdn' | 'standalone' | 'hosting'>('cdn');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const standaloneHtmlCode = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>SQL Learning Sandbox - SQLite WASM</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- sql.js (SQLite WebAssembly) CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-5xl mx-auto space-y-4">
    <header class="flex justify-between items-center border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-xl font-bold text-sky-400">SQL Learning Sandbox (Client-side WASM)</h1>
        <p class="text-xs text-slate-400">Thực thi SQLite trực tiếp trong trình duyệt bằng WebAssembly</p>
      </div>
      <span id="db-status" class="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950 text-amber-300">
        Đang nạp WASM...
      </span>
    </header>

    <!-- SQL Editor -->
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <label class="text-xs font-semibold text-slate-300">Nhập câu lệnh SQL:</label>
        <button id="run-btn" class="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">
          Chạy truy vấn (Ctrl + Enter)
        </button>
      </div>
      <textarea id="sql-input" rows="5" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-sm text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500">
SELECT hs.ho_ten, lh.ten_lop, ds.mon_hoc, ds.diem
FROM HocSinh hs
JOIN LopHoc lh ON hs.lop_id = lh.id
JOIN DiemSo ds ON hs.id = ds.hoc_sinh_id
WHERE ds.diem >= 8.5
ORDER BY ds.diem DESC;
      </textarea>
    </div>

    <!-- Results Table -->
    <div class="border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
      <div class="p-2.5 bg-slate-850 text-xs font-semibold border-b border-slate-800 text-slate-300 flex justify-between">
        <span>Kết quả truy vấn</span>
        <span id="result-stats" class="text-slate-400 font-mono text-[11px]"></span>
      </div>
      <div id="output-container" class="p-3 overflow-x-auto text-xs">
        <p class="text-slate-500">Nhấn nút "Chạy truy vấn" để xem kết quả.</p>
      </div>
    </div>
  </div>

  <script>
    let db = null;

    // 1. Khởi tạo sql.js và định vị file WASM
    async function initDatabase() {
      const statusEl = document.getElementById('db-status');
      try {
        const SQL = await initSqlJs({
          // Cung cấp đường dẫn đến file sql-wasm.wasm trên CDN
          locateFile: file => \`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/\${file}\`
        });

        // 2. Tạo CSDL SQLite trong bộ nhớ
        db = new SQL.Database();

        // 3. Nạp dữ liệu mẫu Quản lý Trường học
        db.run(\`
          CREATE TABLE LopHoc (id INTEGER PRIMARY KEY, ten_lop TEXT, gvcn TEXT);
          INSERT INTO LopHoc VALUES (1, '10A1', 'Thầy Toàn'), (2, '10A2', 'Cô Hương');

          CREATE TABLE HocSinh (id INTEGER PRIMARY KEY, ho_ten TEXT, lop_id INTEGER);
          INSERT INTO HocSinh VALUES (1, 'Nguyễn An', 1), (2, 'Trần Bình', 1), (3, 'Lê Cường', 2);

          CREATE TABLE DiemSo (id INTEGER PRIMARY KEY, hoc_sinh_id INTEGER, mon_hoc TEXT, diem REAL);
          INSERT INTO DiemSo VALUES (1, 1, 'Toán', 9.5), (2, 2, 'Toán', 8.5), (3, 3, 'Toán', 7.0);
        \`);

        statusEl.className = 'px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300';
        statusEl.innerText = 'SQLite WASM: Sẵn sàng';
      } catch (err) {
        statusEl.className = 'px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950 text-rose-300';
        statusEl.innerText = 'Lỗi nạp WASM: ' + err.message;
      }
    }

    // 4. Xử lý thực thi câu truy vấn
    function executeSql() {
      if (!db) return;
      const sql = document.getElementById('sql-input').value;
      const container = document.getElementById('output-container');
      const stats = document.getElementById('result-stats');

      try {
        const start = performance.now();
        const results = db.exec(sql);
        const duration = (performance.now() - start).toFixed(1);

        if (results.length === 0) {
          container.innerHTML = '<p class="text-amber-400">Câu lệnh chạy thành công (Không trả về dòng dữ liệu nào).</p>';
          stats.innerText = duration + ' ms';
          return;
        }

        const { columns, values } = results[0];
        stats.innerText = \`\${values.length} dòng (\${duration} ms)\`;

        let html = '<table class="w-full text-left font-mono border-collapse">';
        html += '<thead class="bg-slate-800 text-sky-300"><tr>' + columns.map(c => \`<th class="p-2 border-b border-slate-700">\${c}</th>\`).join('') + '</tr></thead><tbody>';
        html += values.map(row => '<tr class="hover:bg-slate-800/50 border-b border-slate-800">' + row.map(v => \`<td class="p-2">\${v}</td>\`).join('') + '</tr>').join('');
        html += '</tbody></table>';

        container.innerHTML = html;
      } catch (err) {
        container.innerHTML = \`<div class="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded font-mono">Lỗi: \${err.message}</div>\`;
      }
    }

    document.getElementById('run-btn').addEventListener('click', executeSql);
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') executeSql();
    });

    initDatabase();
  </script>
</body>
</html>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Hướng Dẫn Triển Khai & Nhúng SQLite WASM</h2>
              <p className="text-xs text-slate-400">Cách nhúng sql.js qua CDN và cấu hình hosting tĩnh trơn tru</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800 bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveTab('cdn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'cdn'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>1. Cơ chế sql.js WASM & CDN</span>
          </button>

          <button
            onClick={() => setActiveTab('standalone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'standalone'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. File index.html độc lập (Single Page)</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. Triển khai Vercel & GitHub Pages</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-slate-200">
          
          {/* TAB 1: CDN & WASM MECHANISM */}
          {activeTab === 'cdn' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-lg text-xs leading-relaxed space-y-2">
                <h4 className="font-bold text-sky-300 text-sm">💡 Nguyên lý hoạt động của SQLite WebAssembly (`sql.js`)</h4>
                <p className="text-slate-300">
                  `sql.js` là bản biên dịch mã nguồn C của SQLite 3 sang WebAssembly (WASM).
                  Để chạy được trong trình duyệt, ứng dụng cần 2 thành phần:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300 font-mono">
                  <li><b>sql-wasm.js</b>: File JavaScript wrapper cung cấp API (Database, exec, run).</li>
                  <li><b>sql-wasm.wasm</b>: File nhị phân WebAssembly chứa toàn bộ nhân SQLite engine.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấu hình `locateFile` chuẩn xác:</h4>
                <div className="relative">
                  <pre className="text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto text-sky-300">
{`import initSqlJs from 'sql.js';

const SQL = await initSqlJs({
  // Bắt buộc cấu hình locateFile để trình duyệt tải đúng file .wasm
  locateFile: (file) => {
    // 1. Chạy qua CDN cdnjs (ổn định, không cần bundle):
    return \`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/\${file}\`;
    
    // Hoặc 2. Đặt file sql-wasm.wasm trong thư mục public/:
    // return \`/\${file}\`;
  }
});

// Khởi tạo Database trong RAM
const db = new SQL.Database();`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`import initSqlJs from 'sql.js';\n\nconst SQL = await initSqlJs({\n  locateFile: (file) => \`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/\${file}\`\n});\nconst db = new SQL.Database();`, 'cdn-js')}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
                  >
                    {copiedCode === 'cdn-js' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'cdn-js' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE SINGLE-FILE HTML */}
          {activeTab === 'standalone' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Mã nguồn `index.html` hoàn chỉnh (Ready to run):</h4>
                  <p className="text-[11px] text-slate-400">Copy toàn bộ mã này vào file `index.html` và mở trực tiếp bằng trình duyệt</p>
                </div>
                <button
                  onClick={() => copyToClipboard(standaloneHtmlCode, 'standalone-html')}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedCode === 'standalone-html' ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'standalone-html' ? 'Đã sao chép!' : 'Sao chép toàn bộ HTML'}</span>
                </button>
              </div>

              <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                  {standaloneHtmlCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: DEPLOYMENT GUIDE */}
          {activeTab === 'hosting' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Vercel */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 text-sm">Deploy lên Vercel</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Khuyên dùng</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
                    <li>Đẩy mã nguồn lên kho lưu trữ GitHub của bạn.</li>
                    <li>Đăng nhập <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">Vercel.com</a> và chọn <b>Import Repository</b>.</li>
                    <li>Vercel tự động nhận diện Vite/React:
                      <div className="bg-slate-900 p-2 rounded font-mono text-[11px] mt-1 text-slate-400">
                        Build Command: npm run build<br />
                        Output Directory: dist
                      </div>
                    </li>
                    <li>Nhập biến môi trường (nếu dùng AI Gemini): <code className="text-sky-300">GEMINI_API_KEY</code>.</li>
                    <li>Bấm <b>Deploy</b> — Trang web hoạt động với HTTPS và CDN toàn cầu.</li>
                  </ol>
                </div>

                {/* Render.com */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 text-sm">Deploy lên Render.com (Web Service / Blueprint)</span>
                      <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded font-mono">Đã có render.yaml</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Miễn phí Cloud</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
                    <li>Đẩy code lên GitHub. Vào <a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">dashboard.render.com</a> chọn <b>New +</b> ➔ <b>Web Service</b> (hoặc <b>Blueprint</b>).</li>
                    <li>Liên kết repository GitHub của dự án.</li>
                    <li>Cấu hình thông số Web Service:
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded font-mono text-[11px] mt-1 text-slate-400">
                        <div>Runtime: <span className="text-sky-300">Node</span></div>
                        <div>Region: <span className="text-sky-300">Singapore</span></div>
                        <div>Build Command: <span className="text-emerald-300">npm install && npm run build</span></div>
                        <div>Start Command: <span className="text-emerald-300">npm start</span></div>
                      </div>
                    </li>
                    <li>Mục <b>Environment Variables</b>: Thêm <code className="text-sky-300">NODE_ENV=production</code> và <code className="text-sky-300">GEMINI_API_KEY</code>.</li>
                    <li>Nhấn <b>Create Web Service</b> — Render tự động build và cấp domain miễn phí (dạng <code className="text-amber-300">*.onrender.com</code>).</li>
                  </ol>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
