// Client-side helpers only (no AWS SDK - safe for browser)

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "—";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function getFileIcon(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    const icons: Record<string, string> = {
        pdf: "📄", doc: "📝", docx: "📝", txt: "📃",
        jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🎞️", svg: "🎨", webp: "🖼️",
        mp4: "🎬", mov: "🎬", avi: "🎬", mkv: "🎬",
        mp3: "🎵", wav: "🎵", flac: "🎵",
        zip: "🗜️", rar: "🗜️", "7z": "🗜️",
        js: "⚡", ts: "⚡", jsx: "⚛️", tsx: "⚛️",
        py: "🐍", json: "📋", html: "🌐", css: "🎨",
        xls: "📊", xlsx: "📊", csv: "📊",
        ppt: "📊", pptx: "📊",
    };
    return icons[ext] || "📁";
}
