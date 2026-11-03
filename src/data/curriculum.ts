/**
 * SQL Master Curriculum - Lộ trình 4 Tuần (8 Buổi)
 * Chủ đề CSDL: Quản lý Trường học (HocSinh, LopHoc, DiemSo)
 */

export interface Challenge {
  id: string;
  week: number;
  session: number;
  weekTitle: string;
  sessionTitle: string;
  title: string;
  difficulty: 'Căn bản' | 'Trung bình' | 'Nâng cao';
  xp: number;
  timeEstimate: string;
  tags: string[];
  theory: string;
  task: string;
  initialSql: string;
  solutionSql: string;
  expectedColumns: string[];
  expectedPreview: any[][];
  tips: string[];
}

export interface WeekPlan {
  week: number;
  title: string;
  description: string;
  sessions: number[];
}

export const WEEKS_DATA: WeekPlan[] = [
  {
    week: 1,
    title: 'Tuần 1: Nhập môn & Lọc Dữ liệu Căn bản',
    description: 'Làm quen cú pháp SELECT, FROM và mệnh đề WHERE kết hợp toán tử logic',
    sessions: [1, 2],
  },
  {
    week: 2,
    title: 'Tuần 2: Sắp xếp, Giới hạn & Tính toán Tổng hợp',
    description: 'Thành thạo ORDER BY, LIMIT, DISTINCT và các hàm COUNT, AVG, SUM, MIN, MAX',
    sessions: [3, 4],
  },
  {
    week: 3,
    title: 'Tuần 3: Thống kê Nhóm & Kết nối Bảng (JOINs)',
    description: 'Gom nhóm với GROUP BY, lọc nhóm với HAVING và ghép nối INNER JOIN, LEFT JOIN',
    sessions: [5, 6],
  },
  {
    week: 4,
    title: 'Tuần 4: Kỹ thuật Nâng cao (Subqueries, CTE & Window Functions)',
    description: 'Truy vấn con lồng nhau, rẽ nhánh CASE WHEN, bảng tạm CTE và hàm xếp hạng',
    sessions: [7, 8],
  },
];

