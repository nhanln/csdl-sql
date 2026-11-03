import React, { useState } from 'react';
import { 
  Table, 
  Sparkles, 
  History, 
  MessageSquare, 
  Download, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { QueryResult } from '../services/sqliteEngine';
import { exportToCsv } from '../utils/sqlFormatter';

export interface HistoryItem {
  id: string;
  sql: string;
  timestamp: string;
  success: boolean;
  rowCount: number;
  durationMs: number;
  error?: string;
}

interface ResultPanelProps {
  result: QueryResult | null;
  expectedResult?: QueryResult | null;
  error: string | null;
  isExecuting: boolean;
  aiExplanation: string | null;
  isExplaining: boolean;
  onDiagnoseError: () => void;
  isDiagnosing: boolean;
  history: HistoryItem[];
  onLoadHistorySql: (sql: string) => void;
  currentSql: string;
  schemaInfo: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  expectedResult,
  error,
  isExecuting,
  aiExplanation,
  isExplaining,
  onDiagnoseError,
  isDiagnosing,
  history,
  onLoadHistorySql,
  currentSql,
  schemaInfo,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'ai' | 'history' | 'chat'>('table');
  const [showExpected, setShowExpected] = useState<boolean>(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: '👋 Chào bạn! Tôi là **AI SQL Mentor**. Bạn có thể hỏi tôi bất cứ điều gì về cách viết câu lệnh, tối ưu truy vấn, thiết kế bảng CSDL hoặc giải thích các khái niệm phức tạp!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Tự động chuyển qua tab AI khi có kết quả giải thích
  React.useEffect(() => {
    if (aiExplanation) {
      setActiveTab('ai');
    }
  }, [aiExplanation]);

  // Tự động chuyển qua tab table khi có kết quả truy vấn mới
  React.useEffect(() => {
    if (result) {
      setActiveTab('table');
    }
  }, [result]);

  const handleExportCsv = () => {
    if (!result || result.columns.length === 0) return;
    exportToCsv(result.columns, result.values, `sql_result_${Date.now()}.csv`);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg = chatInput.trim();
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentSql,
          schemaInfo,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, tôi gặp khó khăn khi phản hồi. Bạn thử lại nhé!' }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Lỗi kết nối: ${err?.message || 'Không thể liên lạc máy chủ.'}` }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const quickPrompts = [
    'WHERE khác HAVING thế nào?',
    'Khi nào nên dùng LEFT JOIN thay vì INNER JOIN?',
    'Giải thích thứ tự thực thi của câu lệnh SQL',
    'Chỉ số Index B-Tree giúp tối ưu truy vấn ra sao?'
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Kết quả {result ? `(${result.rowCount})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Insights {aiExplanation ? '●' : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Hỏi đáp AI Mentor</span>
          </button>
        </div>

        {/* Action button if table tab */}
        {activeTab === 'table' && result && result.columns.length > 0 && (
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition cursor-pointer"
            title="Xuất bảng dữ liệu ra file CSV (Excel)"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto relative">
        
        {/* TAB 1: RESULT TABLE */}
        {activeTab === 'table' && (
          <div className="h-full flex flex-col">
            
            {/* Error Display */}
            {error && (
              <div className="p-4 m-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-rose-300">Lỗi cú pháp hoặc thực thi SQLite:</h4>
                    <p className="font-mono text-xs text-rose-200/90 mt-1 whitespace-pre-wrap">{error}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-rose-900/40">
                  <button
                    onClick={onDiagnoseError}
                    disabled={isDiagnosing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-900 hover:bg-rose-800 text-white text-xs font-medium transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                    <span>{isDiagnosing ? 'Gemini đang chẩn đoán...' : 'Nhờ AI chẩn đoán & Sửa lỗi'}</span>
                  </button>
                  <span className="text-[11px] text-rose-300/70">Nhận hướng dẫn sửa lỗi tức thì</span>
                </div>
              </div>
            )}

            {/* Performance Stats Bar & Comparison Switcher */}
            {result && !error && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 text-[11px] text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Thành công
                  </span>
                  <span>{(showExpected && expectedResult ? expectedResult : result).rowCount} dòng</span>
                  <span>{(showExpected && expectedResult ? expectedResult : result).columns.length} cột</span>
                </div>

                {/* Compare Switcher (nếu có kết quả mẫu) */}
                {expectedResult && (
                  <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                    <button
                      onClick={() => setShowExpected(false)}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                        !showExpected ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Kết quả của bạn
                    </button>
                    <button
                      onClick={() => setShowExpected(true)}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                        showExpected ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Kết quả mẫu (Kỳ vọng)
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1 font-mono text-slate-400">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>{result.executionTimeMs} ms</span>
                </div>
              </div>
            )}

            {/* Table View */}
            {(() => {
              const activeTableData = (showExpected && expectedResult) ? expectedResult : result;
              return activeTableData && activeTableData.columns.length > 0 ? (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900/90 sticky top-0 z-10 select-none shadow-sm">
                    <tr>
                      <th className="px-3 py-2 text-slate-500 font-mono text-[10px] border-b border-slate-800 w-10 text-center">
                        #
                      </th>
                      {activeTableData.columns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-3 py-2 text-slate-300 font-mono font-semibold border-b border-slate-800 tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono">
                    {activeTableData.values.map((row, rIdx) => (
                      <tr 
                        key={rIdx} 
                        className="hover:bg-slate-850/60 transition-colors"
                      >
                        <td className="px-3 py-1.5 text-slate-600 text-[10px] text-center border-r border-slate-900/80">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td 
                            key={cIdx} 
                            className="px-3 py-1.5 text-slate-200 whitespace-nowrap"
                          >
                            {cell === null ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : typeof cell === 'number' ? (
                              <span className="text-emerald-400">
                                {cell.toLocaleString('vi-VN')}
                              </span>
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
            ) : !error && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <Table className="w-10 h-10 text-slate-700" />
                <p className="text-sm font-medium text-slate-400">Chưa có kết quả truy vấn</p>
                <p className="text-xs max-w-sm text-slate-500">
                  Hãy viết câu lệnh SQL ở khung bên trên và nhấn nút <b>"Chạy SQL"</b> (hoặc <b>Ctrl + Enter</b>).
                </p>
              </div>
            );
            })()}

          </div>
        )}

        {/* TAB 2: AI INSIGHTS & EXPLANATIONS */}
        {activeTab === 'ai' && (
          <div className="p-4 space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
            
            {/* Visual Logical Execution Flow */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thứ tự thực thi Logic của RDBMS</span>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-slate-300">
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">1. FROM / JOIN</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">2. WHERE</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">3. GROUP BY</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">4. HAVING</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">5. SELECT</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">6. ORDER BY</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">7. LIMIT</span>
              </div>
            </div>

            {/* Explanation Content */}
            {isExplaining ? (
              <div className="flex items-center gap-2.5 text-indigo-300 py-6 justify-center">
                <Sparkles className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-sm font-medium">Gemini AI đang phân tích cú pháp và kiến trúc câu truy vấn...</span>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-3 prose-dark whitespace-pre-line">
                {aiExplanation}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-700" />
                <p className="text-sm text-slate-400 font-medium">Chưa có phân tích AI</p>
                <p className="text-xs text-slate-500">
                  Nhấn nút <b>"Giải thích AI"</b> trên thanh công cụ để xem Gemini giải thích từng dòng lệnh.
                </p>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: QUERY HISTORY */}
        {activeTab === 'history' && (
          <div className="p-3 space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <History className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="text-sm text-slate-400 font-medium">Lịch sử trống</p>
                <p className="text-xs text-slate-500">Các câu lệnh SQL bạn đã thực thi sẽ được lưu tại đây.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={item.success ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {item.success ? '✓ Thành công' : '✕ Thất bại'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{item.timestamp}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono">{item.durationMs}ms</span>
                      {item.success && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{item.rowCount} dòng</span>
                        </>
                      )}
                    </div>

                    <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded overflow-x-auto">
                      {item.sql}
                    </pre>

                    {item.error && (
                      <p className="text-[11px] text-rose-400 font-mono">{item.error}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onLoadHistorySql(item.sql)}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-sky-600 text-slate-400 hover:text-white transition cursor-pointer shrink-0 mt-1"
                    title="Nạp lại câu lệnh này vào Editor"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: AI MENTOR CHAT */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            
            {/* Quick Prompts */}
            <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-500 text-[10px] uppercase font-semibold shrink-0">Hỏi nhanh:</span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(p);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 border border-slate-700 text-slate-300 shrink-0 transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm whitespace-pre-line'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isSendingChat && (
                <div className="flex items-center gap-2 text-indigo-400 text-xs py-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI Mentor đang soạn câu trả lời...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Hỏi AI Mentor về SQL, tối ưu hóa, mẹo viết truy vấn..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
              <button
                onClick={handleSendChat}
                disabled={isSendingChat || !chatInput.trim()}
                className="p-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-50 cursor-pointer"
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
