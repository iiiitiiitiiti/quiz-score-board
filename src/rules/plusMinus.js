import { updatePlayer, finishWhere, FINISH_WON } from './helpers.js';

export default {
  id: 'plus-minus',
  name: 'プラス1マイナス1',
  description: '○で点が増え、✕で点が減ります。勝ち抜け点に達したら勝ち抜けです。',
  labels: { correct: '○', wrong: '✕' },
  params: [
    { key: 'correctPoints', label: '正解の点', default: 1, min: 1 },
    { key: 'wrongPoints', label: '誤答の点', default: 1, min: 0 },
    { key: 'target', label: '勝ち抜け点（0なら無し）', default: 10, min: 0 },
  ],
  answer(players, playerId, result, params) {
    if (result === 'correct') {
      const next = updatePlayer(players, playerId, (p) => ({
        score: p.score + params.correctPoints,
        correct: p.correct + 1,
      }));
      if (!(params.target > 0)) return next;
      return finishWhere(next, FINISH_WON, (p) => p.id === playerId && p.score >= params.target);
    }
    return updatePlayer(players, playerId, (p) => ({
      score: p.score - params.wrongPoints,
      wrong: p.wrong + 1,
    }));
  },
  compare(a, b) {
    return b.score - a.score || a.wrong - b.wrong;
  },
  view(p, params) {
    return {
      kind: 'number',
      value: p.score,
      sub: params.target > 0 ? `${params.target}点で勝ち抜け` : null,
      summary: `${p.score} 点`,
    };
  },
};
