import { SkipForward } from 'lucide-react';
import { getRule, questionLimit, isOver } from '../rules/index.js';

// 問題の数を使うルールだけに出す帯: 今の問題番号と、誰も答えずに次へ進むスルー
export default function QuestionBar({ rule, questionNo, dispatch }) {
  if (!getRule(rule.id).usesQuestions) return null;

  const limit = questionLimit(rule);
  const over = isOver(rule, questionNo);

  const handleThrough = () => {
    if (over) return;
    dispatch({ type: 'answer/record', payload: { playerId: null, result: 'through' } });
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3 bg-panel rounded-2xl border border-panel-edge px-4 py-2">
      <p className="text-lg font-bold text-ink tabular-nums">
        {over ? (
          <span className="text-lamp">{limit}問終了</span>
        ) : (
          <>
            第<span className="text-2xl text-lamp mx-0.5">{questionNo + 1}</span>問
            {limit > 0 && <span className="text-sm text-ink-dim ml-1">/ {limit}問</span>}
          </>
        )}
      </p>
      <button
        onClick={handleThrough}
        disabled={over}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-panel-edge/60 hover:bg-panel-edge text-ink text-sm font-semibold transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        title="誰も正解しなかった問題を飛ばして次の問題へ進みます"
      >
        <SkipForward size={15} />
        スルー
      </button>
    </div>
  );
}
