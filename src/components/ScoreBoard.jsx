import { useState, useRef } from 'react';
import { ArrowDownUp } from 'lucide-react';
import PlayerCard from './PlayerCard.jsx';

export default function ScoreBoard({ players, dispatch }) {
  const dragFromRef = useRef(null);
  const [dragFrom, setDragFrom] = useState(null);
  const [insertAt, setInsertAt] = useState(null);
  const [sortedByScore, setSortedByScore] = useState(false);

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-lg font-medium">プレイヤーがいません</p>
        <p className="text-sm mt-1">「プレイヤーを追加」ボタンから追加してください</p>
      </div>
    );
  }

  const displayPlayers = sortedByScore
    ? [...players].sort((a, b) => b.score - a.score)
    : players;

  const handleDragStart = (index) => {
    dragFromRef.current = index;
    setDragFrom(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragFromRef.current === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const insertBefore = e.clientX < rect.left + rect.width / 2;
    setInsertAt(insertBefore ? index : index + 1);
  };

  const handleDrop = () => {
    const from = dragFromRef.current;
    if (from !== null && insertAt !== null && insertAt !== from && insertAt !== from + 1) {
      const to = insertAt > from ? insertAt - 1 : insertAt;
      dispatch({ type: 'player/reorder', payload: { from, to } });
    }
    dragFromRef.current = null;
    setDragFrom(null);
    setInsertAt(null);
  };

  const handleDragEnd = () => {
    dragFromRef.current = null;
    setDragFrom(null);
    setInsertAt(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setSortedByScore((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
            sortedByScore
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={sortedByScore ? '元の順序に戻す' : '得点が高い順に並び替え'}
        >
          <ArrowDownUp size={15} />
          {sortedByScore ? '元の順序に戻す' : '得点順'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayPlayers.map((player, index) => {
          const isLast = index === displayPlayers.length - 1;
          const showLeftLine = !sortedByScore && insertAt === index;
          const showRightLine = !sortedByScore && insertAt === displayPlayers.length && isLast;

          return (
            <div
              key={player.id}
              draggable={!sortedByScore}
              onDragStart={!sortedByScore ? () => handleDragStart(index) : undefined}
              onDragOver={!sortedByScore ? (e) => handleDragOver(e, index) : undefined}
              onDrop={!sortedByScore ? handleDrop : undefined}
              onDragEnd={!sortedByScore ? handleDragEnd : undefined}
              className={`rounded-2xl transition-opacity ${
                !sortedByScore ? 'cursor-grab active:cursor-grabbing' : ''
              } ${dragFrom === index ? 'opacity-40' : ''}`}
              style={
                showLeftLine
                  ? { boxShadow: '-3px 0 0 0 rgb(59 130 246)' }
                  : showRightLine
                  ? { boxShadow: '3px 0 0 0 rgb(59 130 246)' }
                  : undefined
              }
            >
              <PlayerCard player={player} dispatch={dispatch} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
