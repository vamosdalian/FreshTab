import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

function createChromeStorageMock() {
  const storageData = {}
  const listeners = []

  return {
    storageData,
    chrome: {
      storage: {
        sync: {
          get: vi.fn(async (key) => {
            if (typeof key === 'string') {
              return { [key]: storageData[key] }
            }

            if (Array.isArray(key)) {
              return key.reduce((result, currentKey) => {
                result[currentKey] = storageData[currentKey]
                return result
              }, {})
            }

            return { ...storageData }
          }),
          set: vi.fn(async (items) => {
            const changes = {}

            Object.entries(items).forEach(([key, value]) => {
              changes[key] = {
                oldValue: storageData[key],
                newValue: value
              }
              storageData[key] = value
            })

            listeners.forEach((listener) => listener(changes, 'sync'))
          })
        },
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

    const savedGroups = JSON.parse(storageData.FRESH_TAB_TAG_GROUPS)
    expect(savedGroups.groups.some((group) => group.name === '测试分组')).toBe(true)

    setActivePinia(createPinia())
    const reloadedStore = useTagGroupsStore()
    await reloadedStore.initialize()

    expect(reloadedStore.tagGroups.groups.some((group) => group.name === '测试分组')).toBe(true)
  })

  it('renders the persisted group and tag after a reload', async () => {
    const { chrome } = createChromeStorageMock()
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
      iconType: 'text',
      iconValue: 'V',
      backgroundColor: '#0ea5e9'
    })

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
