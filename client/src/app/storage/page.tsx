"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import FileExplorer from "@/components/FileExplorer";
import VisitorModal from "@/components/VisitorModal";
import OnlineUsers from "@/components/OnlineUsers";
import { Database, HardDrive, Cloud, Zap } from "lucide-react";

export default function StoragePage() {
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const searchParams = useSearchParams();
  const initialPrefix = searchParams.get("prefix") || "";

  useEffect(() => {
    const cached = localStorage.getItem("d72_visitor_name");
    if (cached) setVisitorName(cached);
    else setShowVisitorModal(true);
  }, []);

  const handleNameSet = (name: string) => {
    setVisitorName(name);
    setShowVisitorModal(false);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {showVisitorModal && <VisitorModal onNameSet={handleNameSet} />}
      <Navbar />

      {/* Hero */}
      <div style={{
        borderBottom: "2.5px solid #1a1a1a",
        background: "#1a1a1a",
        padding: "36px 20px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(78,205,196,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(78,205,196,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          {/* Online users */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <OnlineUsers currentPage="/storage" />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  background: "#4ECDC4",
                  border: "2.5px solid #4ECDC4",
                  borderRadius: 8,
                  padding: "4px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  ☁️ CLOUDFLARE R2
                </div>
                <div style={{ color: "#4ECDC4", fontSize: 12, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>
                  thesis bucket
                </div>
              </div>
              <h1 style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 10,
                letterSpacing: "-0.5px",
              }}>
                📁 File <span style={{ color: "#4ECDC4" }}>Storage</span>
              </h1>
              <p style={{ color: "#aaa", fontSize: 15, maxWidth: 520, lineHeight: 1.6 }}>
                Secure storage for{" "}
                <strong>Dhaka International University — CSE, Batch D-72</strong>{" "}
                thesis chapters, datasets, and important documents. Organize folders, add rich metadata, and keep the whole batch in one place.
                {visitorName && (
                  <span style={{ color: "#4ECDC4", fontWeight: 600 }}> Welcome, {visitorName}!</span>
                )}
              </p>
            </div>

            {/* Feature pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { icon: "⬆️", label: "Upload + Tag Files" },
                { icon: "🔍", label: "Search by Metadata" },
                { icon: "📁", label: "Create Folders" },
                { icon: "🗑️", label: "Bulk Delete" },
              ].map((f) => (
                <div key={f.label} style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>{f.icon}</span>{f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div style={{
        background: "#4ECDC4",
        borderBottom: "2.5px solid #1a1a1a",
        padding: "10px 20px",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 20,
          fontSize: 13, fontWeight: 600, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Cloud size={14} /><span>Bucket: <strong>thesis</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <HardDrive size={14} /><span>Provider: Cloudflare R2</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={14} /><span>Zero egress fees</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Database size={14} /><span>Metadata indexed & searchable</span>
          </div>
        </div>
      </div>

      {/* File Explorer */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        {/* Tips banner */}
        <div style={{
          background: "#fff",
          border: "2.5px solid #1a1a1a",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 24,
          boxShadow: "4px 4px 0 #4ECDC4",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Quick Tips</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              When uploading, you'll be asked to tag files with a <strong>type</strong> (Dataset, Research Paper, etc.), description, and tags — so the whole team can search and find them easily.
              Use the search bar to find files across all folders by name, type, description, tags, or uploader.
            </div>
          </div>
        </div>

        <FileExplorer visitorName={visitorName || ""} initialPrefix={initialPrefix} />
      </div>
    </div>
  );
}
