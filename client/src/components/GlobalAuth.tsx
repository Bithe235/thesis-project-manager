"use client";
import React, { useState, useEffect } from "react";

export default function GlobalAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("d72_global_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "fahad" && password === "fahadakash12345") {
      localStorage.setItem("d72_global_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid username or password.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a", color: "#fff", fontFamily: "'Space Mono', monospace" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a1a",
        padding: 20
      }}>
        <div style={{
          background: "#fff",
          border: "3px solid #1a1a1a",
          borderRadius: 12,
          padding: 30,
          width: "100%",
          maxWidth: 400,
          boxShadow: "8px 8px 0 #4ECDC4",
          fontFamily: "'Space Mono', monospace"
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a", marginBottom: 20, textAlign: "center", letterSpacing: "-0.5px" }}>
            🔒 SECURITY LOGIN
          </h2>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 24, textAlign: "center", fontWeight: 600 }}>
            This workspace is private. Please authenticate to continue.
          </p>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>USERNAME</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #1a1a1a",
                  borderRadius: 6,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 16,
                  outline: "none"
                }}
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>PASSWORD</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #1a1a1a",
                  borderRadius: 6,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 16,
                  outline: "none"
                }}
              />
            </div>
            {error && <div style={{ color: "#FF4757", fontSize: 13, fontWeight: 700 }}>{error}</div>}
            <button type="submit" style={{
              background: "#FFE135",
              color: "#1a1a1a",
              border: "2.5px solid #1a1a1a",
              padding: "12px",
              fontSize: 16,
              fontWeight: 800,
              borderRadius: 6,
              cursor: "pointer",
              boxShadow: "3px 3px 0 #1a1a1a",
              marginTop: 10,
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "translate(2px, 2px)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "translate(0, 0)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translate(0, 0)"}
            >
              ENTER ➜
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
