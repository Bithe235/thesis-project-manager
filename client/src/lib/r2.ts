import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const R2_BUCKET = "thesis";

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});
export interface R2Object {
    key: string;
    size: number;
    lastModified: Date;
    isFolder: boolean;
    name: string;
}

export async function listObjects(prefix: string = ""): Promise<R2Object[]> {
    const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: prefix,
        Delimiter: "/",
    });

    try {
        const response = await r2Client.send(command);
        const objects: R2Object[] = [];

        // Folders
        if (response.CommonPrefixes) {
            for (const cp of response.CommonPrefixes) {
                if (cp.Prefix) {
                    const folderName = cp.Prefix.slice(prefix.length).replace(/\/$/, "");
                    if (folderName) {
                        objects.push({
                            key: cp.Prefix,
                            size: 0,
                            lastModified: new Date(),
                            isFolder: true,
                            name: folderName,
                        });
                    }
                }
            }
        }

        // Files
        if (response.Contents) {
            for (const obj of response.Contents) {
                if (obj.Key && obj.Key !== prefix) {
                    const fileName = obj.Key.slice(prefix.length);
                    if (fileName && !fileName.endsWith("/")) {
                        objects.push({
                            key: obj.Key,
                            size: obj.Size || 0,
                            lastModified: obj.LastModified || new Date(),
                            isFolder: false,
                            name: fileName,
                        });
                    }
                }
            }
        }

        return objects;
    } catch (err: any) {
        console.error("List objects failed:", err);
        throw err;
    }
}

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    // Signed URLs don't go through middlewareStack the same way, but it should work
    return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export async function getPresignedDownloadUrl(key: string, contentDisposition?: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        // Optional: influence how the browser treats the response (view vs download)
        ResponseContentDisposition: contentDisposition,
    });
    return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export async function deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });
    await r2Client.send(command);
}

export async function deleteObjects(keys: string[]): Promise<void> {
    const command = new DeleteObjectsCommand({
        Bucket: R2_BUCKET,
        Delete: {
            Objects: keys.map((key) => ({ Key: key })),
        },
    });
    await r2Client.send(command);
}

export async function createFolder(prefix: string): Promise<void> {
    const key = prefix.endsWith("/") ? prefix : `${prefix}/`;
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: "",
        ContentType: "application/x-directory",
    });
    await r2Client.send(command);
}
