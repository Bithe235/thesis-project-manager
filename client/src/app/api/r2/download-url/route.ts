import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }
    const url = await getPresignedDownloadUrl(key);
    return NextResponse.json({ url, key });
  } catch (err: any) {
    console.error("R2 download URL error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate download URL" },
      { status: 500 },
    );
  }
}

