"""
main.py
FastAPI アプリケーションのエントリーポイント。
"""

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic

from spec_loader import load_all_specs, build_system_prompt

# .env ファイルを読み込む
load_dotenv()

# ── 起動時に仕様書を一度だけ読み込む ──────────────────────────────────
specs: dict[str, str] = {}
system_prompt: str = ""


@asynccontextmanager
async def lifespan(app: FastAPI):
    """サーバー起動時に仕様書を読み込む"""
    global specs, system_prompt
    specs_dir = os.getenv("SPECS_DIR", "../specs")
    try:
        specs = load_all_specs(specs_dir)
        system_prompt = build_system_prompt(specs)
        print(f"✅ 仕様書を読み込みました: {list(specs.keys())}")
    except FileNotFoundError as e:
        print(f"⚠️  {e}")
    yield


# ── FastAPI アプリ初期化 ───────────────────────────────────────────────
app = FastAPI(
    title="FieldReport 仕様書レビューAPI",
    version="0.1.0",
    lifespan=lifespan,
)

# React（localhostの任意ポート）からのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── リクエスト・レスポンスの型定義 ────────────────────────────────────
class Message(BaseModel):
    role: str   # "user" または "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]  # これまでの会話履歴（最新メッセージを含む）


class ChatResponse(BaseModel):
    reply: str


# ── エンドポイント ────────────────────────────────────────────────────
@app.get("/api/specs")
def get_specs():
    """読み込み済みの仕様書一覧を返す"""
    return {"files": list(specs.keys())}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """ユーザーのメッセージを受け取り、Claude の回答を返す"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY が設定されていません")

    if not system_prompt:
        raise HTTPException(status_code=500, detail="仕様書が読み込まれていません")

    client = anthropic.Anthropic(api_key=api_key)

    # Anthropic API に渡すメッセージ形式に変換
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    response = client.messages.create(
        model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
        max_tokens=2048,
        system=system_prompt,
        messages=messages,
    )

    return ChatResponse(reply=response.content[0].text)


@app.get("/")
def root():
    return {"message": "FieldReport 仕様書レビューAPI が起動中です"}
