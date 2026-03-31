import { NextRequest, NextResponse } from "next/server";
import { initSchema, sql } from "@/lib/db";

export async function GET() {
    try {
        await initSchema();
        // Fetch all profiles ordered by created_at (default first)
        const profiles = await sql`
            SELECT * FROM profiles ORDER BY created_at ASC
        `;
        return NextResponse.json({ profiles });
    } catch (e: any) {
        console.error("GET /api/profiles error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await initSchema();
        const body = await req.json();
        
        let { id, name, description } = body;
        if (!id || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        // Ensure ID is sort of URL safe
        id = id.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        const newProfile = await sql`
            INSERT INTO profiles (id, name, description)
            VALUES (${id}, ${name}, ${description || ""})
            RETURNING *
        `;

        return NextResponse.json({ profile: newProfile[0] });
    } catch (e: any) {
        console.error("POST /api/profiles error:", e);
        if (e.message.includes("duplicate key")) {
            return NextResponse.json({ error: "Profile ID already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
