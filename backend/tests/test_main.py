"""
test_main.py
FastAPI エンドポイントのテスト
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

import main as app_module
from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def setup_specs():
    """各テスト前に specs と system_prompt をセットアップする"""
    app_module.specs = {"仕様書A.html": "テスト用コンテンツ"}
    app_module.system_prompt = "テスト用システムプロンプト"
    yield
    app_module.specs = {}
    app_module.system_prompt = ""


# ── GET / ────────────────────────────────────────────────────────────

class TestRoot:
    def test_returns_200(self, client):
        response = client.get("/")
        assert response.status_code == 200

    def test_returns_message(self, client):
        response = client.get("/")
        assert "message" in response.json()


# ── GET /api/specs ────────────────────────────────────────────────────

class TestGetSpecs:
    def test_returns_200(self, client):
        response = client.get("/api/specs")
        assert response.status_code == 200

    def test_returns_files_key(self, client):
        response = client.get("/api/specs")
        assert "files" in response.json()

    def test_returns_loaded_spec_names(self, client):
        response = client.get("/api/specs")
        assert "仕様書A.html" in response.json()["files"]

    def test_empty_when_no_specs(self, client):
        app_module.specs = {}
        response = client.get("/api/specs")
        assert response.json()["files"] == []


# ── POST /api/chat ────────────────────────────────────────────────────

class TestChat:
    def _mock_response(self, text: str):
        mock_content = MagicMock()
        mock_content.text = text
        mock_response = MagicMock()
        mock_response.content = [mock_content]
        return mock_response

    def test_returns_200(self, client):
        with patch("main.anthropic.Anthropic") as MockClient:
            MockClient.return_value.messages.create.return_value = self._mock_response("テスト回答")
            with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
                response = client.post(
                    "/api/chat",
                    json={"messages": [{"role": "user", "content": "仕様書について教えて"}]},
                )
        assert response.status_code == 200

    def test_returns_reply(self, client):
        with patch("main.anthropic.Anthropic") as MockClient:
            MockClient.return_value.messages.create.return_value = self._mock_response("AIの回答です")
            with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
                response = client.post(
                    "/api/chat",
                    json={"messages": [{"role": "user", "content": "質問"}]},
                )
        assert response.json()["reply"] == "AIの回答です"

    def test_passes_message_history(self, client):
        with patch("main.anthropic.Anthropic") as MockClient:
            mock_create = MockClient.return_value.messages.create
            mock_create.return_value = self._mock_response("回答")
            with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
                client.post(
                    "/api/chat",
                    json={
                        "messages": [
                            {"role": "user", "content": "最初の質問"},
                            {"role": "assistant", "content": "最初の回答"},
                            {"role": "user", "content": "次の質問"},
                        ]
                    },
                )
            called_messages = mock_create.call_args.kwargs["messages"]
            assert len(called_messages) == 3

    def test_error_when_no_api_key(self, client):
        with patch.dict("os.environ", {}, clear=True):
            # ANTHROPIC_API_KEY を除外
            env = {k: v for k, v in __import__("os").environ.items() if k != "ANTHROPIC_API_KEY"}
            with patch.dict("os.environ", env, clear=True):
                response = client.post(
                    "/api/chat",
                    json={"messages": [{"role": "user", "content": "質問"}]},
                )
        assert response.status_code == 500

    def test_error_when_no_system_prompt(self, client):
        app_module.system_prompt = ""
        with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
            response = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "質問"}]},
            )
        assert response.status_code == 500

    def test_invalid_request_body_returns_422(self, client):
        response = client.post("/api/chat", json={"invalid": "body"})
        assert response.status_code == 422
