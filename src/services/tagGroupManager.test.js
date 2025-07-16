import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTagGroups, setTagGroups, defaultTagGroups } from './tagGroupManager.js'

// Mock chrome.storage.sync
const mockStorage = {
  data: {},
  get: vi.fn().mockImplementation((key) => {
    console.log('Mock get called with:', key, 'Data:', mockStorage.data)
    if (typeof key === 'string') {
      return Promise.resolve({ [key]: mockStorage.data[key] })
    } else if (Array.isArray(key)) {
      const result = {}
      key.forEach(k => {
        result[k] = mockStorage.data[k]
      })
      return Promise.resolve(result)
    }
    return Promise.resolve({})
  }),
  set: vi.fn().mockImplementation((data) => {
    console.log('Mock set called with:', data)
    Object.assign(mockStorage.data, data)
    return Promise.resolve()
  }),
  onChanged: {
    addListener: vi.fn()
  }
}

// Mock chrome API
global.chrome = {
  storage: {
    sync: mockStorage
  }
}

describe('TagGroupManager', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    mockStorage.data = {}
    vi.clearAllMocks()
  })

  it('should return default tag groups when no data exists', async () => {
    const tagGroups = await getTagGroups()
    
    expect(tagGroups).toEqual(defaultTagGroups)
    expect(tagGroups.groups).toHaveLength(2)
    expect(tagGroups.groups[0].name).toBe('Common Sites')
    expect(tagGroups.groups[1].name).toBe('Development')
  })

  it('should save and retrieve tag groups', async () => {
    const testTagGroups = {
      version: '1',
      lastModified: new Date().toISOString(),
      groups: [
        {
          id: 'test_group',
          name: 'Test Group',
          emoji: '🧪',
          themeColor: '#ff0000',
          tags: [
            {
              id: 'test_tag',
              name: 'Test Tag',
              url: 'https://test.com',
              iconType: 'emoji',
              iconValue: '🔗',
              backgroundColor: '#000'
            }
          ]
        }
      ]
    }

    await setTagGroups(testTagGroups)
    
    // Verify data was saved to mock storage
    expect(mockStorage.data['FRESH_TAB_TAG_GROUPS']).toBeDefined()
    expect(mockStorage.data['FRESH_TAB_TAG_GROUPS'].groups).toHaveLength(1)
    
    const retrievedTagGroups = await getTagGroups()
    
    expect(retrievedTagGroups.groups).toHaveLength(1)
    expect(retrievedTagGroups.groups[0].name).toBe('Test Group')
    expect(retrievedTagGroups.groups[0].tags).toHaveLength(1)
    expect(retrievedTagGroups.groups[0].tags[0].name).toBe('Test Tag')
  })

  it('should migrate data structure correctly', async () => {
    // Simulate old version data without version field
    const oldData = {
      groups: [
        {
          id: 'old_group',
          name: 'Old Group',
          emoji: '📁',
          tags: []
        }
      ]
    }

    mockStorage.data['FRESH_TAB_TAG_GROUPS'] = oldData
    
    const tagGroups = await getTagGroups()
    
    expect(tagGroups.version).toBe('1')
    expect(tagGroups.lastModified).toBeDefined()
    expect(tagGroups.groups[0].themeColor).toBe('#667eea') // default theme color
  })

  it('should handle corrupted data gracefully', async () => {
    // Simulate corrupted data
    mockStorage.data['FRESH_TAB_TAG_GROUPS'] = { corrupted: true }
    
    const tagGroups = await getTagGroups()
    
    expect(tagGroups).toEqual(defaultTagGroups)
  })

  it('should update lastModified when saving', async () => {
    const before = new Date()
    
    await setTagGroups(defaultTagGroups)
    
    const after = new Date()
    const saved = mockStorage.data['FRESH_TAB_TAG_GROUPS']
    
    expect(saved).toBeDefined()
    expect(saved.lastModified).toBeDefined()
    
    const lastModified = new Date(saved.lastModified)
    
    expect(lastModified.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(lastModified.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})
