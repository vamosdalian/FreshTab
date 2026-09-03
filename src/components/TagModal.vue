<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? t('tag.editTitle') : t('tag.addTitle') }}</h2>
        <button @click="$emit('close')" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">{{ t('tag.name') }}</label>
          <input
            v-model="formData.name"
            type="text"
            :placeholder="t('tag.namePlaceholder')"
            class="form-input"
            required
            ref="nameInput"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ t('tag.url') }}</label>
          <input
            v-model="formData.url"
            type="url"
            placeholder="https://example.com"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ t('tag.iconType') }}</label>
          <div class="icon-type-selector">
            <button 
              type="button"
              @click="formData.iconType = 'favicon'"
              :class="['icon-type-btn', { active: formData.iconType === 'favicon' }]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              {{ t('tag.iconTypes.favicon') }}
            </button>
            <button 
              type="button"
              @click="formData.iconType = 'emoji'"
              :class="['icon-type-btn', { active: formData.iconType === 'emoji' }]"
            >
              <span>😀</span>
              {{ t('tag.iconTypes.emoji') }}
            </button>
            <button 
              type="button"
              @click="formData.iconType = 'text'"
              :class="['icon-type-btn', { active: formData.iconType === 'text' }]"
            >
              <span>A</span>
              {{ t('tag.iconTypes.text') }}
            </button>
            <button
              type="button"
              @click="formData.iconType = 'image'"
              :class="['icon-type-btn', { active: formData.iconType === 'image' }]"
            >
              <ImageUp :size="16" />
              {{ t('tag.iconTypes.image') }}
            </button>
          </div>
        </div>
        
        <!-- Emoji选择器 -->
        <div v-if="formData.iconType === 'emoji'" class="form-group">
          <label class="form-label">{{ t('tag.chooseEmoji') }}</label>
          <div class="emoji-selector">
            <button 
              type="button"
              @click="showEmojiPicker = true"
              class="emoji-select-button"
            >
              <span class="emoji-preview">{{ formData.iconValue || '🔗' }}</span>
              <span class="emoji-select-text">{{ t('tag.chooseEmojiButton') }}</span>
            </button>
          </div>
        </div>
        
        <!-- 文字输入 -->
        <div v-if="formData.iconType === 'text'" class="form-group">
          <label class="form-label">{{ t('tag.iconText') }}</label>
          <input
            v-model="formData.iconValue"
            type="text"
            :placeholder="t('tag.iconTextPlaceholder')"
            class="form-input"
            maxlength="2"
          />
        </div>

        <!-- 自定义图片上传 -->
        <div v-if="formData.iconType === 'image'" class="form-group">
          <label class="form-label">{{ t('tag.customIcon.title') }}</label>
          <input
            ref="customIconInput"
            class="custom-icon-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="handleCustomIconInput"
          />
          <button
            type="button"
            :class="['custom-icon-upload', { dragging: isDraggingCustomIcon }]"
            :disabled="isCustomIconProcessing"
            @click="customIconInput?.click()"
            @dragenter.prevent="isDraggingCustomIcon = true"
            @dragover.prevent="isDraggingCustomIcon = true"
            @dragleave.prevent="isDraggingCustomIcon = false"
            @drop.prevent="handleCustomIconDrop"
          >
            <img v-if="customIconData" :src="customIconData" :alt="t('tag.customIcon.previewAlt')" />
            <ImageUp v-else :size="30" />
            <span class="custom-icon-upload-title">
              {{ isCustomIconProcessing
                ? t('tag.customIcon.processing')
                : customIconData
                  ? t('tag.customIcon.replace')
                  : t('tag.customIcon.upload') }}
            </span>
            <span class="custom-icon-upload-hint">{{ t('tag.customIcon.hint') }}</span>
          </button>
          <div v-if="customIconData" class="custom-icon-actions">
            <button type="button" class="remove-custom-icon" @click="removeCustomIcon">
              <Trash2 :size="15" />
              {{ t('tag.customIcon.remove') }}
            </button>
          </div>
          <p v-if="customIconError" class="custom-icon-error">{{ customIconError }}</p>
        </div>
        
        <!-- Favicon选择器 -->
        <div v-if="formData.iconType === 'favicon' && showFaviconSelector && availableFavicons.length > 1" class="form-group">
          <label class="form-label">{{ t('tag.faviconSource', { count: availableFavicons.length }) }}</label>
          <div class="favicon-selector">
            <div 
              v-for="favicon in availableFavicons" 
              :key="favicon.url"
              @click="selectFavicon(favicon)"
              :class="['favicon-option', { selected: currentFaviconUrl === favicon.validUrl }]"
            >
              <div class="favicon-preview">
                <img 
                  :src="favicon.validUrl" 
                  :alt="favicon.name"
                  @error="handleFaviconError"
                />
              </div>
              <span class="favicon-source">{{ favicon.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ t('tag.backgroundColor') }}</label>
          <ColorPicker
            v-model="formData.backgroundColor"
            :swatches="themeColors"
            :aria-label="t('tag.backgroundColor')"
            alpha
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ t('common.preview') }}</label>
          <div class="tag-preview-container">
            <div 
              class="tag-preview-item"
              :style="{
                '--preview-color': formData.backgroundColor,
                '--icon-content-size': `${iconScale}%`
              }"
            >
              <span v-if="formData.iconType === 'emoji'">{{ formData.iconValue || '🔗' }}</span>
              <span v-else-if="formData.iconType === 'text'">{{ formData.iconValue || formData.name.charAt(0).toUpperCase() }}</span>
              <div v-else-if="formData.iconType === 'favicon'" class="icon-image-container">
                <div v-if="faviconLoading" class="favicon-loading">
                  <div class="loading-spinner"></div>
                </div>
                <img 
                  v-else-if="currentFaviconUrl"
                  :src="currentFaviconUrl"
                  :alt="formData.name"
                  @error="handleFaviconError"
                  class="favicon-preview-img"
                />
                <span v-else class="favicon-fallback">🔗</span>
              </div>
              <div v-else-if="formData.iconType === 'image'" class="icon-image-container">
                <img
                  v-if="customIconData"
                  :src="customIconData"
                  :alt="formData.name"
                  class="favicon-preview-img"
                />
                <ImageUp v-else class="custom-icon-fallback" />
              </div>
              <span v-else>🔗</span>
            </div>
            <span class="preview-name">{{ formData.name || t('tag.previewNameFallback') }}</span>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-button">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="submit-button" :disabled="isSubmitDisabled">
            {{ isEditing ? t('common.save') : t('common.add') }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Emoji选择弹窗 -->
  <EmojiPicker
    v-if="showEmojiPicker"
    :site-name="formData.name"
    :site-url="formData.url"
    :show-smart-recommendations="true"
    @select-emoji="handleEmojiSelect"
    @close="showEmojiPicker = false"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImageUp, Trash2 } from 'lucide-vue-next'
