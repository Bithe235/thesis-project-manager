import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "@aws-sdk/signature-v4",
    "@aws-sdk/middleware-signing"
  ],
};


export default nextConfig;
