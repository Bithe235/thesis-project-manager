"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

interface VisitorModalProps {
  onNameSet: (name: string) => void;
}

const EMOJIS = ["🎓", "🔬", "📚", "💡", "🚀", "⚡", "🌟", "🎯", "🧠", "🛠️"];

export default function VisitorModal({ onNameSet }: VisitorModalProps) {
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError(true); return; }
    const displayName = `${selectedEmoji} ${trimmed}`;
    localStorage.setItem("d72_visitor_name", displayName);
    localStorage.setItem("d72_session_id", uuidv4());
    onNameSet(displayName);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(26,26,26,0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="animate-bounce-in"
        style={{
          background: "#FFFBF0",
          border: "3px solid #1a1a1a",
          borderRadius: 16,
          boxShadow: "8px 8px 0 #1a1a1a",
          width: "100%",
          maxWidth: 460,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          background: "#FFE135",
          borderBottom: "3px solid #1a1a1a",
          padding: "20px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.2,
          }}>
            Welcome to D-72 Thesis Hub!
          </h2>
          <p style={{ fontSize: 13, color: "#555", marginTop: 4, fontWeight: 500 }}>
            Let the team know you're here 👋
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {/* Emoji selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
              Pick your avatar emoji
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setSelectedEmoji(em)}
                  style={{
                    width: 42, height: 42,
                    fontSize: 22,
                    border: selectedEmoji === em ? "2.5px solid #1a1a1a" : "2px solid #ddd",
                    borderRadius: 10,
                    background: selectedEmoji === em ? "#FFE135" : "#fff",
                    cursor: "pointer",
                    boxShadow: selectedEmoji === em ? "2px 2px 0 #1a1a1a" : "none",
                    transform: selectedEmoji === em ? "translate(-1px,-1px)" : "none",
                    transition: "all 0.1s",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              Your name *
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 18, pointerEvents: "none",
              }}>
                {selectedEmoji}
              </span>
              <input
                autoFocus
                className="neo-input"
                style={{
                  paddingLeft: 42,
                  fontSize: 16,
                  fontWeight: 600,
                  border: error ? "2.5px solid #FF4757" : undefined,
                }}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(false); }}
                placeholder="e.g. fahadakash"
                maxLength={32}
              />
            </div>
            {error && (
              <p style={{ color: "#FF4757", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                Please enter your name to continue.
              </p>
            )}
          </div>

          {/* Preview */}
          {name.trim() && (
            <div style={{
              marginBottom: 20,
              padding: "10px 14px",
              background: "#fff",
              border: "2px solid #1a1a1a",
              borderRadius: 8,
              boxShadow: "2px 2px 0 #1a1a1a",
              fontSize: 13,
              fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: "#888" }}>You'll appear as:</span>
              <span style={{
                background: "#FFE135",
                border: "1.5px solid #1a1a1a",
                borderRadius: 6,
                padding: "2px 10px",
                fontWeight: 700,
              }}>
                {selectedEmoji} {name.trim()}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="neo-btn neo-btn-black"
            style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "12px" }}
          >
            🚀 Enter the Hub
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 12 }}>
            Your name is stored locally and shared with team members
          </p>
        </form>
      </div>
    </div>
  );
}
