import { updatePlayer, finishWhere, outByWrong, FINISH_WON } from './helpers.js';

export default {
  id: 'm-n',
  name: 'm○n×',
  description: '○がm個そろったら勝ち抜け、✕がn個たまったら失格です。',
  labels: { correct: '○', wrong: '✕' },
  params: [
    { key: 'm', label: '勝ち抜けの○の数（m）', default: 7, min: 1 },
    { key: 'n', label: '失格の✕の数（n）', default: 3, min: 1 },
  ],
  answer(players, playerId, result, params) {
    if (result === 'correct') {
      const next = updatePlayer(players, playerId, (p) => ({ correct: p.correct + 1 }));
      return finishWhere(next, FINISH_WON, (p) => p.id === playerId && p.correct >= params.m);
    }
    const next = updatePlayer(players, playerId, (p) => ({ wrong: p.wrong + 1 }));
    return outByWrong(next, params.n);
  },
  compare(a, b) {
    return b.correct - a.correct || a.wrong - b.wrong;
  },
  view(p, params) {
    return {
      kind: 'circle',
      correct: p.correct,
      wrong: p.wrong,
      correctMax: params.m,
      wrongMax: params.n,
      summary: `○ ${p.correct}  ✕ ${p.wrong}`,
    };
  },
};
