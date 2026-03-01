"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Database, Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("d72_is_admin") === "1");
    }
  }, []);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === "fahadakash" && adminPassword === "hani") {
      if (typeof window !== "undefined") {
        localStorage.setItem("d72_is_admin", "1");
        window.dispatchEvent(new Event("d72_admin_change"));
      }
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminError("");
      setAdminPassword("");
    } else {
      setAdminError("Invalid admin username or password.");
    }
  };

  const handleAdminLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("d72_is_admin");
      window.dispatchEvent(new Event("d72_admin_change"));
    }
    setIsAdmin(false);
    setShowAdminModal(false);
  };

  return (
    <nav className="navbar">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo / Title */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42,
              background: "#FFE135",
              border: "2.5px solid #1a1a1a",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "3px 3px 0 #1a1a1a",
              fontSize: 20,
              flexShrink: 0,
            }}>
              🎓
            </div>
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 16,
                color: "#1a1a1a",
                letterSpacing: "-0.3px",
                lineHeight: 1.1,
              }}>
                D-72 Thesis Group
              </div>
              <div style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>Research Hub ✦</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-nav">
            <Link href="/" className="sidetab">
              <BookOpen size={16} />
              Links
            </Link>
            <Link href="/storage" className="sidetab">
              <Database size={16} />
              Storage
            </Link>
            <div style={{
              width: 1, height: 28,
              background: "#1a1a1a",
              opacity: 0.15,
              margin: "0 4px"
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: "#FF6B9D",
                border: "2px solid #1a1a1a",
                borderRadius: 8,
                boxShadow: "2px 2px 0 #1a1a1a",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
              }}>
                <Sparkles size={13} />
                Batch-7 | Dept. CSE
              </div>
              <button
                onClick={() => setShowAdminModal(true)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "2px solid #1a1a1a",
                  background: isAdmin ? "#95E16A" : "#fff",
                  boxShadow: "2px 2px 0 #1a1a1a",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {isAdmin ? "Admin ✓" : "Admin"}
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "none",
              border: "2px solid #1a1a1a",
              borderRadius: 6,
              padding: "6px",
              cursor: "pointer",
              boxShadow: "2px 2px 0 #1a1a1a",
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          borderTop: "2px solid #1a1a1a",
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: "#fff",
        }}>
          <Link href="/" className="sidetab" onClick={() => setMobileOpen(false)}>
            <BookOpen size={16} /> Links
          </Link>
          <Link href="/storage" className="sidetab" onClick={() => setMobileOpen(false)}>
            <Database size={16} /> Storage
          </Link>
          <button
            onClick={() => { setShowAdminModal(true); setMobileOpen(false); }}
            className="sidetab"
            style={{ justifyContent: "flex-start" }}
          >
            Admin {isAdmin && "✓"}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {showAdminModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowAdminModal(false)}
        >
          <div
            className="animate-bounce-in"
            style={{
              background: "#FFFFFF",
              border: "3px solid #1a1a1a",
              borderRadius: 16,
              boxShadow: "8px 8px 0 #1a1a1a",
              width: "100%",
              maxWidth: 400,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              Admin Login
            </h2>

            {isAdmin ? (
              <>
                <p style={{ fontSize: 13, marginBottom: 16 }}>
                  You are logged in as <strong>admin</strong>.
                </p>
                <button
                  onClick={handleAdminLogout}
                  className="neo-btn neo-btn-red"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Log out
                </button>
              </>
            ) : (
              <form onSubmit={handleAdminSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Username
                  </label>
                  <input
                    className="neo-input"
                    value={adminUsername}
                    onChange={(e) => { setAdminUsername(e.target.value); setAdminError(""); }}
                    placeholder="Admin username"
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Password
                  </label>
                  <input
                    className="neo-input"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); setAdminError(""); }}
                    placeholder="Admin password"
                  />
                </div>
                {adminError && (
                  <p style={{ color: "#FF4757", fontSize: 12, fontWeight: 600 }}>
                    {adminError}
                  </p>
                )}
                <button
                  type="submit"
                  className="neo-btn neo-btn-black"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                >
                  Sign in
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
