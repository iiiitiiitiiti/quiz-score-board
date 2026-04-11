import { Plus, Minus, Trash2 } from 'lucide-react';

export default function PlayerCard({ player, dispatch }) {
  const handleScore = (delta) => {
    dispatch({ type: 'score/update', payload: { playerId: player.id, delta } });
  };

  const handleRemove = () => {
    if (window.confirm(`「${player.name}」を削除しますか？`)) {
      dispatch({ type: 'player/remove', payload: { id: player.id } });
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex flex-col items-center gap-3 transition-shadow hover:shadow-lg">
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
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

      <div className="flex gap-2 w-full">
        <button
          onClick={() => handleScore(-1)}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-colors active:scale-95"
          aria-label={`${player.name} のスコアを減らす`}
        >
          <Minus size={16} />
          <span>-1</span>
        </button>
        <button
          onClick={() => handleScore(1)}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors active:scale-95"
          aria-label={`${player.name} のスコアを増やす`}
        >
          <Plus size={16} />
          <span>+1</span>
        </button>
      </div>
    </div>
  );
}
