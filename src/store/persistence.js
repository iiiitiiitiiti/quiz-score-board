import { initialState, QUESTION_PLACEHOLDER_INDEX } from './initialState.js';

const STORAGE_KEY = 'quiz-scoreboard:v1';

function sanitizePlayer(p) {
  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    score: Number.isFinite(p.score) ? p.score : 0,
    correct: Number.isFinite(p.correct) ? p.correct : 0,
    wrong: Number.isFinite(p.wrong) ? p.wrong : 0,
    locked: Boolean(p.locked),
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

function sanitizeHistoryEntry(h) {
  if (h.type === 'score/update') {
    return {
      type: 'score/update',
      playerId: String(h.playerId ?? ''),
      oldScore: Number.isFinite(h.oldScore) ? h.oldScore : 0,
      newScore: Number.isFinite(h.newScore) ? h.newScore : 0,
      delta: Number.isFinite(h.delta) ? h.delta : 0,
      timestamp: Number.isFinite(h.timestamp) ? h.timestamp : 0,
    };
  }
  if (h.type === 'circle/record') {
    return {
      type: 'circle/record',
      playerId: String(h.playerId ?? ''),
      result: h.result === 'correct' ? 'correct' : 'wrong',
      oldVal: Number.isFinite(h.oldVal) ? h.oldVal : 0,
      newVal: Number.isFinite(h.newVal) ? h.newVal : 0,
      timestamp: Number.isFinite(h.timestamp) ? h.timestamp : 0,
    };
  }
  return h;
}

function sanitizeStateForStorage(state) {
  return {
    title: typeof state.title === 'string' ? state.title : initialState.title,
    mode: state.mode === 'circle-cross' ? 'circle-cross' : 'score',
    players: Array.isArray(state.players) ? state.players.map(sanitizePlayer) : [],
    questions: Array.isArray(state.questions) ? state.questions.map(sanitizeQuestion) : [],
    currentIndex: Number.isInteger(state.currentIndex) ? state.currentIndex : 0,
    history: Array.isArray(state.history) ? state.history.slice(-500).map(sanitizeHistoryEntry) : [],
    historyIndex: Number.isInteger(state.historyIndex) ? state.historyIndex : -1,
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
      historyIndex: Math.min(safe.historyIndex, safe.history.length - 1),
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
