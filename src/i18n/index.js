import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US']
export const DEFAULT_LOCALE = 'zh-CN'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export function resolveSupportedLocale(locale) {
  if (!locale || typeof locale !== 'string') {
    return DEFAULT_LOCALE
  }

  const normalized = locale.trim().replace('_', '-').toLowerCase()

  if (normalized.startsWith('zh')) {
    return 'zh-CN'
  }

  if (normalized.startsWith('en')) {
    return 'en-US'
  }

  return DEFAULT_LOCALE
}

export function detectBrowserLocale() {
  const chromeLocale = globalThis.chrome?.i18n?.getUILanguage?.()
  if (chromeLocale) {
    return resolveSupportedLocale(chromeLocale)
  }

  return resolveSupportedLocale(globalThis.navigator?.language)
}

export function createAppI18n(locale = DEFAULT_LOCALE) {
  return createI18n({
    legacy: false,
    locale: resolveSupportedLocale(locale),
    fallbackLocale: DEFAULT_LOCALE,
    messages
  })
}

export let i18nInstance = null

export function setI18nInstance(instance) {
  i18nInstance = instance
}

export function setI18nLocale(locale) {
  if (!i18nInstance) {
    return DEFAULT_LOCALE
  }

  const nextLocale = resolveSupportedLocale(locale)
  i18nInstance.global.locale.value = nextLocale
  return nextLocale
}

export function translate(key, params = {}) {
  if (!i18nInstance) {
    return key
  }

  return i18nInstance.global.t(key, params)
}
