import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  Sparkles, 
  AlignLeft, 
  RotateCcw, 
  Activity, 
  Copy, 
  Check,
  Code2
} from 'lucide-react';
import { formatSql } from '../utils/sqlFormatter';

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onExecute: () => void;
  onCheckSolution: () => void;
  onExplain: () => void;
  onExplainPlan: () => void;
  onResetCode: () => void;
  isExecuting: boolean;
  isChecking: boolean;
  isExplaining: boolean;
  isSandboxMode: boolean;
  tableNames: string[];
}

const COMMON_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'CASE WHEN', 'AS'
];

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onExecute,
  onCheckSolution,
  onExplain,
  onExplainPlan,
  onResetCode,
  isExecuting,
  isChecking,
  isExplaining,
  isSandboxMode,
  tableNames,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Xử lý phím tắt Ctrl+Enter hoặc Cmd+Enter để chạy
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onExecute();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Chèn từ khóa hoặc tên bảng vào vị trí con trỏ
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + (value ? ' ' : '') + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);

    const needsPreSpace = before.length > 0 && !/\s$/.test(before);
    const textWithSpace = (needsPreSpace ? ' ' : '') + textToInsert + ' ';

    const nextVal = before + textWithSpace + after;
    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + textWithSpace.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 0);
  };

  const handleFormat = () => {
    const formatted = formatSql(value);
    onChange(formatted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tính số lượng dòng
  const lines = value.split('\n');

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      
      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span>SQL Editor</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (Nhấn <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono text-[10px]">Ctrl+Enter</kbd> để chạy)
          </span>
        </div>

        {/* Buttons Action Group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Run Query */}
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-50 cursor-pointer"
            title="Thực thi câu lệnh SQL (Ctrl+Enter)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Đang chạy...' : 'Chạy SQL'}</span>
          </button>

          {/* Check Solution (Bài tập) */}
          {!isSandboxMode && (
            <button
              onClick={onCheckSolution}
              disabled={isChecking || !value.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer"
              title="Chấm điểm câu truy vấn của bạn với đáp án bài tập"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isChecking ? 'Đang chấm...' : 'Nộp bài'}</span>
            </button>
          )}

          {/* AI Explain Query */}
          <button
            onClick={onExplain}
            disabled={isExplaining || !value.trim()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-200 text-xs font-medium transition cursor-pointer disabled:opacity-40"
            title="Nhờ AI giải thích chi tiết câu lệnh theo thứ tự thực thi logic"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Giải thích AI</span>
          </button>

          {/* EXPLAIN Query Plan */}
          <button
            onClick={onExplainPlan}
            disabled={!value.trim()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer disabled:opacity-40"
            title="Xem kế hoạch thực thi câu lệnh (EXPLAIN QUERY PLAN)"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Kế hoạch</span>
          </button>

          {/* Format Code */}
          <button
            onClick={handleFormat}
            disabled={!value.trim()}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Định dạng thụt dòng và viết hoa từ khóa SQL"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            disabled={!value.trim()}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Sao chép toàn bộ code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Code */}
          <button
            onClick={onResetCode}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Khôi phục lại code ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>

      {/* Quick Insert Chips Bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto text-[11px]">
        <span className="text-slate-500 text-[10px] uppercase font-semibold shrink-0 mr-1">Chèn nhanh:</span>
        {COMMON_KEYWORDS.map((kw) => (
          <button
            key={kw}
            onClick={() => insertTextAtCursor(kw)}
            className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-sky-950 hover:text-sky-300 hover:border-sky-700/60 border border-slate-700/60 text-slate-300 font-mono text-[11px] transition shrink-0 cursor-pointer"
          >
            {kw}
          </button>
        ))}

        <div className="w-[1px] h-3.5 bg-slate-700 mx-1 shrink-0" />

        {tableNames.map((tbl) => (
          <button
            key={tbl}
            onClick={() => insertTextAtCursor(tbl)}
            className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-700/60 border border-slate-700/60 text-indigo-300/90 font-mono text-[11px] transition shrink-0 cursor-pointer"
            title={`Chèn bảng ${tbl}`}
          >
            {tbl}
          </button>
        ))}
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-sm leading-relaxed">
        
        {/* Line Numbers Column */}
        <div className="w-10 bg-slate-900/40 border-r border-slate-800/60 text-slate-600 select-none py-3 text-right pr-2 text-xs shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Editor */}
        <div className="flex-1 relative h-full">
          <textarea
            aria-label="Khung soạn thảo câu truy vấn SQL"
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="-- Viết câu truy vấn SQL tại đây..."
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="w-full h-full p-3 bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-6 selection:bg-sky-500/30 overflow-auto"
          />
        </div>

      </div>

      {/* Editor Status Footer */}
      <div className="px-3 py-1 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>{lines.length} dòng</span>
          <span>{value.length} ký tự</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>SQLite 3 (WASM in-memory)</span>
        </div>
      </div>

    </div>
  );
};
