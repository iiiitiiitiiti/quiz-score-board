import { initialState, clampIndex, QUESTION_PLACEHOLDER_INDEX } from './initialState.js';
import { PLAY_FIELDS, applyAnswer, initialPlayFields, normalizeRule } from '../rules/index.js';

// 変わったプレイヤーの PLAY_FIELDS だけを前後の値で残す
function diffPlayers(before, after) {
  const beforeById = new Map(before.map((p) => [p.id, p]));
  const changes = [];
  for (const p of after) {
    const old = beforeById.get(p.id);
    if (!old) continue;
    const b = {};
    const a = {};
    for (const key of PLAY_FIELDS) {
      if (old[key] !== p[key]) {
        b[key] = old[key];
        a[key] = p[key];
      }
    }
    if (Object.keys(a).length > 0) changes.push({ id: p.id, before: b, after: a });
  }
  return changes;
}

// undo は before、redo は after を書き戻す。今いないプレイヤーの分は無視する
function applyEntry(state, entry, side) {
  if (entry.type !== 'answer/record') return state;
  const byId = new Map(entry.changes.map((c) => [c.id, c[side]]));
  return {
    ...state,
    players: state.players.map((p) => (byId.has(p.id) ? { ...p, ...byId.get(p.id) } : p)),
    questionNo: entry.questionNo[side],
  };
}

function resetPlayFields(players, rule) {
  const fields = initialPlayFields(rule);
  return players.map((p) => ({ ...p, ...fields }));
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'rule/set': {
      // 点数の意味が変わるため、PLAY_FIELDS・問題の数・履歴を戻す（確認は画面側で出す）
      const rule = normalizeRule(action.payload);
      return {
        ...state,
        rule,
        players: resetPlayFields(state.players, rule),
        questionNo: 0,
        history: [],
        historyIndex: -1,
      };
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
          { id: crypto.randomUUID(), name, locked: false, ...initialPlayFields(state.rule) },
        ],
      };
    }

    case 'player/rename': {
      const { id } = action.payload;
      const name = String(action.payload.name ?? '').trim();
      if (!name) return state;
      const duplicate = state.players.some((p) => p.id !== id && p.name === name);
      if (duplicate) return state;
      return {
        ...state,
        players: state.players.map((p) => (p.id === id ? { ...p, name } : p)),
      };
    }

    case 'player/remove': {
      // entry を消すと、その entry がほかの人に与えた変化まで消えて undo が食い違う。
      // そのため entry は残し、消した人の changes だけ取り除く。historyIndex は触らない
      const playerId = action.payload.id;
      const players = state.players.filter((p) => p.id !== playerId);
      const history = state.history.map((h) =>
        h.type === 'answer/record'
          ? { ...h, changes: h.changes.filter((c) => c.id !== playerId) }
          : h
      );
      return { ...state, players, history };
    }

    case 'answer/record': {
      const { playerId, result } = action.payload; // result: 'correct' | 'wrong'
      const next = applyAnswer(state.rule, state.players, state.questionNo, playerId, result);
      if (!next) return state;

      const entry = {
        type: 'answer/record',
        playerId,
        result,
        changes: diffPlayers(state.players, next.players),
        questionNo: { before: state.questionNo, after: next.questionNo },
        timestamp: Date.now(),
      };

      const history = state.history
        .slice(0, state.historyIndex + 1)
        .concat(entry);

      return {
        ...state,
        players: next.players,
        questionNo: next.questionNo,
        history,
        historyIndex: history.length - 1,
      };
    }

    case 'history/undo': {
      if (state.historyIndex < 0) return state;
      const entry = state.history[state.historyIndex];
      return { ...applyEntry(state, entry, 'before'), historyIndex: state.historyIndex - 1 };
    }

    case 'history/redo': {
      const nextIndex = state.historyIndex + 1;
      if (nextIndex >= state.history.length) return state;
      const entry = state.history[nextIndex];
      return { ...applyEntry(state, entry, 'after'), historyIndex: nextIndex };
    }

    case 'title/update': {
      const title = String(action.payload.title ?? '');
      return { ...state, title };
    }

    case 'questions/import': {
      return {
        ...state,
        questions: action.payload.questions,
        currentIndex: QUESTION_PLACEHOLDER_INDEX,
        ui: { ...state.ui, importError: '' },
      };
    }

    case 'questions/clear': {
      return {
        ...state,
        questions: [],
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

    case 'player/toggleLock': {
      const { id } = action.payload;
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === id ? { ...p, locked: !p.locked } : p
        ),
      };
    }

    case 'scores/reset': {
      return {
        ...state,
        players: resetPlayFields(state.players, state.rule).map((p) => ({ ...p, locked: false })),
        questionNo: 0,
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
