import React from 'react';
import { Trophy, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  hasNext: boolean;
  xpEarned: number;
  challengeTitle: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onNext,
  hasNext,
  xpEarned,
  challengeTitle,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-center shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
          <Trophy className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Thử thách hoàn thành!
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Chính xác tuyệt đối!
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Bạn đã giải đúng bài: <span className="text-slate-200 font-semibold">{challengeTitle}</span>
          </p>
        </div>

        {/* XP Gained Badge */}
        <div className="py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 inline-flex items-center gap-2">
          <span className="text-xs text-slate-400">Phần thưởng:</span>
          <span className="text-sm font-bold text-amber-400 font-mono">+{xpEarned} XP</span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Xem lại kết quả
          </button>

          {hasNext && (
            <button
              onClick={() => {
                onClose();
                onNext();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition cursor-pointer"
            >
              <span>Bài tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
