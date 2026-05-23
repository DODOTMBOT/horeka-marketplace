import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadFile } from '@/lib/storage'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const FILE_TYPES  = [
  ...IMAGE_TYPES,
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',   // xlsx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/zip', 'application/x-zip-compressed',
  'text/plain', 'text/csv',
]
const MAX_IMAGE = 5  * 1024 * 1024  //  5 MB
const MAX_FILE  = 50 * 1024 * 1024  // 50 MB

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file   = formData.get('file')
  const folder = formData.get('folder')

  if (!(file instanceof File)) return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })

  const isFiles = folder === 'files'
  const allowed = isFiles ? FILE_TYPES : IMAGE_TYPES
  const maxSize = isFiles ? MAX_FILE : MAX_IMAGE

  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: isFiles ? 'Недопустимый формат файла' : 'Допустимые форматы: JPEG, PNG, WebP' }, { status: 422 })
  }
  if (file.size > maxSize) {
    return NextResponse.json({ error: `Максимальный размер — ${isFiles ? '50' : '5'} МБ` }, { status: 422 })
  }
  if (folder !== 'avatars' && folder !== 'services' && folder !== 'logos' && folder !== 'files') {
    return NextResponse.json({ error: 'Некорректная папка' }, { status: 422 })
  }

  const { url, path } = await uploadFile(file, folder, session.userId)
  return NextResponse.json({ url, path, name: file.name, size: file.size })
}
