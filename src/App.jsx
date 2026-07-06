import { useReducer, useEffect, useState } from 'react';
import { Undo2, Redo2, RotateCcw, Trash2 } from 'lucide-react';
import { appReducer } from './store/reducer.js';
import { loadState, saveState, clearStorage } from './store/persistence.js';
import ProblemArea from './components/ProblemArea.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import Toolbar from './components/Toolbar.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import HelpModal from './components/HelpModal.jsx';
import WinnerOverlay from './components/WinnerOverlay.jsx';

function App() {
  const [state, rawDispatch] = useReducer(appReducer, undefined, loadState);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [winner, setWinner] = useState(null);

  // app/clear 時は localStorage も削除する
  const dispatch = (action) => {
    if (action.type === 'app/clear') {
      clearStorage();
    }
    rawDispatch(action);
  };

  useEffect(() => {
    saveState(state);
  }, [state]);

  const canUndo = state.historyIndex >= 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const handleResetScores = () => {
    if (window.confirm('全プレイヤーのスコアを 0 にリセットしますか？')) {
      dispatch({ type: 'scores/reset' });
    }
  };

  const handleAllClear = () => {
    if (window.confirm('すべてのデータ（プレイヤー・問題・履歴）を削除しますか？')) {
      dispatch({ type: 'app/clear' });
    }
  };

  return (
    <>
    <div className="min-h-screen bg-stage">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ヘッダー: タイトル + 進行中に使う操作（undo/redo・ヘルプ）+ 破壊的操作（右端に隔離） */}
        <header className="mb-6 flex flex-wrap items-center gap-3">
          {editingTitle ? (
            <input
              className="text-2xl font-bold text-ink tracking-tight bg-transparent border-b-2 border-lamp outline-none w-full max-w-sm"
              value={state.title}
              onChange={(e) =>
                dispatch({ type: 'title/update', payload: { title: e.target.value } })
              }
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) setEditingTitle(false); }}
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-bold text-ink tracking-tight cursor-pointer hover:text-lamp transition-colors"
              onClick={() => setEditingTitle(true)}
              title="クリックして編集"
            >
              {state.title || 'クイズ得点板'}
            </h1>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: 'history/undo' })}
              disabled={!canUndo}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-panel text-ink hover:bg-panel-edge disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="元に戻す"
            >
              <Undo2 size={16} />
              <span className="hidden sm:inline">元に戻す</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'history/redo' })}
              disabled={!canRedo}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-panel text-ink hover:bg-panel-edge disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="やり直し"
            >
              <Redo2 size={16} />
              <span className="hidden sm:inline">やり直し</span>
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="ml-1 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-ink-dim bg-panel hover:bg-panel-edge hover:text-ink transition-colors shrink-0"
              title="使い方を見る"
              aria-label="使い方"
            >
              ?
            </button>
          </div>

          <div className="flex items-center gap-1 pl-3 border-l border-panel-edge">
            <button
              onClick={handleResetScores}
              disabled={state.players.length === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-panel text-lamp/80 hover:bg-panel-edge disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="スコアをリセット"
            >
              <RotateCcw size={16} />
              <span className="hidden md:inline">スコアリセット</span>
            </button>
            <button
              onClick={handleAllClear}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-panel text-ng hover:bg-ng/20 transition-colors"
              title="全データ削除"
            >
              <Trash2 size={16} />
              <span className="hidden md:inline">全クリア</span>
            </button>
          </div>
        </header>

        {state.ui.importError && (
          <div className="mb-4">
            <ErrorBanner
              message={state.ui.importError}
              onClose={() =>
                dispatch({ type: 'ui/setImportError', payload: { message: '' } })
              }
            />
          </div>
        )}

        {state.questions.length > 0 && (
          <ProblemArea
            questions={state.questions}
            currentIndex={state.currentIndex}
            dispatch={dispatch}
          />
        )}

        {/* 準備バー: CSV・プレイヤー追加・モード切替 */}
        <div className="mb-4">
          <Toolbar state={state} dispatch={dispatch} />
        </div>

        <ScoreBoard players={state.players} mode={state.mode} dispatch={dispatch} onWinner={setWinner} />
      </div>
    </div>

    {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    {winner && <WinnerOverlay winner={winner} mode={state.mode} onClose={() => setWinner(null)} />}
    </>
  );
}

export default App;
