const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const R2_ACCOUNT_ID = "85af707cdbc8a7b243573961f1e042d6";
const R2_ACCESS_KEY_ID = "3b2434022f11042bc6170f3b25e5bc73";
const R2_TOKEN = "tkTicNiTk1x0VmXHIWAWaaUKNYOakcopSEnN5GN8"; // Trying Token as secret
const R2_BUCKET = "thesis";

const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_TOKEN,
    },
    forcePathStyle: true,
});

async function test() {
    try {
        console.log("Testing R2 with TOKEN as SECRET...");
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET,
            Prefix: "",
        });
        const response = await client.send(command);
        console.log("Success! Objects found:", response.Contents ? response.Contents.length : 0);
    } catch (err) {
        console.error("Connection failed:", err.name, err.message);
        if (err.$metadata) console.log("Metadata:", err.$metadata);
    }
}

test();
