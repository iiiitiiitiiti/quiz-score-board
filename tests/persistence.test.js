import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadState, saveState } from '../src/store/persistence.js';
import { appReducer } from '../src/store/reducer.js';
import { initialState } from '../src/store/initialState.js';

const KEY = 'quiz-scoreboard:v1';
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

beforeEach(() => store.clear());

const run = (state, ...actions) => actions.reduce((s, a) => appReducer(s, a), state);
const UNDO = { type: 'history/undo' };

test('古い形（mode: score と score/update の履歴）を読み込み、undo できる', () => {
  store.set(KEY, JSON.stringify({
    title: '大会',
    mode: 'score',
    players: [{ id: 'a', name: 'A', score: 2, correct: 0, wrong: 0 }, { id: 'b', name: 'B', score: -1 }],
    questions: [],
    currentIndex: 0,
    history: [
      { type: 'score/update', playerId: 'a', oldScore: 0, newScore: 1, delta: 1, timestamp: 1 },
      { type: 'score/update', playerId: 'b', oldScore: 0, newScore: -1, delta: -1, timestamp: 2 },
      { type: 'score/update', playerId: 'a', oldScore: 1, newScore: 2, delta: 1, timestamp: 3 },
    ],
    historyIndex: 2,
  }));
  let s = loadState();
  assert.deepEqual(s.rule, { id: 'free-score', params: {} });
  assert.equal(s.mode, undefined);
  assert.equal(s.questionNo, 0);
  assert.deepEqual(s.players.map((p) => [p.score, p.finish, p.stage]), [[2, 'none', 0], [-1, 'none', 0]]);
  assert.ok(s.history.every((h) => h.type === 'answer/record'));
  s = run(s, UNDO, UNDO);
  assert.deepEqual(s.players.map((p) => p.score), [1, 0]);
  assert.equal(s.questionNo, 0);
});

test('古い形（mode: circle-cross と circle/record の履歴）を読み込み、undo できる', () => {
  store.set(KEY, JSON.stringify({
    mode: 'circle-cross',
    players: [{ id: 'a', name: 'A', score: 0, correct: 1, wrong: 1 }],
    history: [
      { type: 'circle/record', playerId: 'a', result: 'correct', oldVal: 0, newVal: 1, timestamp: 1 },
      { type: 'circle/record', playerId: 'a', result: 'wrong', oldVal: 0, newVal: 1, timestamp: 2 },
    ],
    historyIndex: 1,
  }));
  let s = loadState();
  assert.equal(s.rule.id, 'free-circle');
  s = run(s, UNDO);
  assert.deepEqual([s.players[0].correct, s.players[0].wrong], [1, 0]);
  s = run(s, UNDO);
  assert.deepEqual([s.players[0].correct, s.players[0].wrong], [0, 0]);
});

test('新しい形を保存して読み戻すと、ルール・問題の数・勝ち負け・undo が残る', () => {
  let s = run(
    initialState,
    { type: 'rule/set', payload: { id: 'm-n', params: { m: 2, n: 2 } } },
    { type: 'player/add', payload: { name: 'A' } },
    { type: 'player/add', payload: { name: 'B' } },
  );
  const [a, b] = s.players.map((p) => p.id);
  s = run(
    s,
    { type: 'answer/record', payload: { playerId: a, result: 'correct' } },
    { type: 'answer/record', payload: { playerId: a, result: 'correct' } },
    { type: 'answer/record', payload: { playerId: b, result: 'wrong' } },
  );
  saveState(s);
  let loaded = loadState();
  assert.deepEqual(loaded.rule, { id: 'm-n', params: { m: 2, n: 2 } });
  assert.equal(loaded.questionNo, 2);
  assert.equal(loaded.players[0].finish, 'won');
  assert.equal(loaded.players[0].finishOrder, 1);
  assert.equal(loaded.historyIndex, 2);
  loaded = run(loaded, UNDO, UNDO);
  assert.equal(loaded.players[0].finish, 'none');
  assert.equal(loaded.players[0].correct, 1);
  assert.equal(loaded.questionNo, 1);
});

test('おかしな値は捨てるか既定値にする', () => {
  store.set(KEY, JSON.stringify({
    rule: { id: 'updown', params: { target: 'x', maxWrong: -1 } },
    questionNo: -5,
    players: [{ id: 'a', name: 'A', score: 1.5, finish: 'win', stage: -1 }],
    history: [
      { type: 'unknown' },
      { type: 'answer/record', result: 'correct', playerId: 'a', changes: [{ id: 'a', before: { score: 0, finish: 'bad' }, after: { score: 1 } }], questionNo: { before: 0, after: 1 } },
    ],
    historyIndex: 1,
  }));
  const s = loadState();
  assert.deepEqual(s.rule, { id: 'updown', params: { target: 7, maxWrong: 2 } });
  assert.equal(s.questionNo, 0);
  assert.deepEqual([s.players[0].score, s.players[0].finish, s.players[0].stage], [0, 'none', 0]);
  assert.equal(s.history.length, 1);
  assert.equal(s.historyIndex, 0);
  assert.deepEqual(s.history[0].changes[0].before, { score: 0 });
});

test('読めない entry が続けて並んでも historyIndex を正しくずらす', () => {
  const ok = (i) => ({ type: 'score/update', playerId: 'a', oldScore: i, newScore: i + 1, delta: 1, timestamp: i });
  store.set(KEY, JSON.stringify({
    mode: 'score',
    players: [{ id: 'a', name: 'A', score: 3 }],
    history: [{ type: 'x' }, { type: 'x' }, { type: 'x' }, { type: 'x' }, { type: 'x' }, ok(0), ok(1), ok(2), ok(3)],
    historyIndex: 7,
  }));
  const s = loadState();
  assert.equal(s.history.length, 4);
  assert.equal(s.historyIndex, 2);
  assert.equal(run(s, UNDO).players[0].score, 2);
});

test('サバイバルで持ち点の無い古いプレイヤーはルールの最初の値で埋める', () => {
  store.set(KEY, JSON.stringify({ rule: { id: 'survival', params: {} }, players: [{ id: 'a', name: 'A' }] }));
  assert.equal(loadState().players[0].score, 20);
});

test('履歴は直近500件に切り詰め、historyIndex も同じだけずらす', () => {
  const history = Array.from({ length: 600 }, (_, i) => ({
    type: 'score/update', playerId: 'a', oldScore: i, newScore: i + 1, delta: 1, timestamp: i,
  }));
  store.set(KEY, JSON.stringify({ mode: 'score', players: [{ id: 'a', name: 'A', score: 300 }], history, historyIndex: 299 }));
  const s = loadState();
  assert.equal(s.history.length, 500);
  assert.equal(s.historyIndex, 199);
  assert.equal(run(s, UNDO).players[0].score, 299);
});
