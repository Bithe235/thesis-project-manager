"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import LinkCard from "@/components/LinkCard";
import AddLinkModal from "@/components/AddLinkModal";
import VisitorModal from "@/components/VisitorModal";
import OnlineUsers from "@/components/OnlineUsers";
import { Plus, Search, Grid, List, Zap } from "lucide-react";

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

const CATEGORIES = [
  "All", "Research", "Reference", "Tool", "Documentation",
  "Dataset", "Resource", "Communication", "Other",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  All: "🌐", Research: "🔬", Reference: "📚", Tool: "🛠️",
  Documentation: "📖", Dataset: "📊", Resource: "📦",
  Communication: "💬", Other: "🔗",
};

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState("");
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  useEffect(() => {
    fetchLinks();
    // Check for cached visitor name
    const cached = localStorage.getItem("d72_visitor_name");
    if (cached) setVisitorName(cached);
    else setShowVisitorModal(true);
  }, []);

  // Sync admin flag from navbar/localStorage
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

  const handleNameSet = (name: string) => {
    setVisitorName(name);
    setShowVisitorModal(false);
  };

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data.links || []);
    } catch {
      showToast("❌ Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (newLink: Omit<Link, "id" | "createdAt">) => {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    setLinks((prev) => [data.link, ...prev]);
    showToast("✅ Link added!");
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast("🗑️ Link deleted");
  };

  const handleUpdateLink = async (id: string, updated: Omit<Link, "id" | "createdAt">) => {
    const res = await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updated }),
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    setLinks((prev) => prev.map((l) => (l.id === id ? data.link : l)));
    showToast("✅ Link updated");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const filtered = links.filter((l) => {
    const matchCat = activeCategory === "All" || l.category === activeCategory;
    const q = search.toLowerCase();
    const matchQ = !q || l.title.toLowerCase().includes(q) ||
      l.purpose.toLowerCase().includes(q) ||
      l.url.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === "All" ? links.length : links.filter((l) => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ minHeight: "100vh" }}>
      {showVisitorModal && <VisitorModal onNameSet={handleNameSet} />}
      <Navbar />

      {/* Hero Banner */}
      <div style={{
        borderBottom: "2.5px solid #1a1a1a",
        background: "#1a1a1a",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative grid accent */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,225,53,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,225,53,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
            {/* Online users bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <OnlineUsers currentPage="/" />
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  background: "#FFE135",
                  border: "2.5px solid #FFE135",
                  borderRadius: 8,
                  padding: "4px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  🎓 D-72 THESIS GROUP
                </div>
                <div style={{ color: "#FFE135", fontSize: 12, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>
                  Batch-7 • CSE
                </div>
              </div>
              <h1 style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: 12,
                letterSpacing: "-1px",
              }}>
                🔗 Research <span style={{ color: "#FFE135" }}>Link Hub</span>
              </h1>
              <p style={{ color: "#aaa", fontSize: 16, maxWidth: 520, lineHeight: 1.6 }}>
                Central hub for thesis resources, research links, and tools for{" "}
                <strong>Dhaka International University</strong> —{" "}
                <strong>Dept. of CSE, Batch D-72</strong>. Add, search, and share materials so every student stays in sync.
              </p>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { label: "Total Links", value: links.length, color: "#FFE135", emoji: "🔗" },
                { label: "Categories", value: CATEGORIES.length - 1, color: "#4ECDC4", emoji: "📂" },
                { label: "Active", value: links.length > 0 ? "Yes" : "Empty", color: "#95E16A", emoji: "⚡" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "#fff",
                  border: "2.5px solid #1a1a1a",
                  borderRadius: 10,
                  padding: "10px 16px",
                  boxShadow: "3px 3px 0 #FFE135",
                  textAlign: "center",
                  minWidth: 90,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>{stat.emoji}</div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 20, fontWeight: 700, color: "#1a1a1a"
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        {/* Controls row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          flexWrap: "wrap", marginBottom: 24,
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <input
              className="neo-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search links, purposes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* View mode toggle */}
          <div style={{ display: "flex", border: "2px solid #1a1a1a", borderRadius: 8, overflow: "hidden" }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "8px 12px", border: "none", cursor: "pointer",
                background: viewMode === "grid" ? "#1a1a1a" : "#fff",
                color: viewMode === "grid" ? "#fff" : "#1a1a1a",
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 13, fontWeight: 600,
              }}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "8px 12px", border: "none", cursor: "pointer",
                background: viewMode === "list" ? "#1a1a1a" : "#fff",
                color: viewMode === "list" ? "#fff" : "#1a1a1a",
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 13, fontWeight: 600,
                borderLeft: "2px solid #1a1a1a",
              }}
            >
              <List size={14} />
            </button>
          </div>

          {/* Add link */}
          <button
            onClick={() => setShowModal(true)}
            className="neo-btn neo-btn-yellow"
            style={{ fontSize: 13 }}
          >
            <Plus size={15} /> Add Link
          </button>
        </div>

        {/* Category filter chips */}
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28,
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px",
                border: "2px solid #1a1a1a",
                borderRadius: 100,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "all 0.12s",
                background: activeCategory === cat ? "#1a1a1a" : "#fff",
                color: activeCategory === cat ? "#fff" : "#1a1a1a",
                boxShadow: activeCategory === cat ? "2px 2px 0 #FFE135" : "1px 1px 0 #1a1a1a",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span>{CATEGORY_EMOJIS[cat]}</span>
              {cat}
              {categoryCounts[cat] > 0 && (
                <span style={{
                  background: activeCategory === cat ? "#FFE135" : "#f0f0f0",
                  color: "#1a1a1a",
                  borderRadius: 100,
                  fontSize: 11,
                  padding: "1px 7px",
                  fontWeight: 700,
                }}>
                  {categoryCounts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={14} color="#FFB800" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
            Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? "link" : "links"}
            {search && ` for "${search}"`}
            {activeCategory !== "All" && ` in ${activeCategory}`}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: "wiggle 1s ease infinite" }}>⚙️</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 16 }}>Loading links...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            border: "2.5px solid #1a1a1a",
            borderRadius: 12,
            boxShadow: "4px 4px 0 #1a1a1a",
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {links.length === 0 ? "🔗" : "🔍"}
            </div>
            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, marginBottom: 8 }}>
              {links.length === 0 ? "No links yet!" : "No results found"}
            </h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
              {links.length === 0
                ? "Add your first research link to get started."
                : "Try a different search term or category."}
            </p>
            {links.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="neo-btn neo-btn-yellow"
              >
                <Plus size={16} /> Add First Link
              </button>
            )}
          </div>
        )}

        {/* Link grid/list */}
        {!loading && filtered.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: viewMode === "grid"
              ? "repeat(auto-fill, minmax(340px, 1fr))"
              : "1fr",
            gap: 20,
          }}>
            {filtered.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={handleDeleteLink}
                onEdit={isAdmin ? (l) => { setEditingLink(l); setShowModal(true); } : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Link Modal */}
      {showModal && (
        <AddLinkModal
          mode={editingLink ? "edit" : "add"}
          initialValues={editingLink ? {
            title: editingLink.title,
            url: editingLink.url,
            purpose: editingLink.purpose,
            category: editingLink.category,
            tags: editingLink.tags,
            color: editingLink.color,
            author: editingLink.author || "",
          } : undefined}
          onClose={() => { setShowModal(false); setEditingLink(null); }}
          onAdd={(payload) => editingLink
            ? handleUpdateLink(editingLink.id, payload)
            : handleAddLink(payload)}
        />
      )}

      {/* Toast */}
      {toast && <div className="copy-toast">{toast}</div>}
    </div>
  );
}
