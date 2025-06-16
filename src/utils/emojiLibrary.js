// 增强版Emoji管理工具 - 使用第三方库数据
import emojiData from 'unicode-emoji-json/data-by-group.json'
import emojiRegex from 'emoji-regex'

export class EmojiLibrary {
  constructor() {
    this.emojiData = emojiData
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
    return Object.keys(this.emojiData)
  }

  // 获取指定分组的emoji
  getEmojisByGroup(group) {
    if (this.cache.has(group)) {
      return this.cache.get(group)
    }

    const groupData = this.emojiData[group]
    if (!groupData) return []

    const emojis = Object.keys(groupData).map(key => ({
      emoji: key,
      name: groupData[key].name,
      keywords: groupData[key].keywords || [],
      category: group
    }))

    this.cache.set(group, emojis)
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
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
        this.getWebsiteEmoji(searchTerm) === item.emoji
      )
    }).slice(0, 50) // 限制结果数量
  }

  // 获取emoji名称
  getEmojiName(emoji) {
    for (const group of this.getAllGroups()) {
      const groupData = this.emojiData[group]
      if (groupData[emoji]) {
        return groupData[emoji].name
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
    const keywords = siteName.toLowerCase().split(/[\s\-_]+/)
    for (const keyword of keywords) {
      const searchResults = this.searchEmojis(keyword)
      if (searchResults.length > 0) {
        const emoji = searchResults[0].emoji
        if (!suggestions.includes(emoji)) {
          suggestions.push(emoji)
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