import EmojiPicker from './EmojiPicker.vue'
import ColorPicker from './ColorPicker.vue'
import type { IconType } from '../types/tagGroup'
import { FaviconUtils } from '../services/favicons.js'
import { CustomIconError, processCustomIcon } from '../services/iconImageProcessor'
import { useSettingsStore } from '../stores/settingsStore'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const iconScale = computed(() => {
  const value = Number(settingsStore.settings.iconScale)
  return Number.isFinite(value) ? Math.min(100, Math.max(20, value)) : 50
})

// 定义类型
interface TagFormData {
  name: string
  url: string
  iconType: IconType
  iconValue: string
  backgroundColor: string
}

interface TagData extends TagFormData {
  id?: string
  iconData?: string
  faviconData?: string
  validFaviconUrl?: string
}

interface FaviconService {
  name: string
  url: string
  validUrl?: string
}

// Props 定义
interface Props {
  isOpen: boolean
  tag?: TagData | null
  themeColors: string[]
}

// Emits 定义
interface Emits {
  close: []
  save: [tag: TagData]
}

const props = withDefaults(defineProps<Props>(), {
  tag: null,
  themeColors: () => []
})

const emit = defineEmits<Emits>()

// 响应式变量
const formData: Ref<TagFormData> = ref({
  name: '',
  url: '',
  iconType: 'favicon',
  iconValue: '',
  backgroundColor: '#667eea'
})

