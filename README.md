# FieldReport 仕様書レビューシステム

> 工場向けアプリ「FieldReport」の仕様書を AI（Claude）を使って精査する Web アプリケーション

![スクリーンショット](docs/screenshot.png)

---

## 概要

複数の仕様書ドキュメント（機能仕様書・画面仕様書・画面遷移仕様書）をアップロードするだけで、チャット形式で以下の操作が可能になります。

- **矛盾チェック**：仕様書間の記述の食い違いを自動検出・優先度付きで報告
- **内容の質問応答**：「SCR-003 の仕様を教えて」などの自然言語での問い合わせ
- **不明点の指摘**：曖昧な定義・未定義の仕様箇所の洗い出し

実際の検出例として、本リポジトリ内のサンプル仕様書からは以下の矛盾が検出されました。

- **SCR-003 スクロール可否**：画面仕様書「縦スクロール可」⇔ 画面遷移仕様書「スクロール非対応」
- **バックキーのダイアログ表示条件**：画面仕様書「変更がある場合」⇔ 画面遷移仕様書「必ず表示」

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 / Vite |
| バックエンド | Python 3 / FastAPI |
| AI | Claude API（Anthropic） |
| 仕様書パース | python-docx / BeautifulSoup4 |

---

## 画面構成

```
┌─────────────────────────────────────────────┐
│  FieldReport  仕様書レビューシステム  📄 3件読み込み済 │
├────────────┬────────────────────────────────┤
│ 読み込み済み│                                │
│ 仕様書     │  👋 仕様書について質問してください  │
│            │                                │
│ 📝 機能仕様書│  ┌──────────────────────────┐ │
│ 🌐 画面仕様書│  │ サジェストボタン群         │ │
│ 📝 遷移仕様書│  └──────────────────────────┘ │
│            │                                │
│            │  ─── チャット履歴 ───           │
│            │                                │
│            ├────────────────────────────────┤
│            │  [ 質問を入力... ]     [ 送信 ] │
└────────────┴────────────────────────────────┘
```

---

## セットアップ

### 前提条件

- Python 3.10 以上
- Node.js 18 以上
- Anthropic API キー（[取得はこちら](https://console.anthropic.com/)）

### 1. リポジトリをクローン

```bash
git clone https://github.com/<your-username>/fieldreport-spec-review.git
cd fieldreport-spec-review
```

### 2. 仕様書を配置

```bash
# specs/ フォルダに .docx または .html ファイルを置く
cp your-spec.docx specs/
```

### 3. バックエンドをセットアップ

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 環境変数を設定
cp .env.example .env
# .env を開いて ANTHROPIC_API_KEY を設定

# サーバー起動
python -m uvicorn main:app --reload
```

### 4. フロントエンドをセットアップ

別ターミナルで：

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173`（または表示されたポート）を開く。

---

## フォルダ構成

```
fieldreport-spec-review/
├── specs/                   # 仕様書ファイル置き場（.docx / .html）
├── backend/
│   ├── main.py              # FastAPI エンドポイント
│   ├── spec_loader.py       # 仕様書パース・Claude プロンプト生成
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── ChatPanel.jsx   # チャット UI（Markdown レンダリング対応）
│           └── SpecList.jsx    # 仕様書ファイル一覧
└── docs/
    └── screenshot.png       # スクリーンショット
```

---

## 使い方

1. バックエンド・フロントエンドを起動する
2. ブラウザで画面を開く
3. サジェストボタンをクリック、または自由に質問を入力する

**質問例：**
- `仕様書の中に矛盾はありますか？`
- `SCR-002 の必須入力項目を一覧で教えてください`
- `オフライン時の挙動はどの画面でどう定義されていますか？`

---

## ライセンス

MIT
