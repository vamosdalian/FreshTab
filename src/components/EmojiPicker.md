# EmojiPicker 组件

一个功能完整的 Vue 3 emoji 选择器组件，支持搜索、分类浏览、智能推荐和最近使用等功能。

## 功能特性

- 🔍 **搜索功能** - 支持通过关键词搜索emoji
- 📂 **分类浏览** - 按不同类别浏览emoji（笑脸与情感、动物与自然等）
- 🧠 **智能推荐** - 基于网站名称和URL智能推荐相关emoji
- ⏰ **最近使用** - 显示最近使用过的emoji
- 🎨 **自定义样式** - 支持CSS变量自定义外观
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 使用方式

### 基本用法

```vue
<template>
  <EmojiPicker 
    :selected-emoji="selectedEmoji"
    @select-emoji="handleEmojiSelect"
  />
</template>

<script>
import EmojiPicker from './components/EmojiPicker.vue'

export default {
  components: {
    EmojiPicker
  },
  data() {
    return {
      selectedEmoji: '😀'
    }
  },
  methods: {
    handleEmojiSelect(emoji) {
      this.selectedEmoji = emoji
      console.log('选中的emoji:', emoji)
    }
  }
}
</script>
```

### 带智能推荐的用法

```vue
<template>
  <EmojiPicker 
    :selected-emoji="selectedEmoji"
    :show-smart-recommendations="true"
    :site-name="siteName"
    :site-url="siteUrl"
    @select-emoji="handleEmojiSelect"
  />
</template>

<script>
export default {
  data() {
    return {
      selectedEmoji: '',
      siteName: 'GitHub',
      siteUrl: 'https://github.com'
    }
  }
}
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `selectedEmoji` | `String` | `''` | 当前选中的emoji |
| `showSmartRecommendations` | `Boolean` | `false` | 是否显示智能推荐 |
| `siteName` | `String` | `''` | 网站名称（用于智能推荐） |
| `siteUrl` | `String` | `''` | 网站URL（用于智能推荐） |

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `select-emoji` | `(emoji: string)` | 当用户选择emoji时触发 |

## 暴露的方法

| 方法名 | 说明 |
|--------|------|
| `reset()` | 重置搜索状态和分类选择 |
| `loadRecentEmojis()` | 重新加载最近使用的emoji |

### 使用暴露的方法

```vue
<template>
  <div>
    <button @click="resetPicker">重置</button>
    <EmojiPicker ref="emojiPickerRef" @select-emoji="handleEmojiSelect" />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const emojiPickerRef = ref(null)
    
    const resetPicker = () => {
      // 直接调用组件实例的方法
      emojiPickerRef.value.reset()
    }
    
    const handleEmojiSelect = (emoji) => {
      console.log('选中的emoji:', emoji)
    }
    
    return {
      emojiPickerRef,
      resetPicker,
      handleEmojiSelect
    }
  }
}
</script>
```

## 自定义样式

组件使用CSS变量，可以通过覆盖这些变量来自定义外观：

```css
.emoji-picker {
  --border-color: #dee2e6;
  --primary-color: #007bff;
  --text-color: #495057;
  --text-secondary: #6c757d;
  --button-bg: #f8f9fa;
  --button-hover-bg: #e9ecef;
  --input-bg: white;
  --item-bg: white;
  --item-hover-bg: #e9ecef;
  --item-selected-bg: rgba(0, 123, 255, 0.1);
  --grid-bg: #f8f9fa;
  --scrollbar-track: #f1f1f1;
  --scrollbar-thumb: #c1c1c1;
  --scrollbar-thumb-hover: #a8a8a8;
  --placeholder-color: #6c757d;
}
```

## 依赖

- Vue 3
- `../utils/emojiLibrary.js` - emoji数据和工具函数

## 注意事项

1. 确保已正确配置 `emojiLibrary.js` 和相关的emoji数据
2. 组件会自动保存用户最近使用的emoji到localStorage
3. 智能推荐功能需要提供 `siteName` 或 `siteUrl` 属性
4. 组件支持响应式设计，在移动设备上会自动调整布局
