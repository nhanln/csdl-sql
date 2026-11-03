import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Network, 
  ChevronRight, 
  ChevronDown, 
  Key, 
  Link2, 
  Lightbulb, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Copy,
  Table
} from 'lucide-react';
import { Challenge } from '../data/curriculum';
import { TableSchema } from '../services/sqliteEngine';

interface LeftPanelProps {
  challenge: Challenge;
  schemas: TableSchema[];
  onSelectColumn: (colName: string) => void;
  onSelectTable: (tableName: string) => void;
  onPreviewTable: (tableName: string) => void;
  onNextChallenge: () => void;
  onPrevChallenge: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isCompleted: boolean;
  userSql: string;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  challenge,
  schemas,
  onSelectColumn,
  onSelectTable,
  onPreviewTable,
  onNextChallenge,
  onPrevChallenge,
  hasNext,
  hasPrev,
  isCompleted,
  userSql,
}) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'schema' | 'erd'>('theory');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    khach_hang: true,
    san_pham: true,
    don_hang: true,
  });

  // Hints state
  const [activeHintLevel, setActiveHintLevel] = useState<number | null>(null);
  const [hintContents, setHintContents] = useState<Record<number, string>>({});
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);

  const toggleTable = (name: string) => {
    setExpandedTables(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Yêu cầu gợi ý từ AI
  const fetchHint = async (level: number) => {
    if (hintContents[level]) {
      setActiveHintLevel(activeHintLevel === level ? null : level);
      return;
    }

    setIsLoadingHint(true);
    setActiveHintLevel(level);

    try {
      const res = await fetch('/api/gemini/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          challengeTitle: challenge.title,
          challengePrompt: challenge.task,
          userSql,
          schemaInfo: schemas.map(s => `${s.name}(${s.columns.map(c => c.name).join(', ')})`).join('\n'),
        }),
      });

      const data = await res.json();
      if (data.hint) {
        setHintContents(prev => ({ ...prev, [level]: data.hint }));
      }
    } catch (err) {
      // Fallback hint
      const fallback = challenge.tips[level - 1] || 'Hãy đọc kỹ phần lý thuyết và xác định các bảng cần truy vấn.';
      setHintContents(prev => ({ ...prev, [level]: fallback }));
    } finally {
      setIsLoadingHint(false);
    }
  };

  const difficultyColors = {
    'Căn bản': 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
    'Trung bình': 'bg-amber-950/70 text-amber-400 border-amber-800/60',
    'Nâng cao': 'bg-rose-950/70 text-rose-400 border-rose-800/60',
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      
      {/* Tab Switcher Header */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-2 pt-2 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium transition cursor-pointer border-t-2 ${
            activeTab === 'theory'
              ? 'bg-slate-900 text-sky-400 border-sky-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Bài tập & Lý thuyết</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium transition cursor-pointer border-t-2 ${
            activeTab === 'schema'
              ? 'bg-slate-900 text-sky-400 border-sky-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Lược đồ CSDL ({schemas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('erd')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium transition cursor-pointer border-t-2 ${
            activeTab === 'erd'
              ? 'bg-slate-900 text-sky-400 border-sky-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Sơ đồ ERD</span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-200">
        
        {/* TAB 1: BÀI TẬP & LÝ THUYẾT */}
        {activeTab === 'theory' && (
          <div className="space-y-5">
            
            {/* Meta Tags & Title */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="text-xs text-sky-400 font-semibold tracking-wide">
                  {challenge.weekTitle} • {challenge.sessionTitle}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                    +{challenge.xp} XP
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                      <CheckCircle className="w-3 h-3" /> Hoàn thành
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                {challenge.title}
              </h2>
            </div>

            {/* Task Requirement Card */}
            <div className="bg-sky-950/30 border border-sky-800/50 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Yêu cầu bài tập (Tuần {challenge.week} - Buổi {challenge.session})</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                {challenge.task}
              </p>
            </div>

            {/* Expected Output Preview */}
            {challenge.expectedColumns && challenge.expectedColumns.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-emerald-400" />
                    Bảng kết quả kỳ vọng (Expected Output):
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {challenge.expectedColumns.length} cột
                  </span>
                </div>

                <div className="overflow-x-auto max-h-36 overflow-y-auto">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead className="bg-slate-900 sticky top-0">
                      <tr>
                        {challenge.expectedColumns.map((col, idx) => (
                          <th key={idx} className="p-1.5 border-b border-slate-800 text-sky-300 font-semibold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {challenge.expectedPreview.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/40">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-1.5 text-slate-300 whitespace-nowrap">
                              {cell === null ? (
                                <span className="text-slate-600 italic">NULL</span>
                              ) : typeof cell === 'number' ? (
                                <span className="text-emerald-400">{cell}</span>
                              ) : (
                                <span>{String(cell)}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Theory Explanation (Rendered) */}
            <div className="space-y-3 pt-1 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Lý thuyết & Cú pháp trọng tâm
              </h3>
              
              <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
                {challenge.theory}
              </div>
            </div>

            {/* 3-Level Socratic AI Hints */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Gợi ý tư duy (Socratic AI)
                </span>
                <span className="text-[11px] text-slate-500">3 cấp độ</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { lvl: 1, label: 'Cấp 1: Hướng đi' },
                  { lvl: 2, label: 'Cấp 2: Từ khóa' },
                  { lvl: 3, label: 'Cấp 3: Khung code' },
                ].map(({ lvl, label }) => (
                  <button
                    key={lvl}
                    onClick={() => fetchHint(lvl)}
                    className={`py-1.5 px-2 rounded-md border text-xs font-medium transition cursor-pointer text-center ${
                      activeHintLevel === lvl
                        ? 'bg-amber-950/80 border-amber-600 text-amber-200 shadow-sm'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Hint Content Display */}
              {activeHintLevel !== null && (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-200/90 leading-relaxed animate-in fade-in">
                  {isLoadingHint ? (
                    <div className="flex items-center gap-2 text-amber-400 py-1">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini AI đang chuẩn bị gợi ý cho bạn...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line">
                      {hintContents[activeHintLevel] || challenge.tips[activeHintLevel - 1]}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lesson Navigation Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={onPrevChallenge}
                disabled={!hasPrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Bài trước</span>
              </button>

              <button
                onClick={onNextChallenge}
                disabled={!hasNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span>Bài tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: LƯỢC ĐỒ CSDL (SCHEMA EXPLORER) */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Cơ sở dữ liệu mẫu</h3>
                <p className="text-[11px] text-slate-400">Click vào tên bảng hoặc cột để chèn vào Editor</p>
              </div>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                {schemas.length} bảng
              </span>
            </div>

            <div className="space-y-2.5">
              {schemas.map((table) => {
                const isExpanded = expandedTables[table.name];
                return (
                  <div
                    key={table.name}
                    className="border border-slate-800 bg-slate-950/60 rounded-lg overflow-hidden transition"
                  >
                    {/* Table Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-850 cursor-pointer select-none">
                      <div 
                        className="flex items-center gap-2 flex-1"
                        onClick={() => toggleTable(table.name)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <Table className="w-4 h-4 text-sky-400" />
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {table.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({table.rowCount} dòng)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPreviewTable(table.name)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition"
                          title="Xem 5 dòng dữ liệu mẫu"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectTable(table.name)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition"
                          title="Chèn tên bảng vào câu lệnh SQL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Columns List */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-850 bg-slate-950/40 text-xs font-mono">
                        {table.columns.map((col) => (
                          <div
                            key={col.name}
                            onClick={() => onSelectColumn(col.name)}
                            className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-900/80 cursor-pointer group transition"
                          >
                            <div className="flex items-center gap-2">
                              {col.pk ? (
                                <span title="Khoá chính (Primary Key)">
                                  <Key className="w-3 h-3 text-amber-400" />
                                </span>
                              ) : col.name.startsWith('ma_') && !col.pk ? (
                                <span title="Khoá ngoại (Foreign Key)">
                                  <Link2 className="w-3 h-3 text-indigo-400" />
                                </span>
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-slate-700/50" />
                              )}
                              <span className="text-slate-300 group-hover:text-sky-300 transition font-medium">
                                {col.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {col.notnull ? (
                                <span className="text-[10px] text-slate-500 font-sans">NN</span>
                              ) : null}
                              <span className="text-[11px] text-slate-500 group-hover:text-slate-400">
                                {col.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SƠ ĐỒ ERD (ENTITY RELATIONSHIP DIAGRAM) */}
        {activeTab === 'erd' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Sơ đồ Quan hệ Thực thể: Quản lý Trường học</h3>
              <p className="text-[11px] text-slate-400">Các đường nối thể hiện quan hệ 1 - N qua Khoá ngoại (Foreign Key)</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-4 text-xs font-mono">
              
              {/* ERD Node 1: LopHoc */}
              <div className="p-3 rounded-lg border border-indigo-800/60 bg-indigo-950/30">
                <div className="font-bold text-indigo-300 flex items-center justify-between pb-1.5 mb-1.5 border-b border-indigo-900/60">
                  <span>LopHoc</span>
                  <span className="text-[10px] text-indigo-400 font-sans">Bảng Lớp (1)</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div>🔑 <span className="text-amber-300 font-bold">id</span> (PK, INTEGER)</div>
                  <div>ten_lop (TEXT, ví dụ: '10A1')</div>
                  <div>gvcn (TEXT, Giáo viên chủ nhiệm)</div>
                  <div>phong_hoc (TEXT)</div>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="flex justify-center text-slate-400 text-[11px] font-sans">
                ⬇️ 1 Lớp có nhiều (N) Học sinh: <code className="text-sky-300 font-mono ml-1">LopHoc.id = HocSinh.lop_id</code>
              </div>

              {/* ERD Node 2: HocSinh */}
              <div className="p-3 rounded-lg border border-sky-800/60 bg-sky-950/30">
                <div className="font-bold text-sky-300 flex items-center justify-between pb-1.5 mb-1.5 border-b border-sky-900/60">
                  <span>HocSinh</span>
                  <span className="text-[10px] text-sky-400 font-sans">Học sinh (N - 1)</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div>🔑 <span className="text-amber-300 font-bold">id</span> (PK, INTEGER)</div>
                  <div>ho_ten (TEXT, Họ và tên)</div>
                  <div>gioi_tinh (TEXT, 'Nam' / 'Nữ')</div>
                  <div>ngay_sinh (DATE)</div>
                  <div>que_quan (TEXT)</div>
                  <div>🔗 <span className="text-sky-300 font-bold">lop_id</span> (FK ➔ LopHoc.id)</div>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="flex justify-center text-slate-400 text-[11px] font-sans">
                ⬇️ 1 Học sinh có nhiều (N) Điểm số: <code className="text-emerald-300 font-mono ml-1">HocSinh.id = DiemSo.hoc_sinh_id</code>
              </div>

              {/* ERD Node 3: DiemSo */}
              <div className="p-3 rounded-lg border border-emerald-800/60 bg-emerald-950/30">
                <div className="font-bold text-emerald-300 flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-900/60">
                  <span>DiemSo</span>
                  <span className="text-[10px] text-emerald-400 font-sans">Điểm kiểm tra (N)</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div>🔑 <span className="text-amber-300 font-bold">id</span> (PK, INTEGER)</div>
                  <div>🔗 <span className="text-emerald-300 font-bold">hoc_sinh_id</span> (FK ➔ HocSinh.id)</div>
                  <div>mon_hoc (TEXT, 'Toán', 'Văn', 'Anh', 'Lý')</div>
                  <div>diem (REAL, Thang điểm 10.0)</div>
                  <div>hoc_ky (INTEGER, Học kỳ 1 / 2)</div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
