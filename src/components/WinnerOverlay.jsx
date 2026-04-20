import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

function fire(particleRatio, opts) {
  confetti({
    origin: { y: 0.6 },
    ...opts,
    particleCount: Math.floor(200 * particleRatio),
  });
}

function launchConfetti() {
  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#FFD700', '#FFA500', '#FF6B35'] });
  fire(0.2,  { spread: 60, colors: ['#FFD700', '#FFFFFF', '#FFC0CB'] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#FFD700', '#C0C0C0', '#00BFFF'] });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#FFD700', '#FF69B4'] });
  fire(0.1,  { spread: 120, startVelocity: 45, colors: ['#FFD700', '#ADFF2F'] });
}

export default function WinnerOverlay({ winner, mode, onClose }) {
  const hasLaunched = useRef(false);

  useEffect(() => {
    if (hasLaunched.current) return;
    hasLaunched.current = true;
    launchConfetti();
    // 少し遅らせてもう一度
    const t = setTimeout(launchConfetti, 800);
    return () => clearTimeout(t);
  }, []);

  const scoreDisplay =
    mode === 'circle-cross'
      ? `○ ${winner.correct ?? 0}  ✕ ${winner.wrong ?? 0}`
      : `${winner.score} 点`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, rgba(10,10,40,0.92) 0%, rgba(40,10,60,0.95) 100%)' }}
      onClick={onClose}
    >
      {/* 閉じるボタン */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="閉じる"
      >
        <X size={20} />
      </button>

      {/* カード本体 */}
      <div
        className="relative flex flex-col items-center gap-6 px-10 py-12 rounded-3xl text-center max-w-sm w-full mx-4"
        style={{
          background: 'linear-gradient(160deg, #1a1a3e 0%, #2d1b4e 100%)',
          border: '2px solid rgba(255,215,0,0.4)',
          boxShadow: '0 0 60px rgba(255,215,0,0.2), 0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* トロフィー */}
        <div className="text-7xl leading-none" style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.8))' }}>
          🏆
        </div>

        {/* WINNER ラベル */}
        <div>
          <p
            className="text-xs font-bold tracking-[0.3em] mb-2"
            style={{ color: 'rgba(255,215,0,0.7)' }}
          >
            W I N N E R
          </p>
          <h2
            className="text-4xl font-bold leading-tight break-words"
            style={{
              color: '#FFD700',
              textShadow: '0 0 30px rgba(255,215,0,0.6), 0 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Noto Sans JP", sans-serif',
            }}
          >
            {winner.name}
          </h2>
        </div>

        {/* スコア */}
        <div
          className="px-6 py-2 rounded-full text-xl font-bold"
          style={{
            background: 'rgba(255,215,0,0.15)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: '#FFE55C',
          }}
        >
          {scoreDisplay}
        </div>

        {/* 閉じるボタン（カード内） */}
        <button
          onClick={onClose}
          className="mt-2 px-8 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        >
          スコアボードに戻る
        </button>
      </div>
    </div>
  );
}
