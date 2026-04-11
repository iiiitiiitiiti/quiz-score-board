export const initialState = {
  players: [],
  // [{ id: string, name: string, score: number }]
  questions: [],
  // [{ no: string, question: string, answer: string, note: string }]
  currentIndex: 0,
  history: [],
  // [{ type: 'score/update', playerId, oldScore, newScore, delta, timestamp }]
  historyIndex: -1,
  ui: {
    importError: '',
  },
};

export function clampIndex(index, questions) {
  if (questions.length === 0) return 0;
  return Math.min(Math.max(index, 0), questions.length - 1);
}
