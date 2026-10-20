# quiz-score-board

クイズ大会用の得点ボード。React 19 + Vite + Tailwind CSS v4（`@tailwindcss/vite` プラグイン方式、tailwind.config.js は無い）。

## コマンド

- `npm run dev` / `npm run build` / `npm run lint` — **変更後は lint と build を必ず実行**

## アーキテクチャ

- 状態管理は `useReducer` 一本。`src/store/reducer.js` が全ロジックの中心。コンポーネントは `dispatch(action)` を投げるだけ
- action type は `'領域/動詞'` 形式（例 `answer/record`, `history/undo`）。新機能もこの命名に従う
- クイズのルールは `src/rules/` に1ルール1ファイルの純粋関数で置く（`answer`・`compare`・`view`）。reducer は `applyAnswer()` を呼び、`PLAY_FIELDS` の前後の差分を履歴に積むだけ。ルールを足すときは `src/rules/index.js` の `RULES` に並べ、`tests/rules.test.js` にテストを足す（`npm test`）。設計は `docs/plan-rules.md`
- 状態は全変更ごとに `persistence.js` 経由で localStorage（key: `quiz-scoreboard:v1`）へ保存

## 落とし穴・暗黙ルール

- **`QUESTION_PLACEHOLDER_INDEX = -1` は sentinel 値**。「CSV インポート済みだが問題を未表示」の状態を表す。`currentIndex` を扱うコードは必ずこのケースを考慮し、`clampIndex()` を通すこと
- **localStorage に新フィールドを足すときは `persistence.js` の sanitize 系関数への追加が必須**。忘れると保存はされるが復元時に消える（読み込みで捨てられる）
- undo/redo は `history` 配列 + `historyIndex` 方式。entry は `answer/record` 1種類で、変わった人ごとの `PLAY_FIELDS` の前後の値（`changes`）と `questionNo` の前後を持つ。**プレイヤーに新しい欄を足してルールで変えるなら、`PLAY_FIELDS` と `persistence.js` の値の検査（`isValidPlayValue`）に足す**。元に戻せる操作を別の type で足すなら、entry の追加・`history/undo`・`history/redo`・`sanitizeHistoryEntry` の4箇所をセットで実装する（プレイヤー追加削除・並べ替え・改名・ロックは undo 対象外という設計判断）
- 古い保存データの `mode` と `score/update`・`circle/record` の履歴は、読み込み時に `rule` と `answer/record` へ読み替える（`persistence.js`）。この読み替えは消さない
- 勝ち抜け・失格（`finish`）が決まった人の○✕は `applyAnswer()` が受け付けない。ロックは reducer では見ず、ボタン側で止める（阻止やサバイバルの減点はロック中の人にも入る）
- 問題の数を使うルールは `usesQuestions: true` を持ち、画面に「第n問」とスルー（`QuestionBar`）が出る。`applyAnswer()` の result は `ANSWER_RESULTS`（correct / wrong / through / convert）。スルーは `playerId: null` で問題を1つ進め、換算（ルールの `convert()`）は問題を進めず休み中でもできる。休み中（`isResting`: `questionNo + 1 <= restUntil`）の○✕と、`params.limit`（問題数の上限）に達したあとの操作は全部受け付けない。ボタンの無効化も同じ条件にそろえる
- `playerView()` に `questionNo` を渡すと「休み あと○問」の札が付く
- `app/clear` は reducer の外（App.jsx の dispatch ラッパー）で `clearStorage()` を呼んでいる。reducer に副作用を書かない
- タイトル入力の Enter 確定は `e.nativeEvent.isComposing` チェック済み。**日本語 IME 変換確定の Enter を誤爆させない**ため、テキスト入力の keydown には必ずこのチェックを入れる
- history は保存時に直近500件へ切り詰め（`slice(-500)`）
- `state.rule = { id, params }`。プレイヤーはどのルールでも `PLAY_FIELDS`（score / correct / wrong / finish / finishOrder など）を全部持つ。ルール切り替え（`rule/set`）とスコアリセットは `PLAY_FIELDS`・`questionNo`・履歴をルールの最初の値に戻す
- **変更後は `npm test` も実行する**（`node --test`。tests/ は lint の対象外）

## CSV インポート

- パースは papaparse（`src/lib/csv.js`）。問題データは `{ no, question, answer, note }`
- インポートエラーは `ui/setImportError` で ErrorBanner に表示する（throw しない）
