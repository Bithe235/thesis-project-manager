import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const mode = searchParams.get("mode") || "download"; // 'view' | 'download'
    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }
    const filename = key.split("/").pop() || "file";
    let disposition: string | undefined;
    if (mode === "view") {
      disposition = `inline; filename="${filename}"`;
    } else if (mode === "download") {
      disposition = `attachment; filename="${filename}"`;
    }
    const url = await getPresignedDownloadUrl(key, disposition);
    return NextResponse.json({ url, key });
  } catch (err: any) {
    console.error("R2 download URL error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate download URL" },
      { status: 500 },
    );
  }
}

