import { isActive, FINISH_OUT, FINISH_WON } from './helpers.js';

export default {
  id: 'survival',
  name: 'アタック風サバイバル',
  description: '○を押した人以外の全員が−1、✕は自分が−1。0点で失格し、最後の1人が勝ち抜けです。',
  labels: { correct: '○', wrong: '✕' },
  params: [{ key: 'life', label: '最初の持ち点', default: 20, min: 1 }],
  initialPlayer(params) {
    return { score: params.life };
  },
  answer(players, playerId, result) {
    let next;
    if (result === 'correct') {
      next = players.map((p) => {
        if (p.id === playerId) return { ...p, correct: p.correct + 1 };
        return isActive(p) ? { ...p, score: Math.max(p.score - 1, 0) } : p;
      });
    } else {
      next = players.map((p) =>
        p.id === playerId ? { ...p, score: Math.max(p.score - 1, 0), wrong: p.wrong + 1 } : p
      );
    }
    next = next.map((p) => (isActive(p) && p.score <= 0 ? { ...p, finish: FINISH_OUT } : p));
    // 2人以上いて残りが1人になったら、その人が勝ち抜け
    const alive = next.filter(isActive);
    if (next.length >= 2 && alive.length === 1) {
      next = next.map((p) => (p.id === alive[0].id ? { ...p, finish: FINISH_WON } : p));
    }
    return next;
  },
  compare(a, b) {
    return b.score - a.score;
  },
  view(p) {
    return { kind: 'number', value: p.score, sub: '残りの持ち点', summary: `残り ${p.score} 点` };
  },
};
