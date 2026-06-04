import { Avatar } from "antd"

export const CommentItem: React.FC<{ author: string; content: string; datetime: string }> = ({
  author,
  content,
  datetime,
}) => {
  return (
    <div
      style={{
        display: "flex",
        marginBottom: 16,
        padding: "8px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Avatar style={{ marginRight: 12, backgroundColor: "#1677ff" }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <strong>{author}</strong>
          <span style={{ fontSize: 12, color: "#999" }}>{datetime}</span>
        </div>
        <div style={{ color: "#333" }}>{content}</div>
      </div>
    </div>
  )
}
