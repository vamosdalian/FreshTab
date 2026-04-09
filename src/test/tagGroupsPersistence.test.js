import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

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

      Object.entries(items).forEach(([key, value]) => {
        changes[key] = {
          oldValue: areaStorage[key],
          newValue: value
        }
        areaStorage[key] = value
      })

      listeners.forEach((listener) => listener(changes, area))
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

    const savedGroups = JSON.parse(storageData.sync.FRESH_TAB_TAG_GROUPS)
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
      iconType: 'favicon',
      iconValue: '',
      backgroundColor: '#0ea5e9',
      faviconData: 'data:image/png;base64,abc123'
    })

    const savedGroups = JSON.parse(storageData.sync.FRESH_TAB_TAG_GROUPS)
    const qaTag = savedGroups.groups.find((group) => group.id === 'qa_group').tags[0]
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
    mountedSettingsStore.settings = reloadedSettingsStore.settings

    app.mount(root)
    await nextTick()

    expect(root.textContent).toContain('QA 分组')
    expect(root.textContent).toContain('Vitest')

    app.unmount()
    root.remove()
  })
})
