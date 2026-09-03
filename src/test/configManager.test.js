import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('configManager migration', () => {
  beforeEach(() => {
    vi.resetModules()
    global.chrome = {
      i18n: {
        getUILanguage: vi.fn(() => 'en-US')
      },
      storage: {
        sync: {
          get: vi.fn(async () => ({
            FRESH_TAB_SETTING: {
              version: '0',
              showBookmarks: false
            }
          })),
          set: vi.fn(async () => {})
        },
        onChanged: {
          addListener: vi.fn()
        }
      }
    }
  })

  it('adds uiLocale during config migration', async () => {
    const { getConfig } = await import('../services/configManager.js')
    const config = await getConfig()

    expect(config.uiLocale).toBe('en-US')
    expect(config.showBookmarks).toBe(false)
    expect(config.iconScale).toBe(50)
    expect(config.version).toBe('2')
  })

  it('adds iconScale when migrating version 1 settings', async () => {
    global.chrome.storage.sync.get.mockResolvedValueOnce({
      FRESH_TAB_SETTING: {
        version: '1',
        bookmarkSize: 'large'
      }
    })

    const { getConfig } = await import('../services/configManager.js')
    const config = await getConfig()

    expect(config.bookmarkSize).toBe('large')
    expect(config.iconScale).toBe(50)
    expect(config.version).toBe('2')
    expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({
      FRESH_TAB_SETTING: config
    })
  })
})
