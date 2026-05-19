<template>
  <div class="emoji-picker-overlay" @click="handleOverlayClick">
    <div class="emoji-picker-modal" @click.stop>
      <div class="emoji-picker-header">
        <h3>{{ t('emoji.title') }}</h3>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      
      <div class="emoji-picker-content">
        <!-- Emoji Mart 选择器 -->
        <Picker
          v-if="emojiIndex"
          :data="emojiIndex"
          set="apple"
          :emoji-size="24"
          :per-line="8"
          :show-preview="false"
          :show-search="true"
          :show-categories="true"
          :show-skin-tones="true"
          :i18n="i18nData"
          :title="t('emoji.pickerTitle')"
          :emoji="'point_up'"
          :color="'#ae65c5'"
          :native="true"
          @select="selectEmoji"
          @skin-change="onSkinChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src'
import data from 'emoji-mart-vue-fast/data/apple.json'

export default {
  name: 'EmojiPickerNew',
  components: {
    Picker
  },
  props: {
    siteName: {
      type: String,
      default: ''
    },
    siteUrl: {
      type: String,
      default: ''
    }
  },
  emits: ['select-emoji', 'close'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const emojiIndex = ref(null)

    const i18nData = {
      search: t('emoji.search'),
      clear: t('emoji.clear'),
      notfound: t('emoji.notfound'),
      skintext: t('emoji.skintext'),
      categories: {
        search: t('emoji.categories.search'),
        recent: t('emoji.categories.recent'),
        smileys: t('emoji.categories.smileys'),
        people: t('emoji.categories.people'),
        nature: t('emoji.categories.nature'),
        foods: t('emoji.categories.foods'),
        activity: t('emoji.categories.activity'),
        places: t('emoji.categories.places'),
        objects: t('emoji.categories.objects'),
        symbols: t('emoji.categories.symbols'),
        flags: t('emoji.categories.flags'),
        custom: t('emoji.categories.custom')
      },
      categorieslabel: t('emoji.categorieslabel'),
      skintones: {
        1: t('emoji.skintones.1'),
        2: t('emoji.skintones.2'),
        3: t('emoji.skintones.3'),
        4: t('emoji.skintones.4'),
        5: t('emoji.skintones.5'),
        6: t('emoji.skintones.6')
      }
    }

    // 选择emoji
    const selectEmoji = (emoji) => {
      console.log('Selected emoji:', emoji)
      emit('select-emoji', emoji.native || emoji.colons || emoji)
      emit('close')
    }

    // 肤色变化
    const onSkinChange = (skin) => {
      console.log('Skin changed:', skin)
    }

    // 处理遮罩层点击
    const handleOverlayClick = () => {
      emit('close')
    }

    // 初始化
    onMounted(() => {
      try {
        emojiIndex.value = new EmojiIndex(data)
      } catch (error) {
        console.error('Error creating emoji index:', error)
      }
    })

    return {
      emojiIndex,
      i18nData,
      selectEmoji,
      onSkinChange,
      handleOverlayClick
      ,
      t
    }
  }
}
</script>

<style scoped>
.emoji-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.emoji-picker-modal {
  background: var(--modal-bg, white);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 90vw;
  max-width: 380px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 480px) {
  .emoji-picker-modal {
    width: 95vw;
    max-width: 350px;
    max-height: 70vh;
  }
}

.emoji-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e9ecef);
  background: var(--header-bg, #f8f9fa);
}

.emoji-picker-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #333);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary, #666);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--button-hover-bg, #e9ecef);
  color: var(--text-color, #333);
}

.emoji-picker-content {
  flex: 1;
  overflow: hidden;
}

/* 主题适配 */
[data-theme="dark"] .emoji-picker-modal {
  background: var(--modal-bg, #2d3748);
}

[data-theme="dark"] .emoji-picker-header {
  background: var(--header-bg, #4a5568);
  border-bottom-color: var(--border-color, #718096);
}

[data-theme="dark"] .emoji-picker-header h3 {
  color: var(--text-color, #f7fafc);
}

[data-theme="dark"] .close-button {
  color: var(--text-secondary, #a0aec0);
}

[data-theme="dark"] .close-button:hover {
  background: var(--button-hover-bg, #718096);
  color: var(--text-color, #f7fafc);
}
</style>

<!-- 导入emoji-mart默认样式 -->
<style>
@import 'emoji-mart-vue-fast/css/emoji-mart.css';

/* 自定义emoji-mart样式以减少留白 */
.emoji-mart {
  width: 100% !important;
  max-width: none !important;
  border: none !important;
  display: flex !important;
  flex-direction: column !important;
}

.emoji-mart-content {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}

.emoji-mart-bar {
  border: none !important;
}

.emoji-mart-search {
  margin: 0 !important;
  padding: 12px 16px !important;
}

.emoji-mart-search input {
  font-size: 14px !important;
  padding: 8px 12px !important;
}

.emoji-mart-category .emoji-mart-emoji {
  display: inline-block !important;
  margin: 2px !important;
}

.emoji-mart-category-list {
  height: 300px !important;
  overflow-y: auto !important;
  margin-bottom: 0 !important;
}

.emoji-mart-anchors {
  padding: 0 6px !important;
}

.emoji-mart-anchor {
  padding: 12px 4px !important;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .emoji-mart-search {
    padding: 8px 12px !important;
  }
  
  .emoji-mart-search input {
    font-size: 16px !important; /* 防止iOS缩放 */
  }
  
  .emoji-mart-category-list {
    height: 260px !important;
    margin-bottom: 0 !important;
  }
  
  .emoji-mart-anchors {
    padding: 0 2px !important;
  }
  
  .emoji-mart-anchor {
    padding: 10px 2px !important;
  }
}
</style>
