"use client";
import { useState } from "react";
import { X, Plus, Link as LinkIcon, Tag, Palette, User } from "lucide-react";

const LINK_COLORS = [
  "#FFE135", "#FF6B9D", "#4ECDC4", "#95E16A",
  "#FF8C42", "#A855F7", "#FF4757", "#3B82F6",
];

const LINK_CATEGORIES = [
  "Research", "Reference", "Tool", "Documentation",
  "Dataset", "Resource", "Communication", "Other",
];

interface AddLinkModalProps {
  onClose: () => void;
  onAdd: (link: {
    title: string;
    url: string;
    purpose: string;
    category: string;
    tags: string[];
    color: string;
    author: string;
  }) => void;
}

export default function AddLinkModal({ onClose, onAdd }: AddLinkModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("Other");
  const [tagsInput, setTagsInput] = useState("");
  const [color, setColor] = useState(LINK_COLORS[0]);
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !purpose.trim()) {
      setError("Title, URL, and purpose are required.");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setLoading(true);
    try {
      await onAdd({ title, url, purpose, category, tags, color, author });
      onClose();
    } catch {
      setError("Failed to add link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="neo-card animate-bounce-in"
        style={{ width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "2.5px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: color,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 17, fontFamily: "'Space Mono', monospace" }}>
            <LinkIcon size={18} /> Add New Link
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#1a1a1a", color: "#fff",
              border: "none", borderRadius: 6,
              padding: "5px 8px", cursor: "pointer",
              display: "flex", alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{
              background: "#FF4757", color: "#fff",
              padding: "10px 14px", borderRadius: 8,
              border: "2px solid #1a1a1a",
              fontSize: 13, fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              🏷️ Title *
            </label>
            <input
              className="neo-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Research Paper on CNNs"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              🌐 URL *
            </label>
            <input
              className="neo-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              type="url"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              📋 Purpose / Description *
            </label>
            <textarea
              className="neo-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What is this link for? Why is it useful?"
              rows={3}
              style={{ resize: "vertical" }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                📂 Category
              </label>
              <select
                className="neo-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {LINK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                <User size={12} style={{ display: "inline", marginRight: 4 }} />
                Added By
              </label>
              <input
                className="neo-input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              <Tag size={12} style={{ display: "inline", marginRight: 4 }} />
              Tags (comma separated)
            </label>
            <input
              className="neo-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. ML, Python, deep-learning"
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
              <Palette size={12} style={{ display: "inline", marginRight: 4 }} />
              Card Color
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {LINK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 34, height: 34,
                    background: c,
                    border: color === c ? "3px solid #1a1a1a" : "2px solid #1a1a1a",
                    borderRadius: 8,
                    cursor: "pointer",
                    boxShadow: color === c ? "3px 3px 0 #1a1a1a" : "1px 1px 0 #1a1a1a",
                    transform: color === c ? "translate(-1px,-1px)" : "none",
                    transition: "all 0.1s",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              className="neo-btn neo-btn-white"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="neo-btn neo-btn-black"
              style={{ flex: 2, justifyContent: "center" }}
            >
              {loading ? "Adding..." : (
                <><Plus size={16} /> Add Link</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
