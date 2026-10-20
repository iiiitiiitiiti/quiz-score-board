import { finishWhere, FINISH_WON } from './helpers.js';

// 連答は1人しか持てない。ほかの人が○を取るとその人の連答は0に戻る（✕やスルーでは戻らない）
export default {
  id: '10hits',
  name: '10hits Combo',
  description: '続けて○を取ると連答が伸び、連答2で+1・3で+2・4で+3点。連答5か10点で勝ち抜けです。✕は連答が0に戻り、1回目は1問・2回目は2問と休みが増えます。',
  labels: { correct: '○', wrong: '✕' },
  usesQuestions: true,
  params: [
    { key: 'target', label: '勝ち抜け点', default: 10, min: 1 },
    { key: 'winStreak', label: '勝ち抜けの連答数', default: 5, min: 2 },
  ],
  answer(players, playerId, result, params, { question }) {
    if (result === 'wrong') {
      return players.map((p) => {
        if (p.id !== playerId) return p;
        const wrong = p.wrong + 1;
        return { ...p, wrong, streak: 0, restUntil: question + wrong };
      });
    }
    const next = players.map((p) => {
      if (p.id !== playerId) return p.streak > 0 ? { ...p, streak: 0 } : p;
      const streak = p.streak + 1;
      return { ...p, streak, score: p.score + streak - 1, correct: p.correct + 1 };
    });
    return finishWhere(
      next,
      FINISH_WON,
      (p) => p.id === playerId && (p.streak >= params.winStreak || p.score >= params.target)
    );
  },
  compare(a, b) {
    return b.score - a.score || b.streak - a.streak;
  },
  view(p) {
    return { kind: 'number', value: p.score, sub: `連答 ${p.streak}`, summary: `${p.score} 点` };
  },
};
