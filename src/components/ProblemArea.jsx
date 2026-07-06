import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { isQuestionPlaceholder } from '../store/initialState.js';

export default function ProblemArea({ questions, currentIndex, dispatch }) {
  if (questions.length === 0) return null;

  const isPlaceholder = isQuestionPlaceholder(currentIndex);
  const q = isPlaceholder ? null : questions[currentIndex];
  const isFirst = isPlaceholder;
  const isLast = currentIndex === questions.length - 1;

  const displayNo = isPlaceholder ? '0' : q.no;
  const displayQuestion = isPlaceholder ? 'ここに問題文を表示' : q.question;
  const displayAnswer = isPlaceholder ? 'ここに解答を表示' : q.answer;
  const displayNote = isPlaceholder ? 'ここに備考を表示' : q.note;

  return (
    <div className="bg-panel rounded-2xl border border-panel-edge p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="px-2.5 py-1 rounded-lg bg-lamp/15 text-lamp text-xs font-bold tracking-widest tabular-nums">
          No. {displayNo}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-dim tabular-nums">
            {isPlaceholder ? `0 / ${questions.length}` : `${currentIndex + 1} / ${questions.length}`}
          </span>
          <button
            onClick={() => {
              if (window.confirm('読み込んだ問題データを消去しますか？')) {
                dispatch({ type: 'questions/clear' });
              }
            }}
            className="p-0.5 rounded text-ink-dim hover:text-ink hover:bg-panel-edge transition-colors"
            title="問題データを消去"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-36 overflow-hidden">
        {/* 左カラム: 問題文 */}
        <div className="flex-[2] min-w-0 overflow-y-auto">
          <p className="text-xs font-semibold text-ink-dim uppercase tracking-widest mb-1">問題</p>
          <p className={`text-lg whitespace-pre-wrap leading-relaxed ${isPlaceholder ? 'text-ink-dim/60 italic' : 'text-ink'}`}>
            {displayQuestion}
          </p>
        </div>

        {/* 右カラム: 答えと備考 */}
        <div className="flex-[1] min-w-0 overflow-y-auto">
          <p className="text-xs font-semibold text-ink-dim uppercase tracking-widest mb-1">答え</p>
          <p className={`text-xl font-bold whitespace-pre-wrap leading-relaxed ${isPlaceholder ? 'text-lamp/40 italic' : 'text-lamp'}`}>
            {displayAnswer}
          </p>
          <div className="mt-3">
            <p className="text-xs font-semibold text-ink-dim uppercase tracking-widest mb-0.5">備考</p>
            <p className={`text-sm whitespace-pre-wrap ${isPlaceholder ? 'text-ink-dim/60 italic' : 'text-ink-dim'}`}>
              {displayNote || (isPlaceholder ? '' : '—')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-5 justify-end">
        <button
          onClick={() => dispatch({ type: 'question/prev' })}
          disabled={isFirst}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-panel-edge/60 text-ink hover:bg-panel-edge disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          前の問題
        </button>
        <button
          onClick={() => dispatch({ type: 'question/next' })}
          disabled={isLast}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-lamp text-stage hover:bg-lamp/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          次の問題
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
