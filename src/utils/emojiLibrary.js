// 增强版Emoji管理工具 - 使用第三方库数据
// 改用动态导入以避免JSON导入语法兼容性问题
import emojiRegex from 'emoji-regex'

export class EmojiLibrary {
  constructor() {
    this.emojiData = null
    this.cache = new Map()
    this.loadingPromise = null
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
    
    // 异步加载emoji数据
    this.loadEmojiData()
  }

  // 异步加载emoji数据
  async loadEmojiData() {
    if (this.loadingPromise) return this.loadingPromise
    
    this.loadingPromise = this._loadData()
    return this.loadingPromise
  }

  async _loadData() {
    try {
      // 尝试动态导入emoji数据
      const emojiModule = await import('unicode-emoji-json/data-by-group.json')
      this.emojiData = emojiModule.default || emojiModule
      
      console.log('Emoji data loaded successfully:', {
        groupCount: Object.keys(this.emojiData || {}).length,
        dataType: typeof this.emojiData,
        sampleKeys: Object.keys(this.emojiData || {}).slice(0, 5)
      })
    } catch (error) {
      console.warn('Failed to load unicode-emoji-json, using fallback data:', error)
      // 使用内置的fallback数据
      this.emojiData = this.getFallbackEmojiData()
    }
  }

