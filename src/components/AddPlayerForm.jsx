import { useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function AddPlayerForm({ dispatch }) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'player/add', payload: { name: trimmed } });
    setName('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-lamp text-stage hover:bg-lamp/85 transition-colors"
      >
        <UserPlus size={16} />
        プレイヤーを追加
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="プレイヤー名"
        className="px-3 py-2 rounded-xl bg-panel border border-panel-edge text-ink text-sm placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-lamp w-40"
        maxLength={30}
      />
      <button
        type="submit"
        className="px-3 py-2 rounded-xl text-sm font-semibold bg-lamp text-stage hover:bg-lamp/85 transition-colors"
      >
        追加
      </button>
      <button
        type="button"
        onClick={() => { setName(''); setOpen(false); }}
        className="px-3 py-2 rounded-xl text-sm font-semibold bg-panel text-ink hover:bg-panel-edge transition-colors"
      >
        キャンセル
      </button>
    </form>
  );
}
