import { X } from 'lucide-react';

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-ng/10 border border-ng/40 px-4 py-3 text-ng text-sm">
      <span className="flex-1 whitespace-pre-wrap">{message}</span>
      <button
        onClick={onClose}
        className="shrink-0 rounded p-0.5 hover:bg-ng/20 transition-colors"
        aria-label="エラーを閉じる"
      >
        <X size={16} />
      </button>
    </div>
  );
}