  // 内置fallback emoji数据
  getFallbackEmojiData() {
    return {
      "Smileys & Emotion": {
        name: "Smileys & Emotion",
        emojis: [
          { emoji: '😀', name: 'grinning face' },
          { emoji: '😃', name: 'grinning face with big eyes' },
          { emoji: '😄', name: 'grinning face with smiling eyes' },
          { emoji: '😁', name: 'beaming face with smiling eyes' },
          { emoji: '😆', name: 'grinning squinting face' },
          { emoji: '😅', name: 'grinning face with sweat' },
          { emoji: '🤣', name: 'rolling on the floor laughing' },
          { emoji: '😂', name: 'face with tears of joy' },
          { emoji: '🙂', name: 'slightly smiling face' },
          { emoji: '🙃', name: 'upside down face' },
          { emoji: '😉', name: 'winking face' },
          { emoji: '😊', name: 'smiling face with smiling eyes' },
          { emoji: '😇', name: 'smiling face with halo' },
          { emoji: '🥰', name: 'smiling face with hearts' },
          { emoji: '😍', name: 'smiling face with heart-eyes' },
          { emoji: '🤩', name: 'star-struck' },
          { emoji: '😘', name: 'face blowing a kiss' },
          { emoji: '😗', name: 'kissing face' },
          { emoji: '☺️', name: 'smiling face' },
          { emoji: '😚', name: 'kissing face with closed eyes' },
          { emoji: '😙', name: 'kissing face with smiling eyes' },
          { emoji: '🥲', name: 'smiling face with tear' },
          { emoji: '😋', name: 'face savoring food' },
          { emoji: '😛', name: 'face with tongue' },
          { emoji: '😜', name: 'winking face with tongue' },
          { emoji: '🤪', name: 'zany face' },
          { emoji: '😝', name: 'squinting face with tongue' },
          { emoji: '🤑', name: 'money-mouth face' },
          { emoji: '🤗', name: 'hugging face' },
          { emoji: '🤭', name: 'face with hand over mouth' }
        ]
      },
      "People & Body": {
        name: "People & Body", 
        emojis: [
          { emoji: '👋', name: 'waving hand' },
          { emoji: '🤚', name: 'raised back of hand' },
          { emoji: '🖐️', name: 'hand with fingers splayed' },
          { emoji: '✋', name: 'raised hand' },
          { emoji: '🖖', name: 'vulcan salute' },
          { emoji: '👌', name: 'OK hand' },
          { emoji: '🤏', name: 'pinching hand' },
          { emoji: '✌️', name: 'victory hand' },
          { emoji: '🤞', name: 'crossed fingers' },
          { emoji: '🤟', name: 'love-you gesture' },
          { emoji: '🤘', name: 'sign of the horns' },
          { emoji: '🤙', name: 'call me hand' },
          { emoji: '👈', name: 'backhand index pointing left' },
          { emoji: '👉', name: 'backhand index pointing right' },
          { emoji: '👆', name: 'backhand index pointing up' },
          { emoji: '🖕', name: 'middle finger' },
          { emoji: '👇', name: 'backhand index pointing down' },
          { emoji: '☝️', name: 'index pointing up' },
          { emoji: '👍', name: 'thumbs up' },
          { emoji: '👎', name: 'thumbs down' },
          { emoji: '✊', name: 'raised fist' },
          { emoji: '👊', name: 'oncoming fist' },
          { emoji: '🤛', name: 'left-facing fist' },
          { emoji: '🤜', name: 'right-facing fist' },
          { emoji: '👏', name: 'clapping hands' },
          { emoji: '🙌', name: 'raising hands' },
          { emoji: '👐', name: 'open hands' },
          { emoji: '🤲', name: 'palms up together' },
          { emoji: '🤝', name: 'handshake' },
          { emoji: '🙏', name: 'folded hands' }
        ]
      },
      "Animals & Nature": {
        name: "Animals & Nature",
        emojis: [
          { emoji: '🐵', name: 'monkey face' },
          { emoji: '🐒', name: 'monkey' },
          { emoji: '🦍', name: 'gorilla' },
          { emoji: '🦧', name: 'orangutan' },
          { emoji: '🐶', name: 'dog face' },
          { emoji: '🐕', name: 'dog' },
          { emoji: '🦮', name: 'guide dog' },
          { emoji: '🐕‍🦺', name: 'service dog' },
          { emoji: '🐩', name: 'poodle' },
          { emoji: '🐺', name: 'wolf' },
          { emoji: '🦊', name: 'fox' },
          { emoji: '🦝', name: 'raccoon' },
          { emoji: '🐱', name: 'cat face' },
          { emoji: '🐈', name: 'cat' },
          { emoji: '🐈‍⬛', name: 'black cat' },
          { emoji: '🦁', name: 'lion' },
          { emoji: '🐯', name: 'tiger face' },
          { emoji: '🐅', name: 'tiger' },
          { emoji: '🐆', name: 'leopard' },
          { emoji: '🐴', name: 'horse face' },
          { emoji: '🐎', name: 'horse' },
          { emoji: '🦄', name: 'unicorn' },
          { emoji: '🦓', name: 'zebra' },
          { emoji: '🦌', name: 'deer' },
          { emoji: '🦬', name: 'bison' },
          { emoji: '🐮', name: 'cow face' },
          { emoji: '🐂', name: 'ox' },
          { emoji: '🐃', name: 'water buffalo' },
          { emoji: '🐄', name: 'cow' },
          { emoji: '🐷', name: 'pig face' }
        ]
      },
      "Food & Drink": {
        name: "Food & Drink",
        emojis: [
          { emoji: '🍇', name: 'grapes' },
          { emoji: '🍈', name: 'melon' },
          { emoji: '🍉', name: 'watermelon' },
          { emoji: '🍊', name: 'tangerine' },
          { emoji: '🍋', name: 'lemon' },
          { emoji: '🍌', name: 'banana' },
          { emoji: '🍍', name: 'pineapple' },
          { emoji: '🥭', name: 'mango' },
          { emoji: '🍎', name: 'red apple' },
          { emoji: '🍏', name: 'green apple' },
          { emoji: '🍐', name: 'pear' },
          { emoji: '🍑', name: 'peach' },
          { emoji: '🍒', name: 'cherries' },
          { emoji: '🍓', name: 'strawberry' },
          { emoji: '🫐', name: 'blueberries' },
          { emoji: '🥝', name: 'kiwi fruit' },
          { emoji: '🍅', name: 'tomato' },
          { emoji: '🫒', name: 'olive' },
          { emoji: '🥥', name: 'coconut' },
          { emoji: '🥑', name: 'avocado' },
          { emoji: '🍆', name: 'eggplant' },
          { emoji: '🥔', name: 'potato' },
          { emoji: '🥕', name: 'carrot' },
          { emoji: '🌽', name: 'ear of corn' },
          { emoji: '🌶️', name: 'hot pepper' },
          { emoji: '🫑', name: 'bell pepper' },
          { emoji: '🥒', name: 'cucumber' },
          { emoji: '🥬', name: 'leafy greens' },
          { emoji: '🥦', name: 'broccoli' },
          { emoji: '🧄', name: 'garlic' }
        ]
      },
      "Travel & Places": {
        name: "Travel & Places",
        emojis: [
          { emoji: '🌍', name: 'globe showing Europe-Africa' },
          { emoji: '🌎', name: 'globe showing Americas' },
          { emoji: '🌏', name: 'globe showing Asia-Australia' },
          { emoji: '🌐', name: 'globe with meridians' },
          { emoji: '🗺️', name: 'world map' },
          { emoji: '🗾', name: 'map of Japan' },
          { emoji: '🧭', name: 'compass' },
          { emoji: '🏔️', name: 'snow-capped mountain' },
          { emoji: '⛰️', name: 'mountain' },
          { emoji: '🌋', name: 'volcano' },
          { emoji: '🗻', name: 'mount fuji' },
          { emoji: '🏕️', name: 'camping' },
          { emoji: '🏖️', name: 'beach with umbrella' },
          { emoji: '🏜️', name: 'desert' },
          { emoji: '🏝️', name: 'desert island' },
          { emoji: '🏞️', name: 'national park' },
          { emoji: '🏟️', name: 'stadium' },
          { emoji: '🏛️', name: 'classical building' },
          { emoji: '🏗️', name: 'building construction' },
          { emoji: '🧱', name: 'brick' },
          { emoji: '🪨', name: 'rock' },
          { emoji: '🪵', name: 'wood' },
          { emoji: '🛖', name: 'hut' },
          { emoji: '🏘️', name: 'houses' },
          { emoji: '🏚️', name: 'derelict house' },
          { emoji: '🏠', name: 'house' },
          { emoji: '🏡', name: 'house with garden' },
          { emoji: '🏢', name: 'office building' },
          { emoji: '🏣', name: 'Japanese post office' },
          { emoji: '🏤', name: 'post office' }
        ]
      },
      "Activities": {
        name: "Activities",
        emojis: [
          { emoji: '⚽', name: 'soccer ball' },
          { emoji: '🏀', name: 'basketball' },
          { emoji: '🏈', name: 'american football' },
          { emoji: '⚾', name: 'baseball' },
          { emoji: '🥎', name: 'softball' },
          { emoji: '🎾', name: 'tennis' },
          { emoji: '🏐', name: 'volleyball' },
          { emoji: '🏉', name: 'rugby football' },
          { emoji: '🥏', name: 'flying disc' },
          { emoji: '🎱', name: 'pool 8 ball' },
          { emoji: '🪀', name: 'yo-yo' },
          { emoji: '🏓', name: 'ping pong' },
          { emoji: '🏸', name: 'badminton' },
          { emoji: '🏒', name: 'ice hockey' },
          { emoji: '🏑', name: 'field hockey' },
          { emoji: '🥍', name: 'lacrosse' },
          { emoji: '🏏', name: 'cricket game' },
          { emoji: '🪃', name: 'boomerang' },
          { emoji: '🥅', name: 'goal net' },
          { emoji: '⛳', name: 'flag in hole' },
          { emoji: '🪁', name: 'kite' },
          { emoji: '🏹', name: 'bow and arrow' },
          { emoji: '🎣', name: 'fishing pole' },
          { emoji: '🤿', name: 'diving mask' },
          { emoji: '🥊', name: 'boxing glove' },
          { emoji: '🥋', name: 'martial arts uniform' },
          { emoji: '🎽', name: 'running shirt' },
          { emoji: '🛹', name: 'skateboard' },
          { emoji: '🛷', name: 'sled' },
          { emoji: '⛸️', name: 'ice skate' }
        ]
      },
      "Objects": {
        name: "Objects",
        emojis: [
          { emoji: '⌚', name: 'watch' },
          { emoji: '📱', name: 'mobile phone' },
          { emoji: '📲', name: 'mobile phone with arrow' },
          { emoji: '💻', name: 'laptop' },
          { emoji: '⌨️', name: 'keyboard' },
          { emoji: '🖥️', name: 'desktop computer' },
          { emoji: '🖨️', name: 'printer' },
          { emoji: '🖱️', name: 'computer mouse' },
          { emoji: '🖲️', name: 'trackball' },
          { emoji: '🕹️', name: 'joystick' },
          { emoji: '🗜️', name: 'clamp' },
          { emoji: '💽', name: 'computer disk' },
          { emoji: '💾', name: 'floppy disk' },
          { emoji: '💿', name: 'optical disk' },
          { emoji: '📀', name: 'dvd' },
          { emoji: '🧮', name: 'abacus' },
          { emoji: '🎥', name: 'movie camera' },
          { emoji: '🎞️', name: 'film frames' },
          { emoji: '📽️', name: 'film projector' },
          { emoji: '🎬', name: 'clapper board' },
          { emoji: '📺', name: 'television' },
          { emoji: '📷', name: 'camera' },
          { emoji: '📸', name: 'camera with flash' },
          { emoji: '📹', name: 'video camera' },
          { emoji: '📼', name: 'videocassette' },
          { emoji: '🔍', name: 'magnifying glass tilted left' },
          { emoji: '🔎', name: 'magnifying glass tilted right' },
          { emoji: '🕯️', name: 'candle' },
          { emoji: '💡', name: 'light bulb' },
          { emoji: '🔦', name: 'flashlight' }
        ]
      },
      "Symbols": {
        name: "Symbols",
        emojis: [
          { emoji: '❤️', name: 'red heart' },
          { emoji: '🧡', name: 'orange heart' },
          { emoji: '💛', name: 'yellow heart' },
          { emoji: '💚', name: 'green heart' },
          { emoji: '💙', name: 'blue heart' },
          { emoji: '💜', name: 'purple heart' },
          { emoji: '🖤', name: 'black heart' },
          { emoji: '🤍', name: 'white heart' },
          { emoji: '🤎', name: 'brown heart' },
          { emoji: '💔', name: 'broken heart' },
          { emoji: '❣️', name: 'heart exclamation' },
          { emoji: '💕', name: 'two hearts' },
          { emoji: '💞', name: 'revolving hearts' },
          { emoji: '💓', name: 'beating heart' },
          { emoji: '💗', name: 'growing heart' },
          { emoji: '💖', name: 'sparkling heart' },
          { emoji: '💘', name: 'heart with arrow' },
          { emoji: '💝', name: 'heart with ribbon' },
          { emoji: '💟', name: 'heart decoration' },
          { emoji: '☮️', name: 'peace symbol' },
          { emoji: '✝️', name: 'latin cross' },
          { emoji: '☪️', name: 'star and crescent' },
          { emoji: '🕉️', name: 'om' },
          { emoji: '☸️', name: 'wheel of dharma' },
          { emoji: '✡️', name: 'star of David' },
          { emoji: '🔯', name: 'dotted six-pointed star' },
          { emoji: '🕎', name: 'menorah' },
          { emoji: '☯️', name: 'yin yang' },
          { emoji: '☦️', name: 'orthodox cross' },
          { emoji: '🛐', name: 'place of worship' }
        ]
      },
      "Flags": {
        name: "Flags",
        emojis: [
          { emoji: '🏁', name: 'chequered flag' },
          { emoji: '🚩', name: 'triangular flag' },
          { emoji: '🎌', name: 'crossed flags' },
          { emoji: '🏴', name: 'black flag' },
          { emoji: '🏳️', name: 'white flag' },
          { emoji: '🏳️‍🌈', name: 'rainbow flag' },
          { emoji: '🏳️‍⚧️', name: 'transgender flag' },
          { emoji: '🏴‍☠️', name: 'pirate flag' },
          { emoji: '🇦🇨', name: 'flag: Ascension Island' },
          { emoji: '🇦🇩', name: 'flag: Andorra' },
          { emoji: '🇦🇪', name: 'flag: United Arab Emirates' },
          { emoji: '🇦🇫', name: 'flag: Afghanistan' },
          { emoji: '🇦🇬', name: 'flag: Antigua & Barbuda' },
          { emoji: '🇦🇮', name: 'flag: Anguilla' },
          { emoji: '🇦🇱', name: 'flag: Albania' },
          { emoji: '🇦🇲', name: 'flag: Armenia' },
          { emoji: '🇦🇴', name: 'flag: Angola' },
          { emoji: '🇦🇶', name: 'flag: Antarctica' },
          { emoji: '🇦🇷', name: 'flag: Argentina' },
          { emoji: '🇦🇸', name: 'flag: American Samoa' },
          { emoji: '🇦🇹', name: 'flag: Austria' },
          { emoji: '🇦🇺', name: 'flag: Australia' },
          { emoji: '🇦🇼', name: 'flag: Aruba' },
          { emoji: '🇦🇽', name: 'flag: Åland Islands' },
          { emoji: '🇦🇿', name: 'flag: Azerbaijan' },
          { emoji: '🇧🇦', name: 'flag: Bosnia & Herzegovina' },
          { emoji: '🇧🇧', name: 'flag: Barbados' },
          { emoji: '🇧🇩', name: 'flag: Bangladesh' },
          { emoji: '🇧🇪', name: 'flag: Belgium' },
          { emoji: '🇧🇫', name: 'flag: Burkina Faso' }
        ]
      }
    }
  }

