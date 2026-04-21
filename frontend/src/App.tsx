import { useState, useEffect } from "react";
import ChatPanel from "./components/ChatPanel";
import SpecList from "./components/SpecList";
import type { SpecsResponse } from "./types";

const API_BASE = "http://localhost:8000";

export default function App() {
  const [specFiles, setSpecFiles] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/specs`)
      .then((res) => res.json())
      .then((data: SpecsResponse) => setSpecFiles(data.files))
      .catch(() =>
        setLoadError(
          "バックエンドに接続できません。サーバーが起動しているか確認してください。"
        )
      );
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.logo}>⬛ FieldReport</span>
          <span style={styles.subtitle}>仕様書レビューシステム</span>
        </div>
        <div style={styles.headerRight}>
          {loadError ? (
            <span style={styles.errorBadge}>⚠ {loadError}</span>
          ) : (
            <span style={styles.specBadge}>
              📄 仕様書 {specFiles.length} 件 読み込み済
            </span>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <div style={styles.main}>
        <SpecList files={specFiles} />
        <ChatPanel apiBase={API_BASE} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: "#1e4d8c",
    color: "#fff",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "4px solid #e85d04",
    flexShrink: 0,
  },
  headerTitle: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { fontWeight: 700, fontSize: "18px", letterSpacing: "0.05em" },
  subtitle: { fontSize: "14px", opacity: 0.8 },
  headerRight: {},
  specBadge: {
    background: "rgba(255,255,255,0.15)",
    padding: "4px 12px",
    borderRadius: "99px",
    fontSize: "12px",
  },
  errorBadge: {
    background: "#e85d04",
    padding: "4px 12px",
    borderRadius: "99px",
    fontSize: "12px",
  },
  main: { display: "flex", flex: 1, overflow: "hidden" },
};
