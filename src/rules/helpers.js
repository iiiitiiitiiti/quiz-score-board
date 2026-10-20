// ルールの関数が共通で使う小さな道具。index.js からも各ルールからも読むため別ファイルに置く

// 勝ち負けに関わるプレイヤーの値。履歴の前後の値・リセット・sanitize はすべてこの一覧を使う
// restUntil / stock / streak は後半（問題の数を使うルール）用。今は常に 0
export const PLAY_FIELDS = [
  'score',
  'correct',
  'wrong',
  'finish',
  'finishOrder',
  'restUntil',
  'stock',
  'stage',
  'streak',
];

export const FINISH_NONE = 'none';
export const FINISH_WON = 'won';
export const FINISH_OUT = 'out';
export const FINISH_VALUES = [FINISH_NONE, FINISH_WON, FINISH_OUT];

export const BASE_PLAY_VALUES = {
  score: 0,
  correct: 0,
  wrong: 0,
  finish: FINISH_NONE,
  finishOrder: 0,
  restUntil: 0,
  stock: 0,
  stage: 0,
  streak: 0,
};

export function isActive(player) {
  return player.finish === FINISH_NONE;
}

// id が一致するプレイヤーだけ fn で書き換えた新しい配列を返す
export function updatePlayer(players, id, fn) {
  return players.map((p) => (p.id === id ? { ...p, ...fn(p) } : p));
}

// 勝ち負けの決まっていない全員のうち、条件に合う人を勝ち抜け／失格にする
export function finishWhere(players, finish, predicate) {
  return players.map((p) => (isActive(p) && predicate(p) ? { ...p, finish } : p));
}

// 誤答数が上限に達した人を失格にする（上限 0 は「失格なし」）
export function outByWrong(players, maxWrong) {
  if (!(maxWrong > 0)) return players;
  return finishWhere(players, FINISH_OUT, (p) => p.wrong >= maxWrong);
}
