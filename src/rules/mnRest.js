import { updatePlayer, finishWhere, outByWrong, FINISH_WON } from './helpers.js';

export default {
  id: 'm-rest',
  name: 'm○n休',
  description: '○がm個そろったら勝ち抜けです。✕を出すと、決まった問題数だけ休みます。',
  labels: { correct: '○', wrong: '✕' },
  usesQuestions: true,
  params: [
    { key: 'm', label: '勝ち抜けの○の数（m）', default: 7, min: 1 },
    { key: 'rest', label: '休む問題数（n）', default: 3, min: 0 },
    {
      key: 'restStyle',
      label: '休み方',
      type: 'choice',
      default: 'same',
      options: [
        { value: 'same', label: '毎回同じ問題数' },
        { value: 'grow', label: '1回目は1問・2回目は2問と増やす' },
      ],
    },
    { key: 'maxWrong', label: '失格の誤答数（0なら無し）', default: 0, min: 0 },
  ],
  answer(players, playerId, result, params, { question }) {
    if (result === 'correct') {
      const next = updatePlayer(players, playerId, (p) => ({ correct: p.correct + 1 }));
      return finishWhere(next, FINISH_WON, (p) => p.id === playerId && p.correct >= params.m);
    }
    const next = updatePlayer(players, playerId, (p) => {
      const wrong = p.wrong + 1;
      const count = params.restStyle === 'grow' ? wrong : params.rest;
      return { wrong, restUntil: question + count };
    });
    return outByWrong(next, params.maxWrong);
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
      wrongMax: params.maxWrong > 0 ? params.maxWrong : null,
      summary: `○ ${p.correct}  ✕ ${p.wrong}`,
    };
  },
};