const nameInput: Ref<HTMLInputElement | null> = ref(null)
const isEditing: Ref<boolean> = ref(false)
const currentFaviconUrl: Ref<string> = ref('')
const faviconLoading: Ref<boolean> = ref(false)
const availableFavicons: Ref<FaviconService[]> = ref([])
const showFaviconSelector: Ref<boolean> = ref(false)
const showEmojiPicker: Ref<boolean> = ref(false)
const customIconInput: Ref<HTMLInputElement | null> = ref(null)
const customIconData: Ref<string> = ref('')
const customIconError: Ref<string> = ref('')
const isCustomIconProcessing: Ref<boolean> = ref(false)
const isDraggingCustomIcon: Ref<boolean> = ref(false)
const isSubmitDisabled = computed(() => (
  isCustomIconProcessing.value || (formData.value.iconType === 'image' && !customIconData.value)
))

// 监听 props 变化，初始化表单数据
watch(
  () => props.tag,
  (newTag: TagData | null) => {
    if (newTag) {
      isEditing.value = true
      formData.value = {
        name: newTag.name,
        url: newTag.url,
        iconType: newTag.iconType || 'favicon',
        iconValue: newTag.iconValue || '',
        backgroundColor: newTag.backgroundColor || '#667eea'
      }

      const savedIconData = newTag.iconData || newTag.faviconData || ''
      customIconData.value = formData.value.iconType === 'image' ? savedIconData : ''

      // 如果是favicon类型，加载现有的图标或重新获取
      if (formData.value.iconType === 'favicon') {
        if (savedIconData) {
          currentFaviconUrl.value = savedIconData
        } else if (newTag.validFaviconUrl) {
          currentFaviconUrl.value = newTag.validFaviconUrl
        } else {
          updateFavicon()
        }
      }
    } else {
      isEditing.value = false
      formData.value = {
        name: '',
        url: '',
        iconType: 'favicon',
        iconValue: '',
        backgroundColor: '#667eea'
      }
      currentFaviconUrl.value = ''
      customIconData.value = ''
    }
    customIconError.value = ''
    isDraggingCustomIcon.value = false
  },
  { immediate: true }
)

// 监听模态框打开状态，自动聚焦输入框
watch(
  () => props.isOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      nextTick(() => {
        nameInput.value?.focus()
      })
    }
  }
)

// 监听URL变化，自动更新favicon
let updateFaviconTimeout: NodeJS.Timeout | null = null
watch(
  () => formData.value.url,
  (newUrl: string, oldUrl: string) => {
    if (newUrl !== oldUrl && formData.value.iconType === 'favicon') {
      // 延迟执行，避免频繁请求
      if (updateFaviconTimeout) {
        clearTimeout(updateFaviconTimeout)
      }
      updateFaviconTimeout = setTimeout(() => {
        updateFavicon()
      }, 800) // 增加延迟，减少API调用
    }
  }
)

// 监听图标类型变化，如果切换到favicon则更新图标
watch(
  () => formData.value.iconType,
  (newType: IconType) => {
    if (newType === 'favicon' && formData.value.url) {
      updateFavicon()
    }
  }
)

// 方法定义
const handleOverlayClick = (): void => {
  emit('close')
}

