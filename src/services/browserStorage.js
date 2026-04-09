const LOCAL_STORAGE_PREFIX = 'freshtab:'
const localAreaListeners = {
  sync: new Set(),
  local: new Set()
}

function getChromeStorageArea(area = 'sync') {
  return globalThis.chrome?.storage?.[area] || null
}

function getLocalStorageKey(area, key) {
  return `${LOCAL_STORAGE_PREFIX}${area}:${key}`
}

function readLocalValue(area, key) {
  const rawValue = globalThis.localStorage?.getItem(getLocalStorageKey(area, key))
  if (rawValue === null || rawValue === undefined) {
    return undefined
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return rawValue
  }
}

function writeLocalValue(area, key, value) {
  const storageKey = getLocalStorageKey(area, key)
  const oldValue = readLocalValue(area, key)

  globalThis.localStorage?.setItem(storageKey, JSON.stringify(value))

  const changes = {
    [key]: {
      oldValue,
      newValue: value
    }
  }

  localAreaListeners[area]?.forEach((listener) => listener(changes, area))
}

export async function getFromStorage(key, area = 'sync') {
  const chromeStorageArea = getChromeStorageArea(area)
  if (chromeStorageArea) {
    return chromeStorageArea.get(key)
  }

  if (typeof key === 'string') {
    return { [key]: readLocalValue(area, key) }
  }

  if (Array.isArray(key)) {
    return key.reduce((result, currentKey) => {
      result[currentKey] = readLocalValue(area, currentKey)
      return result
    }, {})
  }

  return {}
}

export async function setToStorage(items, area = 'sync') {
  const chromeStorageArea = getChromeStorageArea(area)
  if (chromeStorageArea) {
    return chromeStorageArea.set(items)
  }

  Object.entries(items).forEach(([key, value]) => {
    writeLocalValue(area, key, value)
  })
}

export function addStorageChangeListener(listener, area = 'sync') {
  const chromeStorageOnChanged = globalThis.chrome?.storage?.onChanged
  if (chromeStorageOnChanged?.addListener) {
    chromeStorageOnChanged.addListener((changes, areaName) => {
      if (areaName === area) {
        listener(changes, areaName)
      }
    })
    return
  }

  localAreaListeners[area]?.add(listener)
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
