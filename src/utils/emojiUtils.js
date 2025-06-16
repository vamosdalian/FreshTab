// Emoji管理工具
export const emojiUtils = {
  // 基础emoji分类
  categories: {
    常用: ['🌟', '⭐', '💫', '🔥', '💎', '🎯', '🚀', '⚡', '🎨', '🎭'],
    技术: ['💻', '🖥️', '📱', '⌨️', '🖱️', '📺', '📷', '📹', '💾', '💿'],
    社交: ['👥', '💬', '📧', '📞', '📱', '💌', '📮', '📪', '📫', '📬'],
    娱乐: ['🎮', '🕹️', '🎲', '🎯', '🎱', '🎪', '🎭', '🎨', '🎵', '🎬'],
    购物: ['🛒', '💰', '💳', '🏪', '🏬', '🛍️', '💎', '👑', '🎁', '🛎️'],
    学习: ['📚', '📖', '📝', '📊', '📈', '📉', '📋', '🔍', '💡', '🎓'],
    地理: ['🌍', '🌎', '🌏', '🗺️', '🧭', '📍', '🏠', '🏢', '🏭', '🏛️'],
    运动: ['⚽', '🏀', '🏈', '🎾', '🏐', '🏓', '🏸', '🥊', '🏊', '🚴'],
    食物: ['🍎', '🍔', '🍕', '🍜', '🍣', '🎂', '🍰', '☕', '🍺', '🍷'],
    交通: ['🚗', '🚕', '🚙', '🚌', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔'],
    天气: ['☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️'],
    动物: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯']
  },

  // 根据关键词获取相关emoji
  getEmojiByKeyword(keyword) {
    const keywordMap = {
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
      'ebay': '🛒',
      'paypal': '💰',
      'zoom': '📹',
      'slack': '💬',
      'notion': '📝',
      'figma': '🎨',
      'dribbble': '🎨',
      'behance': '🎨',
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
      'douyin': '🎵'
    }
    
    const lowerKeyword = keyword.toLowerCase()
    return keywordMap[lowerKeyword] || this.generateEmojiFromName(keyword)
  },

  // 根据网站名称生成emoji
  generateEmojiFromName(name) {
    if (!name) return '🔗'
    
    const firstChar = name.charAt(0).toLowerCase()
    const charCode = firstChar.charCodeAt(0)
    
    // 根据首字母生成不同的emoji
    const emojiMap = {
      'a': '🅰️', 'b': '🅱️', 'c': '©️', 'd': '🔶', 'e': '📧',
      'f': '🎯', 'g': '🟢', 'h': '🏠', 'i': 'ℹ️', 'j': '⭐',
      'k': '🔑', 'l': '📍', 'm': '📧', 'n': '📰', 'o': '⭕',
      'p': '🅿️', 'q': '❓', 'r': '🔴', 's': '🟡', 't': '📞',
      'u': '🔺', 'v': '✅', 'w': '🌐', 'x': '❌', 'y': '💛',
      'z': '⚡'
    }
    
    return emojiMap[firstChar] || '🔗'
  },

  // 获取所有emoji（扁平化）
  getAllEmojis() {
    return Object.values(this.categories).flat()
  },

  // 获取分类emoji
  getCategorizedEmojis() {
    return this.categories
  },

  // 搜索emoji
  searchEmojis(query) {
    if (!query) return this.getAllEmojis()
    
    const keyword = query.toLowerCase()
    const allEmojis = this.getAllEmojis()
    
    // 简单的关键词匹配
    const matchedByKeyword = this.getEmojiByKeyword(keyword)
    if (matchedByKeyword !== '🔗') {
      return [matchedByKeyword, ...allEmojis.filter(e => e !== matchedByKeyword)]
    }
    
    return allEmojis
  },

  // 获取最近使用的emoji (可以结合localStorage)
  getRecentEmojis() {
    try {
      const recent = localStorage.getItem('freshtab-recent-emojis')
      return recent ? JSON.parse(recent) : []
    } catch {
      return []
    }
  },

  // 保存最近使用的emoji
  saveRecentEmoji(emoji) {
    try {
      let recent = this.getRecentEmojis()
      // 移除已存在的，添加到开头
      recent = recent.filter(e => e !== emoji)
      recent.unshift(emoji)
      // 只保留最近10个
      recent = recent.slice(0, 10)
      localStorage.setItem('freshtab-recent-emojis', JSON.stringify(recent))
    } catch (error) {
      console.warn('无法保存最近使用的emoji:', error)
    }
  }
}

// 使用示例：
// import { emojiUtils } from './emojiUtils'
// 
// // 获取所有emoji
// const allEmojis = emojiUtils.getAllEmojis()
// 
// // 根据关键词获取emoji
// const googleEmoji = emojiUtils.getEmojiByKeyword('google') // 🔍
// 
// // 搜索emoji
// const searchResults = emojiUtils.searchEmojis('github') // [🐱, ...]
// 
// // 获取分类emoji
// const categories = emojiUtils.getCategorizedEmojis()
