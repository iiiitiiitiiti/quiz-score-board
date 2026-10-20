import { updatePlayer } from './helpers.js';

export default {
  id: 'free-score',
  name: '自由得点',
  description: '+1 と −1 のボタンで点を付けます。勝ち抜けや失格は自動で決めません。',
  labels: { correct: '+1', wrong: '−1' },
  // ボタンを −1・+1 の順に並べる（ほかのルールは ○・✕ の順）
  buttonStyle: 'score',
  params: [],
  answer(players, playerId, result) {
    const delta = result === 'correct' ? 1 : -1;
    return updatePlayer(players, playerId, (p) => ({ score: p.score + delta }));
  },
  compare(a, b) {
    return b.score - a.score;
  },
  view(p) {
    return { kind: 'number', value: p.score, summary: `${p.score} 点` };
  },
};
