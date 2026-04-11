import { useRef } from 'react';
import { Upload, Undo2, Redo2, RotateCcw, Trash2 } from 'lucide-react';
import { parseQuestionsCsv } from '../lib/csv.js';
import AddPlayerForm from './AddPlayerForm.jsx';

export default function Toolbar({ state, dispatch }) {
  const fileInputRef = useRef(null);
  const canUndo = state.historyIndex >= 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const handleImportClick = () => {
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const questions = await parseQuestionsCsv(file);
      dispatch({ type: 'questions/import', payload: { questions } });
    } catch (err) {
      dispatch({
        type: 'ui/setImportError',
        payload: { message: err.message },
      });
    }
  };

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

  const isCircleCross = state.mode === 'circle-cross';

  const handleModeToggle = () => {
    dispatch({
      type: 'mode/set',
      payload: { mode: isCircleCross ? 'score' : 'circle-cross' },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={handleImportClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <Upload size={16} />
        CSV インポート
      </button>

      <AddPlayerForm dispatch={dispatch} />

      <button
        onClick={handleModeToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
          isCircleCross
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
        title={isCircleCross ? '+1/-1 モードに切替' : '○/✕ モードに切替'}
      >
        {isCircleCross ? '○/✕ モード' : '+1/-1 モード'}
      </button>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => dispatch({ type: 'history/undo' })}
          disabled={!canUndo}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="元に戻す"
        >
          <Undo2 size={16} />
          <span className="hidden sm:inline">元に戻す</span>
        </button>
        <button
          onClick={() => dispatch({ type: 'history/redo' })}
          disabled={!canRedo}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="やり直し"
        >
          <Redo2 size={16} />
          <span className="hidden sm:inline">やり直し</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleResetScores}
          disabled={state.players.length === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="スコアをリセット"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">スコアリセット</span>
        </button>
        <button
          onClick={handleAllClear}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
          title="全データ削除"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">全クリア</span>
        </button>
      </div>
    </div>
  );
}
