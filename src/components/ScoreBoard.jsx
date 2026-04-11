import { useState, useRef } from 'react';
import PlayerCard from './PlayerCard.jsx';

export default function ScoreBoard({ players, dispatch }) {
  const dragFromRef = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-lg font-medium">プレイヤーがいません</p>
        <p className="text-sm mt-1">「プレイヤーを追加」ボタンから追加してください</p>
      </div>
    );
  }

  const handleDragStart = (index) => {
    dragFromRef.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragFromRef.current !== index) setDragOver(index);
  };

  const handleDrop = (index) => {
    if (dragFromRef.current !== null && dragFromRef.current !== index) {
      dispatch({ type: 'player/reorder', payload: { from: dragFromRef.current, to: index } });
    }
    dragFromRef.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragFromRef.current = null;
    setDragOver(null);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {players.map((player, index) => (
        <div
          key={player.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={`rounded-2xl transition-all cursor-grab active:cursor-grabbing ${
            dragOver === index ? 'ring-2 ring-blue-400 scale-105' : ''
          } ${
            dragFromRef.current === index ? 'opacity-40' : ''
          }`}
        >
          <PlayerCard player={player} dispatch={dispatch} />
        </div>
      ))}
    </div>
  );
}
