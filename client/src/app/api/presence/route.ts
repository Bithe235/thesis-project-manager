import { NextRequest, NextResponse } from "next/server";
import { sql, initSchema } from "@/lib/db";

const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// GET — return currently active visitors
export async function GET() {
    try {
        await initSchema();
        const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
        const visitors = await sql`
      SELECT session_id, name, last_seen, page
      FROM visitors
      WHERE last_seen > ${cutoff}
      ORDER BY last_seen DESC
    `;
        return NextResponse.json({ visitors, count: visitors.length });
    } catch (err: any) {
        console.error("Presence GET error:", err);
        return NextResponse.json({ visitors: [], count: 0 });
    }
}

// POST — upsert visitor heartbeat
export async function POST(req: NextRequest) {
    try {
        await initSchema();
        const { name, sessionId, page } = await req.json();
        if (!name || !sessionId) {
            return NextResponse.json({ error: "name and sessionId required" }, { status: 400 });
        }
        await sql`
      INSERT INTO visitors (session_id, name, last_seen, page)
      VALUES (${sessionId}, ${name}, NOW(), ${page || "/"})
      ON CONFLICT (session_id) DO UPDATE SET
        name      = EXCLUDED.name,
        last_seen = NOW(),
        page      = EXCLUDED.page
    `;
        // Clean up stale visitors older than 10 minutes
        const stale = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        await sql`DELETE FROM visitors WHERE last_seen < ${stale}`;

        const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
        const [{ count }] = await sql`SELECT COUNT(*) FROM visitors WHERE last_seen > ${cutoff}`;
        return NextResponse.json({ ok: true, count: Number(count) });
    } catch (err: any) {
        console.error("Presence POST error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
