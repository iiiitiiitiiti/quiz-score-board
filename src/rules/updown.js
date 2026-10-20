import { updatePlayer, finishWhere, outByWrong, FINISH_WON } from './helpers.js';

export default {
  id: 'updown',
  name: 'アップダウン',
  description: '○で+1。✕のたびに0点に戻ります。勝ち抜け点に達したら勝ち抜け、誤答数が上限に達したら失格です。',
  labels: { correct: '○', wrong: '✕' },
  params: [
    { key: 'target', label: '勝ち抜け点', default: 7, min: 1 },
    { key: 'maxWrong', label: '失格の誤答数（0なら無し）', default: 2, min: 0 },
  ],
  answer(players, playerId, result, params) {
    if (result === 'correct') {
      const next = updatePlayer(players, playerId, (p) => ({ score: p.score + 1, correct: p.correct + 1 }));
      return finishWhere(next, FINISH_WON, (p) => p.id === playerId && p.score >= params.target);
    }
    const next = updatePlayer(players, playerId, (p) => ({ score: 0, wrong: p.wrong + 1 }));
    return outByWrong(next, params.maxWrong);
  },
  compare(a, b) {
    return b.score - a.score || a.wrong - b.wrong;
  },
  view(p, params) {
    return {
      kind: 'number',
      value: p.score,
      sub: params.maxWrong > 0 ? `誤答 あと${Math.max(params.maxWrong - p.wrong, 0)}回` : `✕ ${p.wrong}`,
      summary: `${p.score} 点`,
    };
  },
};
