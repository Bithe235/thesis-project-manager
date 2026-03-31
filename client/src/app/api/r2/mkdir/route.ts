import { NextRequest, NextResponse } from "next/server";
import { createFolder } from "@/lib/r2";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { path: folderPath, profileId } = body;
        const pid = profileId || "default";
        if (!folderPath) return NextResponse.json({ error: "path is required" }, { status: 400 });
        const actualPath = pid !== "default" ? `${pid}/${folderPath}` : folderPath;
        await createFolder(actualPath);
        return NextResponse.json({ success: true, path: actualPath });
    } catch (err: any) {
        console.error("R2 mkdir error:", err);
        return NextResponse.json({ error: err.message || "Failed to create folder" }, { status: 500 });
    }
}
