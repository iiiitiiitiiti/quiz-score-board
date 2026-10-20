import { isActive, outByWrong, FINISH_WON } from './helpers.js';

// stage は越えた段階の数。今の段階は stage + 1 で、それを越えるには ○ が stage + 1 個要る
// 今の段階の ○ は score で持つ
export default {
  id: 'zaa',
  name: 'ザー',
  description: '1段目は○1つ、2段目は○2つ…で次の段階へ進みます。誰かが段階を越えると、ほかの人の今の段階の○は0に戻ります。最後の段階を越えたら勝ち抜けです。',
  labels: { correct: '○', wrong: '✕' },
  params: [
    { key: 'stages', label: '段階の数', default: 3, min: 1 },
    { key: 'maxWrong', label: '失格の誤答数（0なら無し）', default: 3, min: 0 },
  ],
  answer(players, playerId, result, params) {
    if (result === 'wrong') {
      const next = players.map((p) => (p.id === playerId ? { ...p, wrong: p.wrong + 1 } : p));
      return outByWrong(next, params.maxWrong);
    }
    const me = players.find((p) => p.id === playerId);
    const score = me.score + 1;
    if (score < me.stage + 1) {
      return players.map((p) => (p.id === playerId ? { ...p, score, correct: p.correct + 1 } : p));
    }
    const stage = me.stage + 1;
    return players.map((p) => {
      if (p.id === playerId) {
        return {
          ...p,
          score: 0,
          stage,
          correct: p.correct + 1,
          finish: stage >= params.stages ? FINISH_WON : p.finish,
        };
      }
      return isActive(p) ? { ...p, score: 0 } : p;
    });
  },
  compare(a, b) {
    return b.stage - a.stage || b.score - a.score || a.wrong - b.wrong;
  },
  view(p, params) {
    const text = p.stage >= params.stages
      ? `${params.stages}段 クリア`
      : `${p.stage + 1}段目 ○${p.score}/${p.stage + 1}`;
    return { kind: 'text', value: text, summary: text };
  },
};
