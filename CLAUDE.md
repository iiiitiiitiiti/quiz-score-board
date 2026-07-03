# quiz-score-board

クイズ大会用の得点ボード。React 19 + Vite + Tailwind CSS v4（`@tailwindcss/vite` プラグイン方式、tailwind.config.js は無い）。

## コマンド

- `npm run dev` / `npm run build` / `npm run lint` — **変更後は lint と build を必ず実行**

## アーキテクチャ

- 状態管理は `useReducer` 一本。`src/store/reducer.js` が全ロジックの中心。コンポーネントは `dispatch(action)` を投げるだけ
- action type は `'領域/動詞'` 形式（例 `score/update`, `history/undo`）。新機能もこの命名に従う
- 状態は全変更ごとに `persistence.js` 経由で localStorage（key: `quiz-scoreboard:v1`）へ保存

## 落とし穴・暗黙ルール

- **`QUESTION_PLACEHOLDER_INDEX = -1` は sentinel 値**。「CSV インポート済みだが問題を未表示」の状態を表す。`currentIndex` を扱うコードは必ずこのケースを考慮し、`clampIndex()` を通すこと
- **localStorage に新フィールドを足すときは `persistence.js` の sanitize 系関数への追加が必須**。忘れると保存はされるが復元時に消える（読み込みで捨てられる）
- undo/redo は `history` 配列 + `historyIndex` 方式。**元に戻せる操作を追加するなら、entry の追加・`history/undo`・`history/redo`・`sanitizeHistoryEntry` の4箇所をセットで実装する**。対象は現状 `score/update` と `circle/record` のみ（プレイヤー追加削除・並べ替えは undo 対象外という設計判断）
- `app/clear` は reducer の外（App.jsx の dispatch ラッパー）で `clearStorage()` を呼んでいる。reducer に副作用を書かない
- タイトル入力の Enter 確定は `e.nativeEvent.isComposing` チェック済み。**日本語 IME 変換確定の Enter を誤爆させない**ため、テキスト入力の keydown には必ずこのチェックを入れる
- history は保存時に直近500件へ切り詰め（`slice(-500)`）
- モードは `'score'`（得点制）と `'circle-cross'`（○×制）の2つ。プレイヤーは両モードのフィールド（score / correct / wrong）を常に持つ

## CSV インポート

- パースは papaparse（`src/lib/csv.js`）。問題データは `{ no, question, answer, note }`
- インポートエラーは `ui/setImportError` で ErrorBanner に表示する（throw しない）
