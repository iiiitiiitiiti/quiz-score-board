import { isActive, outByWrong, FINISH_WON } from './helpers.js';

// 通過席にいるかは「点数が上がる点以上で、勝ち負けが決まっていない」で出す（フィールドにしない）
export function inPassSeat(p, params) {
  return isActive(p) && p.score >= params.up;
}

// 今正解すると、通過席の人を一般席へ戻せるか
export function canBlock(p, players, params) {
  if (!isActive(p) || inPassSeat(p, params)) return false;
  const seated = players.some((q) => q.id !== p.id && inPassSeat(q, params));
  if (!seated) return false;
  return params.blocker === 'all' || p.score === params.up - 1;
}

export default {
  id: 'pass',
  name: '通過クイズ',
  description: '一般席で○を重ねて上がる点に達すると通過席へ。通過席で○なら勝ち抜けです。ほかの人が○を取ると、通過席の人は0点で一般席に戻されます（阻止）。',
  labels: { correct: '○', wrong: '✕' },
  params: [
    { key: 'up', label: '通過席に上がる点', default: 3, min: 1 },
    {
      key: 'blocker',
      label: '阻止できる人',
      type: 'choice',
      default: 'all',
      options: [
        { value: 'all', label: '通過席の人以外の全員' },
        { value: 'one-below', label: '上がる点の1つ手前の人だけ' },
      ],
    },
    {
      key: 'generalWrong',
      label: '一般席での誤答',
      type: 'choice',
      default: 'minus',
      options: [
        { value: 'minus', label: '−1点' },
        { value: 'cross', label: '✕を1つ数える' },
      ],
    },
    {
      key: 'passWrong',
      label: '通過席での誤答',
      type: 'choice',
      default: 'minus',
      options: [
        { value: 'minus', label: '−1点（一般席に戻る）' },
        { value: 'zero', label: '0点で一般席に戻る（✕に数えない）' },
      ],
    },
    { key: 'maxWrong', label: '失格の誤答数（0なら無し）', default: 0, min: 0 },
  ],
  presets: [
    { id: 'general', label: '一般形', params: { up: 3, blocker: 'all', generalWrong: 'minus', passWrong: 'minus', maxWrong: 0 } },
    { id: 'manob', label: 'マンオブ風', params: { up: 2, blocker: 'one-below', generalWrong: 'cross', passWrong: 'zero', maxWrong: 3 } },
  ],
  answer(players, playerId, result, params) {
    const me = players.find((p) => p.id === playerId);
    const seated = inPassSeat(me, params);

    if (result === 'correct') {
      if (seated) {
        return players.map((p) => (p.id === playerId ? { ...p, correct: p.correct + 1, finish: FINISH_WON } : p));
      }
      const block = canBlock(me, players, params);
      return players.map((p) => {
        if (p.id === playerId) return { ...p, score: p.score + 1, correct: p.correct + 1 };
        if (block && inPassSeat(p, params)) return { ...p, score: 0 };
        return p;
      });
    }

    let next;
    if (seated && params.passWrong === 'zero') {
      next = players.map((p) => (p.id === playerId ? { ...p, score: 0 } : p));
    } else if (!seated && params.generalWrong === 'cross') {
      next = players.map((p) => (p.id === playerId ? { ...p, wrong: p.wrong + 1 } : p));
    } else {
      next = players.map((p) => (p.id === playerId ? { ...p, score: p.score - 1, wrong: p.wrong + 1 } : p));
    }
    return outByWrong(next, params.maxWrong);
  },
  compare(a, b) {
    return b.score - a.score || a.wrong - b.wrong;
  },
  view(p, params, players) {
    const badges = [];
    if (inPassSeat(p, params)) badges.push({ label: '通過席', tone: 'lamp' });
    if (canBlock(p, players, params)) badges.push({ label: '阻止権', tone: 'ok' });
    return {
      kind: 'number',
      value: p.score,
      sub: params.maxWrong > 0 ? `✕ ${p.wrong}/${params.maxWrong}` : null,
      badges,
      summary: `${p.score} 点`,
    };
  },
};
