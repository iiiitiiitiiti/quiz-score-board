import { Trash2 } from 'lucide-react';

export default function PlayerCard({ player, mode, dispatch }) {
  const handleScore = (delta) => {
    dispatch({ type: 'score/update', payload: { playerId: player.id, delta } });
  };

  const handleCircle = (result) => {
    dispatch({ type: 'circle/record', payload: { playerId: player.id, result } });
  };

  const handleRemove = () => {
    if (window.confirm(`「${player.name}」を削除しますか？`)) {
      dispatch({ type: 'player/remove', payload: { id: player.id } });
    }
  };

  if (mode === 'circle-cross') {
    const correct = player.correct ?? 0;
    const wrong = player.wrong ?? 0;
    return (
      <div className="group relative bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex flex-col items-center gap-2 transition-shadow hover:shadow-lg">
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

        <div className="flex items-center gap-3 mt-1">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-emerald-600 tabular-nums leading-none">{correct}</span>
            <span className="text-xs text-emerald-500 font-medium mt-0.5">○</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-red-500 tabular-nums leading-none">{wrong}</span>
            <span className="text-xs text-red-400 font-medium mt-0.5">✕</span>
          </div>
        </div>

        <div className="absolute inset-0 rounded-2xl flex gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex flex-col items-center gap-2 transition-shadow hover:shadow-lg">
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

      {/* 増減ボタン: ホバー時にオーバーレイ表示（余白なし） */}
      <div className="absolute inset-0 rounded-2xl flex gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
    </div>
  );
}
