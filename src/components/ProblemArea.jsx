import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProblemArea({ questions, currentIndex, dispatch }) {
  if (questions.length === 0) return null;

  const q = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
          No. {q.no}
        </span>
        <span className="text-xs text-slate-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-base text-slate-500 font-medium mb-1">問題</p>
        <p className="text-lg text-slate-800 whitespace-pre-wrap leading-relaxed">
          {q.question}
        </p>
      </div>

      <div className="mb-3">
        <p className="text-base text-slate-500 font-medium mb-1">答え</p>
        <p className="text-xl font-bold text-blue-700 whitespace-pre-wrap leading-relaxed">
          {q.answer}
        </p>
      </div>

      {q.note && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-0.5">備考</p>
          <p className="text-sm text-slate-500 whitespace-pre-wrap">{q.note}</p>
        </div>
      )}

      <div className="flex gap-3 mt-5 justify-end">
        <button
          onClick={() => dispatch({ type: 'question/prev' })}
          disabled={isFirst}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          前の問題
        </button>
        <button
          onClick={() => dispatch({ type: 'question/next' })}
          disabled={isLast}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          次の問題
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
