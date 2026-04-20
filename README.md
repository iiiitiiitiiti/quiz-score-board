# クイズ得点板

クイズ大会・授業・社内イベントなどで使えるリアルタイム得点管理Webアプリです。

**デモ**: https://iiiitiiitiiti.github.io/quiz-score-board/

## 機能

- **プレイヤー管理** — プレイヤーの追加・削除・並び替え（ドラッグ＆ドロップ）
- **スコア操作** — +1 / -1 ボタンでスコアをリアルタイム更新
- **○/✕ モード** — 正解・不正解を記録するモード
- **Undo / Redo** — スコア変更の取り消し・やり直し
- **問題表示** — CSVファイルから問題・解答・備考を読み込んで表示
- **優勝者発表** — 🏆ボタンで優勝者を選択し、紙吹雪エフェクト付きの全画面演出を表示
- **ロック機能** — 特定プレイヤーのスコア変更を禁止
- **スコアリセット** — 全プレイヤーのスコアを一括リセット
- **全クリア** — すべてのデータを削除
- **データ永続化** — ページをリロードしてもデータが保持される（localStorage）

## CSV フォーマット

以下のヘッダーを持つCSVファイルをインポートできます。

```csv
No,Question,Answer,Note
1,日本の首都は？,東京,都道府県ではなく都
2,1+1は？,2,
```

| カラム | 必須 | 説明 |
|--------|------|------|
| No | ✓ | 問題番号 |
| Question | ✓ | 問題文 |
| Answer | ✓ | 答え |
| Note | | 備考（省略可） |

## 技術スタック

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [PapaParse](https://www.papaparse.com/)
- [canvas-confetti](https://github.com/catdad/canvas-confetti)

## ローカルで起動する

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。
