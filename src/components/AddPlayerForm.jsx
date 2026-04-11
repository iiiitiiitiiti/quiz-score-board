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
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
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
        className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
        maxLength={30}
      />
      <button
        type="submit"
        className="px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
      >
        追加
      </button>
      <button
        type="button"
        onClick={() => { setName(''); setOpen(false); }}
        className="px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        キャンセル
      </button>
    </form>
  );
}
