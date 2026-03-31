import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, contentType, profileId } = body;
        const pid = profileId || "default";
        if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });
        
        const actualKey = pid !== "default" ? `${pid}/${key}` : key;
        const uploadUrl = await getPresignedUploadUrl(actualKey, contentType || "application/octet-stream");
        return NextResponse.json({ uploadUrl, key: actualKey });
    } catch (err: any) {
        console.error("R2 presign error:", err);
        return NextResponse.json({ error: err.message || "Failed to generate upload URL" }, { status: 500 });
    }
}
