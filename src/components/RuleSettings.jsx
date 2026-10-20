import { useState } from 'react';
import { RULES, getRule, normalizeRule } from '../rules/index.js';

// ルール設定パネル: ルールの選択・数字や選択肢の入力・通過クイズのひな形
// 入力中の数字は文字のまま持ち、適用時に normalizeRule で既定値に寄せる
function toDraft(rule) {
  return { id: rule.id, params: Object.fromEntries(Object.entries(rule.params).map(([k, v]) => [k, String(v)])) };
}

function fromDraft(draft) {
  const def = getRule(draft.id);
  const params = {};
  for (const p of def.params) {
    const v = draft.params[p.key];
    // 空欄は Number('') が 0 になり「0なら無し」と区別できないので、既定値に寄せる
    params[p.key] = p.type === 'choice' ? v : v.trim() === '' ? NaN : Number(v);
  }
  return normalizeRule({ id: draft.id, params });
}

const sameRule = (a, b) => a.id === b.id && JSON.stringify(a.params) === JSON.stringify(b.params);

export default function RuleSettings({ rule, canSwitchFreely, dispatch, onClose }) {
  const [draft, setDraft] = useState(() => toDraft(rule));
  const def = getRule(draft.id);

  const handleRuleChange = (id) => {
    setDraft(toDraft(normalizeRule({ id, params: {} })));
  };

  const handleParamChange = (key, value) => {
    setDraft((d) => ({ ...d, params: { ...d.params, [key]: value } }));
  };

  const handlePreset = (preset) => {
    setDraft(toDraft(normalizeRule({ id: draft.id, params: preset.params })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = fromDraft(draft);
    if (sameRule(next, rule)) {
      onClose();
      return;
    }
    if (!canSwitchFreely && !window.confirm('ルールを変えると、全員の点数と操作履歴が最初に戻ります（プレイヤーは残ります）。変えますか？')) {
      return;
    }
    dispatch({ type: 'rule/set', payload: next });
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-panel border border-panel-edge shadow-md p-4 flex flex-col gap-3"
      aria-label="ルール設定"
    >
      <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
        ルール
        <select
          value={draft.id}
          onChange={(e) => handleRuleChange(e.target.value)}
          className="px-3 py-2 rounded-xl bg-panel border border-panel-edge text-ink text-sm focus:outline-none focus:ring-2 focus:ring-lamp max-w-xs"
        >
          {RULES.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>

      <p className="text-sm text-ink-dim leading-relaxed">{def.description}</p>

      {def.presets && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">ひな形</span>
          {def.presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePreset(preset)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-panel-edge/60 text-ink hover:bg-panel-edge transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {def.params.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {def.params.map((p) => (
            <label key={p.key} className="flex flex-col gap-1 text-sm text-ink">
              {p.label}
              {p.type === 'choice' ? (
                <select
                  value={draft.params[p.key]}
                  onChange={(e) => handleParamChange(p.key, e.target.value)}
                  className="px-3 py-2 rounded-xl bg-panel border border-panel-edge text-ink text-sm focus:outline-none focus:ring-2 focus:ring-lamp"
                >
                  {p.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  inputMode="numeric"
                  min={p.min ?? 0}
                  step={1}
                  value={draft.params[p.key]}
                  onChange={(e) => handleParamChange(p.key, e.target.value)}
                  className="px-3 py-2 rounded-xl bg-panel border border-panel-edge text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-lamp w-32"
                />
              )}
            </label>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 rounded-xl text-sm font-semibold bg-panel text-ink hover:bg-panel-edge border border-panel-edge transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded-xl text-sm font-semibold bg-lamp text-stage hover:bg-lamp/85 transition-colors"
        >
          このルールにする
        </button>
      </div>
    </form>
  );
}
