import { NextRequest, NextResponse } from "next/server";
import { sql, initSchema } from "@/lib/db";

export const FILE_TYPES = [
    "Research Paper", "Dataset", "Thesis Chapter", "Presentation",
    "Code / Script", "Notes", "Report", "Image / Figure", "Other",
];

// GET — fetch metadata; ?key= single file, ?search= full-text search, ?prefix= folder
export async function GET(req: NextRequest) {
    try {
        await initSchema();
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");
        const prefix = searchParams.get("prefix") || "";
        const search = searchParams.get("search") || "";

        if (key) {
            const [meta] = await sql`SELECT * FROM file_metadata WHERE key = ${key}`;
            return NextResponse.json({ meta: meta || null });
        }

        if (search) {
            // Full-text search across type, description, tags (array→text), key, uploaded_by
            const q = `%${search.toLowerCase()}%`;
            const results = await sql`
        SELECT * FROM file_metadata
        WHERE
          LOWER(key) LIKE ${q} OR
          LOWER(type) LIKE ${q} OR
          LOWER(description) LIKE ${q} OR
          LOWER(uploaded_by) LIKE ${q} OR
          EXISTS (
            SELECT 1 FROM unnest(tags) t WHERE LOWER(t) LIKE ${q}
          )
        ORDER BY uploaded_at DESC
      `;
            return NextResponse.json({ results, total: results.length });
        }

        // List by prefix
        const results = prefix
            ? await sql`SELECT * FROM file_metadata WHERE key LIKE ${prefix + "%"} ORDER BY uploaded_at DESC`
            : await sql`SELECT * FROM file_metadata ORDER BY uploaded_at DESC`;

        return NextResponse.json({ results, total: results.length });
    } catch (err: any) {
        console.error("File metadata GET error:", err);
        return NextResponse.json({ results: [], total: 0 });
    }
}

// POST — save metadata for one or more files
export async function POST(req: NextRequest) {
    try {
        await initSchema();
        const { entries } = await req.json();
        if (!entries || !Array.isArray(entries)) {
            return NextResponse.json({ error: "entries array required" }, { status: 400 });
        }

        for (const entry of entries) {
            await sql`
        INSERT INTO file_metadata (key, type, description, tags, uploaded_by, uploaded_at)
        VALUES (
          ${entry.key},
          ${entry.type || "Other"},
          ${entry.description || ""},
          ${entry.tags || []},
          ${entry.uploadedBy || entry.uploaded_by || "Anonymous"},
          NOW()
        )
        ON CONFLICT (key) DO UPDATE SET
          type        = EXCLUDED.type,
          description = EXCLUDED.description,
          tags        = EXCLUDED.tags,
          uploaded_by = EXCLUDED.uploaded_by,
          uploaded_at = NOW()
      `;
        }

        return NextResponse.json({ ok: true, saved: entries.length });
    } catch (err: any) {
        console.error("File metadata POST error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE — remove metadata for a key
export async function DELETE(req: NextRequest) {
    try {
        await initSchema();
        const { key } = await req.json();
        if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
        await sql`DELETE FROM file_metadata WHERE key = ${key}`;
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("File metadata DELETE error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
