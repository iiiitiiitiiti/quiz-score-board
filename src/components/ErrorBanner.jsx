import { X } from 'lucide-react';

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
      <span className="flex-1 whitespace-pre-wrap">{message}</span>
      <button
        onClick={onClose}
        className="shrink-0 rounded p-0.5 hover:bg-red-100 transition-colors"
        aria-label="エラーを閉じる"
      >
        <X size={16} />
      </button>
    </div>
  );
}
