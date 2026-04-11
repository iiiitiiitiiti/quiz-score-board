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

function applyCircle(players, playerId, result, val) {
  const field = result === 'correct' ? 'correct' : 'wrong';
  return players.map((p) =>
    p.id === playerId ? { ...p, [field]: val } : p
  );
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'mode/set': {
      return { ...state, mode: action.payload.mode };
    }

    case 'player/add': {
      const name = String(action.payload.name ?? '').trim();
      if (!name) return state;
      const duplicate = state.players.some((p) => p.name === name);
      if (duplicate) return state;
      return {
        ...state,
        players: [
          ...state.players,
          { id: crypto.randomUUID(), name, score: 0, correct: 0, wrong: 0 },
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

    case 'circle/record': {
      const { playerId, result } = action.payload; // result: 'correct' | 'wrong'
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return state;

      const field = result === 'correct' ? 'correct' : 'wrong';
      const oldVal = player[field] ?? 0;
      const newVal = oldVal + 1;

      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, [field]: newVal } : p
      );

      const entry = {
        type: 'circle/record',
        playerId,
        result,
        oldVal,
        newVal,
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
      if (entry.type === 'score/update') {
        return {
          ...state,
          players: applyScore(state.players, entry.playerId, entry.oldScore),
          historyIndex: state.historyIndex - 1,
        };
      }
      if (entry.type === 'circle/record') {
        return {
          ...state,
          players: applyCircle(state.players, entry.playerId, entry.result, entry.oldVal),
          historyIndex: state.historyIndex - 1,
        };
      }
      return { ...state, historyIndex: state.historyIndex - 1 };
    }

    case 'history/redo': {
      const nextIndex = state.historyIndex + 1;
      if (nextIndex >= state.history.length) return state;
      const entry = state.history[nextIndex];
      if (entry.type === 'score/update') {
        return {
          ...state,
          players: applyScore(state.players, entry.playerId, entry.newScore),
          historyIndex: nextIndex,
        };
      }
      if (entry.type === 'circle/record') {
        return {
          ...state,
          players: applyCircle(state.players, entry.playerId, entry.result, entry.newVal),
          historyIndex: nextIndex,
        };
      }
      return { ...state, historyIndex: nextIndex };
    }

    case 'title/update': {
      const title = String(action.payload.title ?? '').trimEnd();
      return { ...state, title };
    }

    case 'questions/import': {
      return {
        ...state,
        questions: action.payload.questions,
        currentIndex: -1,
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

    case 'player/reorder': {
      const { from, to } = action.payload;
      if (from === to || from == null || to == null) return state;
      const players = [...state.players];
      const [moved] = players.splice(from, 1);
      players.splice(to, 0, moved);
      return { ...state, players };
    }

    case 'players/sortByScore': {
      const players = [...state.players].sort((a, b) => b.score - a.score);
      return { ...state, players };
    }

    case 'scores/reset': {
      return {
        ...state,
        players: state.players.map((p) => ({ ...p, score: 0, correct: 0, wrong: 0 })),
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
