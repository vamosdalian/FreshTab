// 增强版Emoji管理工具 - 使用第三方库数据
import emojiData from 'unicode-emoji-json/data-by-group.json' with { type: 'json' }
import emojiRegex from 'emoji-regex'

export class EmojiLibrary {
  constructor() {
    // 安全加载emoji数据
    try {
      this.emojiData = emojiData || {}
    } catch (error) {
      console.warn('Failed to load emoji data, using fallback:', error)
      this.emojiData = {}
    }
    
    this.cache = new Map()
    this.popularEmojis = [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
      '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
      '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
      '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
      '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
      '😾'
    ]
  }

  // 获取所有分组
  getAllGroups() {
    if (!this.emojiData || typeof this.emojiData !== 'object') return []
    
    // 处理数字索引的组
    return Object.keys(this.emojiData).map(key => {
      const group = this.emojiData[key]
      return group && group.name ? group.name : key
    }).filter(Boolean)
  }

  // 获取指定分组的emoji
  getEmojisByGroup(groupName) {
    if (this.cache.has(groupName)) {
      return this.cache.get(groupName)
    }

    // 查找匹配的组
    let targetGroup = null
    for (const key of Object.keys(this.emojiData || {})) {
      const group = this.emojiData[key]
      if (group && group.name === groupName) {
        targetGroup = group
        break
      }
    }

    if (!targetGroup || !targetGroup.emojis) return []

    const emojis = targetGroup.emojis.map(emojiData => {
      return {
        emoji: emojiData.emoji,
        name: emojiData.name || 'Unknown',
        keywords: [], // 这个数据源没有keywords
        category: groupName
      }
    })

    this.cache.set(groupName, emojis)
    return emojis
  }

  // 获取所有emoji
  getAllEmojis() {
    const cacheKey = 'all_emojis'
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const allEmojis = []
    for (const group of this.getAllGroups()) {
      allEmojis.push(...this.getEmojisByGroup(group))
    }

    this.cache.set(cacheKey, allEmojis)
    return allEmojis
  }

  // 获取常用emoji（简化版）
  getPopularEmojis() {
    return this.popularEmojis.map(emoji => ({
      emoji,
      name: this.getEmojiName(emoji),
      category: 'popular'
    }))
  }

  // 根据关键词搜索emoji
  searchEmojis(query) {
    if (!query) return this.getPopularEmojis()

    const searchTerm = query.toLowerCase()
    const allEmojis = this.getAllEmojis()
    
    return allEmojis.filter(item => {
      // 安全检查：确保name和keywords存在且不为undefined
      const name = item.name || ''
      const keywords = item.keywords || []
      
      return (
        name.toLowerCase().includes(searchTerm) ||
        keywords.some(keyword => keyword && keyword.toLowerCase().includes(searchTerm)) ||
        this.getWebsiteEmoji(searchTerm) === item.emoji
      )
    }).slice(0, 50) // 限制结果数量
  }

  // 获取emoji名称
  getEmojiName(emoji) {
    for (const key of Object.keys(this.emojiData || {})) {
      const group = this.emojiData[key]
      if (group && group.emojis) {
        const found = group.emojis.find(item => item.emoji === emoji)
        if (found) {
          return found.name || 'Unknown'
        }
      }
    }
    return 'Unknown'
  }

  // 网站专用emoji映射
  getWebsiteEmoji(keyword) {
    const websiteMap = {
      'google': '🔍',
      'github': '🐱',
      'youtube': '📺',
      'facebook': '📘',
      'twitter': '🐦',
      'instagram': '📷',
      'linkedin': '💼',
      'reddit': '🤖',
      'discord': '🎮',
      'spotify': '🎵',
      'netflix': '🎬',
      'amazon': '📦',
      'apple': '🍎',
      'microsoft': '🪟',
      'slack': '💬',
      'zoom': '📹',
      'notion': '📝',
      'figma': '🎨',
      'stackoverflow': '📚',
      'codepen': '💻',
      'twitch': '🎮',
      'telegram': '💬',
      'whatsapp': '💬',
      'wechat': '💬',
      'qq': '🐧',
      'weibo': '📝',
      'zhihu': '🤔',
      'bilibili': '📺',
      'taobao': '🛒',
      'jd': '📦',
      'tmall': '🛒',
      'alipay': '💰',
      'baidu': '🔍',
      'douban': '📚',
      'xiaohongshu': '📷',
      'tiktok': '🎵',
      'douyin': '🎵',
      'chrome': '🌐',
      'firefox': '🦊',
      'safari': '🧭',
      'edge': '🌐'
    }

    return websiteMap[keyword.toLowerCase()] || null
  }

