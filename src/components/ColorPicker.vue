<template>
  <div class="color-picker">
    <button
      type="button"
      class="color-preview"
      :style="{ backgroundColor: modelValue }"
      :aria-label="ariaLabel"
      @click="openPicker"
    ></button>
    <input
      ref="inputRef"
      class="fresh-color-input color-value"
      type="text"
      :value="modelValue"
      :aria-label="ariaLabel"
      maxlength="7"
      placeholder="#667eea"
      autocomplete="off"
      spellcheck="false"
      @click="syncColorisOptions"
      @input="handleInput"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import 'Coloris'
import 'Coloris/dist/coloris.css'

interface ColorisOptions {
  el?: string | HTMLElement
  wrap?: boolean
  theme?: 'default' | 'large' | 'polaroid' | 'pill'
  themeMode?: 'light' | 'dark' | 'auto'
  format?: 'hex' | 'rgb' | 'hsl' | 'auto' | 'mixed'
  alpha?: boolean
  swatches?: string[]
  focusInput?: boolean
}

interface ColorisApi {
  (options?: ColorisOptions): void
  close: (revert?: boolean) => void
}

declare global {
  interface Window {
    Coloris?: ColorisApi
  }
}

interface Props {
  modelValue: string
  swatches?: string[]
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  swatches: () => [],
  ariaLabel: 'Choose color'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6})$/i

const getThemeMode = (): 'light' | 'dark' => (
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
)

const syncColorisOptions = (): void => {
  window.Coloris?.({
    themeMode: getThemeMode(),
    swatches: props.swatches
  })
}

const openPicker = (): void => {
  syncColorisOptions()
  inputRef.value?.click()
}

const handleInput = (event: Event): void => {
  const value = (event.target as HTMLInputElement).value.trim()
  if (HEX_COLOR_PATTERN.test(value)) {
    emit('update:modelValue', value)
  }
}

const handleChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const value = input.value.trim()

  if (HEX_COLOR_PATTERN.test(value)) {
    emit('update:modelValue', value)
  } else {
    input.value = props.modelValue
  }
}

onMounted(() => {
  if (!window.Coloris || !inputRef.value) {
    return
  }

  window.Coloris({
    el: inputRef.value,
    wrap: false,
    theme: 'large',
    themeMode: getThemeMode(),
    format: 'hex',
    alpha: false,
    focusInput: false,
    swatches: props.swatches
  })
})
</script>

<style scoped>
.color-picker {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.color-preview {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border: 3px solid #fff;
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.color-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 2px #007bff, 0 3px 10px rgba(0, 0, 0, 0.14);
}

.color-preview:focus-visible {
  outline: 3px solid rgba(0, 123, 255, 0.25);
  outline-offset: 2px;
}

.color-value {
  width: 100%;
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 8px;
  background: var(--input-bg, #fff);
  color: var(--text-color, #333);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.color-value:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.12);
}

:global(.clr-picker) {
  z-index: 3100;
}
</style>