export const CHALLENGES: Challenge[] = [
  // =================== TUẦN 1 ===================
  {
    id: 't1-b1-select-all',
    week: 1,
    session: 1,
    weekTitle: 'Tuần 1: Nhập môn & Lọc Dữ liệu',
    sessionTitle: 'Buổi 1: Cú pháp SELECT & FROM',
    title: 'Buổi 1: Khám phá toàn bộ danh sách Học sinh',
    difficulty: 'Căn bản',
    xp: 50,
    timeEstimate: '5 phút',
    tags: ['SELECT', 'FROM', 'Syntax'],
    theory: `### 1. Mệnh đề SELECT & FROM

Trong SQL, câu lệnh \`SELECT\` là bước khởi đầu dùng để đọc và trích xuất dữ liệu từ các bảng trong cơ sở dữ liệu.

**Cú pháp tổng quát:**
\`\`\`sql
SELECT cot_1, cot_2 FROM ten_bang;
-- Hoặc lấy tất cả các cột bằng ký tự hoa thị (*):
SELECT * FROM ten_bang;
\`\`\`

> 💡 **Quy tắc vàng:** Tên bảng và tên cột trong SQLite không phân biệt chữ hoa/thường, nhưng để code chuyên nghiệp và dễ đọc, các từ khóa SQL (\`SELECT\`, \`FROM\`, \`WHERE\`) nên được viết hoa.`,
    task: 'Hãy viết câu lệnh SQL để lấy **tất cả các cột** của toàn bộ học sinh trong bảng `HocSinh`.',
    initialSql: '-- Viết câu truy vấn lấy toàn bộ học sinh tại đây\nSELECT * FROM ...;',
    solutionSql: 'SELECT * FROM HocSinh;',
    expectedColumns: ['id', 'ho_ten', 'gioi_tinh', 'ngay_sinh', 'que_quan', 'lop_id'],
    expectedPreview: [
      [1, 'Nguyễn An Khang', 'Nam', '2008-03-15', 'Hà Nội', 1],
      [2, 'Trần Bảo Ngọc', 'Nữ', '2008-07-22', 'Hà Nội', 1],
      [3, 'Lê Quốc Cường', 'Nam', '2008-11-05', 'Hải Phòng', 1],
      [4, 'Phạm Diệu Linh', 'Nữ', '2008-01-30', 'Nam Định', 2],
    ],
    tips: [
      'Dùng ký tự hoa thị (*) để chọn tất cả các cột.',
      'Tên bảng cần truy vấn là `HocSinh` (không có dấu cách).',
    ],
  },
  {
    id: 't1-b2-where-filter',
    week: 1,
    session: 2,
    weekTitle: 'Tuần 1: Nhập môn & Lọc Dữ liệu',
    sessionTitle: 'Buổi 2: Mệnh đề WHERE & Toán tử logic',
    title: 'Buổi 2: Lọc học sinh Nữ ở Hà Nội hoặc Nam Định',
    difficulty: 'Căn bản',
    xp: 60,
    timeEstimate: '7 phút',
    tags: ['WHERE', 'AND', 'OR', 'IN'],
    theory: `### 2. Mệnh đề WHERE & Các toán tử so sánh

Mệnh đề \`WHERE\` được dùng để lọc ra những dòng bản ghi thỏa mãn điều kiện mong muốn.

**Toán tử thông dụng:**
- \`=\` : Bằng giá trị
- \`!=\` hoặc \`<>\` : Khác giá trị
- \`AND\` : Cả hai điều kiện đều phải đúng
- \`OR\` : Chỉ cần một trong hai điều kiện đúng
- \`IN ('A', 'B')\` : Giá trị nằm trong danh sách chỉ định

\`\`\`sql
SELECT ho_ten, gioi_tinh, que_quan
FROM HocSinh
WHERE gioi_tinh = 'Nữ' AND que_quan = 'Hà Nội';
\`\`\``,
    task: 'Truy xuất các cột \`ho_ten\`, \`gioi_tinh\`, \`ngay_sinh\`, \`que_quan\` của các học sinh có giới tính là **"Nữ"** VÀ quê quán tại **"Hà Nội"**.',
    initialSql: 'SELECT ho_ten, gioi_tinh, ngay_sinh, que_quan\nFROM HocSinh\nWHERE ...;',
    solutionSql: "SELECT ho_ten, gioi_tinh, ngay_sinh, que_quan FROM HocSinh WHERE gioi_tinh = 'Nữ' AND que_quan = 'Hà Nội';",
    expectedColumns: ['ho_ten', 'gioi_tinh', 'ngay_sinh', 'que_quan'],
    expectedPreview: [
      ['Trần Bảo Ngọc', 'Nữ', '2008-07-22', 'Hà Nội'],
      ['Đinh Quỳnh Nga', 'Nữ', '2006-02-14', 'Hà Nội'],
    ],
    tips: [
      "Trong SQL, chuỗi ký tự phải được bọc trong dấu nháy đơn: 'Nữ', 'Hà Nội'.",
      "Kết hợp 2 điều kiện bằng từ khóa AND.",
    ],
  },

  // =================== TUẦN 2 ===================
  {
    id: 't2-b3-order-limit',
    week: 2,
    session: 3,
    weekTitle: 'Tuần 2: Sắp xếp, Giới hạn & Tính toán',
    sessionTitle: 'Buổi 3: ORDER BY & LIMIT',
    title: 'Buổi 3: Sắp xếp danh sách lớp học & Top bản ghi',
    difficulty: 'Căn bản',
    xp: 70,
    timeEstimate: '7 phút',
    tags: ['ORDER BY', 'ASC', 'DESC', 'LIMIT'],
    theory: `### 3. Sắp xếp với ORDER BY & Cắt dòng với LIMIT

- \`ORDER BY cot ASC\` : Sắp xếp tăng dần (Mặc định nếu không ghi)
- \`ORDER BY cot DESC\` : Sắp xếp giảm dần (lớn nhất lên trước)
- \`LIMIT n\` : Chỉ lấy ra tối đa \`n\` dòng đầu tiên

\`\`\`sql
SELECT ho_ten, ngay_sinh
FROM HocSinh
ORDER BY ngay_sinh ASC
LIMIT 5;
\`\`\``,
    task: 'Lấy thông tin \`ten_lop\`, \`gvcn\`, \`phong_hoc\` từ bảng `LopHoc`, sắp xếp theo tên lớp tăng dần (\`ten_lop ASC\`) và chỉ lấy **5 lớp học đầu tiên** (\`LIMIT 5\`).',
    initialSql: 'SELECT ten_lop, gvcn, phong_hoc\nFROM LopHoc\nORDER BY ...\nLIMIT ...;',
    solutionSql: 'SELECT ten_lop, gvcn, phong_hoc FROM LopHoc ORDER BY ten_lop ASC LIMIT 5;',
    expectedColumns: ['ten_lop', 'gvcn', 'phong_hoc'],
    expectedPreview: [
      ['10A1', 'Thầy Nguyễn Văn Toàn', 'P.201'],
      ['10A2', 'Cô Trần Thị Hương', 'P.202'],
      ['10A3', 'Cô Đặng Thúy Kiều', 'P.204'],
      ['10B2', 'Thầy Hoàng Minh Đức', 'P.203'],
      ['11A1', 'Thầy Lê Hoàng Long', 'P.301'],
    ],
    tips: [
      'Từ khóa sắp xếp: ORDER BY ten_lop ASC.',
      'Hạn chế kết quả: LIMIT 5.',
    ],
  },
  {
    id: 't2-b4-aggregate-functions',
    week: 2,
    session: 4,
    weekTitle: 'Tuần 2: Sắp xếp, Giới hạn & Tính toán',
    sessionTitle: 'Buổi 4: Các hàm tổng hợp (COUNT, AVG, MAX, MIN)',
    title: 'Buổi 4: Thống kê điểm thi môn Toán toàn trường',
    difficulty: 'Căn bản',
    xp: 80,
    timeEstimate: '8 phút',
    tags: ['COUNT', 'AVG', 'MAX', 'MIN', 'AS'],
    theory: `### 4. Các hàm tổng hợp (Aggregate Functions)

SQL cung cấp các hàm dựng sẵn để tính toán trên tập dữ liệu:
- \`COUNT(*)\` : Đếm tổng số bài kiểm tra
- \`AVG(diem)\` : Điểm trung bình
- \`MAX(diem)\` : Điểm cao nhất
- \`MIN(diem)\` : Điểm thấp nhất
- \`SUM(diem)\` : Tổng điểm

Dùng từ khóa \`AS\` để đặt tên alias cho cột hiển thị đẹp mắt.

\`\`\`sql
SELECT 
  COUNT(*) AS so_luong,
  AVG(diem) AS diem_tb
FROM DiemSo
WHERE mon_hoc = 'Toán';
\`\`\``,
    task: 'Từ bảng `DiemSo`, hãy tính cho môn **"Toán"**:\n- Tổng số bài thi đặt tên là \`so_bai_thi\`\n- Điểm cao nhất đặt tên là \`diem_cao_nhat\`\n- Điểm thấp nhất đặt tên là \`diem_thap_nhat\`\n- Điểm trung bình đặt tên là \`diem_trung_binh\` (dùng hàm AVG).',
    initialSql: "SELECT \n  COUNT(*) AS so_bai_thi,\n  MAX(diem) AS diem_cao_nhat,\n  ...\nFROM DiemSo\nWHERE mon_hoc = 'Toán';",
    solutionSql: "SELECT COUNT(*) AS so_bai_thi, MAX(diem) AS diem_cao_nhat, MIN(diem) AS diem_thap_nhat, AVG(diem) AS diem_trung_binh FROM DiemSo WHERE mon_hoc = 'Toán';",
    expectedColumns: ['so_bai_thi', 'diem_cao_nhat', 'diem_thap_nhat', 'diem_trung_binh'],
    expectedPreview: [
      [9, 9.8, 6.5, 8.255555555555556],
    ],
    tips: [
      "Đừng quên điều kiện lọc WHERE mon_hoc = 'Toán'.",
      'Đặt đúng 4 alias: so_bai_thi, diem_cao_nhat, diem_thap_nhat, diem_trung_binh.',
    ],
  },

  // =================== TUẦN 3 ===================
  {
    id: 't3-b5-group-by-having',
    week: 3,
    session: 5,
    weekTitle: 'Tuần 3: Thống kê Nhóm & Kết nối Bảng',
    sessionTitle: 'Buổi 5: GROUP BY & HAVING',
    title: 'Buổi 5: Thống kê điểm trung bình từng môn học',
    difficulty: 'Trung bình',
    xp: 100,
    timeEstimate: '9 phút',
    tags: ['GROUP BY', 'HAVING', 'AVG', 'ROUND'],
    theory: `### 5. Gom nhóm với GROUP BY & Lọc nhóm với HAVING

- \`GROUP BY cot\` : Gom dữ liệu có cùng giá trị lại thành từng nhóm để tính toán tổng hợp.
- \`HAVING dieu_kien\` : Lọc các nhóm **sau khi** đã tính toán (ví dụ: chỉ lấy môn có điểm trung bình >= 8.0).

> ⚠️ **Lưu ý quan trọng:** Không dùng được \`WHERE\` cho kết quả của hàm \`AVG()\` hoặc \`COUNT()\`, bắt buộc phải dùng \`HAVING\`!

\`\`\`sql
SELECT mon_hoc, COUNT(*) AS so_luong, AVG(diem) AS diem_tb
FROM DiemSo
GROUP BY mon_hoc
HAVING AVG(diem) >= 8.0;
\`\`\``,
    task: 'Từ bảng `DiemSo`, hãy gom nhóm theo từng môn học (\`mon_hoc\`), tính số lượng bài kiểm tra (\`so_bai\`) và điểm trung bình (\`diem_tb\`). Chỉ giữ lại những môn học có **điểm trung bình lớn hơn hoặc bằng 8.0**. Sắp xếp theo \`diem_tb DESC\`.',
    initialSql: 'SELECT mon_hoc, COUNT(*) AS so_bai, AVG(diem) AS diem_tb\nFROM DiemSo\nGROUP BY ...\nHAVING ...\nORDER BY ...;',
    solutionSql: 'SELECT mon_hoc, COUNT(*) AS so_bai, AVG(diem) AS diem_tb FROM DiemSo GROUP BY mon_hoc HAVING AVG(diem) >= 8.0 ORDER BY diem_tb DESC;',
    expectedColumns: ['mon_hoc', 'so_bai', 'diem_tb'],
    expectedPreview: [
      ['Hóa', 1, 9.0],
      ['Lý', 4, 8.875],
      ['Anh', 5, 8.4],
      ['Toán', 9, 8.255555555555556],
      ['Văn', 8, 8.0875],
    ],
    tips: [
      'Gom nhóm GROUP BY mon_hoc.',
      'Điều kiện lọc nhóm: HAVING AVG(diem) >= 8.0.',
      'Sắp xếp giảm dần: ORDER BY diem_tb DESC.',
    ],
  },
  {
    id: 't3-b6-inner-left-join',
    week: 3,
    session: 6,
    weekTitle: 'Tuần 3: Thống kê Nhóm & Kết nối Bảng',
    sessionTitle: 'Buổi 6: Kết nối bảng quan hệ (JOINs)',
    title: 'Buổi 6: Ghép bảng Học sinh với Lớp học (INNER JOIN)',
    difficulty: 'Trung bình',
    xp: 120,
    timeEstimate: '10 phút',
    tags: ['INNER JOIN', 'ON', 'Khoá ngoại'],
    theory: `### 6. Kết nối bảng dữ liệu với INNER JOIN

Bảng \`HocSinh\` lưu cột khóa ngoại \`lop_id\` tham chiếu đến khóa chính \`id\` của bảng \`LopHoc\`.

\`\`\`sql
SELECT hs.ho_ten, lh.ten_lop, lh.gvcn
FROM HocSinh hs
INNER JOIN LopHoc lh ON hs.lop_id = lh.id;
\`\`\`

- \`hs\` và \`lh\` là **Table Aliases** giúp câu lệnh ngắn gọn và tránh nhầm lẫn giữa các cột cùng tên.`,
    task: 'Hãy kết nối bảng `HocSinh` (hs) và `LopHoc` (lh) để hiển thị: mã học sinh (\`hs.id\`), họ tên (\`hs.ho_ten\`), tên lớp (\`lh.ten_lop\`) và tên giáo viên chủ nhiệm (\`lh.gvcn\`). Chỉ lọc các học sinh thuộc lớp có tên bắt đầu bằng "10" (\`lh.ten_lop LIKE "10%"\`). Sắp xếp theo tên lớp ASC, sau đó theo ho_ten ASC.',
    initialSql: 'SELECT hs.id, hs.ho_ten, lh.ten_lop, lh.gvcn\nFROM HocSinh hs\nINNER JOIN LopHoc lh ON ...\nWHERE lh.ten_lop LIKE ...\nORDER BY ...;',
    solutionSql: "SELECT hs.id, hs.ho_ten, lh.ten_lop, lh.gvcn FROM HocSinh hs INNER JOIN LopHoc lh ON hs.lop_id = lh.id WHERE lh.ten_lop LIKE '10%' ORDER BY lh.ten_lop ASC, hs.ho_ten ASC;",
    expectedColumns: ['id', 'ho_ten', 'ten_lop', 'gvcn'],
    expectedPreview: [
      [3, 'Lê Quốc Cường', '10A1', 'Thầy Nguyễn Văn Toàn'],
      [1, 'Nguyễn An Khang', '10A1', 'Thầy Nguyễn Văn Toàn'],
      [2, 'Trần Bảo Ngọc', '10A1', 'Thầy Nguyễn Văn Toàn'],
      [5, 'Hoàng Minh Đức', '10A2', 'Cô Trần Thị Hương'],
      [4, 'Phạm Diệu Linh', '10A2', 'Cô Trần Thị Hương'],
      [14, 'Mai Hồng Nhung', '10B2', 'Thầy Hoàng Minh Đức'],
    ],
    tips: [
      'Điều kiện nối bảng: ON hs.lop_id = lh.id.',
      "Điều kiện lọc: WHERE lh.ten_lop LIKE '10%'.",
    ],
  },

  // =================== TUẦN 4 ===================
  {
    id: 't4-b7-subquery-case-when',
    week: 4,
    session: 7,
    weekTitle: 'Tuần 4: Kỹ thuật Nâng cao',
    sessionTitle: 'Buổi 7: Truy vấn con & Phân loại CASE WHEN',
    title: 'Buổi 7: Tìm học sinh có điểm Toán cao hơn điểm TB toàn trường',
    difficulty: 'Nâng cao',
    xp: 150,
    timeEstimate: '12 phút',
    tags: ['Subquery', 'CASE WHEN', 'Nested Query'],
    theory: `### 7. Truy vấn con (Subquery) & Mệnh đề CASE WHEN

- **Subquery (Truy vấn lồng)**: Là một câu \`SELECT\` đặt trong dấu ngoặc đơn \`(...)\` để cung cấp giá trị cho câu truy vấn cha.
\`\`\`sql
SELECT * FROM DiemSo
WHERE diem > (SELECT AVG(diem) FROM DiemSo WHERE mon_hoc = 'Toán');
\`\`\`

- **CASE WHEN**: Thực hiện rẽ nhánh If-Else ngay trong kết quả truy vấn.
\`\`\`sql
SELECT ho_ten, diem,
  CASE 
    WHEN diem >= 9.0 THEN 'Xuất sắc'
    WHEN diem >= 8.0 THEN 'Giỏi'
    ELSE 'Khá'
  END AS xep_loai
FROM ...;
\`\`\``,
    task: 'Truy xuất mã học sinh (\`hoc_sinh_id\`), môn học (\`mon_hoc\`) và điểm số (\`diem\`) từ bảng `DiemSo` cho môn **"Toán"** có điểm thi **lớn hơn điểm trung bình môn Toán của toàn trường**. Sắp xếp điểm thi giảm dần.',
    initialSql: 'SELECT hoc_sinh_id, mon_hoc, diem\nFROM DiemSo\nWHERE mon_hoc = \'Toán\' AND diem > (SELECT ...)\nORDER BY diem DESC;',
    solutionSql: "SELECT hoc_sinh_id, mon_hoc, diem FROM DiemSo WHERE mon_hoc = 'Toán' AND diem > (SELECT AVG(diem) FROM DiemSo WHERE mon_hoc = 'Toán') ORDER BY diem DESC;",
    expectedColumns: ['hoc_sinh_id', 'mon_hoc', 'diem'],
    expectedPreview: [
      [10, 'Toán', 9.8],
      [1, 'Toán', 9.5],
      [4, 'Toán', 9.0],
      [6, 'Toán', 9.0],
      [2, 'Toán', 8.5],
      [12, 'Toán', 8.5],
    ],
    tips: [
      "Subquery con: `(SELECT AVG(diem) FROM DiemSo WHERE mon_hoc = 'Toán')`.",
      'Mệnh đề ngoài lọc môn Toán VÀ điểm > subquery.',
    ],
  },
  {
    id: 't4-b8-cte-window-functions',
    week: 4,
    session: 8,
    weekTitle: 'Tuần 4: Kỹ thuật Nâng cao',
    sessionTitle: 'Buổi 8: Bảng tạm CTE & Hàm Cửa sổ (Window Functions)',
    title: 'Buổi 8: Bảng tạm CTE & Xếp hạng điểm số từng môn',
    difficulty: 'Nâng cao',
    xp: 180,
    timeEstimate: '15 phút',
    tags: ['WITH CTE', 'DENSE_RANK', 'OVER', 'PARTITION BY'],
    theory: `### 8. CTE (\`WITH\`) & Window Functions

- **CTE (Common Table Expressions)**: Tạo một bảng ảo tạm thời bằng cú pháp \`WITH BangTam AS (...)\` giúp câu truy vấn rõ ràng, module hóa.
- **Window Function \`DENSE_RANK()\`**: Xếp hạng dữ liệu mà không làm gộp dòng như \`GROUP BY\`.

\`\`\`sql
WITH BangDiemChiTiet AS (
  SELECT hs.ho_ten, ds.mon_hoc, ds.diem
  FROM HocSinh hs
  JOIN DiemSo ds ON hs.id = ds.hoc_sinh_id
)
SELECT 
  ho_ten, mon_hoc, diem,
  DENSE_RANK() OVER (
    PARTITION BY mon_hoc 
    ORDER BY diem DESC
  ) AS hang
FROM BangDiemChiTiet;
\`\`\``,
    task: 'Dùng bảng tạm CTE với cú pháp `WITH BangDiem AS (...)` kết nối `HocSinh hs` và `DiemSo ds` trên điều kiện `hs.id = ds.hoc_sinh_id`.\nSau đó, sử dụng hàm cửa sổ `DENSE_RANK() OVER (PARTITION BY mon_hoc ORDER BY diem DESC)` để xếp hạng điểm của học sinh theo từng môn học.\nLấy 4 cột: \`ho_ten\`, \`mon_hoc\`, \`diem\`, và \`hang\`. Chỉ lấy môn "Toán". Sắp xếp theo \`hang ASC\`, sau đó \`ho_ten ASC\`.',
    initialSql: 'WITH BangDiem AS (\n  SELECT hs.ho_ten, ds.mon_hoc, ds.diem\n  FROM HocSinh hs\n  JOIN DiemSo ds ON hs.id = ds.hoc_sinh_id\n)\nSELECT ho_ten, mon_hoc, diem, DENSE_RANK() OVER (PARTITION BY mon_hoc ORDER BY diem DESC) AS hang\nFROM BangDiem\nWHERE mon_hoc = \'Toán\'\nORDER BY hang ASC, ho_ten ASC;',
    solutionSql: "WITH BangDiem AS (SELECT hs.ho_ten, ds.mon_hoc, ds.diem FROM HocSinh hs JOIN DiemSo ds ON hs.id = ds.hoc_sinh_id) SELECT ho_ten, mon_hoc, diem, DENSE_RANK() OVER (PARTITION BY mon_hoc ORDER BY diem DESC) AS hang FROM BangDiem WHERE mon_hoc = 'Toán' ORDER BY hang ASC, ho_ten ASC;",
    expectedColumns: ['ho_ten', 'mon_hoc', 'diem', 'hang'],
    expectedPreview: [
      ['Đinh Quỳnh Nga', 'Toán', 9.8, 1],
      ['Nguyễn An Khang', 'Toán', 9.5, 2],
      ['Phạm Diệu Linh', 'Toán', 9.0, 3],
      ['Vũ Hải Yến', 'Toán', 9.0, 3],
      ['Lý Mỹ Uyên', 'Toán', 8.5, 4],
      ['Trần Bảo Ngọc', 'Toán', 8.5, 4],
      ['Đỗ Gia Huy', 'Toán', 8.0, 5],
      ['Dương Tuấn Kiệt', 'Toán', 7.5, 6],
      ['Hoàng Minh Đức', 'Toán', 7.0, 7],
      ['Lê Quốc Cường', 'Toán', 6.5, 8],
    ],
    tips: [
      'Dùng PARTITION BY mon_hoc để chia cửa sổ xếp hạng theo từng môn.',
      'Dùng ORDER BY diem DESC bên trong OVER() để điểm cao nhất xếp hạng 1.',
      'Lọc bên ngoài: WHERE mon_hoc = "Toán".',
    ],
  },
];
