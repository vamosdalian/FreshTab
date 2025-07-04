import { ref, onMounted } from 'vue'
import { useToast } from './useToast'

// 全局单例：确保所有组件共享同一个状态
let _tagGroups = null
let _isInitialized = false

export function useTagGroups() {
  // 如果还没有初始化，创建全局 ref
  if (!_tagGroups) {
    _tagGroups = ref([])
  }
  
  const tagGroups = _tagGroups
  const { error, warning, log } = useToast()

  // 当前数据版本
  const CURRENT_VERSION = '1'

  // 获取默认标签分组
  const getDefaultTagGroups = () => {
    return {
      version: CURRENT_VERSION,
      lastModified: new Date().toISOString(),
      groups: [
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
              iconType: 'emoji', // favicon, emoji, text
              iconValue: '🔍', // 搜索图标
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
              iconType: 'emoji',
              iconValue: '📺',
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
  }

  // 预设主题颜色
  const themeColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#ffa726', '#ff7043', '#ab47bc', '#5c6bc0',
    '#26a69a', '#66bb6a', '#ffa726', '#ff8a65', '#8d6e63', '#78909c'
  ]

  // 数据迁移函数
  const migrateData = (data) => {
    // 如果是旧版本数组格式，迁移到新版本
    if (Array.isArray(data)) {
      log('检测到旧版本数据，正在迁移...')
      return {
        version: CURRENT_VERSION,
        lastModified: new Date().toISOString(),
        groups: data
      }
    }
    
    // 如果是新版本但版本号不匹配，可以在这里添加版本间的迁移逻辑
    if (data.version !== CURRENT_VERSION) {
      log(`数据版本从 ${data.version} 迁移到 ${CURRENT_VERSION}`)
      // 未来可以在这里添加具体的迁移逻辑
      data.version = CURRENT_VERSION
      data.lastModified = new Date().toISOString()
    }
    
    return data
  }

  // 加载标签分组
  const loadTagGroups = async () => {
    try {
      // 从Chrome存储中加载
      const result = await chrome.storage.sync.get(['tagGroups'])
      const loadedData = result.tagGroups || getDefaultTagGroups()
      
      // 迁移数据到最新版本
      const migratedData = migrateData(loadedData)
      
      // 基本类型检查
      if (migratedData.groups && Array.isArray(migratedData.groups)) {
        tagGroups.value = migratedData.groups
        
        // 如果数据被迁移过，保存新版本
        if (migratedData !== loadedData) {
          await saveTagGroups()
        }
      } else {
        tagGroups.value = getDefaultTagGroups().groups
      }
    } catch (chromeError) {
      error('Chrome存储不可用，加载标签分组失败')
      throw chromeError
    }
  }

  // 保存标签分组
  const saveTagGroups = async () => {
    try {
      const dataToSave = {
        version: CURRENT_VERSION,
        lastModified: new Date().toISOString(),
        groups: tagGroups.value
      }
      
      await chrome.storage.sync.set({ tagGroups: dataToSave })
    } catch (chromeError) {
      error('Chrome存储不可用，保存失败')
      throw chromeError
    }
  }

  // 强制刷新数据（用于手动同步）
  const refreshTagGroups = async () => {
    await loadTagGroups()
  }

  // 添加新分组
  const addGroup = async (name, emoji = '📁', themeColor = '#667eea') => {
    if (!name || !name.trim()) {
      warning('请输入分组名称')
      throw new Error('分组名称不能为空')
    }
    
    const newGroup = {
      id: 'group_' + Date.now(),
      name: name.trim(),
      emoji,
      themeColor,
      tags: []
    }
    
    // 先保存到存储，成功后再更新本地状态
    const originalGroups = [...tagGroups.value]
    tagGroups.value.push(newGroup)
    
    try {
      await saveTagGroups()
      log(`分组 "${newGroup.name}" 已创建`)
      return newGroup
    } catch (error) {
      // 保存失败，回滚本地状态
      tagGroups.value = originalGroups
      throw error
    }
  }

  // 编辑分组
  const editGroup = async (groupId, updates) => {
    if (updates.name && !updates.name.trim()) {
      warning('分组名称不能为空')
      throw new Error('分组名称不能为空')
    }
    
    const group = tagGroups.value.find(g => g.id === groupId)
    if (group) {
      // 保存原始状态用于回滚
      const originalGroup = { ...group }
      
      if (updates.name) {
        updates.name = updates.name.trim()
      }
      Object.assign(group, updates)
      
      try {
        await saveTagGroups()
        log('分组已更新')
      } catch (error) {
        // 保存失败，回滚分组状态
        Object.assign(group, originalGroup)
        throw error
      }
    }
  }

  // 删除分组
  const deleteGroup = async (groupId) => {
    if (groupId === 'default') {
      warning('无法删除默认分组')
      return false
    }
    
    if (confirm('确定要删除这个分组吗？分组内的所有标签也将被删除。')) {
      const originalGroups = [...tagGroups.value]
      tagGroups.value = tagGroups.value.filter(g => g.id !== groupId)
      
      try {
        await saveTagGroups()
        log('分组已删除')
        return true
      } catch (error) {
        // 保存失败，回滚本地状态
        tagGroups.value = originalGroups
        throw error
      }
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
      
      // 如果有验证过的favicon URL，保存它
      if (tagData.validFaviconUrl) {
        newTag.validFaviconUrl = tagData.validFaviconUrl
      }
      
      // 确保URL格式正确
      if (!newTag.url.startsWith('http://') && !newTag.url.startsWith('https://')) {
        newTag.url = 'https://' + newTag.url
        log(`已为网址添加 https:// 前缀`)
      }
      
      group.tags.push(newTag)
      
      try {
        await saveTagGroups()
        log(`标签 "${newTag.name}" 已添加`)
        return newTag
      } catch (error) {
        // 保存失败，回滚标签添加
        group.tags.pop()
        throw error
      }
    }
  }

  // 编辑标签
  const editTag = async (groupId, tagId, updates) => {
    const group = tagGroups.value.find(g => g.id === groupId)
    if (group) {
      const tag = group.tags.find(t => t.id === tagId)
      if (tag) {
        const originalTag = { ...tag }
        Object.assign(tag, updates)
        
        // 如果URL变化了且是favicon类型，清除旧的validFaviconUrl
        if (updates.url && tag.iconType === 'favicon' && !updates.validFaviconUrl) {
          delete tag.validFaviconUrl
        }
        
        try {
          await saveTagGroups()
          log('标签已更新')
        } catch (error) {
          // 保存失败，回滚标签状态
          Object.assign(tag, originalTag)
          throw error
        }
      }
    }
  }

  // 删除标签
  const deleteTag = async (groupId, tagId) => {
    const group = tagGroups.value.find(g => g.id === groupId)
    if (group) {
      const originalTags = [...group.tags]
      group.tags = group.tags.filter(t => t.id !== tagId)
      
      try {
        await saveTagGroups()
        log('标签已删除')
      } catch (error) {
        // 保存失败，回滚标签列表
        group.tags = originalTags
        throw error
      }
    }
  }

  // 获取favicon URL
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname
      
      // 国内外favicon服务列表（按优先级排序）
      const faviconServices = [
        // 国内服务（速度更快）
        `https://api.iowen.cn/favicon/${domain}.png`, // iowen API
        `https://favicon.link/icon?url=${domain}`, // favicon.link
        `https://icon.horse/icon/${domain}`, // icon.horse
        
        // 国外服务（备用）
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        `https://favicon.yandex.net/favicon/v2/${domain}?size=32`,
        `https://s2.googleusercontent.com/s2/favicons?domain_url=${domain}`,
        
        // 直接尝试网站根目录
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`
      ]
      
      // 返回第一个服务作为主要选择，其他作为备用
      return {
        primary: faviconServices[0],
        fallbacks: faviconServices.slice(1)
      }
    } catch {
      return {
        primary: '',
        fallbacks: []
      }
    }
  }
  
  // 获取favicon URL（简化版本，兼容现有代码）
  const getFaviconUrlSimple = (url) => {
    const result = getFaviconUrl(url)
    return result.primary || ''
  }

  // 生成标签图标
  const generateTagIcon = (tag) => {
    switch (tag.iconType) {
      case 'emoji':
        // 直接返回emoji值，由EmojiPicker组件负责验证
        return tag.iconValue || '🔗'
      case 'text':
        return tag.iconValue || tag.name.charAt(0).toUpperCase()
      case 'favicon':
      default:
        return '' // 返回空字符串，组件中会显示img标签
    }
  }

  // 重置为默认数据（用于修复损坏的数据）
  const resetToDefault = async () => {
    const defaultData = getDefaultTagGroups()
    tagGroups.value = defaultData.groups
    await saveTagGroups()
    warning('已重置为默认标签分组')
  }

  onMounted(async () => {
    // 只在第一次初始化时加载数据
    if (!_isInitialized) {
      _isInitialized = true
      await loadTagGroups()
    }
  })

  return {
    // 数据
    tagGroups,
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
    getFaviconUrlSimple, // 简化版本，兼容现有代码
    generateTagIcon,
    saveTagGroups,
    refreshTagGroups,
    resetToDefault
  }
}
