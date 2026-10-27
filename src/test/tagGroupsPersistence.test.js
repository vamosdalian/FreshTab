import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

const SYNC_QUOTA_BYTES_PER_ITEM = 8192
const encoder = new TextEncoder()

function readSavedGroups(storageData) {
  const chunkCount = storageData.sync.FRESH_TAB_TAG_GROUPS_CHUNKS
  const data = Array.from({ length: chunkCount }, (_, index) => storageData.sync[`FRESH_TAB_TAG_GROUPS_CHUNK_${index}`]).join('')
  return JSON.parse(data)
}

function createManyTags(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `bulk_tag_${index}`,
    name: `批量网站 ${index}`,
    url: `https://example-${index}.com/some/long/path?with=query&and="quotes"`,
    iconType: 'favicon',
    iconValue: '',
    backgroundColor: '#336699',
    validFaviconUrl: `https://example-${index}.com/favicon.ico`
  }))
}

function createChromeStorageMock() {
  const storageData = {
    sync: {},
    local: {}
  }
  const listeners = []

  const createArea = (area) => ({
    get: vi.fn(async (key) => {
      const areaStorage = storageData[area]

      if (typeof key === 'string') {
        return { [key]: areaStorage[key] }
      }

      if (Array.isArray(key)) {
        return key.reduce((result, currentKey) => {
          result[currentKey] = areaStorage[currentKey]
          return result
        }, {})
      }

      return { ...areaStorage }
    }),
    set: vi.fn(async (items) => {
      const areaStorage = storageData[area]
      const changes = {}

      if (area === 'sync') {
        Object.entries(items).forEach(([key, value]) => {
          if (encoder.encode(key + JSON.stringify(value)).length > SYNC_QUOTA_BYTES_PER_ITEM) {
            throw new Error('Resource::kQuotaBytesPerItem quota exceeded')
          }
        })
      }

      Object.entries(items).forEach(([key, value]) => {
        changes[key] = {
          oldValue: areaStorage[key],
          newValue: value
        }
        areaStorage[key] = value
      })

      listeners.forEach((listener) => listener(changes, area))
    }),
    remove: vi.fn(async (keys) => {
      const areaStorage = storageData[area]
      const changes = {}

      ;(Array.isArray(keys) ? keys : [keys]).forEach((key) => {
        if (key in areaStorage) {
          changes[key] = { oldValue: areaStorage[key] }
          delete areaStorage[key]
        }
      })

      if (Object.keys(changes).length > 0) {
        listeners.forEach((listener) => listener(changes, area))
      }
    })
  })

  return {
    storageData,
    chrome: {
      storage: {
        sync: createArea('sync'),
        local: createArea('local'),
        onChanged: {
          addListener: vi.fn((listener) => {
            listeners.push(listener)
          })
        }
      }
    }
  }
}

async function loadStores() {
  const [{ useTagGroupsStore }, { useSettingsStore }, { defaultTagGroups }] = await Promise.all([
    import('../stores/tagGroupsStore'),
    import('../stores/settingsStore'),
    import('../services/tagGroupManager')
  ])

  return {
    useTagGroupsStore,
    useSettingsStore,
    defaultTagGroups
  }
}

