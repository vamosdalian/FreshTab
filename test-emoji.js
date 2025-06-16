// 测试新的emoji库功能
import { emojiLibrary, enhancedEmojiUtils } from '../src/utils/emojiLibrary.js'

console.log('=== 测试Emoji库功能 ===')

// 测试1: 获取所有emoji分组
console.log('1. 可用的emoji分组:', emojiLibrary.getAllGroups())

// 测试2: 获取常用emoji
console.log('2. 常用emoji:', enhancedEmojiUtils.getAllEmojis().slice(0, 10))

// 测试3: 智能推荐
console.log('3. GitHub智能推荐:', enhancedEmojiUtils.getSmartRecommendations('GitHub', 'https://github.com'))
console.log('4. Google智能推荐:', enhancedEmojiUtils.getSmartRecommendations('Google', 'https://google.com'))

// 测试4: 搜索功能
console.log('5. 搜索"heart":', enhancedEmojiUtils.searchEmojis('heart').slice(0, 5))

// 测试5: emoji验证
console.log('6. 验证emoji "😀":', enhancedEmojiUtils.isValidEmoji('😀'))
console.log('7. 验证文本 "abc":', enhancedEmojiUtils.isValidEmoji('abc'))

// 测试6: 提取emoji
console.log('8. 从文本提取emoji:', enhancedEmojiUtils.extractEmojis('Hello 😀 World 🎉!'))

console.log('=== 测试完成 ===')
