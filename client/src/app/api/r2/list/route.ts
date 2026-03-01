import { NextRequest, NextResponse } from "next/server";
import { listObjects } from "@/lib/r2";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const prefix = searchParams.get("prefix") || "";
        const objects = await listObjects(prefix);
        return NextResponse.json({ objects, prefix });
    } catch (err: any) {
        console.error("R2 list error:", err);
        return NextResponse.json({ error: err.message || "Failed to list objects" }, { status: 500 });
    }
}