describe('tag groups persistence', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('persists a newly added group and restores it after re-initialization', async () => {
    const { chrome, storageData } = createChromeStorageMock()
    global.chrome = chrome

    const { useTagGroupsStore, defaultTagGroups } = await loadStores()

    setActivePinia(createPinia())
    const firstStore = useTagGroupsStore()
    await firstStore.initialize()

    expect(firstStore.tagGroups.groups).toHaveLength(defaultTagGroups.groups.length)

    await firstStore.addGroup({
      name: '测试分组',
      emoji: '🧪',
      themeColor: '#123456',
      tags: []
    })

    const savedGroups = readSavedGroups(storageData)
    expect(savedGroups.groups.some((group) => group.name === '测试分组')).toBe(true)
    expect(storageData.local.FRESH_TAB_TAG_GROUP_ICONS || {}).toEqual({})

    setActivePinia(createPinia())
    const reloadedStore = useTagGroupsStore()
    await reloadedStore.initialize()

    expect(reloadedStore.tagGroups.groups.some((group) => group.name === '测试分组')).toBe(true)
  })

  it('renders the persisted group and tag after a reload', async () => {
    const { chrome, storageData } = createChromeStorageMock()
    global.chrome = chrome

    const [{ default: TagsSection }, { useTagGroupsStore }, { useSettingsStore }] = await Promise.all([
      import('../components/TagsSection.vue'),
      import('../stores/tagGroupsStore'),
      import('../stores/settingsStore')
    ])

    setActivePinia(createPinia())
    const tagGroupsStore = useTagGroupsStore()
    const settingsStore = useSettingsStore()

    settingsStore.settings = {
      showBookmarks: true,
      bookmarkSize: 'medium',
      columnsPerRow: 6
    }

    await tagGroupsStore.initialize()
    await tagGroupsStore.addGroup({
      id: 'qa_group',
      name: 'QA 分组',
      emoji: '✅',
      themeColor: '#0ea5e9',
      tags: []
    })
    await tagGroupsStore.addTag('qa_group', {
      id: 'qa_tag',
      name: 'Vitest',
      url: 'https://vitest.dev',
      iconType: 'image',
      iconValue: '',
      backgroundColor: '#0ea5e9',
      iconData: 'data:image/png;base64,abc123'
    })

    const savedGroups = readSavedGroups(storageData)
    const qaTag = savedGroups.groups.find((group) => group.id === 'qa_group').tags[0]
    expect(qaTag.iconData).toBeUndefined()
    expect(qaTag.faviconData).toBeUndefined()
    expect(storageData.local.FRESH_TAB_TAG_GROUP_ICONS.qa_tag).toBe('data:image/png;base64,abc123')

    setActivePinia(createPinia())
    const reloadedTagGroupsStore = useTagGroupsStore()
    const reloadedSettingsStore = useSettingsStore()

    reloadedSettingsStore.settings = {
      showBookmarks: true,
      bookmarkSize: 'medium',
      columnsPerRow: 6
    }

    await reloadedTagGroupsStore.initialize()

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp(TagsSection)
    const mountPinia = createPinia()
    app.use(mountPinia)
    setActivePinia(mountPinia)
    const mountedTagGroupsStore = useTagGroupsStore()
    const mountedSettingsStore = useSettingsStore()

    mountedTagGroupsStore.tagGroups = reloadedTagGroupsStore.tagGroups
    mountedSettingsStore.settings = {
      ...reloadedSettingsStore.settings,
      iconScale: 100
    }

    app.mount(root)
    await nextTick()

    expect(root.textContent).toContain('QA 分组')
    expect(root.textContent).toContain('Vitest')
    expect(root.querySelector('.tags-grid').style.getPropertyValue('--icon-content-size')).toBe('100%')
    expect(root.querySelector('.tag-icon img').getAttribute('src')).toBe('data:image/png;base64,abc123')
    expect(root.querySelector('.tag-icon img').dataset.iconType).toBe('image')

    app.unmount()
    root.remove()

    await reloadedTagGroupsStore.updateTag('qa_group', 'qa_tag', {
      iconType: 'emoji',
      iconValue: '🧪',
      iconData: undefined
    })
    expect(storageData.local.FRESH_TAB_TAG_GROUP_ICONS.qa_tag).toBeUndefined()
  })

  it('restores legacy local icon data as generic iconData', async () => {
    const { chrome, storageData } = createChromeStorageMock()
    global.chrome = chrome
    storageData.sync.FRESH_TAB_TAG_GROUPS = JSON.stringify({
      version: '1',
      lastModified: new Date().toISOString(),
      groups: [{
        id: 'legacy',
        name: 'Legacy',
        emoji: '📁',
        themeColor: '#123456',
        tags: [{
          id: 'legacy_tag',
          name: 'Legacy icon',
          url: 'https://example.com',
          iconType: 'favicon',
          iconValue: '',
          backgroundColor: '#654321'
        }]
      }]
    })
    storageData.local.FRESH_TAB_TAG_GROUP_ICONS = {
      legacy_tag: 'data:image/png;base64,legacy'
    }

    const { useTagGroupsStore } = await loadStores()
    setActivePinia(createPinia())
    const store = useTagGroupsStore()
    await store.initialize()

    const tag = store.tagGroups.groups[0].tags[0]
    expect(tag.iconData).toBe('data:image/png;base64,legacy')
    expect(tag.faviconData).toBeUndefined()
  })

  it('persists reordered tags within the same group', async () => {
    const { chrome, storageData } = createChromeStorageMock()
    global.chrome = chrome

    const { useTagGroupsStore } = await loadStores()

    setActivePinia(createPinia())
    const store = useTagGroupsStore()
    await store.initialize()

    const groups = store.tagGroups.groups.map((group) => ({
      ...group,
      tags: [...group.tags]
    }))

    const defaultGroup = groups.find((group) => group.id === 'default')
    defaultGroup.tags = [
      defaultGroup.tags[1],
      defaultGroup.tags[2],
      defaultGroup.tags[0]
    ]

    await store.saveGroupsOrder(groups)

    const savedGroups = readSavedGroups(storageData)
    expect(savedGroups.groups.find((group) => group.id === 'default').tags.map((tag) => tag.id)).toEqual([
      'github',
      'sto',
      'google'
    ])

    setActivePinia(createPinia())
    const reloadedStore = useTagGroupsStore()
    await reloadedStore.initialize()

    expect(reloadedStore.tagGroups.groups.find((group) => group.id === 'default').tags.map((tag) => tag.id)).toEqual([
      'github',
      'sto',
      'google'
    ])
  })

  it('persists moving a tag to another group', async () => {
    const { chrome, storageData } = createChromeStorageMock()
    global.chrome = chrome

    const { useTagGroupsStore } = await loadStores()

    setActivePinia(createPinia())
    const store = useTagGroupsStore()
    await store.initialize()

    const groups = store.tagGroups.groups.map((group) => ({
      ...group,
      tags: [...group.tags]
    }))

    const sourceGroup = groups.find((group) => group.id === 'default')
    const targetGroup = groups.find((group) => group.id === 'dev_tools')
    const [movedTag] = sourceGroup.tags.splice(0, 1)
    targetGroup.tags.splice(1, 0, movedTag)

    await store.saveGroupsOrder(groups)

    const savedGroups = readSavedGroups(storageData)
    expect(savedGroups.groups.find((group) => group.id === 'default').tags.map((tag) => tag.id)).toEqual([
      'github',
      'sto'
    ])
    expect(savedGroups.groups.find((group) => group.id === 'dev_tools').tags.map((tag) => tag.id)).toEqual([
      'vacode',
      'google',
      'npm'
    ])

    setActivePinia(createPinia())
    const reloadedStore = useTagGroupsStore()
    await reloadedStore.initialize()

    expect(reloadedStore.tagGroups.groups.find((group) => group.id === 'default').tags.map((tag) => tag.id)).toEqual([
      'github',
      'sto'
    ])
    expect(reloadedStore.tagGroups.groups.find((group) => group.id === 'dev_tools').tags.map((tag) => tag.id)).toEqual([
      'vacode',
      'google',
      'npm'
    ])
  })

  it('persists tag groups larger than the sync per-item quota across chunks', async () => {
    const { chrome, storageData } = createChromeStorageMock()
    global.chrome = chrome

    const { useTagGroupsStore } = await loadStores()

    setActivePinia(createPinia())
    const store = useTagGroupsStore()
    await store.initialize()

    await store.addGroup({ id: 'bulk', name: '批量分组', tags: createManyTags(120) })
    await store.addTag('bulk', { id: 'last_tag', name: '最后一个', url: 'https://last.example.com' })

    expect(storageData.sync.FRESH_TAB_TAG_GROUPS_CHUNKS).toBeGreaterThan(1)
    expect(storageData.sync.FRESH_TAB_TAG_GROUPS).toBeUndefined()

    setActivePinia(createPinia())
    const reloadedStore = useTagGroupsStore()
    await reloadedStore.initialize()

    const bulkGroup = reloadedStore.tagGroups.groups.find((group) => group.id === 'bulk')
    expect(bulkGroup.tags).toHaveLength(121)
    expect(bulkGroup.tags[120].name).toBe('最后一个')

    await reloadedStore.removeGroup('bulk')
    expect(storageData.sync.FRESH_TAB_TAG_GROUPS_CHUNKS).toBe(1)
    expect(storageData.sync.FRESH_TAB_TAG_GROUPS_CHUNK_1).toBeUndefined()
  })

  it('moves legacy single-key data into chunks on the next save', async () => {
    const { chrome, storageData } = createChromeStorageMock()
    global.chrome = chrome
    storageData.sync.FRESH_TAB_TAG_GROUPS = JSON.stringify({
      version: '1',
      lastModified: new Date().toISOString(),
      groups: [{ id: 'legacy', name: 'Legacy', emoji: '📁', themeColor: '#123456', tags: [] }]
    })

    const { useTagGroupsStore } = await loadStores()
    setActivePinia(createPinia())
    const store = useTagGroupsStore()
    await store.initialize()

    expect(store.tagGroups.groups.map((group) => group.id)).toEqual(['legacy'])

    await store.addTag('legacy', { id: 'new_tag', name: 'New', url: 'https://new.example.com' })

    expect(storageData.sync.FRESH_TAB_TAG_GROUPS).toBeUndefined()
    expect(readSavedGroups(storageData).groups[0].tags.map((tag) => tag.id)).toEqual(['new_tag'])
  })

  it('rolls back in-memory changes when saving fails', async () => {
    const { chrome } = createChromeStorageMock()
    global.chrome = chrome

    const { useTagGroupsStore } = await loadStores()
    setActivePinia(createPinia())
    const store = useTagGroupsStore()
    await store.initialize()

    chrome.storage.sync.set.mockRejectedValueOnce(new Error('Resource::kQuotaBytesPerItem quota exceeded'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(store.addTag('default', { id: 'failed_tag', name: 'Failed' })).rejects.toThrow('quota')
    expect(store.tagGroups.groups[0].tags.some((tag) => tag.id === 'failed_tag')).toBe(false)
  })
})
