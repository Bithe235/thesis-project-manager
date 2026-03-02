"use client";
import { useState } from "react";
import { Copy, ExternalLink, Trash2, CheckCheck, Tag, Clock, Pencil } from "lucide-react";

interface Link {
  id: string;
  title: string;
  url: string;
  purpose: string;
  category: string;
  tags: string[];
  color: string;
  createdAt: string;
  author?: string;
}

interface LinkCardProps {
  link: Link;
  onDelete?: (id: string) => void;
  onEdit?: (link: Link) => void;
  isAdmin?: boolean;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Research: "🔬", Reference: "📚", Tool: "🛠️", Documentation: "📖",
  Dataset: "📊", Resource: "📦", Communication: "💬", Other: "🔗",
};

export default function LinkCard({ link, onDelete, onEdit, isAdmin = false }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyAll, setCopyAll] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = async () => {
    const text = `🔗 ${link.title}\n📋 Purpose: ${link.purpose}\n🌐 URL: ${link.url}\n📂 Category: ${link.category}${link.tags.length > 0 ? `\n🏷 Tags: ${link.tags.join(", ")}` : ""}`;
    await navigator.clipboard.writeText(text);
    setCopyAll(true);
    setTimeout(() => setCopyAll(false), 2000);
  };

  const datetime = new Date(link.createdAt);
  const timeAgo = getTimeAgo(datetime);

  return (
    <div
      className="neo-card"
      style={{
        padding: 0,
        overflow: "hidden",
        borderLeft: `5px solid ${link.color}`,
      }}
    >
      {/* Color header strip */}
      <div style={{
        background: link.color,
        padding: "10px 16px",
        borderBottom: "2px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{CATEGORY_EMOJIS[link.category] || "🔗"}</span>
          <span style={{
            background: "#1a1a1a",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 4,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {link.category}
          </span>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 6 }}>
            {onEdit && (
              <button
                onClick={() => onEdit(link)}
                style={{
                  border: "1.5px solid #1a1a1a",
                  borderRadius: 6,
                  padding: "3px 6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "1px 1px 0 #1a1a1a",
                  background: "rgba(255,255,255,0.7)",
                }}
                title="Edit link"
              >
                <Pencil size={13} color="#1a1a1a" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(link.id)}
                style={{
                  border: "1.5px solid #1a1a1a",
                  borderRadius: 6,
                  padding: "3px 6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "1px 1px 0 #1a1a1a",
                  background: "rgba(255,255,255,0.7)",
                }}
                title="Delete link"
              >
                <Trash2 size={13} color="#1a1a1a" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px" }}>
        <h3 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 16,
          fontWeight: 700,
          color: "#1a1a1a",
          marginBottom: 6,
          lineHeight: 1.3,
        }}>
          {link.title}
        </h3>

        <p style={{
          fontSize: 13,
          color: "#444",
          lineHeight: 1.5,
          marginBottom: 12,
        }}>
          {link.purpose}
        </p>

        {/* URL preview */}
        <div style={{
          background: "#f5f5f5",
          border: "1.5px solid #ddd",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 12,
          color: "#555",
          fontFamily: "'Space Mono', monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 12,
        }}>
          {link.url}
        </div>

        {/* Tags */}
        {link.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {link.tags.map((tag) => (
              <span key={tag} className="neo-tag" style={{ fontSize: 11 }}>
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer meta */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          color: "#888",
          marginBottom: 14,
        }}>
          <Clock size={11} />
          <span>{timeAgo}</span>
          {link.author && (
            <>
              <span>•</span>
              <span>by {link.author}</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Visit */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn neo-btn-black"
            style={{ flex: 1, justifyContent: "center", fontSize: 13 }}
          >
            <ExternalLink size={14} />
            Visit
          </a>

          {/* Copy URL */}
          <button
            onClick={handleCopyUrl}
            className={`neo-btn ${copied ? "neo-btn-green" : "neo-btn-blue"}`}
            style={{ flex: 1, justifyContent: "center", fontSize: 13 }}
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy URL"}
          </button>

          {/* Copy All Info */}
          <button
            onClick={handleCopyAll}
            className={`neo-btn ${copyAll ? "neo-btn-green" : "neo-btn-yellow"}`}
            style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
          >
            {copyAll ? <CheckCheck size={13} /> : <Copy size={13} />}
            {copyAll ? "Copied with Details!" : "📋 Copy Link + Info"}
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
