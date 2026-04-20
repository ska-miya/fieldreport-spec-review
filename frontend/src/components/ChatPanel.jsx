/**
 * ChatPanel.jsx
 * 右メインエリア：チャット形式で仕様書について質問・レビュー依頼ができる。
 */

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// よく使う質問のサジェスト
const SUGGESTIONS = [
  "仕様書の中に矛盾はありますか？",
  "SCR-003（完了確認画面）の仕様を教えてください",
  "オフライン時の動作はどの画面でどう定義されていますか？",
  "必須入力項目の一覧を教えてください",
];

export default function ChatPanel({ apiBase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "サーバーエラーが発生しました");
      }

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.messageArea}>
        {messages.length === 0 && (
          <div style={styles.welcome}>
            <div style={styles.welcomeTitle}>👋 仕様書について質問してください</div>
            <div style={styles.welcomeDesc}>
              仕様書の内容確認・矛盾チェック・不明点の解説ができます。
            </div>
            <div style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s} style={styles.suggestionBtn} onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={msg.role === "user" ? styles.userRow : styles.assistantRow}>
            <div style={msg.role === "user" ? styles.userBubble : styles.assistantBubble}>
              {msg.role === "user" ? (
                <p style={styles.userText}>{msg.content}</p>
              ) : (
                <div style={styles.markdownBody}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => <h2 style={mdStyles.h2}>{children}</h2>,
                      h3: ({ children }) => <h3 style={mdStyles.h3}>{children}</h3>,
                      p:  ({ children }) => <p  style={mdStyles.p}>{children}</p>,
                      ul: ({ children }) => <ul style={mdStyles.ul}>{children}</ul>,
                      ol: ({ children }) => <ol style={mdStyles.ol}>{children}</ol>,
                      li: ({ children }) => <li style={mdStyles.li}>{children}</li>,
                      strong: ({ children }) => <strong style={mdStyles.strong}>{children}</strong>,
                      hr: () => <hr style={mdStyles.hr} />,
                      table: ({ children }) => (
                        <div style={mdStyles.tableWrapper}>
                          <table style={mdStyles.table}>{children}</table>
                        </div>
                      ),
                      th: ({ children }) => <th style={mdStyles.th}>{children}</th>,
                      td: ({ children }) => <td style={mdStyles.td}>{children}</td>,
                      code: ({ inline, children }) =>
                        inline ? (
                          <code style={mdStyles.inlineCode}>{children}</code>
                        ) : (
                          <pre style={mdStyles.codeBlock}><code>{children}</code></pre>
                        ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.assistantRow}>
            <div style={styles.assistantBubble}>
              <span style={styles.loadingDots}>考え中…</span>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorRow}>⚠ {error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="質問を入力してください（Enter で送信 / Shift+Enter で改行）"
          rows={3}
          disabled={loading}
        />
        <button
          style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          送信
        </button>
      </div>
    </div>
  );
}

// レイアウト用スタイル
const styles = {
  container: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  messageArea: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },
  welcome: { textAlign: "center", padding: "40px 24px", color: "#666" },
  welcomeTitle: { fontSize: "20px", fontWeight: 700, color: "#1e4d8c", marginBottom: "8px" },
  welcomeDesc: { fontSize: "14px", marginBottom: "24px" },
  suggestions: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" },
  suggestionBtn: { background: "#fff", border: "1px solid #cbd5e1", borderRadius: "99px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: "#1e4d8c" },
  userRow: { display: "flex", justifyContent: "flex-end" },
  assistantRow: { display: "flex", justifyContent: "flex-start" },
  userBubble: { background: "#1e4d8c", color: "#fff", padding: "12px 16px", borderRadius: "16px 16px 4px 16px", maxWidth: "70%" },
  assistantBubble: { background: "#fff", border: "1px solid #cbd5e1", padding: "16px 20px", borderRadius: "16px 16px 16px 4px", maxWidth: "85%", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  userText: { fontSize: "14px", lineHeight: 1.7, margin: 0, wordBreak: "break-word" },
  markdownBody: { fontSize: "14px", lineHeight: 1.7, color: "#1a1a2e" },
  loadingDots: { fontSize: "14px", color: "#888" },
  errorRow: { background: "#fee2e2", color: "#b91c1c", padding: "10px 16px", borderRadius: "8px", fontSize: "13px" },
  inputArea: { borderTop: "1px solid #cbd5e1", padding: "16px 24px", background: "#fff", display: "flex", gap: "12px", alignItems: "flex-end" },
  textarea: { flex: 1, border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", resize: "none", lineHeight: 1.6, fontFamily: "inherit", outline: "none" },
  sendBtn: { background: "#1e4d8c", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", flexShrink: 0 },
};

// Markdown要素ごとのスタイル
const mdStyles = {
  h2: { fontSize: "16px", fontWeight: 700, color: "#1e4d8c", margin: "16px 0 8px", paddingBottom: "4px", borderBottom: "2px solid #d6e4f7" },
  h3: { fontSize: "14px", fontWeight: 700, color: "#2c5f9e", margin: "12px 0 6px" },
  p:  { margin: "6px 0", lineHeight: 1.7 },
  ul: { paddingLeft: "20px", margin: "6px 0" },
  ol: { paddingLeft: "20px", margin: "6px 0" },
  li: { marginBottom: "4px", lineHeight: 1.7 },
  strong: { fontWeight: 700, color: "#1a1a2e" },
  hr: { border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" },
  tableWrapper: { overflowX: "auto", margin: "8px 0" },
  table: { borderCollapse: "collapse", width: "100%", fontSize: "13px" },
  th: { background: "#1e4d8c", color: "#fff", padding: "7px 12px", textAlign: "left", fontWeight: 600 },
  td: { padding: "7px 12px", borderBottom: "1px solid #e2e8f0", verticalAlign: "top" },
  inlineCode: { background: "#f1f5f9", padding: "1px 5px", borderRadius: "4px", fontSize: "13px", fontFamily: "monospace" },
  codeBlock: { background: "#f1f5f9", padding: "12px", borderRadius: "6px", fontSize: "13px", overflow: "auto", margin: "8px 0" },
};
