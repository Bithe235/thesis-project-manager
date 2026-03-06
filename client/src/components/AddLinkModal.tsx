"use client";
import { useState, useEffect } from "react";
import { X, Plus, Link as LinkIcon, Tag, Palette, User, Folder, Cloud, ChevronRight } from "lucide-react";

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

  type TargetKind = "web" | "storageFile" | "storageFolder";

  const getInitialTargetKind = (): TargetKind => {
    const u = (initialValues?.url ?? "").trim();
    if (u.startsWith("r2://")) return "storageFile";
    if (u.startsWith("r2folder://")) return "storageFolder";
    return "web";
  };

  const [targetKind, setTargetKind] = useState<TargetKind>(getInitialTargetKind());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [storagePrefix, setStoragePrefix] = useState<string>(() => {
    const u = (initialValues?.url ?? "").trim();
    if (u.startsWith("r2folder://")) return u.slice("r2folder://".length);
    if (u.startsWith("r2://")) {
      const key = u.slice("r2://".length);
      const parts = key.split("/");
      parts.pop();
      const p = parts.length ? `${parts.join("/")}/` : "";
      return p;
    }
    return "";
  });
  const [storageObjects, setStorageObjects] = useState<Array<{ key: string; name: string; isFolder: boolean; size: number }>>([]);
  const [storageLoading, setStorageLoading] = useState(false);

  const selectedStorageLabel = (() => {
    const u = url.trim();
    if (u.startsWith("r2://")) return u.slice("r2://".length);
    if (u.startsWith("r2folder://")) {
      const p = u.slice("r2folder://".length);
      return p ? `${p}` : "(root)";
    }
    return "";
  })();

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
    if (!title.trim() || !purpose.trim()) {
      setError("Title and purpose are required.");
      return;
    }
    const u = url.trim();
    if (targetKind === "web") {
      if (!/^https?:\/\//i.test(u)) {
        setError("Please enter a valid http(s) URL.");
        return;
      }
    } else if (targetKind === "storageFile") {
      if (!u.startsWith("r2://")) {
        setError("Please choose a storage file.");
        return;
      }
    } else if (targetKind === "storageFolder") {
      if (!u.startsWith("r2folder://")) {
        setError("Please choose a storage folder.");
        return;
      }
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
              🔗 Target *
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {[
                { id: "web" as const, label: "Web URL", icon: "🌐" },
                { id: "storageFile" as const, label: "Storage File", icon: "📄" },
                { id: "storageFolder" as const, label: "Storage Folder", icon: "📁" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTargetKind(t.id);
                    setError("");
                    setPickerOpen(false);
                    if (t.id === "web" && (url.startsWith("r2://") || url.startsWith("r2folder://"))) {
                      setUrl("");
                    }
                  }}
                  style={{
                    padding: "6px 12px",
                    border: "2px solid #1a1a1a",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 12,
                    background: targetKind === t.id ? "#1a1a1a" : "#fff",
                    color: targetKind === t.id ? "#fff" : "#1a1a1a",
                    boxShadow: targetKind === t.id ? "2px 2px 0 #FFE135" : "1px 1px 0 #1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.1s",
                  }}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            {targetKind === "web" ? (
              <>
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
              </>
            ) : (
              <>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  <Cloud size={12} style={{ display: "inline", marginRight: 4 }} />
                  {targetKind === "storageFile" ? "Storage File" : "Storage Folder"} *
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="neo-input"
                    value={selectedStorageLabel}
                    readOnly
                    placeholder={targetKind === "storageFile" ? "Choose a file from storage..." : "Choose a folder from storage..."}
                  />
                  <button
                    type="button"
                    className="neo-btn neo-btn-white"
                    onClick={async () => {
                      setPickerOpen((p) => !p);
                      setError("");
                      if (!pickerOpen) {
                        setStorageLoading(true);
                        try {
                          const res = await fetch(`/api/r2/list?prefix=${encodeURIComponent(storagePrefix)}`);
                          const data = await res.json();
                          setStorageObjects(data.objects || []);
                        } finally {
                          setStorageLoading(false);
                        }
                      }
                    }}
                    style={{ padding: "10px 12px" }}
                  >
                    Choose
                  </button>
                </div>

                {pickerOpen && (
                  <div style={{
                    marginTop: 10,
                    background: "#fff",
                    border: "2px solid #1a1a1a",
                    borderRadius: 10,
                    boxShadow: "3px 3px 0 #1a1a1a",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      padding: "10px 12px",
                      borderBottom: "2px solid #1a1a1a",
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        <Folder size={14} /> thesis{storagePrefix ? ` / ${storagePrefix.replace(/\/$/, "")}` : ""}
                      </div>
                      {targetKind === "storageFolder" && (
                        <button
                          type="button"
                          className="neo-btn neo-btn-yellow"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          onClick={() => {
                            const p = storagePrefix || "";
                            const normalized = p && !p.endsWith("/") ? `${p}/` : p;
                            setUrl(`r2folder://${normalized}`);
                            setPickerOpen(false);
                          }}
                        >
                          Select this folder
                        </button>
                      )}
                    </div>

                    <div style={{ padding: 10, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="neo-btn neo-btn-white"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={async () => {
                          const parts = storagePrefix.replace(/\/$/, "").split("/").filter(Boolean);
                          parts.pop();
                          const nextPrefix = parts.length ? `${parts.join("/")}/` : "";
                          setStoragePrefix(nextPrefix);
                          setStorageLoading(true);
                          try {
                            const res = await fetch(`/api/r2/list?prefix=${encodeURIComponent(nextPrefix)}`);
                            const data = await res.json();
                            setStorageObjects(data.objects || []);
                          } finally {
                            setStorageLoading(false);
                          }
                        }}
                        disabled={!storagePrefix}
                      >
                        <ChevronRight size={12} style={{ transform: "rotate(180deg)" }} /> Up
                      </button>
                      <div style={{ fontSize: 11, color: "#666" }}>
                        Tip: click folders to navigate.
                      </div>
                    </div>

                    {storageLoading ? (
                      <div style={{ padding: 14, fontSize: 13, color: "#666" }}>Loading...</div>
                    ) : (
                      <div style={{ maxHeight: 260, overflowY: "auto" }}>
                        {storageObjects.map((o) => (
                          <div
                            key={o.key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              borderTop: "1px solid rgba(26,26,26,0.12)",
                              cursor: "pointer",
                            }}
                            onClick={async () => {
                              if (o.isFolder) {
                                if (targetKind === "storageFolder") {
                                  setUrl(`r2folder://${o.key}`);
                                  setPickerOpen(false);
                                  if (!title.trim()) setTitle(o.name);
                                  return;
                                }
                                setStoragePrefix(o.key);
                                setStorageLoading(true);
                                try {
                                  const res = await fetch(`/api/r2/list?prefix=${encodeURIComponent(o.key)}`);
                                  const data = await res.json();
                                  setStorageObjects(data.objects || []);
                                } finally {
                                  setStorageLoading(false);
                                }
                                return;
                              }

                              if (targetKind === "storageFile") {
                                setUrl(`r2://${o.key}`);
                                setPickerOpen(false);
                                if (!title.trim()) setTitle(o.name);
                              }
                            }}
                          >
                            <span style={{ fontSize: 16 }}>
                              {o.isFolder ? "📁" : "📄"}
                            </span>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                              <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {o.isFolder ? `${o.name}/` : o.name}
                              </div>
                              <div style={{ fontSize: 11, color: "#888" }}>
                                {o.key}
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: "#999" }}>
                              {!o.isFolder ? `${Math.round((o.size || 0) / 1024)} KB` : ""}
                            </span>
                          </div>
                        ))}
                        {storageObjects.length === 0 && (
                          <div style={{ padding: 14, fontSize: 13, color: "#666" }}>
                            Empty folder.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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
