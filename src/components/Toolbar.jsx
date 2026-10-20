import { useRef, useState } from 'react';
import { Upload, SlidersHorizontal } from 'lucide-react';
import { parseQuestionsCsv } from '../lib/csv.js';
import { getRule } from '../rules/index.js';
import AddPlayerForm from './AddPlayerForm.jsx';
import RuleSettings from './RuleSettings.jsx';

// 準備バー: 進行前のセットアップ操作（CSV・プレイヤー追加・ルール設定）をまとめる
export default function Toolbar({ state, dispatch }) {
  const fileInputRef = useRef(null);
  const [showRules, setShowRules] = useState(false);

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

  // 履歴が空で問題も0問なら、確認なしで切り替える（docs/plan-rules.md「ルールを切り替えたときの扱い」）
  const canSwitchFreely = state.history.length === 0 && state.questionNo === 0;

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

      <button
        onClick={() => setShowRules((v) => !v)}
        aria-expanded={showRules}
        className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
          showRules ? 'bg-lamp text-stage border-lamp hover:bg-lamp/85' : 'bg-panel text-ink border-panel-edge hover:bg-panel-edge'
        }`}
        title="ルールを選ぶ"
      >
        <SlidersHorizontal size={16} />
        ルール: {getRule(state.rule.id).name}
      </button>

      {showRules && (
        <RuleSettings
          rule={state.rule}
          canSwitchFreely={canSwitchFreely}
          dispatch={dispatch}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  );
}
