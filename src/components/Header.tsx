import React from 'react';
import { 
  Database, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  Terminal, 
  HelpCircle, 
  Trophy, 
  Download,
  CheckCircle2
} from 'lucide-react';
import { CHALLENGES } from '../data/curriculum';

interface HeaderProps {
  currentChallengeId: string;
  onSelectChallenge: (id: string) => void;
  completedChallenges: string[];
  totalXp: number;
  isSandboxMode: boolean;
  onToggleSandbox: (sandbox: boolean) => void;
  onResetDatabase: () => void;
  onOpenCheatSheet: () => void;
  onOpenDeployment: () => void;
  onExportDatabase: () => void;
  hasAiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentChallengeId,
  onSelectChallenge,
  completedChallenges,
  totalXp,
  isSandboxMode,
  onToggleSandbox,
  onResetDatabase,
  onOpenCheatSheet,
  onOpenDeployment,
  onExportDatabase,
  hasAiKey,
}) => {
  const currentChallenge = CHALLENGES.find(c => c.id === currentChallengeId);
  const progressPercent = Math.round((completedChallenges.length / CHALLENGES.length) * 100);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 select-none sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                SQL Master
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                WASM + AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Lộ trình 4 tuần • Quản lý Trường học</p>
          </div>
        </div>

        {/* Challenge Selector or Sandbox Indicator */}
        <div className="flex items-center gap-2 flex-1 max-w-xl mx-2">
          {!isSandboxMode ? (
            <div className="flex-1 flex items-center gap-2">
              <select
                aria-label="Chọn bài tập SQL theo lộ trình 4 tuần"
                value={currentChallengeId}
                onChange={(e) => onSelectChallenge(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition cursor-pointer"
              >
                {CHALLENGES.map((ch) => {
                  const isDone = completedChallenges.includes(ch.id);
                  return (
                    <option key={ch.id} value={ch.id} className="bg-slate-900 text-slate-200">
                      {isDone ? '✓ ' : ''}[Tuần {ch.week} - Buổi {ch.session}] {ch.title}
                    </option>
                  );
                })}
              </select>

              {/* Progress Indicator */}
              <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/60 min-w-[130px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="w-full">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5 font-medium">
                    <span>Lộ trình</span>
                    <span className="text-emerald-400 font-semibold">{completedChallenges.length}/{CHALLENGES.length} buổi</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-medium">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Chế độ Sandbox Tự Do: Thực thi mọi truy vấn trên 3 bảng HocSinh, LopHoc, DiemSo</span>
            </div>
          )}
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => onToggleSandbox(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                !isSandboxMode 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Lộ trình học 4 tuần (8 buổi)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lộ trình</span>
            </button>
            <button
              onClick={() => onToggleSandbox(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                isSandboxMode 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chế độ tự do thực thi câu lệnh SQL bất kỳ"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sandbox</span>
            </button>
          </div>

          {/* XP Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalXp} XP</span>
          </div>

          {/* Deployment Guide */}
          <button
            onClick={onOpenDeployment}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-white text-xs font-medium transition cursor-pointer"
            title="Xem hướng dẫn triển khai và code nhúng sql.js CDN"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Triển khai</span>
          </button>

          {/* Cheat Sheet Button */}
          <button
            onClick={onOpenCheatSheet}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
            title="Mở bảng tra cứu cú pháp SQL"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">Tra cứu</span>
          </button>

          {/* Reset DB Button */}
          <button
            onClick={onResetDatabase}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-800/60 text-slate-400 hover:text-red-300 text-xs transition cursor-pointer"
            title="Khôi phục lại dữ liệu CSDL ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset DB</span>
          </button>

          {/* Gemini AI Status */}
          <div 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/40"
            title={hasAiKey ? "Gemini AI đang trực tuyến & sẵn sàng hỗ trợ" : "Chế độ ngoại tuyến"}
          >
            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">AI Tutor</span>
          </div>

        </div>

      </div>
    </header>
  );
};