const handleSubmit = (): void => {
  const tagData: TagData = {
    name: formData.value.name.trim(),
    url: formData.value.url.trim(),
    iconType: formData.value.iconType,
    iconValue: formData.value.iconValue,
    backgroundColor: formData.value.backgroundColor,
    iconData: undefined
  }

  // 确保 URL 有协议
  if (!tagData.url.startsWith('http://') && !tagData.url.startsWith('https://')) {
    tagData.url = 'https://' + tagData.url
  }

  // 如果是文字类型但没有输入值，使用名称首字母
  if (tagData.iconType === 'text' && !tagData.iconValue) {
    tagData.iconValue = tagData.name.charAt(0).toUpperCase()
  }

  if (tagData.iconType === 'image') {
    tagData.iconData = customIconData.value || undefined
  }

  // 如果是favicon类型，保存base64数据或验证过的URL
  if (tagData.iconType === 'favicon') {
    if (currentFaviconUrl.value.startsWith('data:')) {
      tagData.iconData = currentFaviconUrl.value
    } else if (currentFaviconUrl.value) {
      tagData.validFaviconUrl = currentFaviconUrl.value
    }
  }

  if (isEditing.value && props.tag?.id) {
    tagData.id = props.tag.id
  }

  emit('save', tagData)
  emit('close')
}

// 验证favicon URL是否有效
const validateFaviconUrl = async (url: string): Promise<string | null> => {
  try {
    const faviconData = await FaviconUtils.getFavicon(url, true)
    return faviconData ? url : null
  } catch (error) {
    console.warn('Failed to validate favicon:', error)
    return null
  }
}

// 获取可用的favicon URL
const getValidFaviconUrl = async (siteUrl: string): Promise<FaviconService[]> => {
  try {
    const domain = FaviconUtils.getDomainFromUrl(siteUrl)

    // 直接使用FaviconUtils获取favicon，支持缓存
    const faviconData = await FaviconUtils.getFavicon(siteUrl, true)
    
    if (faviconData && faviconData !== FaviconUtils.getDefaultFavicon()) {
      // 成功获取到favicon
      return [{
        name: 'Website Favicon',
        url: siteUrl,
        validUrl: faviconData
      }]
    } else {
      // 如果获取失败，返回默认图标
      return [{
        name: 'Default Icon',
        url: siteUrl,
        validUrl: FaviconUtils.getDefaultFavicon()
      }]
    }
  } catch (error) {
    console.warn('Failed to get valid favicon URL:', error)
    return [{
      name: 'Default Icon',
      url: siteUrl,
      validUrl: FaviconUtils.getDefaultFavicon()
    }]
  }
}

// 更新favicon
const updateFavicon = async (): Promise<void> => {
  if (formData.value.iconType === 'favicon' && formData.value.url) {
    faviconLoading.value = true
    availableFavicons.value = []
    showFaviconSelector.value = false

    try {
      // 确保URL格式正确
      let url = formData.value.url.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      // 使用改进的 FaviconUtils 获取 favicon
      const faviconData = await FaviconUtils.getFavicon(url, true)
      
      if (faviconData && faviconData !== FaviconUtils.getDefaultFavicon()) {
        currentFaviconUrl.value = faviconData
      } else {
        currentFaviconUrl.value = FaviconUtils.getDefaultFavicon()
      }
    } catch (error) {
      console.warn('获取favicon失败:', error)
      currentFaviconUrl.value = FaviconUtils.getDefaultFavicon()
    } finally {
      faviconLoading.value = false
    }
  } else {
    currentFaviconUrl.value = ''
    availableFavicons.value = []
    showFaviconSelector.value = false
  }
}

const getCustomIconErrorMessage = (error: unknown): string => {
  if (error instanceof CustomIconError) {
    if (error.code === 'unsupported-type') {
      return t('tag.customIcon.errors.unsupportedType')
    }
    if (error.code === 'file-too-large') {
      return t('tag.customIcon.errors.fileTooLarge')
    }
  }
  return t('tag.customIcon.errors.processFailed')
}

