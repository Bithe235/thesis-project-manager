"use client";
import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";

interface Visitor {
  name: string;
  sessionId: string;
  page: string;
  joinedAt: string;
}

interface OnlineUsersProps {
  currentPage?: string;
}

const PAGE_LABELS: Record<string, string> = {
  "/": "🔗 Links",
  "/storage": "☁️ Storage",
};

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

export default function OnlineUsers({ currentPage = "/" }: OnlineUsersProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [connected, setConnected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  // Send a message safely
  const send = (msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const connect = () => {
    const name = localStorage.getItem("d72_visitor_name");
    const sessionId = localStorage.getItem("d72_session_id");
    if (!name || !sessionId) return; // Not registered yet

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Register with the server
      ws.send(JSON.stringify({ type: "join", name, sessionId, page: currentPage }));

      // Keepalive ping every 25 seconds
      pingRef.current = setInterval(() => {
        ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "visitors") {
          setVisitors(msg.visitors || []);
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      if (pingRef.current) clearInterval(pingRef.current);
      // Auto-reconnect after 3 seconds
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  };

  useEffect(() => {
    connect();
    return () => {
      // Clean up on unmount
      if (pingRef.current) clearInterval(pingRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []);

  // Tell server when page changes
  useEffect(() => {
    send({ type: "page", page: currentPage });
  }, [currentPage]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!expanded) return;
    const close = () => setExpanded(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [expanded]);

  const mySession = typeof window !== "undefined"
    ? localStorage.getItem("d72_session_id")
    : null;

  // Always render the pill (show "0 online" if disconnected, count if connected)
  const count = visitors.length;

  return (
    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          background: connected ? "#95E16A" : "#f0f0f0",
          border: "2px solid #1a1a1a",
          borderRadius: 100,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 12,
          boxShadow: "2px 2px 0 #1a1a1a",
          transition: "background 0.3s",
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#1a1a1a",
        }}
      >
        {/* Status dot */}
        <span style={{ position: "relative", width: 8, height: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {connected && (
            <span style={{
              position: "absolute", inset: 0,
              background: "#1a1a1a",
              borderRadius: "50%",
              animation: "presence-ping 1.5s ease infinite",
            }} />
          )}
          <span style={{
            position: "absolute", inset: 0,
            background: connected ? "#1a1a1a" : "#aaa",
            borderRadius: "50%",
          }} />
        </span>
        <Users size={12} />
        {connected ? `${count} online` : "connecting..."}
      </button>

      {/* Dropdown panel */}
      {expanded && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "#fff",
          border: "2.5px solid #1a1a1a",
          borderRadius: 10,
          boxShadow: "4px 4px 0 #1a1a1a",
          minWidth: 240,
          zIndex: 200,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "8px 14px",
            borderBottom: "2px solid #1a1a1a",
            background: "#95E16A",
            fontWeight: 700,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={12} /> Live — {count} online
            </span>
            <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 500 }}>
              {connected ? "● connected" : "○ reconnecting..."}
            </span>
          </div>

          {count === 0 ? (
            <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 13, color: "#aaa" }}>
              👻 No one else here yet
            </div>
          ) : (
            visitors.map((v) => {
              const isMe = v.sessionId === mySession;
              return (
                <div
                  key={v.sessionId}
                  style={{
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #f0f0f0",
                    background: isMe ? "rgba(149,225,106,0.1)" : "transparent",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    {/* Live green dot */}
                    <span style={{
                      width: 8, height: 8,
                      background: "#95E16A",
                      borderRadius: "50%",
                      border: "1.5px solid #1a1a1a",
                      flexShrink: 0,
                      display: "inline-block",
                    }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {v.name}
                      {isMe && (
                        <span style={{
                          marginLeft: 5,
                          background: "#FFE135",
                          border: "1px solid #1a1a1a",
                          borderRadius: 4,
                          fontSize: 9,
                          padding: "1px 5px",
                          fontWeight: 700,
                          verticalAlign: "middle",
                        }}>
                          YOU
                        </span>
                      )}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11,
                    background: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    padding: "1px 6px",
                    fontWeight: 600,
                    color: "#555",
                    whiteSpace: "nowrap",
                  }}>
                    {PAGE_LABELS[v.page] || v.page}
                  </span>
                </div>
              );
            })
          )}

          <div style={{
            padding: "6px 14px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
            fontSize: 10,
            color: "#aaa",
            textAlign: "center",
          }}>
            Updates instantly via WebSocket ⚡
          </div>
        </div>
      )}

      <style>{`
        @keyframes presence-ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
