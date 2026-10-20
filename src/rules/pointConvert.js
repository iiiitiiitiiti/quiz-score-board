import { updatePlayer } from './helpers.js';

// ためた○は stock で持つ。換算で stock の2乗が点に入る
export default {
  id: 'point-convert',
  name: 'ポイント換算クイズ',
  description: '○をためて、好きなときに「換算」で点に換えます。点はためた○の数の2乗（1・4・9…）です。✕でためた○は0に戻り、ためた○が無いときの✕は休みです。上限の問題数で終わり、点数の順で決まります。終わったあとは換算できないので、換えていない○は点になりません。',
  labels: { correct: '○', wrong: '✕' },
  usesQuestions: true,
  params: [
    { key: 'rest', label: '休む問題数', default: 3, min: 0 },
    { key: 'limit', label: '問題数の上限（0なら無し）', default: 35, min: 0 },
  ],
  answer(players, playerId, result, params, { question }) {
    if (result === 'correct') {
      return updatePlayer(players, playerId, (p) => ({ stock: p.stock + 1, correct: p.correct + 1 }));
    }
    return updatePlayer(players, playerId, (p) =>
      p.stock > 0
        ? { stock: 0, wrong: p.wrong + 1 }
        : { wrong: p.wrong + 1, restUntil: question + params.rest }
    );
  },
  // ためた○が無いときは換算できない（null で受け付けない）
  convert(players, playerId) {
    const me = players.find((p) => p.id === playerId);
    if (!me || me.stock <= 0) return null;
    return updatePlayer(players, playerId, (p) => ({ score: p.score + p.stock * p.stock, stock: 0 }));
  },
  compare(a, b) {
    return b.score - a.score || b.stock - a.stock;
  },
  view(p) {
    return {
      kind: 'number',
      value: p.score,
      sub: `○${p.stock}（換えると${p.stock * p.stock}点）`,
      summary: `${p.score} 点`,
    };
  },
};
