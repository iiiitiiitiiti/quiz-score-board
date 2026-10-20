import { initialState, QUESTION_PLACEHOLDER_INDEX } from './initialState.js';
import { PLAY_FIELDS, FINISH_VALUES, initialPlayFields, normalizeRule, defaultRule } from '../rules/index.js';

const STORAGE_KEY = 'quiz-scoreboard:v1';

const HISTORY_LIMIT = 500;
const ANSWER_RESULTS = ['correct', 'wrong', 'through', 'convert'];

const isCount = (v) => Number.isInteger(v) && v >= 0;

// PLAY_FIELDS の1項目が正しい値か。score だけは負の点（自由得点の−1など）を許す
function isValidPlayValue(key, v) {
  if (key === 'finish') return FINISH_VALUES.includes(v);
  if (key === 'score') return Number.isInteger(v);
  return isCount(v);
}

// PLAY_FIELDS のうち、正しい値の項目だけを残す（履歴の前後の値に使う）
function sanitizePlayFields(src) {
  const out = {};
  if (!src || typeof src !== 'object') return out;
  for (const key of PLAY_FIELDS) {
    if (isValidPlayValue(key, src[key])) out[key] = src[key];
  }
  return out;
}

function sanitizePlayer(p, rule) {
  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    locked: Boolean(p.locked),
    ...initialPlayFields(rule),
    ...sanitizePlayFields(p),
  };
}

function sanitizeQuestion(q) {
  return {
    no: String(q.no ?? ''),
    question: String(q.question ?? ''),
    answer: String(q.answer ?? ''),
    note: String(q.note ?? ''),
  };
}

// 古い mode（'score' | 'circle-cross'）は自由得点・自由○×として読む
function sanitizeRule(state) {
  if (state.rule && typeof state.rule === 'object') return normalizeRule(state.rule);
  if (state.mode === 'circle-cross') return defaultRule('free-circle');
  return defaultRule('free-score');
}

function changeEntry(playerId, field, before, after) {
  return [{ id: String(playerId ?? ''), before: { [field]: before }, after: { [field]: after } }];
}

// 履歴の1件を answer/record の形にそろえる。読めないものは null
// 古い score/update・circle/record もここで読み替える（問題の数は記録していないので 0 → 0）
function sanitizeHistoryEntry(h) {
  if (!h || typeof h !== 'object') return null;
  const timestamp = Number.isFinite(h.timestamp) ? h.timestamp : 0;

  if (h.type === 'score/update') {
    if (!Number.isInteger(h.oldScore) || !Number.isInteger(h.newScore)) return null;
    return {
      type: 'answer/record',
      playerId: String(h.playerId ?? ''),
      result: h.newScore >= h.oldScore ? 'correct' : 'wrong',
      changes: changeEntry(h.playerId, 'score', h.oldScore, h.newScore),
      questionNo: { before: 0, after: 0 },
      timestamp,
    };
  }
  if (h.type === 'circle/record') {
    if (!isCount(h.oldVal) || !isCount(h.newVal)) return null;
    const field = h.result === 'correct' ? 'correct' : 'wrong';
    return {
      type: 'answer/record',
      playerId: String(h.playerId ?? ''),
      result: field,
      changes: changeEntry(h.playerId, field, h.oldVal, h.newVal),
      questionNo: { before: 0, after: 0 },
      timestamp,
    };
  }
  if (h.type === 'answer/record') {
    if (!ANSWER_RESULTS.includes(h.result) || !Array.isArray(h.changes)) return null;
    const q = h.questionNo ?? {};
    return {
      type: 'answer/record',
      playerId: h.playerId == null ? null : String(h.playerId),
      result: h.result,
      changes: h.changes
        .filter((c) => c && typeof c === 'object')
        .map((c) => ({
          id: String(c.id ?? ''),
          before: sanitizePlayFields(c.before),
          after: sanitizePlayFields(c.after),
        })),
      questionNo: {
        before: isCount(q.before) ? q.before : 0,
        after: isCount(q.after) ? q.after : 0,
      },
      timestamp,
    };
  }
  return null;
}

// 直近 HISTORY_LIMIT 件に切り詰め、読めない entry を除く。historyIndex も同じだけずらす
function sanitizeHistory(history, historyIndex) {
  if (!Array.isArray(history)) return { history: [], historyIndex: -1 };
  let index = Number.isInteger(historyIndex) ? historyIndex : -1;
  const start = Math.max(history.length - HISTORY_LIMIT, 0);
  index -= start;
  // 比べるのは捨てる前の位置。ループ中に減らした index と比べると、続けて捨てたときにずれる
  const origIndex = index;
  const out = [];
  history.slice(start).forEach((h, i) => {
    const entry = sanitizeHistoryEntry(h);
    if (entry) out.push(entry);
    else if (i <= origIndex) index -= 1;
  });
  return { history: out, historyIndex: Math.min(Math.max(index, -1), out.length - 1) };
}

function sanitizeStateForStorage(state) {
  const rule = sanitizeRule(state);
  return {
    title: typeof state.title === 'string' ? state.title : initialState.title,
    rule,
    questionNo: isCount(state.questionNo) ? state.questionNo : 0,
    players: Array.isArray(state.players) ? state.players.map((p) => sanitizePlayer(p, rule)) : [],
    questions: Array.isArray(state.questions) ? state.questions.map(sanitizeQuestion) : [],
    currentIndex: Number.isInteger(state.currentIndex) ? state.currentIndex : 0,
    ...sanitizeHistory(state.history, state.historyIndex),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;

    const parsed = JSON.parse(raw);
    const safe = sanitizeStateForStorage(parsed);

    return {
      ...initialState,
      ...safe,
      currentIndex: Math.min(
        Math.max(safe.currentIndex, safe.questions.length > 0 ? QUESTION_PLACEHOLDER_INDEX : 0),
        Math.max(0, safe.questions.length - 1)
      ),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialState;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sanitizeStateForStorage(state))
    );
  } catch {
    // localStorage quota exceeded など — 無視して続行
  }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