const handleCustomIconFile = async (file?: File): Promise<void> => {
  isDraggingCustomIcon.value = false
  if (!file) {
    return
  }

  customIconError.value = ''
  isCustomIconProcessing.value = true
  try {
    customIconData.value = await processCustomIcon(file)
  } catch (error) {
    customIconError.value = getCustomIconErrorMessage(error)
  } finally {
    isCustomIconProcessing.value = false
  }
}

const handleCustomIconInput = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  await handleCustomIconFile(input.files?.[0])
  input.value = ''
}

const handleCustomIconDrop = (event: DragEvent): void => {
  void handleCustomIconFile(event.dataTransfer?.files?.[0])
}

const removeCustomIcon = (): void => {
  customIconData.value = ''
  customIconError.value = ''
}

// 选择favicon
const selectFavicon = (favicon: FaviconService): void => {
  currentFaviconUrl.value = favicon.validUrl || ''
}

const handleFaviconError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  // 如果是预览图片加载失败，显示默认图标
  if (target.classList.contains('favicon-preview-img')) {
    target.src = FaviconUtils.getDefaultFavicon()
    target.onerror = null // 防止无限循环
  } else {
    target.style.display = 'none'
  }
}

// emoji选择处理
const handleEmojiSelect = (emoji: string): void => {
  formData.value.iconValue = emoji
  showEmojiPicker.value = false
}

// 初始化数据
const initializeModal = (): void => {
  // 模态框初始化逻辑
}

// 清理favicon缓存的方法（可在需要时调用）
const clearFaviconCache = (): void => {
  FaviconUtils.clearCache()
}

// 监听modal打开状态
watch(
  () => props.isOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      initializeModal()
      nextTick(() => {
        nameInput.value?.focus()
      })
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--card-bg, rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
  transition: background 0.3s ease, border 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h2 {
  color: var(--text-color, white);
  margin: 0;
  font-size: 1.3rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: var(--text-color, white);
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--input-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 8px;
  color: var(--text-color, white);
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: rgba(100, 200, 255, 0.8);
  background: var(--input-focus-bg, rgba(255, 255, 255, 0.15));
  box-shadow: 0 0 0 3px rgba(100, 200, 255, 0.2);
}

.form-input::placeholder {
  color: var(--placeholder-color, rgba(255, 255, 255, 0.5));
}

.icon-type-selector {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.icon-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 8px;
  color: var(--text-color, white);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  min-width: 0;
}

.custom-icon-file-input {
  display: none;
}

.custom-icon-upload {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.4));
  border-radius: 10px;
  background: var(--grid-bg, rgba(255, 255, 255, 0.05));
  color: var(--text-color, white);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.custom-icon-upload:hover,
.custom-icon-upload.dragging {
  border-color: rgba(100, 200, 255, 0.8);
  background: rgba(100, 200, 255, 0.12);
}

.custom-icon-upload:disabled {
  cursor: wait;
  opacity: 0.7;
}

.custom-icon-upload img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 8px;
}

.custom-icon-upload-title {
  font-size: 0.9rem;
  font-weight: 500;
}

.custom-icon-upload-hint {
  font-size: 0.75rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.custom-icon-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.6rem;
}

.remove-custom-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.65rem;
  border: 1px solid rgba(220, 53, 69, 0.35);
  border-radius: 6px;
  background: transparent;
  color: #dc3545;
  cursor: pointer;
}

.remove-custom-icon:hover {
  background: rgba(220, 53, 69, 0.08);
}

.custom-icon-error {
  margin: 0.55rem 0 0;
  color: #dc3545;
  font-size: 0.8rem;
}

.icon-type-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.icon-type-btn.active {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.5);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: var(--grid-bg, rgba(255, 255, 255, 0.05));
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
}

.emoji-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.emoji-item {
  font-size: 1.2rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
}