  // 按分类获取emoji（适配原有接口）
  getCategorizedEmojis() {
    // 如果第三方数据不可用，使用基础emoji作为回退
    const hasValidData = this.getAllGroups().length > 0
    
    if (!hasValidData) {
      // 回退到基础分类
      return {
        '常用': this.popularEmojis.slice(0, 20),
        '技术': ['💻', '🖥️', '📱', '⌨️', '🖱️', '📺', '📷', '📹', '💾', '💿'],
        '社交': ['👥', '💬', '📧', '📞', '📱', '💌', '📮', '📪', '📫', '📬'],
        '娱乐': ['🎮', '🕹️', '🎲', '🎯', '🎱', '🎪', '🎭', '🎨', '🎵', '🎬'],
        '购物': ['🛒', '💰', '💳', '🏪', '🏬', '🛍️', '💎', '👑', '🎁', '🛎️'],
        '学习': ['📚', '📖', '📝', '📊', '📈', '📉', '📋', '🔍', '💡', '🎓'],
        '交通': ['🚗', '🚕', '🚙', '🚌', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔'],
        '动物': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
        '食物': ['🍎', '🍔', '🍕', '🍜', '🍣', '🎂', '🍰', '☕', '🍺', '🍷'],
        '符号': ['⭐', '💫', '🔥', '💎', '🎯', '🚀', '⚡', '💡', '🔗', '📊']
      }
    }
    
    const categories = {
      '常用': this.getPopularEmojis().map(item => item.emoji),
      '笑脸与情感': this.getEmojisByGroup('Smileys & Emotion').slice(0, 20).map(item => item.emoji),
      '人物与身体': this.getEmojisByGroup('People & Body').slice(0, 20).map(item => item.emoji),
      '动物与自然': this.getEmojisByGroup('Animals & Nature').slice(0, 20).map(item => item.emoji),
      '食物与饮料': this.getEmojisByGroup('Food & Drink').slice(0, 20).map(item => item.emoji),
      '旅行与地点': this.getEmojisByGroup('Travel & Places').slice(0, 20).map(item => item.emoji),
      '活动': this.getEmojisByGroup('Activities').slice(0, 20).map(item => item.emoji),
      '物品': this.getEmojisByGroup('Objects').slice(0, 20).map(item => item.emoji),
      '符号': this.getEmojisByGroup('Symbols').slice(0, 20).map(item => item.emoji),
      '旗帜': this.getEmojisByGroup('Flags').slice(0, 20).map(item => item.emoji)
    }

    return categories
  }

  // 获取扁平化的所有emoji（适配原有接口）
  getFlatEmojis() {
    return Object.values(this.getCategorizedEmojis()).flat()
  }

  // 验证emoji
  isValidEmoji(text) {
    const regex = emojiRegex()
    return regex.test(text)
  }

  // 提取文本中的emoji
  extractEmojis(text) {
    const regex = emojiRegex()
    return text.match(regex) || []
  }

  // 最近使用的emoji
  getRecentEmojis() {
    try {
      const recent = localStorage.getItem('freshtab-recent-emojis-v2')
      return recent ? JSON.parse(recent) : []
    } catch {
      return []
    }
  }

  saveRecentEmoji(emoji) {
    try {
      let recent = this.getRecentEmojis()
      recent = recent.filter(e => e !== emoji)
      recent.unshift(emoji)
      recent = recent.slice(0, 12) // 保留12个最近使用的
      localStorage.setItem('freshtab-recent-emojis-v2', JSON.stringify(recent))
    } catch (error) {
      console.warn('无法保存最近使用的emoji:', error)
    }
  }

  // 智能推荐emoji
  getSmartRecommendations(siteName, siteUrl) {
    const suggestions = []
    
    // 确保siteName存在
    if (!siteName) siteName = ''
    
    // 基于网站名称的推荐
    const websiteEmoji = this.getWebsiteEmoji(siteName)
    if (websiteEmoji) {
      suggestions.push(websiteEmoji)
    }

    // 基于域名的推荐
    if (siteUrl) {
      try {
        const domain = new URL(siteUrl).hostname.toLowerCase()
        const domainParts = domain.split('.')
        
        for (const part of domainParts) {
          const emoji = this.getWebsiteEmoji(part)
          if (emoji && !suggestions.includes(emoji)) {
            suggestions.push(emoji)
          }
        }
      } catch (error) {
        // URL解析失败，忽略
      }
    }

    // 基于关键词的推荐
    if (siteName) {
      const keywords = siteName.toLowerCase().split(/[\s\-_]+/)
      for (const keyword of keywords) {
        if (keyword.trim()) {
          const searchResults = this.searchEmojis(keyword.trim())
          if (searchResults.length > 0) {
            const emoji = searchResults[0].emoji
            if (emoji && !suggestions.includes(emoji)) {
              suggestions.push(emoji)
            }
          }
        }
      }
    }

    // 填充一些通用推荐
    const genericSuggestions = ['🌐', '⭐', '📱', '💻', '🔗', '📊', '🎯', '🚀']
    for (const emoji of genericSuggestions) {
      if (suggestions.length >= 8) break
      if (!suggestions.includes(emoji)) {
        suggestions.push(emoji)
      }
    }

    return suggestions.slice(0, 8)
  }
}

// 创建全局实例
export const emojiLibrary = new EmojiLibrary()

// 兼容原有接口的工具函数
export const enhancedEmojiUtils = {
  // 保持向后兼容
  categories: emojiLibrary.getCategorizedEmojis(),
  
  getAllEmojis() {
    return emojiLibrary.getFlatEmojis()
  },

  getCategorizedEmojis() {
    return emojiLibrary.getCategorizedEmojis()
  },

  getEmojiByKeyword(keyword) {
    const websiteEmoji = emojiLibrary.getWebsiteEmoji(keyword)
    if (websiteEmoji) return websiteEmoji

    const searchResults = emojiLibrary.searchEmojis(keyword)
    return searchResults.length > 0 ? searchResults[0].emoji : '🔗'
  },

  searchEmojis(query) {
    return emojiLibrary.searchEmojis(query).map(item => item.emoji)
  },

  getRecentEmojis() {
    return emojiLibrary.getRecentEmojis()
  },

  saveRecentEmoji(emoji) {
    return emojiLibrary.saveRecentEmoji(emoji)
  },

  getSmartRecommendations(siteName, siteUrl) {
    return emojiLibrary.getSmartRecommendations(siteName, siteUrl)
  },

  // 新增功能
  isValidEmoji(text) {
    return emojiLibrary.isValidEmoji(text)
  },

  extractEmojis(text) {
    return emojiLibrary.extractEmojis(text)
  }
}
