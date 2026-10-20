import { updatePlayer, finishWhere, FINISH_WON } from './helpers.js';

export default {
  id: 'aotenjo',
  name: '青天井',
  description: '○で今の問題番号の点が入ります（1問目は1点、2問目は2点）。✕は今の問題番号の点を引きます（減点しない設定もできます）。',
  labels: { correct: '○', wrong: '✕' },
  usesQuestions: true,
  params: [
    {
      key: 'wrongMode',
      label: '誤答のとき',
      type: 'choice',
      default: 'minus',
      options: [
        { value: 'minus', label: '今の問題番号の点を引く' },
        { value: 'none', label: '減点しない' },
      ],
    },
    { key: 'target', label: '勝ち抜け点（0なら無し）', default: 0, min: 0 },
    { key: 'limit', label: '問題数の上限（0なら無し）', default: 0, min: 0 },
  ],
  answer(players, playerId, result, params, { question }) {
    if (result === 'correct') {
      const next = updatePlayer(players, playerId, (p) => ({ score: p.score + question, correct: p.correct + 1 }));
      if (!(params.target > 0)) return next;
      return finishWhere(next, FINISH_WON, (p) => p.id === playerId && p.score >= params.target);
    }
    const minus = params.wrongMode === 'minus' ? question : 0;
    return updatePlayer(players, playerId, (p) => ({ score: p.score - minus, wrong: p.wrong + 1 }));
  },
  compare(a, b) {
    return b.score - a.score || b.correct - a.correct;
  },
  view(p) {
    return { kind: 'number', value: p.score, sub: `○${p.correct} ✕${p.wrong}`, summary: `${p.score} 点` };
  },
};
