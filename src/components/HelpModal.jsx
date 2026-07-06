import { X } from 'lucide-react';

const sections = [
  {
    title: 'タイトル',
    items: [
      'ページ上部のタイトル文字をクリックすると編集できます。',
    ],
  },
  {
    title: 'プレイヤー管理',
    items: [
      '「プレイヤーを追加」フォームに名前を入力して追加します。',
      'カード右上のアイコンで、ロック・優勝発表・削除ができます。',
      'カードをドラッグ＆ドロップで表示順を変更できます。',
      'ロックすると、そのプレイヤーの得点変更を禁止できます。',
      '🏆アイコンを押すと優勝者発表画面が表示され、紙吹雪とともに優勝者を祝福します。',
    ],
  },
  {
    title: '得点モード',
    items: [
      '【+1/-1 モード】カード下の「+1」「−1」ボタンで得点を増減します。',
      '【○/✕ モード】カード下の「○」「✕」ボタンで正解・誤答を記録します。',
      'ツールバー右端の切替スイッチで2つのモードを切り替えられます。',
      '「得点順」ボタンで得点の高い順に並び替えられます（もう一度押すと元に戻ります）。',
    ],
  },
  {
    title: '問題CSV インポート',
    items: [
      '「CSV インポート」ボタンからファイルを選択します。',
      'CSVの1行目はヘッダー行で、No / Question / Answer / Note の4列が必須です。',
      'インポート後、問題エリアが表示され「次の問題」「前の問題」で切り替えられます。',
      '文字コードは UTF-8 を推奨します（Excel の場合は「CSV UTF-8」で保存）。',
    ],
  },
  {
    title: '操作履歴',
    items: [
      '画面右上の「元に戻す」で直前の得点変更を取り消せます。',
      '「やり直し」で取り消した操作を復元できます。',
    ],
  },
  {
    title: 'リセット・削除',
    items: [
      '画面右上の「スコアリセット」で全プレイヤーの得点を 0 に戻します（プレイヤーは残ります）。',
      '「全クリア」でプレイヤー・問題・履歴をすべて削除します。',
    ],
  },
  {
    title: '自動保存',
    items: [
      'データはブラウザの localStorage に自動保存されます。ページを閉じても保持されます。',
      '別のブラウザやシークレットモードでは共有されません。',
    ],
  },
];

export default function HelpModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-panel border border-panel-edge rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-panel-edge">
          <h2 className="text-lg font-bold text-ink">使い方ガイド</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-dim hover:text-ink hover:bg-panel-edge transition-colors"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-lamp uppercase tracking-widest mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ink-dim shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-panel-edge flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-lamp text-stage hover:bg-lamp/85 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