.emoji-item:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.emoji-item.selected {
  border-color: rgba(100, 200, 255, 0.8);
  background: rgba(100, 200, 255, 0.2);
}

/* 新增emoji功能样式 */
.emoji-search {
  margin-bottom: 1rem;
}

.emoji-search-input {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.emoji-recommendations, .emoji-recent {
  margin-bottom: 1rem;
}

.recommendations-label, .recent-label {
  font-size: 0.8rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.emoji-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 0.25rem;
  max-height: 80px;
  overflow-y: auto;
}

.emoji-grid-small .emoji-item {
  width: 32px;
  height: 32px;
  font-size: 1rem;
  min-width: 32px;
}

.emoji-categories {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.25rem 0.5rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 6px;
  color: var(--text-color, white);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.category-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.category-btn.active {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.8);
  color: white;
}

.tag-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--preview-bg, rgba(255, 255, 255, 0.05));
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
}

.tag-preview-item {
  position: relative;
  overflow: hidden;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: #fff;
  background-image:
    linear-gradient(45deg, #d7d7d7 25%, transparent 25%),
    linear-gradient(-45deg, #d7d7d7 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d7d7d7 75%),
    linear-gradient(-45deg, transparent 75%, #d7d7d7 75%);
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  background-size: 12px 12px;
}

.tag-preview-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--preview-color);
}

.tag-preview-item > span,
.tag-preview-item > .icon-image-container {
  position: relative;
  z-index: 1;
}

.tag-preview-item > span {
  font-size: var(--icon-content-size);
}

.icon-image-container {
  width: var(--icon-content-size);
  height: var(--icon-content-size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.custom-icon-fallback {
  width: 70%;
  height: 70%;
}

.favicon-loading {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.favicon-fallback {
  font-size: 16px;
  color: white;
}

.favicon-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 2px;
}

.preview-name {
  color: var(--text-color, white);
  font-size: 0.875rem;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: var(--text-color, white);
}

.cancel-button {
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
}

.cancel-button:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.submit-button {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.5);
}

.submit-button:hover {
  background: rgba(100, 200, 255, 0.5);
  transform: translateY(-1px);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

/* 自定义滚动条 */
.emoji-grid::-webkit-scrollbar,
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track {
  background: var(--scrollbar-track, rgba(255, 255, 255, 0.1));
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.3));
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover,
.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.5));
}

/* Favicon 选择器样式 */
.favicon-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--grid-bg, rgba(255, 255, 255, 0.05));
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  max-height: 200px;
  overflow-y: auto;
}

.favicon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
  border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.favicon-option:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
  border-color: var(--border-hover-color, rgba(255, 255, 255, 0.4));
  transform: translateY(-2px);
}

.favicon-option.selected {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.6);
  box-shadow: 0 0 0 2px rgba(100, 200, 255, 0.3);
}

.favicon-preview {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.favicon-preview img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: 2px;
}

.favicon-source {
  font-size: 0.75rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.8));
  line-height: 1.2;
  word-break: break-word;
  max-width: 100%;
}

.favicon-option.selected .favicon-source {
  color: var(--text-color, white);
  font-weight: 500;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .submit-button {
    width: 100%;
  }
  
  .emoji-grid, .color-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .favicon-selector {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .favicon-option {
    padding: 0.5rem;
    gap: 0.25rem;
  }
  
  .favicon-source {
    font-size: 0.7rem;
  }
}

/* Emoji选择器样式 */
.emoji-selector {
  margin-top: 0.5rem;
}

.emoji-select-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--button-bg, #f8f9fa);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.emoji-select-button:hover {
  background: var(--button-hover-bg, #e9ecef);
  border-color: var(--primary-color, #007bff);
}

.emoji-preview {
  font-size: 1.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--emoji-preview-bg, white);
  border-radius: 6px;
  border: 1px solid var(--border-color, #dee2e6);
}

.emoji-select-text {
  color: var(--text-color, #495057);
  font-size: 0.9rem;
}
</style>
