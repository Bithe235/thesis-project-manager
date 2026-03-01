import { NextRequest, NextResponse } from "next/server";
import { sql, initSchema } from "@/lib/db";

const LINK_COLORS = [
    "#FFE135", "#FF6B9D", "#4ECDC4", "#95E16A",
    "#FF8C42", "#A855F7", "#FF4757", "#3B82F6",
];
const LINK_CATEGORIES = [
    "Research", "Reference", "Tool", "Documentation",
    "Dataset", "Resource", "Communication", "Other",
];

export async function GET() {
    try {
        await initSchema();
        const links = await sql`SELECT * FROM links ORDER BY created_at DESC`;
        return NextResponse.json({ links, colors: LINK_COLORS, categories: LINK_CATEGORIES });
    } catch (err: any) {
        console.error("Links GET error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await initSchema();
        const { title, url, purpose, category, tags, color, author } = await req.json();
        if (!title || !url || !purpose) {
            return NextResponse.json({ error: "title, url, and purpose are required" }, { status: 400 });
        }
        const [link] = await sql`
      INSERT INTO links (title, url, purpose, category, tags, color, author)
      VALUES (
        ${title},
        ${url},
        ${purpose},
        ${category || "Other"},
        ${tags || []},
        ${color || LINK_COLORS[0]},
        ${author || "Anonymous"}
      )
      RETURNING *
    `;
        return NextResponse.json({ link }, { status: 201 });
    } catch (err: any) {
        console.error("Links POST error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await initSchema();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
        const result = await sql`DELETE FROM links WHERE id = ${id} RETURNING id`;
        if (result.length === 0) return NextResponse.json({ error: "Link not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Links DELETE error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await initSchema();
        const { id, title, url, purpose, category, tags, color, author } = await req.json();
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
        const [link] = await sql`
      UPDATE links SET
        title     = COALESCE(${title}, title),
        url       = COALESCE(${url}, url),
        purpose   = COALESCE(${purpose}, purpose),
        category  = COALESCE(${category}, category),
        tags      = COALESCE(${tags}, tags),
        color     = COALESCE(${color}, color),
        author    = COALESCE(${author}, author)
      WHERE id = ${id}
      RETURNING *
    `;
        if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
        return NextResponse.json({ link });
    } catch (err: any) {
        console.error("Links PATCH error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
