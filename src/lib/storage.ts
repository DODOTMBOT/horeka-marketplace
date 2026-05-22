import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function uploadFile(
  file: File,
  folder: 'avatars' | 'services' | 'logos',
  userId: string
): Promise<{ url: string; path: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const relativePath = `${folder}/${userId}/${Date.now()}.${ext}`
  const absDir = path.join(UPLOAD_DIR, folder, userId)

  if (!existsSync(absDir)) {
    await mkdir(absDir, { recursive: true })
  }

  const absPath = path.join(UPLOAD_DIR, relativePath)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(absPath, buffer)

  return { url: `/uploads/${relativePath}`, path: relativePath }
}

export async function deleteFile(filePath: string): Promise<void> {
  const absPath = path.join(UPLOAD_DIR, filePath)
  if (existsSync(absPath)) {
    await unlink(absPath)
  }
}
