import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('i18n locale resolution', () => {
  beforeEach(() => {
    vi.resetModules()
    global.chrome = undefined
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: { language: 'en-US' }
    })
  })

  it('normalizes supported locale families', async () => {
    const { resolveSupportedLocale } = await import('../i18n')

    expect(resolveSupportedLocale('zh-TW')).toBe('zh-CN')
    expect(resolveSupportedLocale('en-GB')).toBe('en-US')
    expect(resolveSupportedLocale('fr-FR')).toBe('zh-CN')
  })

  it('prefers chrome UI language when available', async () => {
    global.chrome = {
      i18n: {
        getUILanguage: vi.fn(() => 'zh-CN')
      }
    }

    const { detectBrowserLocale } = await import('../i18n')
    expect(detectBrowserLocale()).toBe('zh-CN')
  })

  it('falls back to navigator language', async () => {
    const { detectBrowserLocale } = await import('../i18n')
    expect(detectBrowserLocale()).toBe('en-US')
  })
})
