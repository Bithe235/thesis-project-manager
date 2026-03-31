import { NextRequest, NextResponse } from "next/server";
import { listObjects } from "@/lib/r2";
import { sql, initSchema } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        await initSchema();
        const { searchParams } = new URL(req.url);
        // Prefix passed from the UI (e.g. current folder path)
        let prefix = searchParams.get("prefix") || "";
        const profileId = searchParams.get("profileId") || "default";
        
        // Build the isolated R2 prefix
        // If profile is 'default', map back to root to retain old files.
        // Otherwise, prefix everything with '{profileId}/'
        let actualPrefix = prefix;
        if (profileId !== "default") {
            actualPrefix = `${profileId}/${prefix}`;
        }

        const rawObjects = await listObjects(actualPrefix);
        
        // Trim profile prefix before returning objects to UI, so frontend sees standard paths
        let objects = rawObjects;
        if (profileId !== "default") {
            objects = rawObjects.map(obj => ({
                ...obj,
                key: obj.key.startsWith(`${profileId}/`) ? obj.key.slice(profileId.length + 1) : obj.key
            }));
        } else if (actualPrefix === "") {
            // When querying the root of the 'default' profile, we must proactively hide 
            // any folders that belong to other active workspace profiles, as they exist at the 
            // root level of the Cloudflare R2 bucket.
            const profiles = await sql`SELECT id FROM profiles WHERE id != 'default'`;
            const profileIds = new Set(profiles.map(p => p.id));
            
            // Filter out any root folder returned by R2 that strictly matches a workspace id
            objects = rawObjects.filter(obj => {
                // If it's a folder, check if its raw name matches any of our known DB profiles
                if (obj.isFolder && profileIds.has(obj.name)) {
                    return false;
                }
                return true;
            });
        }

        return NextResponse.json({ objects, prefix });
    } catch (err: any) {
        console.error("R2 list error:", err);
        return NextResponse.json({ error: err.message || "Failed to list objects" }, { status: 500 });
    }
}
