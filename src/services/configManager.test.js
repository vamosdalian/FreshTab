import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getConfig, setConfig, onConfigChange, defaultConfig } from '../services/configManager.js'

describe('configManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getConfig', () => {
    it('should return default config when no saved config exists', async () => {
      chrome.storage.sync.get.mockResolvedValue({})
      
      const config = await getConfig()
      
      expect(config).toEqual(defaultConfig)
      expect(chrome.storage.sync.get).toHaveBeenCalledWith('FRESH_TAB_SETTING')
    })

    it('should merge saved config with default config', async () => {
      const savedConfig = {
        version: "1.0",
        showTime: false,
        columnsPerRow: 8
      }
      chrome.storage.sync.get.mockResolvedValue({
        FRESH_TAB_SETTING: savedConfig
      })
      
      const config = await getConfig()
      
      expect(config.showTime).toBe(false)
      expect(config.columnsPerRow).toBe(8)
      expect(config.searchEngine).toBe(defaultConfig.searchEngine)
    })

    it('should migrate config when version differs', async () => {
      const oldConfig = {
        version: "0.9",
        showTime: true,
        oldProperty: "should be removed",
        columnsPerRow: 4
      }
      chrome.storage.sync.get.mockResolvedValue({
        FRESH_TAB_SETTING: oldConfig
      })
      chrome.storage.sync.set.mockResolvedValue()
      
      const config = await getConfig()
      
      expect(config.version).toBe("1.0")
      expect(config.oldProperty).toBeUndefined()
      expect(config.columnsPerRow).toBe(4)
      expect(config.showTime).toBe(true)
      expect(chrome.storage.sync.set).toHaveBeenCalled()
    })

    it('should add missing new properties with default values', async () => {
      const incompleteConfig = {
        version: "0.8",
        showTime: true
      }
      chrome.storage.sync.get.mockResolvedValue({
        FRESH_TAB_SETTING: incompleteConfig
      })
      chrome.storage.sync.set.mockResolvedValue()
      
      const config = await getConfig()
      
      expect(config.searchEngine).toBe(defaultConfig.searchEngine)
      expect(config.displayWidth).toBe(defaultConfig.displayWidth)
      expect(config.showBookmarks).toBe(defaultConfig.showBookmarks)
    })

    it('should return default config on storage error', async () => {
      chrome.storage.sync.get.mockRejectedValue(new Error('Storage error'))
      
      const config = await getConfig()
      
      expect(config).toEqual(defaultConfig)
    })
  })

  describe('setConfig', () => {
    it('should save config to chrome storage', async () => {
      const newConfig = { showTime: false, theme: 'dark' }
      chrome.storage.sync.set.mockResolvedValue()
      
      await setConfig(newConfig)
      
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        FRESH_TAB_SETTING: newConfig
      })
    })

    it('should handle storage errors gracefully', async () => {
      const newConfig = { showTime: false }
      chrome.storage.sync.set.mockRejectedValue(new Error('Storage error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await setConfig(newConfig)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Chrome Storage: Failed to set config.',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('onConfigChange', () => {
    it('should register storage change listener', () => {
      const callback = vi.fn()
      
      onConfigChange(callback)
      
      expect(chrome.storage.sync.onChanged.addListener).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })

    it('should call callback with changed items when sync storage changes', () => {
      const callback = vi.fn()
      let registeredListener
      
      chrome.storage.sync.onChanged.addListener.mockImplementation((listener) => {
        registeredListener = listener
      })
      
      onConfigChange(callback)
      
      const changes = {
        FRESH_TAB_SETTING: { newValue: { showTime: false } }
      }
      registeredListener(changes, 'sync')
      
      expect(callback).toHaveBeenCalledWith({
        FRESH_TAB_SETTING: { showTime: false }
      })
    })

    it('should not call callback for non-sync storage changes', () => {
      const callback = vi.fn()
      let registeredListener
      
      chrome.storage.sync.onChanged.addListener.mockImplementation((listener) => {
        registeredListener = listener
      })
      
      onConfigChange(callback)
      
      const changes = {
        FRESH_TAB_SETTING: { newValue: { showTime: false } }
      }
      registeredListener(changes, 'local')
      
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
