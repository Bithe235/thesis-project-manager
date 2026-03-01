\"use client\";
import { useState, useEffect, useRef } from \"react\";
import {
  Folder, Upload, Trash2, FolderPlus, ChevronRight,
  Home, RefreshCw, X, CheckSquare, Square, AlertTriangle,
  Search, Info, ExternalLink, Download as DownloadIcon,
} from \"lucide-react\";
import { formatFileSize, getFileIcon } from "@/lib/r2-client";
import UploadMetadataModal, { UploadMetadata } from "./UploadMetadataModal";

interface R2Object {
  key: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
  name: string;
}

interface FileMeta {
  key: string;
  type: string;
  description: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
}

interface FileExplorerProps {
  visitorName?: string;
}

export default function FileExplorer({ visitorName = "" }: FileExplorerProps) {
  const [objects, setObjects] = useState<R2Object[]>([]);
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [metaMap, setMetaMap] = useState<Record<string, FileMeta>>({});

  // Search
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FileMeta[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Upload
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [showMkdir, setShowMkdir] = useState(false);
  const [mkdirName, setMkdirName] = useState("");
  const [mkdirLoading, setMkdirLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [hoveredMeta, setHoveredMeta] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const updateAdmin = () => {
      if (typeof window === "undefined") return;
      setIsAdmin(localStorage.getItem("d72_is_admin") === "1");
    };
    updateAdmin();
    window.addEventListener("d72_admin_change", updateAdmin as EventListener);
    return () => {
      window.removeEventListener("d72_admin_change", updateAdmin as EventListener);
    };
  }, []);

  const fetchObjects = async (p = prefix) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/r2/list?prefix=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setObjects(data.objects || []);
      setSelected(new Set());
      // Also fetch metadata for this prefix
      fetchMeta(p);
    } catch (err: any) {
      setError(err.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async (p = prefix) => {
    const res = await fetch(`/api/r2/metadata?prefix=${encodeURIComponent(p)}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      const map: Record<string, FileMeta> = {};
      for (const m of (data.results || [])) map[m.key] = m;
      setMetaMap(map);
    }
  };

  useEffect(() => { fetchObjects(prefix); }, [prefix]);

  // Debounced global search
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/r2/metadata?search=${encodeURIComponent(search)}`).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const pathSegments = prefix ? prefix.replace(/\/$/, "").split("/") : [];

  const handleFolderClick = (obj: R2Object) => { if (obj.isFolder) setPrefix(obj.key); };

  const toggleSelect = (key: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const handleFilesSelected = (files: FileList) => {
    if (files.length === 0) return;
    setPendingFiles(Array.from(files));
    setShowMetaModal(true);
  };

  const handleUploadConfirm = async (metadata: UploadMetadata) => {
    setShowMetaModal(false);
    setUploading(true);
    const newProgress: Record<string, number> = {};

    for (const file of pendingFiles) {
      const key = prefix + file.name;
      newProgress[file.name] = 0;
      setUploadProgress({ ...newProgress });

      try {
        const res = await fetch("/api/r2/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, contentType: file.type || "application/octet-stream" }),
        });
        const { uploadUrl } = await res.json();
        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            const pct = Math.round((e.loaded / e.total) * 100);
            newProgress[file.name] = pct;
            setUploadProgress({ ...newProgress });
          };
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`${xhr.status}`)));
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.send(file);
        });
        newProgress[file.name] = 100;
        setUploadProgress({ ...newProgress });
      } catch (err: any) {
        setError(`Upload failed for ${file.name}: ${err.message}`);
      }
    }

    // Save metadata for all uploaded files
    const metaEntries = pendingFiles.map((file) => ({
      key: prefix + file.name,
      type: metadata.type,
      description: metadata.description,
      tags: metadata.tags,
      uploadedBy: metadata.uploadedBy,
      uploadedAt: new Date().toISOString(),
    }));
    await fetch("/api/r2/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: metaEntries }),
    }).catch(() => {});

    setUploading(false);
    setPendingFiles([]);
    setTimeout(() => { setUploadProgress({}); fetchObjects(prefix); }, 800);
  };

  const handleDelete = async (key: string) => {
    if (!isAdmin) {
      setDeleteConfirm(null);
      return;
    }
    await fetch("/api/r2/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    // Remove metadata too
    await fetch("/api/r2/metadata", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    }).catch(() => {});
    setDeleteConfirm(null);
    fetchObjects(prefix);
  };

  const handleBulkDelete = async () => {
    if (!isAdmin) {
      setDeletingBulk(false);
      return;
    }
    setDeletingBulk(true);
    const keys = Array.from(selected);
    await fetch("/api/r2/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    });
    for (const key of keys) {
      await fetch("/api/r2/metadata", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      }).catch(() => {});
    }
    setSelected(new Set()); setDeletingBulk(false); fetchObjects(prefix);
  };

  const handleMkdir = async () => {
    if (!mkdirName.trim()) return;
    setMkdirLoading(true);
    const folderPath = prefix + mkdirName.trim().replace(/\//g, "_") + "/";
    await fetch("/api/r2/mkdir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: folderPath }),
    });
    setMkdirName(""); setShowMkdir(false); setMkdirLoading(false);
    fetchObjects(prefix);
  };

  const folders = objects.filter((o) => o.isFolder);
  const files = objects.filter((o) => !o.isFolder);
  const isSearchMode = !!search.trim();

  const TYPE_COLORS: Record<string, string> = {
    "Research Paper": "#FF6B9D", "Dataset": "#4ECDC4", "Thesis Chapter": "#A855F7",
    "Presentation": "#FF8C42", "Code / Script": "#95E16A", "Notes": "#FFE135",
    "Report": "#3B82F6", "Image / Figure": "#F59E0B", "Other": "#aaa",
  };

  const getExtension = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  };

  const canPreviewInline = (name: string) => {
    const ext = getExtension(name);
    return ext === "pdf" || ext === "doc" || ext === "docx";
  };

  const openPresignedUrl = async (key: string): Promise<string> => {
    const res = await fetch(`/api/r2/download-url?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    if (!res.ok || data.error || !data.url) {
      throw new Error(data.error || "Failed to generate file URL");
    }
    return data.url as string;
  };

  const handleView = async (obj: R2Object) => {
    try {
      const url = await openPresignedUrl(obj.key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setError(err.message || "Failed to open file");
    }
  };

  const handleDownload = async (obj: R2Object) => {
    try {
      const url = await openPresignedUrl(obj.key);
      const a = document.createElement("a");
      a.href = url;
      a.download = obj.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message || "Failed to download file");
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => fetchObjects(prefix)} className="neo-btn neo-btn-white" disabled={loading} style={{ fontSize: 13 }}>
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="neo-btn neo-btn-yellow" disabled={uploading} style={{ fontSize: 13 }}>
          <Upload size={13} /> {uploading ? "Uploading..." : "Upload Files"}
        </button>
        <button onClick={() => setShowMkdir(true)} className="neo-btn neo-btn-blue" style={{ fontSize: 13 }}>
          <FolderPlus size={13} /> New Folder
        </button>
        {isAdmin && selected.size > 0 && (
          <button onClick={handleBulkDelete} disabled={deletingBulk} className="neo-btn neo-btn-red" style={{ fontSize: 13 }}>
            <Trash2 size={13} /> {deletingBulk ? "Deleting..." : `Delete (${selected.size})`}
          </button>
        )}
        <input ref={fileInputRef} type="file" multiple style={{ display: "none" }}
          onChange={(e) => e.target.files && handleFilesSelected(e.target.files)} />
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
        <input
          className="neo-input"
          style={{ paddingLeft: 38 }}
          placeholder="🔍 Search files by name, type, description, tags, uploader..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 2,
          }}>
            <X size={14} color="#888" />
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      {!isSearchMode && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, padding: "8px 14px",
          background: "#fff", border: "2px solid #1a1a1a", borderRadius: 8,
          fontSize: 13, fontWeight: 600, marginBottom: 12, flexWrap: "wrap",
        }}>
          <button onClick={() => setPrefix("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 13 }}>
            <Home size={14} /> thesis
          </button>
          {pathSegments.map((seg, i) => {
            const segPath = pathSegments.slice(0, i + 1).join("/") + "/";
            return (
              <span key={segPath} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ChevronRight size={12} color="#aaa" />
                <button onClick={() => setPrefix(segPath)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: i === pathSegments.length - 1 ? 700 : 500, fontSize: 13 }}>
                  {seg}
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Upload progress */}
      {Object.entries(uploadProgress).length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(uploadProgress).map(([name, pct]) => (
            <div key={name} style={{ padding: "8px 12px", background: "#fff", border: "1.5px solid #1a1a1a", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                <span>📤 {name}</span><span>{pct}%</span>
              </div>
              <div className="neo-progress-bar">
                <div className="neo-progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? "#95E16A" : "#FFE135" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#FFF0F0", border: "2px solid #FF4757", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#FF4757", fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={14} /> {error}
          <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}><X size={14} /></button>
        </div>
      )}

      {/* SEARCH RESULTS MODE */}
      {isSearchMode ? (
        <div className="neo-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "#1a1a1a", color: "#fff", fontSize: 12, fontWeight: 700 }}>
            {isSearching ? "🔍 Searching..." : `🔍 ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${search}"`}
          </div>
          {!isSearching && searchResults.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center", fontSize: 14, color: "#888" }}>
              No files found. Try different keywords.
            </div>
          )}
          {searchResults.map((m) => (
            <div key={m.key} className="file-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <span style={{ fontSize: 18 }}>{getFileIcon(m.key)}</span>
                <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{m.key.split("/").pop()}</span>
                <span style={{ fontSize: 10, background: TYPE_COLORS[m.type] || "#ddd", border: "1.5px solid #1a1a1a", borderRadius: 4, padding: "2px 8px", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {m.type}
                </span>
              </div>
              {m.description && (
                <p style={{ fontSize: 12, color: "#555", marginLeft: 26, lineHeight: 1.5 }}>{m.description}</p>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 26 }}>
                {m.tags.map((t) => (
                  <span key={t} style={{ fontSize: 11, background: "#FFE135", border: "1.5px solid #1a1a1a", borderRadius: 100, padding: "1px 8px", fontWeight: 600 }}>{t}</span>
                ))}
                <span style={{ fontSize: 11, color: "#aaa" }}>by {m.uploadedBy}</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>📂 {m.key.includes("/") ? m.key.split("/").slice(0, -1).join("/") || "root" : "root"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* NORMAL FILE LIST MODE */
        <div className="neo-card" style={{ overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto 110px 80px", padding: "10px 14px", background: "#1a1a1a", color: "#fff", fontSize: 12, fontWeight: 700, gap: 8 }}>
            <span /><span>Name</span><span>Type</span><span>Size</span><span>Actions</span>
          </div>

          {loading && <div style={{ padding: "32px", textAlign: "center", fontSize: 14, color: "#888" }}>⏳ Loading...</div>}

          {!loading && objects.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Empty folder</div>
              <div style={{ fontSize: 13, color: "#888" }}>Upload files or create a folder to get started</div>
            </div>
          )}

          {/* Back button */}
          {!loading && prefix && (
            <div className="file-row" style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "32px 1fr auto 110px 80px", gap: 8 }}
              onClick={() => { const parts = prefix.replace(/\/$/, "").split("/"); parts.pop(); setPrefix(parts.length ? parts.join("/") + "/" : ""); }}>
              <span /><span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13 }}>
                <Folder size={16} color="#FFB800" style={{ fill: "#FFE135", stroke: "#1a1a1a", strokeWidth: 1.5 }} />.. (go back)
              </span><span /><span /><span />
            </div>
          )}

          {/* Folders */}
          {!loading && folders.map((obj) => (
            <div key={obj.key} className="file-row" style={{ display: "grid", gridTemplateColumns: "32px 1fr auto 110px 80px", gap: 8, cursor: "pointer", background: selected.has(obj.key) ? "rgba(255,225,53,0.2)" : undefined }}>
              <span onClick={() => toggleSelect(obj.key)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                {selected.has(obj.key) ? <CheckSquare size={16} /> : <Square size={16} color="#aaa" />}
              </span>
              <span onClick={() => handleFolderClick(obj)} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13 }}>
                <Folder size={16} color="#FFB800" style={{ fill: "#FFE135", stroke: "#1a1a1a", strokeWidth: 1.5 }} />
                {obj.name}/
              </span>
              <span />
              <span style={{ color: "#999", fontSize: 12 }}>—</span>
              <span>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteConfirm(obj.key)}
                    className="neo-btn neo-btn-red"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </span>
            </div>
          ))}

          {/* Files */}
          {!loading && files.map((obj) => {
            const meta = metaMap[obj.key];
            return (
              <div key={obj.key} className="file-row" style={{ display: "grid", gridTemplateColumns: "32px 1fr auto 110px 80px", gap: 8, background: selected.has(obj.key) ? "rgba(255,225,53,0.2)" : undefined }}>
                <span onClick={() => toggleSelect(obj.key)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                  {selected.has(obj.key) ? <CheckSquare size={16} /> : <Square size={16} color="#aaa" />}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, overflow: "hidden", position: "relative" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, overflow: "hidden" }}>
                    <span style={{ flexShrink: 0, fontSize: 16 }}>{getFileIcon(obj.name)}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{obj.name}</span>
                    {meta && (
                      <span
                        onMouseEnter={() => setHoveredMeta(obj.key)}
                        onMouseLeave={() => setHoveredMeta(null)}
                        style={{ cursor: "help", flexShrink: 0, color: "#4ECDC4" }}
                      >
                        <Info size={13} />
                      </span>
                    )}
                  </span>
                  {meta?.description && (
                    <span style={{ fontSize: 11, color: "#888", paddingLeft: 22, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {meta.description}
                    </span>
                  )}
                  {/* Tags */}
                  {meta?.tags && meta.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, paddingLeft: 22, flexWrap: "wrap" }}>
                      {meta.tags.slice(0, 3).map((t) => (
                        <span key={t} style={{ fontSize: 10, background: "#FFE135", border: "1px solid #1a1a1a", borderRadius: 100, padding: "0 6px", fontWeight: 600 }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {/* Hover tooltip */}
                  {hoveredMeta === obj.key && meta && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, zIndex: 100,
                      background: "#1a1a1a", color: "#fff",
                      border: "2px solid #1a1a1a", borderRadius: 8,
                      padding: "10px 14px", fontSize: 12, minWidth: 240,
                      boxShadow: "4px 4px 0 #FFE135",
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>📂 {meta.type}</div>
                      {meta.description && <div style={{ color: "#ccc", marginBottom: 6 }}>{meta.description}</div>}
                      <div style={{ color: "#aaa", fontSize: 11 }}>👤 by {meta.uploadedBy} • {new Date(meta.uploadedAt).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>

                <span>
                  {meta && (
                    <span style={{ fontSize: 10, background: TYPE_COLORS[meta.type] || "#f0f0f0", border: "1.5px solid #1a1a1a", borderRadius: 4, padding: "2px 7px", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {meta.type}
                    </span>
                  )}
                </span>

                <span style={{ fontSize: 12, color: "#555" }}>{formatFileSize(obj.size)}</span>

                <span style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  {canPreviewInline(obj.name) && (
                    <button
                      onClick={() => handleView(obj)}
                      className="neo-btn neo-btn-white"
                      style={{ padding: "3px 8px", fontSize: 11 }}
                    >
                      <ExternalLink size={11} /> View
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(obj)}
                    className="neo-btn neo-btn-white"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    <DownloadIcon size={11} /> Download
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteConfirm(obj.key)}
                      className="neo-btn neo-btn-red"
                      style={{ padding: "3px 8px", fontSize: 11 }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Mkdir modal */}
      {showMkdir && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowMkdir(false)}>
          <div className="neo-card animate-bounce-in" style={{ width: "100%", maxWidth: 400, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, marginBottom: 16 }}>📁 New Folder</h3>
            <input className="neo-input" value={mkdirName} onChange={(e) => setMkdirName(e.target.value)} placeholder="Folder name..." autoFocus onKeyDown={(e) => e.key === "Enter" && handleMkdir()} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowMkdir(false)} className="neo-btn neo-btn-white" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={handleMkdir} disabled={mkdirLoading} className="neo-btn neo-btn-blue" style={{ flex: 2, justifyContent: "center" }}>
                <FolderPlus size={14} /> {mkdirLoading ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay animate-fade-in" onClick={() => setDeleteConfirm(null)}>
          <div className="neo-card animate-bounce-in" style={{ width: "100%", maxWidth: 380, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🗑️</div>
              <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, marginBottom: 6 }}>Delete Item?</h3>
              <p style={{ fontSize: 13, color: "#555", fontFamily: "'Space Mono', monospace", wordBreak: "break-all" }}>{deleteConfirm.split("/").pop()}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteConfirm(null)} className="neo-btn neo-btn-white" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="neo-btn neo-btn-red" style={{ flex: 1, justifyContent: "center" }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload metadata modal */}
      {showMetaModal && (
        <UploadMetadataModal
          files={pendingFiles}
          visitorName={visitorName}
          onConfirm={handleUploadConfirm}
          onCancel={() => { setShowMetaModal(false); setPendingFiles([]); }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
