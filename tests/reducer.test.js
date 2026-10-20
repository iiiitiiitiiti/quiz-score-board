import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appReducer } from '../src/store/reducer.js';
import { initialState } from '../src/store/initialState.js';

function run(state, ...actions) {
  return actions.reduce((s, a) => appReducer(s, a), state);
}

const add = (name) => ({ type: 'player/add', payload: { name } });
const setRule = (id, params = {}) => ({ type: 'rule/set', payload: { id, params } });
const ans = (state, name, result) => ({
  type: 'answer/record',
  payload: { playerId: state.players.find((p) => p.name === name).id, result },
});
const UNDO = { type: 'history/undo' };
const REDO = { type: 'history/redo' };
const byName = (state, name) => state.players.find((p) => p.name === name);

// 名前と結果の並びを順に押す
function press(state, ...moves) {
  return moves.reduce((s, m) => {
    const [name, mark] = m.split(':');
    return appReducer(s, ans(s, name, mark === 'o' ? 'correct' : 'wrong'));
  }, state);
}

test('プレイヤー追加はルールの最初の値で作る', () => {
  const s = run(initialState, setRule('survival'), add('A'));
  assert.equal(byName(s, 'A').score, 20);
  assert.equal(byName(s, 'A').finish, 'none');
});

test('サバイバルの全員減点と問題の数を undo / redo で戻せる', () => {
  let s = run(initialState, setRule('survival'), add('A'), add('B'), add('C'));
  s = press(s, 'A:o');
  assert.equal(s.questionNo, 1);
  assert.deepEqual(s.players.map((p) => p.score), [20, 19, 19]);
  s = run(s, UNDO);
  assert.equal(s.questionNo, 0);
  assert.deepEqual(s.players.map((p) => p.score), [20, 20, 20]);
  s = run(s, REDO);
  assert.equal(s.questionNo, 1);
  assert.deepEqual(s.players.map((p) => p.score), [20, 19, 19]);
});

test('勝ち抜けを undo すると未決に戻り、redo で順番も戻る', () => {
  let s = run(initialState, setRule('m-n', { m: 1, n: 3 }), add('A'), add('B'));
  s = press(s, 'A:o');
  assert.equal(byName(s, 'A').finish, 'won');
  s = run(s, UNDO);
  assert.equal(byName(s, 'A').finish, 'none');
  assert.equal(byName(s, 'A').finishOrder, 0);
  s = run(s, REDO);
  assert.equal(byName(s, 'A').finishOrder, 1);
});

test('勝ち負けの決まった人の○✕は記録しない', () => {
  let s = run(initialState, setRule('m-n', { m: 1, n: 3 }), add('A'));
  s = press(s, 'A:o');
  const after = press(s, 'A:o');
  assert.equal(after, s);
});

test('ロックは reducer では止めない（ボタン側で止める）', () => {
  let s = run(initialState, add('A'));
  s = run(s, { type: 'player/toggleLock', payload: { id: byName(s, 'A').id } });
  s = press(s, 'A:o');
  assert.equal(byName(s, 'A').score, 1);
});

test('undo は改名・ロックを巻き戻さない', () => {
  let s = run(initialState, add('A'));
  s = press(s, 'A:o');
  const id = byName(s, 'A').id;
  s = run(s, { type: 'player/rename', payload: { id, name: 'エー' } }, { type: 'player/toggleLock', payload: { id } }, UNDO);
  const p = s.players[0];
  assert.equal(p.name, 'エー');
  assert.equal(p.locked, true);
  assert.equal(p.score, 0);
});

test('プレイヤーを消しても、ほかの人への変化は undo で戻せる', () => {
  let s = run(initialState, setRule('survival'), add('A'), add('B'), add('C'));
  s = press(s, 'A:o', 'B:o');
  // A を消す。A が押した entry の「B・C の−1」は残る
  s = run(s, { type: 'player/remove', payload: { id: byName(s, 'A').id } });
  assert.equal(s.history.length, 2);
  assert.equal(s.historyIndex, 1);
  assert.deepEqual(s.players.map((p) => p.score), [19, 18]);
  s = run(s, UNDO);
  assert.deepEqual(s.players.map((p) => p.score), [19, 19]);
  s = run(s, UNDO);
  assert.deepEqual(s.players.map((p) => p.score), [20, 20]);
  assert.equal(s.questionNo, 0);
  s = run(s, REDO, REDO);
  assert.deepEqual(s.players.map((p) => p.score), [19, 18]);
});

test('undo の途中でプレイヤーを消しても redo の位置は変わらない', () => {
  let s = run(initialState, add('A'), add('B'));
  s = press(s, 'A:o', 'B:o', 'A:o');
  s = run(s, UNDO, UNDO);
  s = run(s, { type: 'player/remove', payload: { id: byName(s, 'B').id } });
  assert.equal(s.historyIndex, 0);
  s = run(s, REDO, REDO);
  assert.equal(byName(s, 'A').score, 2);
});

test('ルールの切り替えは点数・問題の数・履歴を戻し、プレイヤーは残す', () => {
  let s = run(initialState, add('A'), add('B'));
  s = press(s, 'A:o', 'B:x');
  s = run(s, setRule('survival', { life: 5 }));
  assert.equal(s.rule.id, 'survival');
  assert.deepEqual(s.rule.params, { life: 5 });
  assert.deepEqual(s.players.map((p) => [p.name, p.score]), [['A', 5], ['B', 5]]);
  assert.equal(s.questionNo, 0);
  assert.equal(s.history.length, 0);
  assert.equal(s.historyIndex, -1);
});

test('スコアリセットはルールの最初の値に戻し、ロックを外す', () => {
  let s = run(initialState, setRule('survival'), add('A'), add('B'));
  s = press(s, 'A:o');
  s = run(s, { type: 'player/toggleLock', payload: { id: byName(s, 'A').id } }, { type: 'scores/reset' });
  assert.deepEqual(s.players.map((p) => p.score), [20, 20]);
  assert.equal(byName(s, 'A').locked, false);
  assert.equal(s.questionNo, 0);
  assert.equal(s.history.length, 0);
});

test('履歴の途中から押すと先の履歴は捨てる', () => {
  let s = run(initialState, add('A'));
  s = press(s, 'A:o', 'A:o');
  s = run(s, UNDO);
  s = press(s, 'A:x');
  assert.equal(s.history.length, 2);
  assert.equal(byName(s, 'A').score, 0);
  assert.equal(run(s, REDO), s);
});
