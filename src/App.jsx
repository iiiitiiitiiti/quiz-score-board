import { useReducer, useEffect } from 'react';
import { appReducer } from './store/reducer.js';
import { loadState, saveState, clearStorage } from './store/persistence.js';
import ProblemArea from './components/ProblemArea.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import Toolbar from './components/Toolbar.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';

function App() {
  const [state, rawDispatch] = useReducer(appReducer, undefined, loadState);

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            クイズ得点板
          </h1>
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

          <ScoreBoard players={state.players} dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
}

export default App;
