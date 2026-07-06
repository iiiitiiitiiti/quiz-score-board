import { Lock, LockOpen, Trash2, Trophy } from 'lucide-react';

// 解答者席パネル: 名前 → 電光数字 → 常時表示の操作ボタン、の縦構成
function PlayerCardShell({ player, locked, isSorting, onRemove, onToggleLock, onWinner, children, actionButtons }) {
  return (
    <div className={`relative bg-panel rounded-2xl border shadow-md p-4 pt-2 flex flex-col items-center gap-2 transition-colors ${locked ? 'border-ink-dim/50 opacity-60 grayscale' : 'border-panel-edge'}`}>
      {/* LOCKEDウォーターマーク */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 rounded-2xl overflow-hidden">
          <span className="text-xl font-black text-white bg-black/40 px-3 py-0.5 rounded border-2 border-white/70 -rotate-12 tracking-widest select-none">
            LOCKED
          </span>
        </div>
      )}

      {/* 管理アイコン列: ロック・優勝・削除 */}
      {!isSorting && (
        <div className="w-full flex justify-end gap-0.5">
          <button
            onClick={onToggleLock}
            className={`p-1.5 rounded-lg transition-colors ${
              locked ? 'text-lamp hover:bg-lamp/15' : 'text-ink-dim hover:text-ink hover:bg-panel-edge'
            }`}
            aria-label={locked ? `${player.name} のロックを解除` : `${player.name} をロック`}
            title={locked ? 'ロック解除' : 'ロック'}
          >
            {locked ? <LockOpen size={14} /> : <Lock size={14} />}
          </button>
          <button
            onClick={onWinner}
            className="p-1.5 rounded-lg text-ink-dim hover:text-lamp hover:bg-lamp/15 transition-colors"
            aria-label={`${player.name} を優勝者に設定`}
            title="優勝確定"
          >
            <Trophy size={14} />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-ink-dim hover:text-ng hover:bg-ng/15 transition-colors"
            aria-label={`${player.name} を削除`}
            title="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <p className="text-sm font-semibold text-ink text-center break-words w-full px-2 leading-snug">
        {player.name}
      </p>

      {children}

      {!isSorting && <div className="w-full mt-1">{actionButtons}</div>}
    </div>
  );
}

export default function PlayerCard({ player, mode, dispatch, isSorting, onWinner }) {
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
      <PlayerCardShell
        player={player}
        locked={locked}
        isSorting={isSorting}
        onRemove={handleRemove}
        onToggleLock={handleToggleLock}
        onWinner={onWinner}
        actionButtons={
          <div className="flex gap-2">
            <button
              onClick={() => handleCircle('correct')}
              disabled={locked}
              className="flex-1 flex items-center justify-center py-2 rounded-xl bg-ok/15 hover:bg-ok/30 text-ok font-bold text-xl border border-ok/40 transition-colors active:scale-95 disabled:cursor-not-allowed"
              aria-label={`${player.name} に○`}
            >
              ○
            </button>
            <button
              onClick={() => handleCircle('wrong')}
              disabled={locked}
              className="flex-1 flex items-center justify-center py-2 rounded-xl bg-ng/15 hover:bg-ng/30 text-ng font-bold text-xl border border-ng/40 transition-colors active:scale-95 disabled:cursor-not-allowed"
              aria-label={`${player.name} に✕`}
            >
              ✕
            </button>
          </div>
        }
      >
        <div className="h-14 flex items-center gap-2">
          <span className="text-xl font-bold text-ok leading-none">○</span>
          <span className="text-4xl font-black text-ok tabular-nums leading-none">{correct}</span>
          <div className="w-px h-8 bg-panel-edge mx-1" />
          <span className="text-xl font-bold text-ng leading-none">✕</span>
          <span className="text-4xl font-black text-ng tabular-nums leading-none">{wrong}</span>
        </div>
      </PlayerCardShell>
    );
  }

  return (
    <PlayerCardShell
      player={player}
      locked={locked}
      isSorting={isSorting}
      onRemove={handleRemove}
      onToggleLock={handleToggleLock}
      onWinner={onWinner}
      actionButtons={
        <div className="flex gap-2">
          <button
            onClick={() => handleScore(-1)}
            disabled={locked}
            className="flex-1 flex items-center justify-center py-2 rounded-xl bg-panel-edge/60 hover:bg-panel-edge text-ink font-bold text-base transition-colors active:scale-95 disabled:cursor-not-allowed"
            aria-label={`${player.name} のスコアを減らす`}
          >
            −1
          </button>
          <button
            onClick={() => handleScore(1)}
            disabled={locked}
            className="flex-1 flex items-center justify-center py-2 rounded-xl bg-lamp hover:bg-lamp/85 text-stage font-bold text-base transition-colors active:scale-95 disabled:cursor-not-allowed"
            aria-label={`${player.name} のスコアを増やす`}
          >
            +1
          </button>
        </div>
      }
    >
      {/* 電光数字: このカードの主役 */}
      <p
        className="h-14 flex items-center text-5xl font-black tabular-nums text-lamp leading-none"
        style={{ textShadow: '0 0 24px rgba(217, 119, 6, 0.25)' }}
      >
        {player.score}
      </p>
    </PlayerCardShell>
  );
}
