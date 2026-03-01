import { NextRequest, NextResponse } from "next/server";
import { createFolder } from "@/lib/r2";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { path: folderPath } = body;
        if (!folderPath) return NextResponse.json({ error: "path is required" }, { status: 400 });
        await createFolder(folderPath);
        return NextResponse.json({ success: true, path: folderPath });
    } catch (err: any) {
        console.error("R2 mkdir error:", err);
        return NextResponse.json({ error: err.message || "Failed to create folder" }, { status: 500 });
    }
}
