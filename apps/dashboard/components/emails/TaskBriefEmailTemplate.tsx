import * as React from "react"

type TaskBriefEmailTemplateProps = {
  taskTitle: string
  senderName: string
  senderEmail: string
  priority: string
  message: string
  taskUrl?: string
}

export function TaskBriefEmailTemplate({
  taskTitle,
  senderName,
  senderEmail,
  priority,
  message,
  taskUrl,
}: TaskBriefEmailTemplateProps) {
  const priorityColor =
    priority === "high" ? "#c0602a" : priority === "medium" ? "#a07840" : "#606060"

  return (
    <html lang="en">
      <body style={{ fontFamily: "Georgia, serif", background: "#f9f5ef", margin: 0, padding: 0 }}>
        <div
          style={{
            maxWidth: 600,
            margin: "40px auto",
            background: "#fff9f2",
            border: "2px solid #c0a060",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#1a1208",
              padding: "24px 32px",
              borderBottom: "4px solid #c0602a",
            }}
          >
            <p
              style={{
                color: "#c0a060",
                fontSize: 11,
                letterSpacing: 4,
                textTransform: "uppercase",
                margin: "0 0 8px 0",
                fontFamily: "monospace",
              }}
            >
              Fungga Wari Lab — Studio Brief
            </p>
            <h1
              style={{
                color: "#f5e8d0",
                fontSize: 24,
                margin: 0,
                fontFamily: "Georgia, serif",
                letterSpacing: -0.5,
              }}
            >
              {taskTitle}
            </h1>
          </div>

          {/* Meta row */}
          <div style={{ borderBottom: "1px solid #e0c890" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "16px 32px",
                      borderRight: "1px solid #e0c890",
                      width: "50%",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: 3,
                        color: "#a07840",
                        textTransform: "uppercase",
                        margin: "0 0 4px 0",
                        fontFamily: "monospace",
                      }}
                    >
                      From
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#2a1a08",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {senderName}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#806040",
                        margin: "2px 0 0 0",
                        fontFamily: "monospace",
                      }}
                    >
                      {senderEmail}
                    </p>
                  </td>
                  <td style={{ padding: "16px 32px", width: "50%" }}>
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: 3,
                        color: "#a07840",
                        textTransform: "uppercase",
                        margin: "0 0 4px 0",
                        fontFamily: "monospace",
                      }}
                    >
                      Priority
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: priorityColor,
                        margin: 0,
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: 2,
                      }}
                    >
                      {priority}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Message body */}
          <div style={{ padding: "24px 32px" }}>
            <p
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: "#a07840",
                textTransform: "uppercase",
                margin: "0 0 12px 0",
                fontFamily: "monospace",
              }}
            >
              Brief
            </p>
            <p
              style={{
                fontSize: 15,
                color: "#2a1a08",
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {message}
            </p>
          </div>

          {/* CTA */}
          {taskUrl && (
            <div style={{ padding: "0 32px 24px 32px" }}>
              {/* eslint-disable-next-line no-restricted-syntax -- email templates require raw <a> tags; next/link is not valid in email HTML */}
              <a
                href={taskUrl}
                style={{
                  display: "inline-block",
                  background: "#c0602a",
                  color: "#fff9f2",
                  padding: "10px 24px",
                  fontFamily: "monospace",
                  fontSize: 12,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                View Task →
              </a>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              background: "#f0e8d8",
              borderTop: "1px solid #e0c890",
              padding: "16px 32px",
            }}
          >
            <p style={{ fontSize: 11, color: "#a07840", margin: 0, fontFamily: "monospace" }}>
              Sent via Fungga Wari Lab Creator Studio · This is an internal team communication.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
