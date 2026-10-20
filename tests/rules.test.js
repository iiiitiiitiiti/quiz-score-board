import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAnswer,
  comparePlayers,
  defaultRule,
  initialPlayFields,
  normalizeRule,
  playerView,
} from '../src/rules/index.js';

function setup(id, names = ['A', 'B', 'C'], params = {}) {
  const rule = normalizeRule({ id, params });
  const players = names.map((name) => ({ id: name, name, locked: false, ...initialPlayFields(rule) }));
  return { rule, players, questionNo: 0 };
}

// 押した順に適用する。受け付けられなかったら例外にする
function play(game, ...moves) {
  let { players, questionNo } = game;
  for (const move of moves) {
    const [id, mark] = move.split(':');
    const res = applyAnswer(game.rule, players, questionNo, id, mark === 'o' ? 'correct' : 'wrong');
    if (!res) throw new Error(`rejected: ${move}`);
    ({ players, questionNo } = res);
  }
  return { ...game, players, questionNo };
}

const get = (game, id) => game.players.find((p) => p.id === id);

test('自由得点: +1 / −1 だけ。勝ち負けは決めない', () => {
  const g = play(setup('free-score'), 'A:o', 'A:o', 'A:x', 'B:x');
  assert.equal(get(g, 'A').score, 1);
  assert.equal(get(g, 'B').score, -1);
  assert.equal(get(g, 'A').correct, 0);
  assert.equal(get(g, 'A').finish, 'none');
});

test('○で問題の数が進み、✕では進まない', () => {
  const g = play(setup('free-circle'), 'A:o', 'B:x', 'C:o');
  assert.equal(g.questionNo, 2);
  assert.equal(get(g, 'A').correct, 1);
  assert.equal(get(g, 'B').wrong, 1);
});

test('プラス1マイナス1: 勝ち抜け点に達したら勝ち抜け。0なら無し', () => {
  const g = play(setup('plus-minus', ['A', 'B'], { correctPoints: 2, wrongPoints: 1, target: 4 }), 'A:o', 'A:x', 'A:o', 'A:o');
  assert.equal(get(g, 'A').score, 5);
  assert.equal(get(g, 'A').finish, 'won');
  assert.equal(get(g, 'A').finishOrder, 1);
  const none = play(setup('plus-minus', ['A'], { target: 0 }), ...Array(20).fill('A:o'));
  assert.equal(get(none, 'A').finish, 'none');
});

test('アップダウン: ✕で0点に戻り、2回目の✕で失格', () => {
  let g = play(setup('updown'), 'A:o', 'A:o', 'A:x');
  assert.equal(get(g, 'A').score, 0);
  assert.equal(get(g, 'A').finish, 'none');
  g = play(g, 'A:x');
  assert.equal(get(g, 'A').finish, 'out');
  assert.equal(applyAnswer(g.rule, g.players, g.questionNo, 'A', 'correct'), null);
  g = play(g, ...Array(7).fill('B:o'));
  assert.equal(get(g, 'B').finish, 'won');
});

test('m○n×: ○m個で勝ち抜け、✕n個で失格。勝ち抜け順を付ける', () => {
  let g = play(setup('m-n', ['A', 'B', 'C'], { m: 2, n: 2 }), 'A:o', 'B:o', 'B:o', 'A:o', 'C:x', 'C:x');
  assert.equal(get(g, 'B').finishOrder, 1);
  assert.equal(get(g, 'A').finishOrder, 2);
  assert.equal(get(g, 'C').finish, 'out');
  assert.equal(get(g, 'C').finishOrder, 1);
  const order = [...g.players].sort((a, b) => comparePlayers(g.rule, a, b)).map((p) => p.id);
  assert.deepEqual(order, ['B', 'A', 'C']);
});

