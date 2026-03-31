import { NextRequest, NextResponse } from "next/server";
import { deleteObject, deleteObjects } from "@/lib/r2";

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, keys, profileId } = body;
        const pid = profileId || "default";
        const formatKey = (k: string) => pid !== "default" ? `${pid}/${k}` : k;

        if (keys && Array.isArray(keys) && keys.length > 0) {
            await deleteObjects(keys.map(formatKey));
            return NextResponse.json({ success: true, deleted: keys.length });
        }

        if (!key) return NextResponse.json({ error: "key or keys is required" }, { status: 400 });
        await deleteObject(formatKey(key));
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("R2 delete error:", err);
        return NextResponse.json({ error: err.message || "Failed to delete object" }, { status: 500 });
    }
}
