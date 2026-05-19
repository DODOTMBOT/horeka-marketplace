import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT
  const region = process.env.S3_REGION ?? 'ru-1'
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('S3 env vars not configured (S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)')
  }

  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  })
}

const BUCKET = process.env.S3_BUCKET ?? 'horeka-media'

export async function uploadFile(
  file: File,
  folder: 'avatars' | 'services',
  userId: string
): Promise<{ url: string; path: string }> {
  const s3 = getS3Client()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${folder}/${userId}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    })
  )

  // Timeweb S3 public URL: https://<bucket>.<s3-host>/<key>
  const host = process.env.S3_ENDPOINT!.replace(/^https?:\/\//, '')
  const url = `https://${BUCKET}.${host}/${path}`

  return { url, path }
}

export async function deleteFile(path: string): Promise<void> {
  const s3 = getS3Client()
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: path,
    })
  )
}

// For private files: generate a short-lived signed URL
export async function getPresignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const s3 = getS3Client()
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: path }),
    { expiresIn }
  )
}
