import { Lock, LockOpen, Trash2 } from 'lucide-react';

export default function PlayerCard({ player, mode, dispatch }) {
  const locked = player.locked ?? false;

  const handleScore = (delta) => {
    if (locked) return;
    dispatch({ type: 'score/update', payload: { playerId: player.id, delta } });
  };

  const handleCircle = (result) => {
    if (locked) return;
    dispatch({ type: 'circle/record', payload: { playerId: player.id, result } });
  };

  const handleRemove = () => {
    if (window.confirm(`「${player.name}」を削除しますか？`)) {
      dispatch({ type: 'player/remove', payload: { id: player.id } });
    }
  };

  const handleToggleLock = () => {
    dispatch({ type: 'player/toggleLock', payload: { id: player.id } });
  };

  if (mode === 'circle-cross') {
    const correct = player.correct ?? 0;
    const wrong = player.wrong ?? 0;
    return (
      <div className={`group relative bg-white rounded-2xl shadow-md border p-5 flex flex-col items-center gap-2 transition-shadow hover:shadow-lg ${locked ? 'border-slate-400 opacity-70 grayscale' : 'border-slate-200'}`}>
        {/* LOCKEDウォーターマーク */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 rounded-2xl overflow-hidden">
            <span className="text-xl font-black text-white bg-black/40 px-3 py-0.5 rounded border-2 border-white/70 -rotate-12 tracking-widest select-none">
              LOCKED
            </span>
          </div>
        )}

        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-20"
          aria-label={`${player.name} を削除`}
        >
          <Trash2 size={14} />
        </button>

        <p className="text-sm font-semibold text-slate-600 text-center break-words w-full px-4 leading-snug">
          {player.name}
        </p>

        <div className="h-12 flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-500 leading-none">○</span>
          <span className="text-4xl font-bold text-emerald-600 tabular-nums leading-none">{correct}</span>
          <div className="w-px h-7 bg-slate-200 mx-1" />
          <span className="text-xl font-bold text-red-400 leading-none">✕</span>
          <span className="text-4xl font-bold text-red-500 tabular-nums leading-none">{wrong}</span>
        </div>

        <div className="absolute inset-0 rounded-2xl flex flex-col gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {!locked && (
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => handleCircle('correct')}
                className="flex-1 flex items-center justify-center py-2 rounded-xl bg-emerald-500/95 hover:bg-emerald-600 text-white font-bold text-xl transition-colors active:scale-95"
                aria-label={`${player.name} に○`}
              >
                ○
              </button>
              <button
                onClick={() => handleCircle('wrong')}
                className="flex-1 flex items-center justify-center py-2 rounded-xl bg-red-100/95 hover:bg-red-200 text-red-600 font-bold text-xl transition-colors active:scale-95"
                aria-label={`${player.name} に✕`}
              >
                ✕
              </button>
            </div>
          )}
          <button
            onClick={handleToggleLock}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-colors active:scale-95 ${
              locked
                ? 'flex-1 bg-amber-500/95 hover:bg-amber-600 text-white'
                : 'bg-slate-600/80 hover:bg-slate-700 text-white'
            }`}
            aria-label={locked ? `${player.name} のロックを解除` : `${player.name} をロック`}
          >
            {locked ? <LockOpen size={13} /> : <Lock size={13} />}
            {locked ? 'ロック解除' : 'ロック'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative bg-white rounded-2xl shadow-md border p-5 flex flex-col items-center gap-2 transition-shadow hover:shadow-lg ${locked ? 'border-slate-400 opacity-70 grayscale' : 'border-slate-200'}`}>
      {/* LOCKEDウォーターマーク */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 rounded-2xl overflow-hidden">
          <span className="text-xl font-black text-white bg-black/40 px-3 py-0.5 rounded border-2 border-white/70 -rotate-12 tracking-widest select-none">
            LOCKED
          </span>
        </div>
      )}

      {/* 削除ボタン */}
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-20"
        aria-label={`${player.name} を削除`}
      >
        <Trash2 size={14} />
      </button>

      <p className="text-sm font-semibold text-slate-600 text-center break-words w-full px-4 leading-snug">
        {player.name}
      </p>

      <p className="text-5xl font-bold tabular-nums text-slate-800 leading-none">
        {player.score}
      </p>

      {/* 増減ボタン＋ロックボタン: ホバー時にオーバーレイ表示 */}
      <div className="absolute inset-0 rounded-2xl flex flex-col gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {!locked && (
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => handleScore(-1)}
              className="flex-1 flex items-center justify-center py-2 rounded-xl bg-slate-200/95 hover:bg-slate-300 text-slate-700 font-semibold text-sm transition-colors active:scale-95"
              aria-label={`${player.name} のスコアを減らす`}
            >
              -1
            </button>
            <button
              onClick={() => handleScore(1)}
              className="flex-1 flex items-center justify-center py-2 rounded-xl bg-blue-600/95 hover:bg-blue-700 text-white font-semibold text-sm transition-colors active:scale-95"
              aria-label={`${player.name} のスコアを増やす`}
            >
              +1
            </button>
          </div>
        )}
        <button
          onClick={handleToggleLock}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-colors active:scale-95 ${
            locked
              ? 'flex-1 bg-amber-500/95 hover:bg-amber-600 text-white'
              : 'bg-slate-600/80 hover:bg-slate-700 text-white'
          }`}
          aria-label={locked ? `${player.name} のロックを解除` : `${player.name} をロック`}
        >
          {locked ? <LockOpen size={13} /> : <Lock size={13} />}
          {locked ? 'ロック解除' : 'ロック'}
        </button>
      </div>
    </div>
  );
}
