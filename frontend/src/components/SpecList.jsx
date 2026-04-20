/**
 * SpecList.jsx
 * 左サイドバー：読み込み済み仕様書ファイルの一覧を表示する。
 */

export default function SpecList({ files }) {
  const fileIcon = (name) => {
    if (name.endsWith(".docx")) return "📝";
    if (name.endsWith(".html") || name.endsWith(".htm")) return "🌐";
    return "📄";
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarTitle}>読み込み済み仕様書</div>

      {files.length === 0 ? (
        <div style={styles.empty}>仕様書が見つかりません</div>
      ) : (
        <ul style={styles.list}>
          {files.map((file) => (
            <li key={file} style={styles.item}>
              <span style={styles.icon}>{fileIcon(file)}</span>
              <span style={styles.fileName}>{file}</span>
            </li>
          ))}
        </ul>
      )}

      <div style={styles.hint}>
        💡 <code>specs/</code> フォルダにファイルを追加すると<br />
        サーバー再起動時に自動で読み込まれます
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    flexShrink: 0,
    background: "#fff",
    borderRight: "1px solid #cbd5e1",
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    gap: "12px",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontWeight: 700,
    fontSize: "13px",
    color: "#1e4d8c",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "2px solid #d6e4f7",
    paddingBottom: "8px",
  },
  empty: {
    color: "#999",
    fontSize: "13px",
  },
  list: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px",
    borderRadius: "6px",
    background: "#f4f7fb",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  icon: {
    flexShrink: 0,
  },
  fileName: {
    wordBreak: "break-all",
    color: "#1a1a2e",
  },
  hint: {
    marginTop: "auto",
    fontSize: "11px",
    color: "#888",
    lineHeight: 1.7,
    padding: "8px",
    background: "#f4f7fb",
    borderRadius: "6px",
  },
};