test('10by10: 正解数×残り誤答数が目標以上で勝ち抜け、残り0で失格', () => {
  let g = play(setup('10by10', ['A', 'B'], { start: 3, target: 6 }), 'A:o', 'A:x', 'A:o');
  assert.equal(playerView(g.rule, get(g, 'A'), g.players).value, '2 × 2 = 4');
  g = play(g, 'A:o');
  assert.equal(get(g, 'A').finish, 'won');
  g = play(g, 'B:x', 'B:x', 'B:x');
  assert.equal(get(g, 'B').finish, 'out');
});

test('通過クイズ（一般形）: 3点で通過席、通過席で○なら勝ち抜け', () => {
  const g = play(setup('pass'), 'A:o', 'A:o', 'A:o', 'A:o');
  assert.equal(get(g, 'A').finish, 'won');
  assert.equal(get(g, 'A').score, 3);
});

test('通過クイズ（一般形）: 通過席以外の誰が○でも阻止。阻止した人も+1', () => {
  let g = play(setup('pass'), 'A:o', 'A:o', 'A:o');
  assert.deepEqual(playerView(g.rule, get(g, 'A'), g.players).badges.map((b) => b.label), ['通過席']);
  assert.deepEqual(playerView(g.rule, get(g, 'B'), g.players).badges.map((b) => b.label), ['阻止権']);
  g = play(g, 'B:o');
  assert.equal(get(g, 'A').score, 0);
  assert.equal(get(g, 'B').score, 1);
});

test('通過クイズ（一般形）: 誤答は−1。通過席から一般席に戻る', () => {
  const g = play(setup('pass'), 'A:o', 'A:o', 'A:o', 'A:x', 'B:x');
  assert.equal(get(g, 'A').score, 2);
  assert.equal(get(g, 'B').score, -1);
  assert.equal(get(g, 'A').finish, 'none');
});

test('通過クイズ（マンオブ風）: 1点の人だけが阻止でき、そのまま通過席へ', () => {
  const manob = { up: 2, blocker: 'one-below', generalWrong: 'cross', passWrong: 'zero', maxWrong: 3 };
  let g = play(setup('pass', ['A', 'B', 'C'], manob), 'A:o', 'A:o', 'B:o');
  // C は0点なので阻止権なし
  assert.equal(playerView(g.rule, get(g, 'C'), g.players).badges.length, 0);
  g = play(g, 'C:o');
  assert.equal(get(g, 'A').score, 2);
  g = play(g, 'B:o');
  assert.equal(get(g, 'A').score, 0);
  assert.equal(get(g, 'B').score, 2);
  // 通過席の誤答は0点・✕に数えない。一般席の誤答は✕+1で点はそのまま
  g = play(g, 'B:x', 'C:x');
  assert.equal(get(g, 'B').score, 0);
  assert.equal(get(g, 'B').wrong, 0);
  assert.equal(get(g, 'C').score, 1);
  assert.equal(get(g, 'C').wrong, 1);
  g = play(g, 'C:x', 'C:x');
  assert.equal(get(g, 'C').finish, 'out');
});

test('通過席は常に1人まで', () => {
  const g = play(setup('pass'), 'A:o', 'A:o', 'B:o', 'B:o', 'A:o', 'B:o');
  const seated = g.players.filter((p) => p.finish === 'none' && p.score >= 3);
  assert.ok(seated.length <= 1);
});

test('アタック風サバイバル: 20点から始まり、○は他の全員−1・✕は自分−1', () => {
  let g = play(setup('survival'), 'A:o', 'B:x');
  assert.equal(get(g, 'A').score, 20);
  assert.equal(get(g, 'B').score, 18);
  assert.equal(get(g, 'C').score, 19);
});

test('アタック風サバイバル: 同時に0点になった人は同じ番号。残り1人で勝ち抜け', () => {
  let g = play(setup('survival', ['A', 'B', 'C'], { life: 1 }), 'A:o');
  assert.equal(get(g, 'B').finish, 'out');
  assert.equal(get(g, 'C').finish, 'out');
  assert.equal(get(g, 'B').finishOrder, 1);
  assert.equal(get(g, 'C').finishOrder, 1);
  assert.equal(get(g, 'A').finish, 'won');
});

