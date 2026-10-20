import { useState } from 'react';
import { Lock, LockOpen, Trash2, Trophy } from 'lucide-react';
import { getRule, playerView, FINISH_WON, FINISH_OUT } from '../rules/index.js';

const BADGE_TONES = {
  lamp: 'bg-lamp/15 text-lamp border-lamp/40',
  ok: 'bg-ok/15 text-ok border-ok/40',
  ng: 'bg-ng/15 text-ng border-ng/40',
};

// 解答者席パネル: 名前 → 電光数字 → 常時表示の操作ボタン、の縦構成
function PlayerCardShell({ player, locked, finish, badges, isSorting, onRemove, onToggleLock, onWinner, onRename, children, actionButtons }) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  const startEditName = () => {
    setDraftName(player.name);
    setEditingName(true);
  };

  const commitName = () => {
    onRename(draftName);
    setEditingName(false);
  };

  return (
    <div className={`relative bg-panel rounded-2xl border shadow-md p-4 pt-2 flex flex-col items-center gap-2 transition-colors ${
      locked ? 'border-ink-dim/50 opacity-60 grayscale' : finish === FINISH_WON ? 'border-lamp ring-2 ring-lamp/30' : finish === FINISH_OUT ? 'border-panel-edge opacity-60' : 'border-panel-edge'
    }`}>
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

      {editingName ? (
        <input
          autoFocus
          type="text"
          value={draftName}
          maxLength={30}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) commitName();
            if (e.key === 'Escape') setEditingName(false);
          }}
          // 親カードが draggable のため、dragstart を潰さないと入力内のテキスト選択がドラッグに化ける
          draggable
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="text-lg font-semibold text-ink text-center w-full px-2 leading-snug bg-transparent border-b-2 border-lamp outline-none"
        />
      ) : (
        <p
          className="text-lg font-semibold text-ink text-center break-words w-full px-2 leading-snug cursor-pointer hover:text-lamp transition-colors"
          onClick={startEditName}
          title="クリックして名前を編集"
        >
          {player.name}
        </p>
      )}

      {/* 札: 勝ち抜け・失格とルールごとの状態（通過席など）。高さを固定してカードの段をそろえる */}
      <div className="h-6 flex flex-wrap items-center justify-center gap-1">
        {badges.map((b) => (
          <span key={b.label} className={`px-2 py-0.5 rounded-full border text-xs font-bold leading-none ${BADGE_TONES[b.tone] ?? BADGE_TONES.lamp}`}>
            {b.label}
          </span>
        ))}
      </div>

      {children}

      {!isSorting && <div className="w-full mt-1">{actionButtons}</div>}
    </div>
  );
}

function ScoreDisplay({ view }) {
  if (view.kind === 'circle') {
    return (
      <div className="h-14 flex items-center gap-2">
        <span className="text-xl font-bold text-ok leading-none">○</span>
        <span className="text-4xl font-black text-ok tabular-nums leading-none">{view.correct}</span>
        {view.correctMax != null && <span className="text-base font-bold text-ok/70 tabular-nums leading-none">/{view.correctMax}</span>}
        <div className="w-px h-8 bg-panel-edge mx-1" />
        <span className="text-xl font-bold text-ng leading-none">✕</span>
        <span className="text-4xl font-black text-ng tabular-nums leading-none">{view.wrong}</span>
        {view.wrongMax != null && <span className="text-base font-bold text-ng/70 tabular-nums leading-none">/{view.wrongMax}</span>}
      </div>
    );
  }
  if (view.kind === 'text') {
    return (
      <p className="h-14 flex items-center text-2xl font-black tabular-nums text-lamp leading-none text-center">
        {view.value}
      </p>
    );
  }
  // 電光数字: このカードの主役
  return (
    <p
      className="h-14 flex items-center text-5xl font-black tabular-nums text-lamp leading-none"
      style={{ textShadow: '0 0 24px rgba(217, 119, 6, 0.25)' }}
    >
      {view.value}
    </p>
  );
}

export default function PlayerCard({ player, players, rule, dispatch, isSorting, onWinner }) {
  const locked = player.locked ?? false;
  const def = getRule(rule.id);
  const view = playerView(rule, player, players);
  // 勝ち負けの決まった人は reducer でも受け付けない。ボタンも止めて見た目で分かるようにする
  const finished = player.finish === FINISH_WON || player.finish === FINISH_OUT;
  const disabled = locked || finished;

  const finishBadge =
    player.finish === FINISH_WON
      ? [{ label: `${player.finishOrder}抜け`, tone: 'lamp' }]
      : player.finish === FINISH_OUT
        ? [{ label: '失格', tone: 'ng' }]
        : [];

  const handleAnswer = (result) => {
    if (disabled) return;
    dispatch({ type: 'answer/record', payload: { playerId: player.id, result } });
  };

  const handleRemove = () => {
    if (window.confirm(`「${player.name}」を削除しますか？`)) {
      dispatch({ type: 'player/remove', payload: { id: player.id } });
    }
  };

  const handleToggleLock = () => {
    dispatch({ type: 'player/toggleLock', payload: { id: player.id } });
  };

  const handleRename = (name) => {
    dispatch({ type: 'player/rename', payload: { id: player.id, name } });
  };

  const actionButtons =
    def.buttonStyle === 'score' ? (
      <div className="flex gap-2">
        <button
          onClick={() => handleAnswer('wrong')}
          disabled={disabled}
          className="flex-1 flex items-center justify-center py-2 rounded-xl bg-panel-edge/60 hover:bg-panel-edge text-ink font-bold text-base transition-colors active:scale-95 disabled:cursor-not-allowed"
          aria-label={`${player.name} のスコアを減らす`}
        >
          {def.labels.wrong}
        </button>
        <button
          onClick={() => handleAnswer('correct')}
          disabled={disabled}
          className="flex-1 flex items-center justify-center py-2 rounded-xl bg-lamp hover:bg-lamp/85 text-stage font-bold text-base transition-colors active:scale-95 disabled:cursor-not-allowed"
          aria-label={`${player.name} のスコアを増やす`}
        >
          {def.labels.correct}
        </button>
      </div>
    ) : (
      <div className="flex gap-2">
        <button
          onClick={() => handleAnswer('correct')}
          disabled={disabled}
          className="flex-1 flex items-center justify-center py-2 rounded-xl bg-ok/15 hover:bg-ok/30 text-ok font-bold text-xl border border-ok/40 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`${player.name} に${def.labels.correct}`}
        >
          {def.labels.correct}
        </button>
        <button
          onClick={() => handleAnswer('wrong')}
          disabled={disabled}
          className="flex-1 flex items-center justify-center py-2 rounded-xl bg-ng/15 hover:bg-ng/30 text-ng font-bold text-xl border border-ng/40 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`${player.name} に${def.labels.wrong}`}
        >
          {def.labels.wrong}
        </button>
      </div>
    );

  return (
    <PlayerCardShell
      player={player}
      locked={locked}
      finish={player.finish}
      badges={[...finishBadge, ...view.badges]}
      isSorting={isSorting}
      onRemove={handleRemove}
      onToggleLock={handleToggleLock}
      onWinner={onWinner}
      onRename={handleRename}
      actionButtons={actionButtons}
    >
      <ScoreDisplay view={view} />
      <p className="h-5 text-sm text-ink-dim tabular-nums leading-5">{view.sub ?? ''}</p>
    </PlayerCardShell>
  );
}
