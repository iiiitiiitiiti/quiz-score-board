import { useState, useRef, useLayoutEffect } from 'react';
import { ArrowDownUp } from 'lucide-react';
import PlayerCard from './PlayerCard.jsx';

function useFlipAnimation(containerRef, trigger) {
  const prevPositions = useRef({});

  const capture = () => {
    const cards = containerRef.current?.querySelectorAll('[data-player-id]') ?? [];
    prevPositions.current = Object.fromEntries(
      [...cards].map((card) => {
        const rect = card.getBoundingClientRect();
        return [card.dataset.playerId, { x: rect.left, y: rect.top }];
      })
    );
  };

  // FLIP - Last → Invert → Play
  useLayoutEffect(() => {
    if (!containerRef.current || Object.keys(prevPositions.current).length === 0) return;

    const cards = containerRef.current.querySelectorAll('[data-player-id]');
    cards.forEach((card) => {
      const id = card.dataset.playerId;
      const old = prevPositions.current[id];
      if (!old) return;

      const newRect = card.getBoundingClientRect();
      const dx = old.x - newRect.left;
      const dy = old.y - newRect.top;
      if (dx === 0 && dy === 0) return;

      // Invert: instantly move back to old position
      card.style.transform = `translate(${dx}px, ${dy}px)`;
      card.style.transition = 'none';

      // Play: let CSS transition animate to natural position
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.transform = '';
          card.style.transition = 'transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          card.addEventListener(
            'transitionend',
            () => { card.style.transition = ''; },
            { once: true }
          );
        });
      });
    });

    prevPositions.current = {};
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return { capture };
}

export default function ScoreBoard({ players, mode, dispatch }) {
  const dragFromRef = useRef(null);
  const [dragFrom, setDragFrom] = useState(null);
  const [insertAt, setInsertAt] = useState(null);
  const [sortedByScore, setSortedByScore] = useState(false);
  const gridRef = useRef(null);
  const { capture } = useFlipAnimation(gridRef, sortedByScore);

  const displayPlayers = sortedByScore
    ? [...players].sort((a, b) => {
        if (mode === 'circle-cross') {
          const correctDiff = (b.correct ?? 0) - (a.correct ?? 0);
          if (correctDiff !== 0) return correctDiff;
          return (a.wrong ?? 0) - (b.wrong ?? 0);
        }
        return b.score - a.score;
      })
    : players;

  const handleSortToggle = () => {
    // FLIP - First: record current positions before state update
    capture();
    setSortedByScore((v) => !v);
  };

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
          onClick={handleSortToggle}
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

      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayPlayers.map((player, index) => {
          const isFirst = index === 0;
          const isLast = index === displayPlayers.length - 1;
          const showLeftLine = !sortedByScore && insertAt === index;
          const showRightLine = !sortedByScore && insertAt === displayPlayers.length && isLast;

          return (
            <div
              key={player.id}
              data-player-id={player.id}
              draggable={!sortedByScore}
              onDragStart={!sortedByScore ? () => handleDragStart(index) : undefined}
              onDragOver={!sortedByScore ? (e) => handleDragOver(e, index) : undefined}
              onDrop={!sortedByScore ? handleDrop : undefined}
              onDragEnd={!sortedByScore ? handleDragEnd : undefined}
              className={`relative rounded-2xl transition-opacity ${
                !sortedByScore ? 'cursor-grab active:cursor-grabbing' : ''
              } ${dragFrom === index ? 'opacity-40' : ''}`}
            >
              {/* 挿入位置の縦線: カードとカードの間のgap中央に配置 */}
              {showLeftLine && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-blue-500 rounded-full z-30 pointer-events-none"
                  style={{ left: isFirst ? 2 : -9 }}
                />
              )}
              {showRightLine && (
                <div
                  className="absolute top-0 right-0.5 h-full w-0.5 bg-blue-500 rounded-full z-30 pointer-events-none"
                />
              )}
              <PlayerCard player={player} mode={mode} dispatch={dispatch} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
