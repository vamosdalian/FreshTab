import { describe, expect, it } from 'vitest'
import {
  CustomIconError,
  MAX_CUSTOM_ICON_FILE_SIZE,
  validateCustomIconFile
} from '../services/iconImageProcessor'

describe('custom icon validation', () => {
  it.each(['image/png', 'image/jpeg', 'image/webp'])('accepts %s files', (type) => {
    const file = new File(['icon'], 'icon', { type })
    expect(() => validateCustomIconFile(file)).not.toThrow()
  })

  it('rejects unsupported image types', () => {
    const file = new File(['<svg></svg>'], 'icon.svg', { type: 'image/svg+xml' })
    expect(() => validateCustomIconFile(file)).toThrowError(
      expect.objectContaining({ code: 'unsupported-type' })
    )
  })

  it('rejects files larger than 2MB', () => {
    const file = new File([new Uint8Array(MAX_CUSTOM_ICON_FILE_SIZE + 1)], 'large.png', {
      type: 'image/png'
    })

    try {
      validateCustomIconFile(file)
      throw new Error('Expected validation to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(CustomIconError)
      expect(error.code).toBe('file-too-large')
    }
  })
})
