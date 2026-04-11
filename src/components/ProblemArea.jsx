import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProblemArea({ questions, currentIndex, dispatch }) {
  if (questions.length === 0) return null;

  const isPlaceholder = currentIndex === -1;
  const q = isPlaceholder ? null : questions[currentIndex];
  const isFirst = isPlaceholder;
  const isLast = currentIndex === questions.length - 1;

  const displayNo = isPlaceholder ? '0' : q.no;
  const displayQuestion = isPlaceholder ? 'ここに問題文を表示' : q.question;
  const displayAnswer = isPlaceholder ? 'ここに解答を表示' : q.answer;
  const displayNote = isPlaceholder ? 'ここに備考を表示' : q.note;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
          No. {displayNo}
        </span>
        <span className="text-xs text-slate-400">
          {isPlaceholder ? `0 / ${questions.length}` : `${currentIndex + 1} / ${questions.length}`}
        </span>
      </div>

      <div className="flex gap-6">
        {/* 左カラム: 問題文 */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">問題</p>
          <p className={`text-lg whitespace-pre-wrap leading-relaxed ${isPlaceholder ? 'text-slate-300 italic' : 'text-slate-800'}`}>
            {displayQuestion}
          </p>
        </div>

        {/* 右カラム: 答えと備考 */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">答え</p>
          <p className={`text-xl font-bold whitespace-pre-wrap leading-relaxed ${isPlaceholder ? 'text-blue-200 italic' : 'text-blue-700'}`}>
            {displayAnswer}
          </p>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">備考</p>
            <p className={`text-sm whitespace-pre-wrap ${isPlaceholder ? 'text-slate-300 italic' : 'text-slate-500'}`}>
              {displayNote || (isPlaceholder ? '' : '—')}
            </p>
          </div>
        </div>
      </div>

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
