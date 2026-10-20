import { defaultRule } from '../rules/index.js';

// questions がインポート済みだがまだ問題を表示していない状態を表す sentinel 値
export const QUESTION_PLACEHOLDER_INDEX = -1;

export function isQuestionPlaceholder(index) {
  return index === QUESTION_PLACEHOLDER_INDEX;
}

export const initialState = {
  title: 'クイズ得点板',
  rule: defaultRule(), // { id, params }。一覧は src/rules/index.js
  questionNo: 0, // 終わった問題の数。○で1進む（今の問題は questionNo + 1）
  players: [],
  // [{ id, name, locked, ...PLAY_FIELDS }]（PLAY_FIELDS は src/rules/helpers.js）
  questions: [],
  // [{ no: string, question: string, answer: string, note: string }]
  currentIndex: 0,
  history: [],
  // [{ type: 'answer/record', playerId, result, changes: [{ id, before, after }], questionNo: { before, after }, timestamp }]
  historyIndex: -1,
  ui: {
    importError: '',
  },
};

export function clampIndex(index, questions) {
  if (questions.length === 0) return 0;
  return Math.min(Math.max(index, QUESTION_PLACEHOLDER_INDEX), questions.length - 1);
}
