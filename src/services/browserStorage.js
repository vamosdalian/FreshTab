const LOCAL_STORAGE_PREFIX = 'freshtab:'
const localListeners = new Set()

function getChromeStorageSync() {
  return globalThis.chrome?.storage?.sync || null
}

function readLocalValue(key) {
  const rawValue = globalThis.localStorage?.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
  if (rawValue === null || rawValue === undefined) {
    return undefined
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return rawValue
  }
}

function writeLocalValue(key, value) {
  const storageKey = `${LOCAL_STORAGE_PREFIX}${key}`
  const oldValue = readLocalValue(key)

  globalThis.localStorage?.setItem(storageKey, JSON.stringify(value))

  const changes = {
    [key]: {
      oldValue,
      newValue: value
    }
  }

  localListeners.forEach((listener) => listener(changes, 'sync'))
}

export async function getFromStorage(key) {
  const chromeStorageSync = getChromeStorageSync()
  if (chromeStorageSync) {
    return chromeStorageSync.get(key)
  }

  if (typeof key === 'string') {
    return { [key]: readLocalValue(key) }
  }

  if (Array.isArray(key)) {
    return key.reduce((result, currentKey) => {
      result[currentKey] = readLocalValue(currentKey)
      return result
    }, {})
  }

  return {}
}

export async function setToStorage(items) {
  const chromeStorageSync = getChromeStorageSync()
  if (chromeStorageSync) {
    return chromeStorageSync.set(items)
  }

  Object.entries(items).forEach(([key, value]) => {
    writeLocalValue(key, value)
  })
}

export function addStorageChangeListener(listener) {
  const chromeStorageOnChanged = globalThis.chrome?.storage?.onChanged
  if (chromeStorageOnChanged?.addListener) {
    chromeStorageOnChanged.addListener(listener)
    return
  }

  localListeners.add(listener)
}

export function hasChromeSearch() {
  return typeof globalThis.chrome !== 'undefined' && !!globalThis.chrome?.search?.query
}

export async function runChromeSearch(query) {
  if (!hasChromeSearch()) {
    throw new Error('Chrome search API unavailable')
  }

  return globalThis.chrome.search.query(query)
}
