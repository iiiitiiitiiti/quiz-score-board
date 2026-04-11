import { initialState, clampIndex } from './initialState.js';

function applyScore(players, playerId, score) {
  let found = false;
  const next = players.map((p) => {
    if (p.id !== playerId) return p;
    found = true;
    return { ...p, score };
  });
  return found ? next : players;
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'player/add': {
      const name = String(action.payload.name ?? '').trim();
      if (!name) return state;
      const duplicate = state.players.some((p) => p.name === name);
      if (duplicate) return state;
      return {
        ...state,
        players: [
          ...state.players,
          { id: crypto.randomUUID(), name, score: 0 },
        ],
      };
    }

    case 'player/remove': {
      const playerId = action.payload.id;
      const players = state.players.filter((p) => p.id !== playerId);
      const history = state.history.filter((h) => h.playerId !== playerId);
      const historyIndex = Math.min(state.historyIndex, history.length - 1);
      return { ...state, players, history, historyIndex };
    }

    case 'score/update': {
      const { playerId, delta } = action.payload;
      if (!Number.isFinite(delta) || delta === 0) return state;
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return state;

      const oldScore = player.score;
      const newScore = oldScore + delta;

      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, score: newScore } : p
      );

      const entry = {
        type: 'score/update',
        playerId,
        oldScore,
        newScore,
        delta,
        timestamp: Date.now(),
      };

      const history = state.history
        .slice(0, state.historyIndex + 1)
        .concat(entry);

      return {
        ...state,
        players,
        history,
        historyIndex: history.length - 1,
      };
    }

    case 'history/undo': {
      if (state.historyIndex < 0) return state;
      const entry = state.history[state.historyIndex];
      if (entry.type !== 'score/update') {
        return { ...state, historyIndex: state.historyIndex - 1 };
      }
      return {
        ...state,
        players: applyScore(state.players, entry.playerId, entry.oldScore),
        historyIndex: state.historyIndex - 1,
      };
    }

    case 'history/redo': {
      const nextIndex = state.historyIndex + 1;
      if (nextIndex >= state.history.length) return state;
      const entry = state.history[nextIndex];
      if (entry.type !== 'score/update') {
        return { ...state, historyIndex: nextIndex };
      }
      return {
        ...state,
        players: applyScore(state.players, entry.playerId, entry.newScore),
        historyIndex: nextIndex,
      };
    }

    case 'questions/import': {
      return {
        ...state,
        questions: action.payload.questions,
        currentIndex: 0,
        ui: { ...state.ui, importError: '' },
      };
    }

    case 'question/next': {
      return {
        ...state,
        currentIndex: clampIndex(state.currentIndex + 1, state.questions),
      };
    }

    case 'question/prev': {
      return {
        ...state,
        currentIndex: clampIndex(state.currentIndex - 1, state.questions),
      };
    }

    case 'scores/reset': {
      return {
        ...state,
        players: state.players.map((p) => ({ ...p, score: 0 })),
        history: [],
        historyIndex: -1,
      };
    }

    case 'app/clear': {
      return initialState;
    }

    case 'ui/setImportError': {
      return {
        ...state,
        ui: { ...state.ui, importError: action.payload.message },
      };
    }

    default:
      return state;
  }
}
