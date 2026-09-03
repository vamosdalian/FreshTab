const MAX_CUSTOM_ICON_FILE_SIZE = 2 * 1024 * 1024
const CUSTOM_ICON_CANVAS_SIZE = 192
const SUPPORTED_CUSTOM_ICON_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp'
])

export type CustomIconErrorCode = 'unsupported-type' | 'file-too-large' | 'decode-failed'

export class CustomIconError extends Error {
  code: CustomIconErrorCode

  constructor(code: CustomIconErrorCode) {
    super(code)
    this.name = 'CustomIconError'
    this.code = code
  }
}

export function validateCustomIconFile(file: File): void {
  if (!SUPPORTED_CUSTOM_ICON_TYPES.has(file.type)) {
    throw new CustomIconError('unsupported-type')
  }

  if (file.size > MAX_CUSTOM_ICON_FILE_SIZE) {
    throw new CustomIconError('file-too-large')
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    const cleanup = (): void => URL.revokeObjectURL(objectUrl)

    image.onload = () => {
      cleanup()
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        resolve(image)
      } else {
        reject(new CustomIconError('decode-failed'))
      }
    }
    image.onerror = () => {
      cleanup()
      reject(new CustomIconError('decode-failed'))
    }
    image.src = objectUrl
  })
}

export async function processCustomIcon(file: File): Promise<string> {
  validateCustomIconFile(file)

  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = CUSTOM_ICON_CANVAS_SIZE
  canvas.height = CUSTOM_ICON_CANVAS_SIZE

  const context = canvas.getContext('2d')
  if (!context) {
    throw new CustomIconError('decode-failed')
  }

  const scale = Math.min(
    CUSTOM_ICON_CANVAS_SIZE / image.naturalWidth,
    CUSTOM_ICON_CANVAS_SIZE / image.naturalHeight
  )
  const width = Math.round(image.naturalWidth * scale)
  const height = Math.round(image.naturalHeight * scale)
  const x = Math.round((CUSTOM_ICON_CANVAS_SIZE - width) / 2)
  const y = Math.round((CUSTOM_ICON_CANVAS_SIZE - height) / 2)

  context.clearRect(0, 0, CUSTOM_ICON_CANVAS_SIZE, CUSTOM_ICON_CANVAS_SIZE)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, x, y, width, height)

  const webpData = canvas.toDataURL('image/webp', 0.9)
  return webpData.startsWith('data:image/webp')
    ? webpData
    : canvas.toDataURL('image/png')
}

export { MAX_CUSTOM_ICON_FILE_SIZE, SUPPORTED_CUSTOM_ICON_TYPES }
