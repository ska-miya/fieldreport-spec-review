"""
spec_loader.py
仕様書ファイル（.docx / .html）を読み込み、テキストに変換するモジュール。
"""

import os
from pathlib import Path
from docx import Document
from bs4 import BeautifulSoup


def load_docx(filepath: str) -> str:
    """Word文書（.docx）からテキストを抽出する"""
    doc = Document(filepath)
    lines = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(lines)


def load_html(filepath: str) -> str:
    """HTMLファイルからテキストを抽出する（タグを除去）"""
    with open(filepath, encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    # script・style タグは除去
    for tag in soup(["script", "style"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)


def load_all_specs(specs_dir: str) -> dict[str, str]:
    """
    specs_dir 内の対応ファイルをすべて読み込み、
    { ファイル名: テキスト内容 } の辞書を返す。
    """
    specs: dict[str, str] = {}
    specs_path = Path(specs_dir)

    if not specs_path.exists():
        raise FileNotFoundError(f"仕様書フォルダが見つかりません: {specs_dir}")

    for filepath in sorted(specs_path.iterdir()):
        suffix = filepath.suffix.lower()
        if suffix == ".docx":
            specs[filepath.name] = load_docx(str(filepath))
        elif suffix in (".html", ".htm"):
            specs[filepath.name] = load_html(str(filepath))
        # その他の拡張子はスキップ

    return specs


def build_system_prompt(specs: dict[str, str]) -> str:
    """
    仕様書テキストを埋め込んだシステムプロンプトを生成する。
    Claude に「仕様書の専門家」として振る舞わせる。
    """
    spec_sections = ""
    for filename, content in specs.items():
        spec_sections += f"\n\n## {filename}\n{content}"

    return f"""あなたは「FieldReport」（工場向け作業日報・点検記録アプリ）の仕様書レビュアーです。
以下の仕様書ドキュメントを完全に把握した上で、ユーザーの質問に正確・丁寧に答えてください。

【対応できること】
- 仕様書の内容に関する質問への回答
- 仕様書間の矛盾・不整合の指摘
- 仕様の曖昧な点や不足している定義の指摘
- 開発者・PM・テスターが持つ疑問への回答

【回答のルール】
- 根拠となる仕様書名・セクション名を必ず明記してください
- 複数の仕様書に関わる場合はそれぞれを比較して答えてください
- 矛盾を発見した場合は「矛盾あり」と明示してください
- 仕様書に記載がない場合は「仕様書に記載なし」と正直に伝えてください

---
# 仕様書ドキュメント
{spec_sections}
"""
