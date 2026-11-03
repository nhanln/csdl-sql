import React from 'react';
import { X, Table, Eye } from 'lucide-react';
import { TableSchema } from '../services/sqliteEngine';

interface SampleDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string | null;
  schema: TableSchema | null;
}

export const SampleDataModal: React.FC<SampleDataModalProps> = ({
  isOpen,
  onClose,
  tableName,
  schema,
}) => {
  if (!isOpen || !tableName || !schema) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Table className="w-5 h-5 text-sky-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono text-slate-100">{tableName}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {schema.rowCount} dòng tổng cộng
                </span>
              </div>
              <p className="text-xs text-slate-400">Xem trước 5 dòng dữ liệu mẫu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-3 py-2 text-slate-500 font-mono text-[10px] border-b border-slate-800 w-10 text-center">
                  #
                </th>
                {schema.columns.map((c) => (
                  <th
                    key={c.name}
                    className="px-3 py-2 text-slate-300 font-mono font-semibold border-b border-slate-800 tracking-wider whitespace-nowrap"
                  >
                    <div>{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{c.type}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {schema.sampleData.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-850/60 transition-colors">
                  <td className="px-3 py-2 text-slate-600 text-[10px] text-center border-r border-slate-850">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-200 whitespace-nowrap">
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
