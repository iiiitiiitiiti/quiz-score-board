import { updatePlayer, finishWhere, FINISH_WON, FINISH_OUT } from './helpers.js';

// 残り誤答数は「開始値 − wrong」で出す（フィールドにしない）
function remaining(p, params) {
  return Math.max(params.start - p.wrong, 0);
}

function product(p, params) {
  return p.correct * remaining(p, params);
}

export default {
  id: '10by10',
  name: '10by10',
  description: '○で正解数が+1、✕で残り誤答数が−1。正解数×残り誤答数が目標に達したら勝ち抜け、残り誤答数が0で失格です。',
  labels: { correct: '○', wrong: '✕' },
  params: [
    { key: 'start', label: '最初の残り誤答数', default: 10, min: 1 },
    { key: 'target', label: '勝ち抜けの目標', default: 100, min: 1 },
  ],
  answer(players, playerId, result, params) {
    if (result === 'correct') {
      const next = updatePlayer(players, playerId, (p) => ({ correct: p.correct + 1 }));
      return finishWhere(next, FINISH_WON, (p) => p.id === playerId && product(p, params) >= params.target);
    }
    const next = updatePlayer(players, playerId, (p) => ({ wrong: p.wrong + 1 }));
    return finishWhere(next, FINISH_OUT, (p) => p.id === playerId && remaining(p, params) <= 0);
  },
  compare(a, b, params) {
    return product(b, params) - product(a, params) || b.correct - a.correct;
  },
  view(p, params) {
    const rest = remaining(p, params);
    const text = `${p.correct} × ${rest} = ${p.correct * rest}`;
    return { kind: 'text', value: text, summary: text };
  },
};
