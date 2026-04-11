// questions がインポート済みだがまだ問題を表示していない状態を表す sentinel 値
export const QUESTION_PLACEHOLDER_INDEX = -1;

export function isQuestionPlaceholder(index) {
  return index === QUESTION_PLACEHOLDER_INDEX;
}

export const initialState = {
  title: 'クイズ得点板',
  mode: 'score', // 'score' | 'circle-cross'
  players: [],
  // [{ id: string, name: string, score: number, correct: number, wrong: number }]
  questions: [],
  // [{ no: string, question: string, answer: string, note: string }]
  currentIndex: 0,
  history: [],
  // [{ type: 'score/update', playerId, oldScore, newScore, delta, timestamp }]
  // [{ type: 'circle/record', playerId, result, oldVal, newVal, timestamp }]
  historyIndex: -1,
  ui: {
    importError: '',
  },
};

export function clampIndex(index, questions) {
  if (questions.length === 0) return 0;
  return Math.min(Math.max(index, QUESTION_PLACEHOLDER_INDEX), questions.length - 1);
}
