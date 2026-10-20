import { updatePlayer } from './helpers.js';

export default {
  id: 'free-circle',
  name: '自由○×',
  description: '○と✕の数を数えます。勝ち抜けや失格は自動で決めません。',
  labels: { correct: '○', wrong: '✕' },
  params: [],
  answer(players, playerId, result) {
    const field = result === 'correct' ? 'correct' : 'wrong';
    return updatePlayer(players, playerId, (p) => ({ [field]: p[field] + 1 }));
  },
  compare(a, b) {
    return b.correct - a.correct || a.wrong - b.wrong;
  },
  view(p) {
    return { kind: 'circle', correct: p.correct, wrong: p.wrong, summary: `○ ${p.correct}  ✕ ${p.wrong}` };
  },
};
