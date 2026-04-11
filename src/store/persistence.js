import { initialState, clampIndex } from './initialState.js';

const STORAGE_KEY = 'quiz-scoreboard:v1';

function sanitizeStateForStorage(state) {
  return {
    players: Array.isArray(state.players) ? state.players : [],
    questions: Array.isArray(state.questions) ? state.questions : [],
    currentIndex: Number.isInteger(state.currentIndex) ? state.currentIndex : 0,
    history: Array.isArray(state.history) ? state.history.slice(-500) : [],
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
        safe.currentIndex,
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