test('勝ち抜けた人を削除しても、次の勝ち抜けの番号は重ならない', () => {
  let g = play(setup('m-n', ['A', 'B', 'C'], { m: 1, n: 3 }), 'A:o', 'B:o');
  g = { ...g, players: g.players.filter((p) => p.id !== 'A') };
  g = play(g, 'C:o');
  assert.equal(get(g, 'B').finishOrder, 2);
  assert.equal(get(g, 'C').finishOrder, 3);
});

test('同時に勝ち負けが決まった2人の次は3番', () => {
  // B・C が2点→1点、A の○で B・C が同時に0点、そのあと D が0点
  const g = play(setup('survival', ['A', 'B', 'C', 'D'], { life: 2 }), 'B:x', 'C:x', 'A:o', 'D:x');
  assert.deepEqual(['B', 'C', 'D'].map((id) => get(g, id).finishOrder), [1, 1, 3]);
  assert.equal(get(g, 'A').finish, 'won');
});

test('アタック風サバイバル: ロック中の人も減点される・勝ち負けの決まった人は減らない', () => {
  let g = setup('survival', ['A', 'B', 'C', 'D'], { life: 2 });
  g = { ...g, players: g.players.map((p) => (p.id === 'C' ? { ...p, locked: true } : p)) };
  g = play(g, 'A:x', 'A:x');
  assert.equal(get(g, 'A').finish, 'out');
  g = play(g, 'B:o');
  assert.equal(get(g, 'C').score, 1);
  assert.equal(get(g, 'A').score, 0);
  g = play(g, 'B:o');
  assert.equal(get(g, 'B').finish, 'won');
  const order = [...g.players].sort((a, b) => comparePlayers(g.rule, a, b)).map((p) => p.id);
  // 後に落ちた C・D が先、最初に落ちた A が最後
  assert.deepEqual(order, ['B', 'C', 'D', 'A']);
});

test('アタック風サバイバル: 1人だけなら自動で勝ち抜けにしない', () => {
  const g = play(setup('survival', ['A']), 'A:o');
  assert.equal(get(g, 'A').finish, 'none');
});

test('ザー: 段階を越えると他の人の今の段階の○が0に戻る', () => {
  let g = play(setup('zaa'), 'B:o', 'A:o');
  // B が1段目を越えた時点で A は0のまま。A も1段目を越える
  assert.equal(get(g, 'B').stage, 1);
  assert.equal(get(g, 'A').stage, 1);
  g = play(g, 'A:o');
  assert.equal(get(g, 'A').score, 1);
  assert.equal(playerView(g.rule, get(g, 'A'), g.players).value, '2段目 ○1/2');
  g = play(g, 'B:o', 'B:o');
  assert.equal(get(g, 'B').stage, 2);
  assert.equal(get(g, 'A').score, 0);
  assert.equal(get(g, 'A').stage, 1);
  g = play(g, 'B:o', 'B:o', 'B:o');
  assert.equal(get(g, 'B').finish, 'won');
});

test('ザー: 誤答数が上限で失格。誤答しても今の段階の○は消えない', () => {
  let g = play(setup('zaa'), 'A:o', 'A:o', 'A:x');
  assert.equal(get(g, 'A').score, 1);
  g = play(g, 'A:x', 'A:x');
  assert.equal(get(g, 'A').finish, 'out');
});

test('params はおかしな値を既定値で埋める', () => {
  assert.deepEqual(normalizeRule({ id: 'updown', params: { target: -3, maxWrong: 1.5 } }).params, { target: 7, maxWrong: 2 });
  assert.deepEqual(normalizeRule({ id: 'pass', params: { blocker: 'x' } }).params.blocker, 'all');
  assert.equal(normalizeRule({ id: 'unknown' }).id, 'free-score');
  assert.deepEqual(defaultRule(), { id: 'free-score', params: {} });
});
