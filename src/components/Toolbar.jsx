import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { parseQuestionsCsv } from '../lib/csv.js';
import AddPlayerForm from './AddPlayerForm.jsx';

// 準備バー: 進行前のセットアップ操作（CSV・プレイヤー追加・モード切替）をまとめる
export default function Toolbar({ state, dispatch }) {
  const fileInputRef = useRef(null);

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

      <AddPlayerForm dispatch={dispatch} />

      <button
        onClick={handleImportClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-panel text-ink hover:bg-panel-edge border border-panel-edge transition-colors"
      >
        <Upload size={16} />
        CSV インポート
      </button>

      <div className="ml-auto flex items-center gap-1 rounded-xl bg-panel border border-panel-edge p-1" role="group" aria-label="得点モード切替">
        <button
          onClick={isCircleCross ? handleModeToggle : undefined}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            !isCircleCross ? 'bg-lamp text-stage' : 'text-ink-dim hover:text-ink'
          }`}
          title="+1/-1 モード"
        >
          +1/-1
        </button>
        <button
          onClick={!isCircleCross ? handleModeToggle : undefined}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            isCircleCross ? 'bg-lamp text-stage' : 'text-ink-dim hover:text-ink'
          }`}
          title="○/✕ モード"
        >
          ○/✕
        </button>
      </div>
    </div>
  );
}
