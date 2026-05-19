export function compressImage(file: File, maxSize = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round(height * maxSize / width); width = maxSize }
        else { width = Math.round(width * maxSize / height); height = maxSize }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('compress failed')), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = url
  })
}

export async function compressAndUpload(file: File, folder = 'avatars'): Promise<string> {
  const blob = await compressImage(file)
  const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  const fd = new FormData()
  fd.append('file', compressed)
  fd.append('folder', folder)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json()
  if (!data.url) throw new Error(data.error ?? 'Upload failed')
  return data.url as string
}
