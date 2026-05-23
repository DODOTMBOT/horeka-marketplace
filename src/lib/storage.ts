import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const BUCKET = process.env.S3_BUCKET!
const ENDPOINT = process.env.S3_ENDPOINT!
const REGION = process.env.S3_REGION ?? 'ru-1'

const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

export async function uploadFile(
  file: File,
  folder: 'avatars' | 'services' | 'logos',
  userId: string
): Promise<{ url: string; path: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const key = `${folder}/${userId}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ACL: 'public-read',
  }))

  const url = `${ENDPOINT}/${BUCKET}/${key}`
  return { url, path: key }
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }))
}
