import PlayerCard from './PlayerCard.jsx';

export default function ScoreBoard({ players, dispatch }) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-lg font-medium">プレイヤーがいません</p>
        <p className="text-sm mt-1">「プレイヤーを追加」ボタンから追加してください</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} dispatch={dispatch} />
      ))}
    </div>
  );
}
