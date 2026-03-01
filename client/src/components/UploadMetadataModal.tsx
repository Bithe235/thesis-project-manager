"use client";
import { useState } from "react";
import { Upload, X, Tag, FileText, User } from "lucide-react";

const FILE_TYPES = [
  "Research Paper", "Dataset", "Thesis Chapter", "Presentation",
  "Code / Script", "Notes", "Report", "Image / Figure", "Other",
];

const TYPE_EMOJIS: Record<string, string> = {
  "Research Paper": "📄",
  "Dataset": "📊",
  "Thesis Chapter": "📖",
  "Presentation": "📊",
  "Code / Script": "💻",
  "Notes": "📝",
  "Report": "📋",
  "Image / Figure": "🖼️",
  "Other": "📁",
};

export interface UploadMetadata {
  type: string;
  description: string;
  tags: string[];
  uploadedBy: string;
}

interface UploadMetadataModalProps {
  files: File[];
  onConfirm: (metadata: UploadMetadata) => void;
  onCancel: () => void;
  visitorName?: string;
}

export default function UploadMetadataModal({
  files,
  onConfirm,
  onCancel,
  visitorName = "",
}: UploadMetadataModalProps) {
  const cleanName = visitorName.replace(/^[\p{Emoji}\s]+/u, "").trim();
  const [type, setType] = useState("Other");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploadedBy, setUploadedBy] = useState(cleanName);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    onConfirm({ type, description, tags, uploadedBy });
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onCancel}>
      <div
        className="neo-card animate-bounce-in"
        style={{ width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "2.5px solid #1a1a1a",
          background: "#4ECDC4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Upload size={16} /> Upload Metadata
          </div>
          <button onClick={onCancel} style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>
            <X size={15} />
          </button>
        </div>

        {/* Files list */}
        <div style={{
          margin: "16px 20px 0",
          background: "#f8f8f8",
          border: "1.5px solid #ddd",
          borderRadius: 8,
          overflow: "hidden",
        }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase" }}>
            {files.length} file{files.length !== 1 ? "s" : ""} to upload
          </div>
          {files.map((f) => (
            <div key={f.name} style={{
              padding: "6px 12px",
              borderBottom: "1px solid #f0f0f0",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>📎</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>
                {(f.size / 1024).toFixed(0)} KB
              </span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* File type */}
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              📂 File Type *
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FILE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    padding: "5px 12px",
                    border: "2px solid #1a1a1a",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: type === t ? "#1a1a1a" : "#fff",
                    color: type === t ? "#fff" : "#1a1a1a",
                    boxShadow: type === t ? "2px 2px 0 #4ECDC4" : "1px 1px 0 #1a1a1a",
                    display: "flex", alignItems: "center", gap: 4,
                    transition: "all 0.1s",
                  }}
                >
                  <span>{TYPE_EMOJIS[t]}</span> {t}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              <FileText size={12} style={{ display: "inline", marginRight: 4 }} />
              Description
            </label>
            <textarea
              className="neo-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this file? What does it contain?"
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              <Tag size={12} style={{ display: "inline", marginRight: 4 }} />
              Tags (comma separated)
            </label>
            <input
              className="neo-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. CNN, PyTorch, experiment-1"
            />
          </div>

          {/* Uploaded by */}
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              <User size={12} style={{ display: "inline", marginRight: 4 }} />
              Uploaded by
            </label>
            <input
              className="neo-input"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onCancel} className="neo-btn neo-btn-white" style={{ flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
            <button type="submit" className="neo-btn neo-btn-black" style={{ flex: 2, justifyContent: "center" }}>
              <Upload size={14} /> Upload {files.length} file{files.length !== 1 ? "s" : ""}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
