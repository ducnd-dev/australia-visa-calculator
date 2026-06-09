import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type R2UploadInput = {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
};

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

let client: S3Client | null = null;

function getR2Client(): S3Client | null {
  const config = getR2Config();
  if (!config) return null;
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}

/** Prefix for all object keys (e.g. `uploads` → `uploads/org-id/logo.png`). */
export function r2ObjectKey(relativePath: string): string {
  const prefix = process.env.R2_KEY_PREFIX?.replace(/^\/|\/$/g, "");
  const path = relativePath.replace(/^\/+/, "");
  return prefix ? `${prefix}/${path}` : path;
}

export async function uploadToR2(input: R2UploadInput): Promise<void> {
  const config = getR2Config();
  const s3 = getR2Client();
  if (!config || !s3) {
    throw new Error(
      "R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME."
    );
  }

  const key = r2ObjectKey(input.key);
  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
    })
  );
}

export async function deleteFromR2(relativePath: string): Promise<void> {
  const config = getR2Config();
  const s3 = getR2Client();
  if (!config || !s3) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: r2ObjectKey(relativePath),
    })
  );
}

/** Public URL base (custom domain or r2.dev). Use NEXT_PUBLIC_ for browser image src. */
export function getR2PublicBaseUrl(): string | null {
  const base =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ||
    process.env.R2_PUBLIC_URL?.trim();
  if (!base) return null;
  return base.replace(/\/$/, "");
}

export function r2PublicUrl(relativePath: string): string | null {
  const base = getR2PublicBaseUrl();
  if (!base) return null;
  return `${base}/${r2ObjectKey(relativePath)}`;
}
