import { X } from 'lucide-react';
import { RULES } from '../rules/index.js';

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
      'ロックすると、そのプレイヤーのボタンを止められます。ほかの人の○で減点されるルール（阻止・サバイバル）では、ロック中でも点が変わります。',
      '🏆アイコンを押すと優勝者発表画面が表示され、紙吹雪とともに優勝者を祝福します。',
    ],
  },
  {
    title: 'ルール',
    items: [
      '準備バー右端の「ルール」ボタンでルールを選び、勝ち抜け点などの数字を変えられます。',
      'ルールを変えると、全員の点数と操作履歴が最初に戻ります（プレイヤーは残ります）。',
      '勝ち抜け・失格はボードが自動で決め、カードに「1抜け」「失格」の札が付きます。札の付いた人のボタンは止まります。',
      '問題の数を使うルール（m○n休・青天井・10hits Combo・ポイント換算）では、ボードの上に「第n問」と「スルー」ボタンが出ます。誰も正解しなかった問題はスルーで次へ進めます。',
      '✕で休みになった人のカードには「休み あと○問」の札が付き、休みが明けるまでボタンが止まります。',
      'ポイント換算では、カードの「換算」ボタンでためた○を点に換えます。休み中でも換算できます。',
      '「得点順」ボタンで、勝ち抜けた順 → 成績の良い順 → 失格（後に落ちた人が上）に並び替えます（もう一度押すと元に戻ります）。',
    ],
  },
  {
    title: 'ルールの一覧',
    items: RULES.map((r) => `【${r.name}】${r.description}`),
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
      '画面右上の「元に戻す」で直前の○✕（+1・−1）・スルー・換算を取り消せます。ほかの人の点が一緒に変わった操作も、まとめて元に戻ります。',
      '「やり直し」で取り消した操作を復元できます。',
    ],
  },
  {
    title: 'リセット・削除',
    items: [
      '画面右上の「スコアリセット」で全プレイヤーの点数をルールの最初の値に戻します（プレイヤーは残ります）。',
      '「全クリア」でプレイヤー・問題・履歴をすべて削除します。',
    ],
  },
  {
    title: '自動保存',
    items: [
      'データはこの端末のブラウザに自動で保存されます。ページを閉じても残ります。',
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