  // 等待数据加载完成
  async ensureDataLoaded() {
    if (!this.emojiData) {
      await this.loadEmojiData()
    }
    return this.emojiData
  }

  // 获取所有分组
  async getAllGroups() {
    await this.ensureDataLoaded()
    if (!this.emojiData || typeof this.emojiData !== 'object') return []
    
    // 返回所有分组名称
    return Object.keys(this.emojiData).map(key => {
      const group = this.emojiData[key]
      return group && group.name ? group.name : key
    }).filter(Boolean)
  }

  // 获取指定分组的emoji
  async getEmojisByGroup(groupName) {
    await this.ensureDataLoaded()
    
    const cacheKey = `group_${groupName}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // 查找匹配的组
    let targetGroup = null
    for (const key of Object.keys(this.emojiData || {})) {
      const group = this.emojiData[key]
      if (group && (group.name === groupName || key === groupName)) {
        targetGroup = group
        break
      }
    }

    if (!targetGroup || !targetGroup.emojis) {
      console.warn(`No emojis found for group: ${groupName}`)
      return []
    }

    const emojis = targetGroup.emojis.map(emojiData => {
      return {
        emoji: emojiData.emoji,
        name: emojiData.name || 'Unknown',
        keywords: emojiData.keywords || [], // 增加keywords支持
        category: groupName
      }
    })

    console.log(`Loaded ${emojis.length} emojis for group: ${groupName}`)
    this.cache.set(cacheKey, emojis)
    return emojis
  }

  // 获取所有emoji
  async getAllEmojis() {
    const cacheKey = 'all_emojis'
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const allGroups = await this.getAllGroups()
    const allEmojis = []
    
    for (const group of allGroups) {
      const groupEmojis = await this.getEmojisByGroup(group)
      allEmojis.push(...groupEmojis)
    }

    console.log(`Total emojis loaded: ${allEmojis.length}`)
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
  async searchEmojis(query) {
    if (!query) return this.getPopularEmojis()

    const searchTerm = query.toLowerCase()
    const allEmojis = await this.getAllEmojis()
    
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
  async getEmojiName(emoji) {
    await this.ensureDataLoaded()
    
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
  async getCategorizedEmojis() {
    await this.ensureDataLoaded()
    
    // 如果第三方数据不可用，使用基础emoji作为回退
    const groups = await this.getAllGroups()
    const hasValidData = groups.length > 0
    
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
      '常用': this.getPopularEmojis().map(item => item.emoji)
    }

    // 动态构建分类
    for (const groupName of groups) {
      const groupEmojis = await this.getEmojisByGroup(groupName)
      if (groupEmojis.length > 0) {
        // 使用中文名称映射
        const chineseName = this.getChineseCategoryName(groupName)
        categories[chineseName] = groupEmojis.slice(0, 30).map(item => item.emoji)
      }
    }

    return categories
  }

  // 获取中文分类名称
  getChineseCategoryName(englishName) {
    const nameMap = {
      'Smileys & Emotion': '笑脸与情感',
      'People & Body': '人物与身体', 
      'Animals & Nature': '动物与自然',
      'Food & Drink': '食物与饮料',
      'Travel & Places': '旅行与地点',
      'Activities': '活动',
      'Objects': '物品',
      'Symbols': '符号',
      'Flags': '旗帜'
    }
    return nameMap[englishName] || englishName
  }

  // 获取扁平化的所有emoji（适配原有接口）
  async getFlatEmojis() {
    const categories = await this.getCategorizedEmojis()
    return Object.values(categories).flat()
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
  async getSmartRecommendations(siteName, siteUrl) {
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
          const searchResults = await this.searchEmojis(keyword.trim())
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
  // 初始化标志
  _initialized: false,
  _initPromise: null,
  
  // 异步初始化
  async init() {
    if (this._initialized) return
    if (this._initPromise) return this._initPromise
    
    this._initPromise = emojiLibrary.loadEmojiData()
    await this._initPromise
    
    // 更新categories
    this.categories = await emojiLibrary.getCategorizedEmojis()
    this._initialized = true
  },
  
  // 保持向后兼容的同步属性（使用fallback数据）
  categories: {
    '常用': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
    '技术': ['💻', '🖥️', '📱', '⌨️', '🖱️', '📺', '📷', '📹', '💾', '💿'],
    '社交': ['👥', '💬', '📧', '📞', '📱', '💌', '📮', '📪', '📫', '📬']
  },
  
  getAllEmojis() {
    // 同步返回基础emoji，异步更新完整数据
    this.init().then(() => {
      // 数据加载完成后的处理
    }).catch(console.warn)
    
    return Object.values(this.categories).flat()
  },

  async getCategorizedEmojis() {
    await this.init()
    return await emojiLibrary.getCategorizedEmojis()
  },

  getEmojiByKeyword(keyword) {
    const websiteEmoji = emojiLibrary.getWebsiteEmoji(keyword)
    if (websiteEmoji) return websiteEmoji

    // 异步搜索，但同步返回默认值
    emojiLibrary.searchEmojis(keyword).then(results => {
      return results.length > 0 ? results[0].emoji : '🔗'
    }).catch(() => '🔗')
    
    return '🔗' // 立即返回默认值
  },

  async searchEmojis(query) {
    await this.init()
    const results = await emojiLibrary.searchEmojis(query)
    return results.map(item => item.emoji)
  },

  getRecentEmojis() {
    return emojiLibrary.getRecentEmojis()
  },

  saveRecentEmoji(emoji) {
    return emojiLibrary.saveRecentEmoji(emoji)
  },

  async getSmartRecommendations(siteName, siteUrl) {
    await this.init()
    return await emojiLibrary.getSmartRecommendations(siteName, siteUrl)
  },

  // 新增功能
  isValidEmoji(text) {
    return emojiLibrary.isValidEmoji(text)
  },

  extractEmojis(text) {
    return emojiLibrary.extractEmojis(text)
  }
}
