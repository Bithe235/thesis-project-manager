"use client";
import { useState, useEffect } from "react";
import { X, Plus, Link as LinkIcon, Tag, Palette, User } from "lucide-react";

const LINK_COLORS = [
  "#FFE135", "#FF6B9D", "#4ECDC4", "#95E16A",
  "#FF8C42", "#A855F7", "#FF4757", "#3B82F6",
];

const LINK_CATEGORIES = [
  "Research", "Reference", "Tool", "Documentation",
  "Dataset", "Resource", "Communication", "Other",
];

const SUGGESTED_TAGS = [
  "thesis",
  "proposal",
  "dataset",
  "paper",
  "presentation",
  "code",
  "survey",
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
  initialValues?: {
    title: string;
    url: string;
    purpose: string;
    category: string;
    tags: string[];
    color: string;
    author: string;
  };
  mode?: "add" | "edit";
}

export default function AddLinkModal({ onClose, onAdd, initialValues, mode = "add" }: AddLinkModalProps) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [purpose, setPurpose] = useState(initialValues?.purpose ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "Other");
  const [tagsInput, setTagsInput] = useState(initialValues?.tags?.join(", ") ?? "");
  const [color, setColor] = useState(initialValues?.color ?? LINK_COLORS[0]);
  const [author, setAuthor] = useState(initialValues?.author ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill "Added By" from visitor name (stored by VisitorModal)
  useEffect(() => {
    if (initialValues) return; // don't override existing author when editing
    if (author) return;
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("d72_visitor_name") || "";
    if (!stored) return;
    try {
      // Strip leading emoji + spaces (matches VisitorModal style like "🎓 Name")
      const clean = stored.replace(/^[\p{Emoji}\s]+/u, "").trim();
      setAuthor((prev) => prev || clean);
    } catch {
      // Fallback without emoji stripping if regex unsupported
      const parts = stored.split(" ");
      const fallback = parts.length > 1 ? parts.slice(1).join(" ") : stored;
      setAuthor((prev) => prev || fallback.trim());
    }
  }, [author, initialValues]);

  const addTag = (tag: string) => {
    const existing = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (existing.includes(tag)) return;
    const next = [...existing, tag];
    setTagsInput(next.join(", "));
  };

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
      setError(isEdit ? "Failed to update link. Please try again." : "Failed to add link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div
        className="neo-card animate-bounce-in"
        style={{ width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}
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
            <LinkIcon size={18} /> {isEdit ? "Edit Link" : "Add New Link"}
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
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUGGESTED_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className="neo-btn neo-btn-white"
                  style={{
                    padding: "4px 10px",
                    fontSize: 11,
                    borderRadius: 999,
                  }}
                >
                  #{t}
                </button>
              ))}
            </div>
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
              {loading
                ? (isEdit ? "Saving..." : "Adding...")
                : (
                  <>
                    <Plus size={16} /> {isEdit ? "Save Changes" : "Add Link"}
                  </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
