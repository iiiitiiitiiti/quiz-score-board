import { useReducer, useEffect, useState } from 'react';
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

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          {editingTitle ? (
            <input
              className="text-2xl font-bold text-slate-800 tracking-tight bg-transparent border-b-2 border-blue-400 outline-none w-full max-w-sm"
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
              className="text-2xl font-bold text-slate-800 tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setEditingTitle(true)}
              title="クリックして編集"
            >
              {state.title || 'クイズ得点板'}
            </h1>
          )}
          <button
            onClick={() => setShowHelp(true)}
            className="ml-4 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
            title="使い方を見る"
            aria-label="使い方"
          >
            ?
          </button>
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

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
          <div className="mb-5">
            <Toolbar state={state} dispatch={dispatch} />
          </div>

          <ScoreBoard players={state.players} mode={state.mode} dispatch={dispatch} onWinner={setWinner} />
        </div>
      </div>
    </div>

    {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    {winner && <WinnerOverlay winner={winner} mode={state.mode} onClose={() => setWinner(null)} />}
    </>
  );
}

export default App;
