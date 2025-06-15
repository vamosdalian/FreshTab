import { ref, onMounted } from 'vue'

export function useBookmarks() {
  const bookmarkGroups = ref([])

  // 获取默认书签分组
  const getDefaultBookmarkGroups = () => {
    return [
      {
        id: 'default',
        name: '快速访问',
        bookmarks: [
          { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
          { name: 'GitHub', url: 'https://github.com', icon: '🐱' },
          { name: '知乎', url: 'https://www.zhihu.com', icon: '🤔' },
          { name: '微博', url: 'https://weibo.com', icon: '📝' },
          { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
          { name: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' }
        ]
      }
    ]
  }

  // 加载书签分组
  const loadBookmarkGroups = async () => {
    try {
      // 尝试从Chrome存储中加载分组
      const result = await chrome.storage.sync.get(['bookmarkGroups'])
      bookmarkGroups.value = result.bookmarkGroups || getDefaultBookmarkGroups()
    } catch (error) {
      console.log('使用默认分组')
      bookmarkGroups.value = getDefaultBookmarkGroups()
    }
  }

  // 保存书签分组到存储
  const saveBookmarkGroups = async () => {
    try {
      await chrome.storage.sync.set({ bookmarkGroups: bookmarkGroups.value })
    } catch (error) {
      console.log('无法保存到Chrome存储，使用localStorage')
      localStorage.setItem('freshtab-bookmark-groups', JSON.stringify(bookmarkGroups.value))
    }
  }

  // 生成书签图标
  const generateIcon = (name) => {
    const iconMap = {
      'google': '🔍',
      'github': '🐱',
      'youtube': '📺',
      'facebook': '📘',
      'twitter': '🐦',
      'instagram': '📷',
      'linkedin': '💼',
      'reddit': '🤖',
      'stackoverflow': '📚',
      'medium': '📖',
      'netflix': '🎬',
      'spotify': '🎵',
      'amazon': '📦',
      '知乎': '🤔',
      '微博': '📝',
      '百度': '🔍',
      '淘宝': '🛒',
      '京东': '📦'
    }

    const lowerName = name.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon
      }
    }

    return name.charAt(0).toUpperCase()
  }

  // 添加书签到分组
  const addBookmarkToGroup = async (name, url, groupId) => {
    // 确保URL格式正确
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    const icon = generateIcon(name)
    const bookmark = { name, url, icon }
    
    const group = bookmarkGroups.value.find(g => g.id === groupId)
    if (group) {
      group.bookmarks.push(bookmark)
      await saveBookmarkGroups()
    }
  }

  // 删除书签
  const deleteBookmark = async (index, groupId) => {
    const group = bookmarkGroups.value.find(g => g.id === groupId)
    if (group) {
      group.bookmarks.splice(index, 1)
      await saveBookmarkGroups()
    }
  }

  // 删除分组
  const deleteGroup = async (groupId) => {
    if (groupId === 'default') return // 不能删除默认分组

    if (confirm('确定要删除这个分组吗？分组内的所有书签也将被删除。')) {
      bookmarkGroups.value = bookmarkGroups.value.filter(g => g.id !== groupId)
      await saveBookmarkGroups()
    }
  }

  // 保存分组
  const saveGroup = async (name, groupId = null) => {
    if (groupId) {
      // 编辑现有分组
      const group = bookmarkGroups.value.find(g => g.id === groupId)
      if (group) {
        group.name = name
      }
    } else {
      // 添加新分组
      const newGroup = {
        id: 'group_' + Date.now(),
        name: name,
        bookmarks: []
      }
      bookmarkGroups.value.push(newGroup)
    }

    await saveBookmarkGroups()
  }

  onMounted(() => {
    loadBookmarkGroups()
  })

  return {
    bookmarkGroups,
    addBookmarkToGroup,
    deleteBookmark,
    deleteGroup,
    saveGroup,
    saveBookmarkGroups,
    generateIcon
  }
}
