import React, { useState } from 'react';
import { X, Search, BookOpen, Layers, GitFork, Calendar, Hash } from 'lucide-react';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'order' | 'joins' | 'functions' | 'window'>('order');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Cẩm Nang Tra Cứu Cú Pháp SQL</h2>
              <p className="text-xs text-slate-400">Kiến thức chuẩn hoá và mẹo nhớ nhanh cho học viên</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveCategory('order')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeCategory === 'order'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thứ tự thực thi SQL</span>
          </button>

          <button
            onClick={() => setActiveCategory('joins')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeCategory === 'joins'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Các loại JOIN</span>
          </button>

          <button
            onClick={() => setActiveCategory('functions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeCategory === 'functions'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Hàm xử lý Chuỗi & Ngày tháng</span>
          </button>

          <button
            onClick={() => setActiveCategory('window')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeCategory === 'window'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Hàm Cửa sổ (Window Functions)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-200">
          
          {/* SECTION 1: LOGICAL ORDER */}
          {activeCategory === 'order' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-lg text-xs leading-relaxed">
                <h4 className="font-bold text-sky-300 text-sm mb-1">Quy tắc vàng: Thứ tự viết ≠ Thứ tự thực thi</h4>
                <p className="text-slate-300">
                  Người lập trình viết <code className="text-sky-300">SELECT</code> đầu tiên, nhưng bộ máy RDBMS (SQLite, PostgreSQL, MySQL) lại thực thi <code className="text-sky-300">FROM</code> đầu tiên để xác định nguồn dữ liệu!
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { step: '1. FROM & JOIN', desc: 'Xác định các bảng nguồn và ghép nối dữ liệu theo khoá quan hệ.' },
                  { step: '2. WHERE', desc: 'Lọc các dòng đơn lẻ trước khi gom nhóm (Không dùng được hàm tổng hợp SUM, COUNT ở đây).' },
                  { step: '3. GROUP BY', desc: 'Gom các dòng có chung giá trị cột lại thành từng cụm.' },
                  { step: '4. HAVING', desc: 'Lọc các nhóm sau khi gom nhóm (Áp dụng được điều kiện trên SUM, AVG, COUNT).' },
                  { step: '5. SELECT & Cột ảo (Expressions)', desc: 'Chọn các cột cần hiển thị và tính toán các biểu thức, đặt alias (AS).' },
                  { step: '6. DISTINCT', desc: 'Loại bỏ các dòng trùng lặp trong tập kết quả.' },
                  { step: '7. ORDER BY', desc: 'Sắp xếp tập kết quả theo thứ tự tăng dần (ASC) hoặc giảm dần (DESC).' },
                  { step: '8. LIMIT & OFFSET', desc: 'Cắt lấy số lượng dòng mong muốn (phân trang dữ liệu).' },
                ].map(({ step, desc }) => (
                  <div key={step} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-start gap-3">
                    <span className="font-mono font-bold text-sky-400 min-w-[130px] shrink-0 text-xs">
                      {step}
                    </span>
                    <span className="text-xs text-slate-300 leading-normal">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: JOINS */}
          {activeCategory === 'joins' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <h4 className="font-bold text-sky-400 font-mono text-sm">INNER JOIN</h4>
                <p className="text-xs text-slate-300">Chỉ lấy các dòng có mặt và khớp điều kiện ở <b>CẢ HAI BẢNG</b>.</p>
                <pre className="text-xs font-mono bg-slate-900 p-2.5 rounded text-slate-200">
{`SELECT *
FROM khach_hang kh
INNER JOIN don_hang dh
  ON kh.ma_kh = dh.ma_kh;`}
                </pre>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <h4 className="font-bold text-emerald-400 font-mono text-sm">LEFT JOIN</h4>
                <p className="text-xs text-slate-300">Giữ <b>TOÀN BỘ</b> bảng bên trái. Nếu bảng phải không có dòng khớp, giá trị là <code>NULL</code>.</p>
                <pre className="text-xs font-mono bg-slate-900 p-2.5 rounded text-slate-200">
{`SELECT kh.ho_ten, dh.ma_dh
FROM khach_hang kh
LEFT JOIN don_hang dh
  ON kh.ma_kh = dh.ma_kh;`}
                </pre>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <h4 className="font-bold text-amber-400 font-mono text-sm">CROSS JOIN (Tích Descartes)</h4>
                <p className="text-xs text-slate-300">Ghép mỗi dòng bảng A với mọi dòng bảng B (N x M dòng).</p>
                <pre className="text-xs font-mono bg-slate-900 p-2.5 rounded text-slate-200">
{`SELECT *
FROM danh_muc
CROSS JOIN phong_ban;`}
                </pre>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <h4 className="font-bold text-indigo-400 font-mono text-sm">SELF JOIN (Tự nối chính nó)</h4>
                <p className="text-xs text-slate-300">Ghép một bảng với chính nó (ví dụ: Nhân viên và Cấp trên trực tiếp).</p>
                <pre className="text-xs font-mono bg-slate-900 p-2.5 rounded text-slate-200">
{`SELECT nv.ho_ten AS NhanVien, ql.ho_ten AS QuanLy
FROM nhan_vien nv
LEFT JOIN nhan_vien ql 
  ON nv.quan_ly_id = ql.ma_nv;`}
                </pre>
              </div>
            </div>
          )}

          {/* SECTION 3: FUNCTIONS */}
          {activeCategory === 'functions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* String Functions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hàm xử lý Chuỗi</h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-sky-300 font-bold">UPPER(str) / LOWER(str)</span>
                      <p className="text-slate-400 font-sans mt-0.5">Chuyển sang chữ hoa / chữ thường.</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-sky-300 font-bold">SUBSTR(str, start, len)</span>
                      <p className="text-slate-400 font-sans mt-0.5">Cắt chuỗi con từ vị trí start (bắt đầu từ 1).</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-sky-300 font-bold">LENGTH(str)</span>
                      <p className="text-slate-400 font-sans mt-0.5">Đếm số ký tự của chuỗi.</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-sky-300 font-bold">COALESCE(val1, val2, ...)</span>
                      <p className="text-slate-400 font-sans mt-0.5">Trả về giá trị đầu tiên khác NULL.</p>
                    </div>
                  </div>
                </div>

                {/* Date & Math */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hàm Ngày tháng & Toán học</h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-emerald-300 font-bold">DATE('now')</span>
                      <p className="text-slate-400 font-sans mt-0.5">Lấy ngày hiện tại (YYYY-MM-DD).</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-emerald-300 font-bold">STRFTIME('%Y', ngay)</span>
                      <p className="text-slate-400 font-sans mt-0.5">Trích xuất năm (%Y), tháng (%m), ngày (%d).</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-emerald-300 font-bold">ROUND(so, 2)</span>
                      <p className="text-slate-400 font-sans mt-0.5">Làm tròn số đến 2 chữ số thập phân.</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-emerald-300 font-bold">CASE WHEN ... THEN ... END</span>
                      <p className="text-slate-400 font-sans mt-0.5">Mệnh đề rẽ nhánh điều kiện If-Else.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 4: WINDOW FUNCTIONS */}
          {activeCategory === 'window' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-xs leading-relaxed">
                <span className="font-bold text-indigo-300">Cú pháp tổng quát:</span>
                <pre className="mt-1 font-mono text-slate-200 bg-slate-950 p-2 rounded">
                  {`FUNCTION() OVER (
  PARTITION BY cot_gom_nhom
  ORDER BY cot_sap_xep [ASC|DESC]
)`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <span className="font-bold font-mono text-sky-400">ROW_NUMBER()</span>
                  <p className="text-slate-400">Đánh số thứ tự liên tục 1, 2, 3, 4 không trùng lặp.</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <span className="font-bold font-mono text-amber-400">RANK()</span>
                  <p className="text-slate-400">Xếp hạng nhảy bậc khi trùng điểm (1, 2, 2, 4).</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <span className="font-bold font-mono text-emerald-400">DENSE_RANK()</span>
                  <p className="text-slate-400">Xếp hạng liền kề khi trùng điểm (1, 2, 2, 3).</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Đã hiểu, đóng lại
          </button>
        </div>

      </div>
    </div>
  );
};
