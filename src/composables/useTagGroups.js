import { ref, onMounted } from 'vue'
import { emojiUtils } from '../utils/emojiUtils'

export function useTagGroups() {
  const tagGroups = ref([])

  // 获取默认标签分组
  const getDefaultTagGroups = () => {
    return [
      {
        id: 'default',
        name: '常用网站',
        emoji: '🌟',
        themeColor: '#667eea', // 使用默认主题颜色
        tags: [
          { 
            id: 'tag_1', 
            name: 'Google', 
            url: 'https://www.google.com',
            iconType: 'favicon', // favicon, emoji, text
            iconValue: '', // 空字符串表示使用favicon
            backgroundColor: '#4285f4'
          },
          { 
            id: 'tag_2', 
            name: 'GitHub', 
            url: 'https://github.com',
            iconType: 'emoji',
            iconValue: '🐱',
            backgroundColor: '#333'
          },
          { 
            id: 'tag_3', 
            name: '知乎', 
            url: 'https://www.zhihu.com',
            iconType: 'text',
            iconValue: '知',
            backgroundColor: '#0084ff'
          },
          { 
            id: 'tag_4', 
            name: '微博', 
            url: 'https://weibo.com',
            iconType: 'emoji',
            iconValue: '📝',
            backgroundColor: '#e6162d'
          },
          { 
            id: 'tag_5', 
            name: 'YouTube', 
            url: 'https://www.youtube.com',
            iconType: 'favicon',
            iconValue: '',
            backgroundColor: '#ff0000'
          },
          { 
            id: 'tag_6', 
            name: 'Netflix', 
            url: 'https://www.netflix.com',
            iconType: 'emoji',
            iconValue: '🎬',
            backgroundColor: '#e50914'
          }
        ]
      }
    ]
  }

  // 使用emoji工具获取emoji选项
  const emojiOptions = emojiUtils.getAllEmojis()
  const emojiCategories = emojiUtils.getCategorizedEmojis()

  // 预设主题颜色
  const themeColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#ffa726', '#ff7043', '#ab47bc', '#5c6bc0',
    '#26a69a', '#66bb6a', '#ffa726', '#ff8a65', '#8d6e63', '#78909c'
  ]

  // 加载标签分组
  const loadTagGroups = async () => {
    try {
      // 尝试从Chrome存储中加载
      const result = await chrome.storage.sync.get(['tagGroups'])
      tagGroups.value = result.tagGroups || getDefaultTagGroups()
    } catch (error) {
      console.log('Chrome API不可用，使用localStorage')
      const saved = localStorage.getItem('freshtab-tag-groups')
      tagGroups.value = saved ? JSON.parse(saved) : getDefaultTagGroups()
    }
  }

  // 保存标签分组
  const saveTagGroups = async () => {
    try {
      await chrome.storage.sync.set({ tagGroups: tagGroups.value })
    } catch (error) {
      console.log('无法保存到Chrome存储，使用localStorage')
      localStorage.setItem('freshtab-tag-groups', JSON.stringify(tagGroups.value))
    }
  }

  // 添加新分组
  const addGroup = async (name, emoji = '📁', themeColor = '#667eea') => {
    const newGroup = {
      id: 'group_' + Date.now(),
      name,
      emoji,
      themeColor,
      tags: []
    }
    tagGroups.value.push(newGroup)
    await saveTagGroups()
    return newGroup
  }

  // 编辑分组
  const editGroup = async (groupId, updates) => {
    const group = tagGroups.value.find(g => g.id === groupId)
    if (group) {
      Object.assign(group, updates)
      await saveTagGroups()
    }
  }

  // 删除分组
  const deleteGroup = async (groupId) => {
    if (groupId === 'default') {
      alert('无法删除默认分组')
      return false
    }
    
    if (confirm('确定要删除这个分组吗？分组内的所有标签也将被删除。')) {
      tagGroups.value = tagGroups.value.filter(g => g.id !== groupId)
      await saveTagGroups()
      return true
    }
    return false
  }

  // 添加标签到分组
  const addTag = async (groupId, tagData) => {
    const group = tagGroups.value.find(g => g.id === groupId)
    if (group) {
      const newTag = {
        id: 'tag_' + Date.now(),
        name: tagData.name,
        url: tagData.url,
        iconType: tagData.iconType || 'favicon',
        iconValue: tagData.iconValue || '',
        backgroundColor: tagData.backgroundColor || '#667eea'
      }
      
      // 确保URL格式正确
      if (!newTag.url.startsWith('http://') && !newTag.url.startsWith('https://')) {
        newTag.url = 'https://' + newTag.url
      }
      
      group.tags.push(newTag)
      await saveTagGroups()
      return newTag
    }
  }

  // 编辑标签
  const editTag = async (groupId, tagId, updates) => {
    const group = tagGroups.value.find(g => g.id === groupId)
    if (group) {
      const tag = group.tags.find(t => t.id === tagId)
      if (tag) {
        Object.assign(tag, updates)
        await saveTagGroups()
      }
    }
  }

  // 删除标签
  const deleteTag = async (groupId, tagId) => {
    const group = tagGroups.value.find(g => g.id === groupId)
    if (group) {
      group.tags = group.tags.filter(t => t.id !== tagId)
      await saveTagGroups()
    }
  }

  // 获取favicon URL
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return ''
    }
  }

  // 生成标签图标
  const generateTagIcon = (tag) => {
    switch (tag.iconType) {
      case 'emoji':
        return tag.iconValue || '🔗'
      case 'text':
        return tag.iconValue || tag.name.charAt(0).toUpperCase()
      case 'favicon':
      default:
        return '' // 返回空字符串，组件中会显示img标签
    }
  }

  onMounted(() => {
    loadTagGroups()
  })

  return {
    // 数据
    tagGroups,
    emojiOptions,
    themeColors,
    
    // 分组操作
    addGroup,
    editGroup,
    deleteGroup,
    
    // 标签操作
    addTag,
    editTag,
    deleteTag,
    
    // 工具函数
    getFaviconUrl,
    generateTagIcon,
    saveTagGroups
  }
}
