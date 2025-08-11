import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from './useToast'

export function useWallpaper() {
  const { error, log } = useToast()
  
  // Silent debug logging function - only logs to console, no toast
  const debugLog = (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Wallpaper Debug] ${message}`)
    }
  }
  
  // 壁纸配置的默认值
  const getDefaultWallpaperSettings = () => ({
    wallpaperMode: 'bing', // 'bing', 'fixed', 'local'
    wallpaperUrl: '',
    wallpaperDate: '',
    wallpaperLocalPath: '',
    fixedWallpaperDate: ''
  })
  
  const wallpaperSettings = reactive(getDefaultWallpaperSettings())
  const isWallpaperLoaded = ref(false)
  const currentWallpaper = ref('')
  const wallpaperLoading = ref(false)
  const fixedWallpapers = ref([])
  const currentPage = ref(0)
  const wallpapersPerPage = 10
  
  // Auto-update functionality
  const autoUpdateTimer = ref(null)
  const lastCheckedDate = ref('')
  
  // Request deduplication system
  const activeRequests = ref(new Map()) // Map<dateString, Promise>
  const requestStates = ref(new Map()) // Map<dateString, 'pending' | 'completed' | 'failed'>
  const dailyRequestCache = ref(new Map()) // Map<dateString, { url: string, timestamp: number }>
  
  // 加载壁纸设置 - 增强版本，带重试机制
  const loadWallpaperSettings = async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await chrome.storage.sync.get(['wallpaperSettings'])
        const loadedData = result.wallpaperSettings || getDefaultWallpaperSettings()
        
        // 验证加载的数据结构
        if (typeof loadedData === 'object' && loadedData !== null) {
          Object.assign(wallpaperSettings, loadedData)
          isWallpaperLoaded.value = true
          
          if (attempt > 1) {
            debugLog(`壁纸设置在第${attempt}次尝试后成功加载`)
          }
          return
        } else {
          throw new Error('Invalid settings data structure')
        }
      } catch (chromeError) {
        if (attempt < retries) {
          const delayMs = calculateBackoffDelay(attempt, 500, 2000) // 较短的延迟
          debugLog(`加载壁纸设置失败，${delayMs}ms后重试第${attempt + 1}次: ${chromeError.message}`)
          await delay(delayMs)
        } else {
          debugLog(`加载壁纸设置失败，使用默认设置: ${chromeError.message}`)
          Object.assign(wallpaperSettings, getDefaultWallpaperSettings())
          isWallpaperLoaded.value = true
        }
      }
    }
  }
  
  // 保存壁纸设置 - 增强版本，带重试机制（静默保存，不显示toast）
  const saveWallpaperSettings = async (showToast = false, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // 验证设置数据
        const settingsToSave = { ...wallpaperSettings }
        if (typeof settingsToSave !== 'object' || settingsToSave === null) {
          throw new Error('Invalid settings data to save')
        }
        
        await chrome.storage.sync.set({ wallpaperSettings: settingsToSave })
        
        if (showToast) {
          log('壁纸设置已保存')
        }
        
        if (attempt > 1) {
          debugLog(`壁纸设置在第${attempt}次尝试后成功保存`)
        }
        return
      } catch (chromeError) {
        if (attempt < retries) {
          const delayMs = calculateBackoffDelay(attempt, 500, 2000) // 较短的延迟
          debugLog(`保存壁纸设置失败，${delayMs}ms后重试第${attempt + 1}次: ${chromeError.message}`)
          await delay(delayMs)
        } else {
          debugLog(`保存壁纸设置失败: ${chromeError.message}`)
        }
      }
    }
  }
  
  // 获取Bing每日一图 - 增强版本，带改进的错误处理和请求去重
  const getBingDailyWallpaper = async () => {
    try {
      wallpaperLoading.value = true
      const today = formatDateToString()
      
      // 验证今天的日期格式
      if (!isValidDateString(today)) {
        debugLog('日期格式无效，无法获取壁纸')
        wallpaperLoading.value = false
        return
      }
      
      // 清理过期的请求缓存
      cleanupExpiredRequestCache()
      
      // 检查是否有活跃的请求
      if (hasActiveRequest(today)) {
        debugLog('检测到相同日期的活跃请求，等待其完成')
        const waitSuccess = await waitForActiveRequest(today)
        if (waitSuccess) {
          // 使用等待完成的请求结果
          const cache = getDailyRequestCache(today)
          if (cache && cache.url) {
            const transitionSuccess = await transitionToWallpaper(cache.url)
            if (transitionSuccess) {
              wallpaperSettings.wallpaperUrl = cache.url
              wallpaperSettings.wallpaperDate = today
              await saveWallpaperSettings()
              wallpaperLoading.value = false
              return
            }
          }
        }
      }
      
      // 检查日期缓存
      if (hasDailyRequestCache(today)) {
        const cache = getDailyRequestCache(today)
        debugLog('使用日期缓存的壁纸')
        const transitionSuccess = await transitionToWallpaper(cache.url)
        if (transitionSuccess) {
          wallpaperSettings.wallpaperUrl = cache.url
          wallpaperSettings.wallpaperDate = today
          await saveWallpaperSettings()
          wallpaperLoading.value = false
          return
        } else {
          // 缓存的URL不可用，清除缓存并重新获取
          debugLog('缓存的壁纸URL不可用，清除缓存并重新获取')
          dailyRequestCache.value.delete(today)
        }
      }
      
      // 检查持久化缓存 - 使用新的日期比较函数
      if (compareDateStrings(wallpaperSettings.wallpaperDate, today) && wallpaperSettings.wallpaperUrl) {
        // 使用增强的过渡系统验证缓存的URL
        try {
          const transitionSuccess = await transitionToWallpaper(wallpaperSettings.wallpaperUrl)
          if (transitionSuccess) {
            // 更新日期缓存
            setDailyRequestCache(today, wallpaperSettings.wallpaperUrl)
            wallpaperLoading.value = false
            return
          } else {
            // 如果缓存的URL不可用，重新获取
            debugLog('持久化缓存的壁纸URL不可用，重新获取')
            await fetchBingWallpaperWithDeduplication(today)
          }
        } catch (preloadError) {
          // 如果缓存的URL不可用，静默重新获取
          debugLog(`持久化缓存壁纸验证失败: ${preloadError.message}，重新获取`)
          await fetchBingWallpaperWithDeduplication(today)
        }
      } else {
        // 获取新的壁纸
        await fetchBingWallpaperWithDeduplication(today)
      }
    } catch (err) {
      // 静默处理顶层错误，记录用于调试
      debugLog(`获取Bing每日壁纸过程中发生错误: ${err.message}`)
      wallpaperLoading.value = false
    }
  }
  
  // 预加载壁纸图片 - 增强版本，支持指数退避重试
  const preloadWallpaper = (url, timeout = 15000, maxRetries = 2) => {
    return new Promise((resolve, reject) => {
      let attempts = 0
      
      const attemptLoad = async () => {
        attempts++
        const img = new Image()
        
        // 设置超时
        const timeoutId = setTimeout(() => {
          img.onload = null
          img.onerror = null
          
          if (attempts < maxRetries) {
            const delayMs = calculateBackoffDelay(attempts)
            debugLog(`壁纸预加载超时，${delayMs}ms后进行第${attempts + 1}次重试`)
            setTimeout(attemptLoad, delayMs)
          } else {
            reject(new Error(`Failed to preload wallpaper after ${maxRetries} attempts: timeout`))
          }
        }, timeout)
        
        img.onload = () => {
          clearTimeout(timeoutId)
          if (attempts > 1) {
            debugLog(`壁纸预加载在第${attempts}次尝试后成功`)
          }
          resolve(url)
        }
        
        img.onerror = (event) => {
          clearTimeout(timeoutId)
          
          if (attempts < maxRetries) {
            const delayMs = calculateBackoffDelay(attempts)
            debugLog(`壁纸预加载失败，${delayMs}ms后进行第${attempts + 1}次重试`)
            setTimeout(attemptLoad, delayMs)
          } else {
            reject(new Error(`Failed to preload wallpaper after ${maxRetries} attempts: Image load error`))
          }
        }
        
        // 添加crossOrigin属性以处理跨域图片
        img.crossOrigin = 'anonymous'
        img.src = url
      }
      
      attemptLoad()
    })
  }
  
  // 平滑过渡到新壁纸 - 增强版本，带改进的错误处理
  const transitionToWallpaper = async (newUrl, fallbackUrl = null) => {
    // 处理空URL的情况
    if (!newUrl || typeof newUrl !== 'string') {
      debugLog('壁纸URL无效，保持当前壁纸')
      return false
    }
    
    // 验证URL格式
    try {
      new URL(newUrl)
    } catch (urlError) {
      debugLog(`壁纸URL格式无效: ${newUrl}`)
      return false
    }
    
    try {
      // 预加载新壁纸
      await preloadWallpaper(newUrl)
      
      // 如果预加载成功，平滑过渡到新壁纸
      const previousWallpaper = currentWallpaper.value
      currentWallpaper.value = newUrl
      
      // 记录成功的过渡
      debugLog(`壁纸已成功过渡: ${previousWallpaper ? '从旧壁纸' : '初始加载'} -> ${newUrl.substring(0, 50)}...`)
      
      return true
    } catch (preloadError) {
      debugLog(`壁纸预加载失败: ${preloadError.message}`)
      
      // 尝试使用fallback URL
      if (fallbackUrl && fallbackUrl !== newUrl && typeof fallbackUrl === 'string') {
        try {
          // 验证fallback URL格式
          new URL(fallbackUrl)
          
          await preloadWallpaper(fallbackUrl, 10000, 2) // 减少fallback的重试次数
          currentWallpaper.value = fallbackUrl
          debugLog(`使用fallback壁纸成功: ${fallbackUrl.substring(0, 50)}...`)
          return true
        } catch (fallbackError) {
          debugLog(`Fallback壁纸也失败: ${fallbackError.message}`)
        }
      }
      
      // 如果所有预加载都失败，但我们有当前壁纸，保持不变
      if (currentWallpaper.value) {
        debugLog('保持当前壁纸，避免显示空白')
        return false
      }
      
      // 最后的fallback：直接设置URL，让浏览器处理加载（仅在没有当前壁纸时）
      debugLog('使用直接设置作为最后的fallback')
      currentWallpaper.value = newUrl
      return false
    }
  }
  
  // 重试机制配置
  const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1秒基础延迟
    maxDelay: 10000, // 最大延迟10秒
    backoffFactor: 2 // 指数退避因子
  }
  
  // 计算指数退避延迟
  const calculateBackoffDelay = (attempt, baseDelay = RETRY_CONFIG.baseDelay, maxDelay = RETRY_CONFIG.maxDelay) => {
    const delay = baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1)
    return Math.min(delay, maxDelay)
  }
  
  // 延迟函数
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  
  // 带重试的API请求函数
  const fetchWithRetry = async (url, options = {}, retries = RETRY_CONFIG.maxRetries) => {
    let lastError = null
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // 设置请求超时
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        // 检查HTTP状态
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // 尝试解析JSON
        const data = await response.json()
        
        // 验证响应数据结构
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format')
        }
        
        // 成功返回数据
        if (attempt > 1) {
          debugLog(`API请求在第${attempt}次尝试后成功`)
        }
        return data
        
      } catch (err) {
        lastError = err
        
        // 记录重试信息（仅用于调试，不显示给用户）
        if (attempt < retries) {
          const delayMs = calculateBackoffDelay(attempt)
          debugLog(`API请求失败，${delayMs}ms后进行第${attempt + 1}次重试: ${err.message}`)
          await delay(delayMs)
        } else {
          // 最后一次重试失败，记录详细错误信息
          debugLog(`API请求在${retries}次重试后仍然失败: ${err.message}`)
        }
      }
    }
    
    // 所有重试都失败，抛出最后的错误
    throw lastError
  }
  
  // 带请求去重的Bing壁纸获取函数
  const fetchBingWallpaperWithDeduplication = async (date) => {
    // 验证是否应该执行请求
    if (!shouldExecuteRequest(date)) {
      // 如果有活跃请求，等待其完成
      if (hasActiveRequest(date)) {
        await waitForActiveRequest(date)
        const cache = getDailyRequestCache(date)
        if (cache && cache.url) {
          const transitionSuccess = await transitionToWallpaper(cache.url)
          if (transitionSuccess) {
            wallpaperSettings.wallpaperUrl = cache.url
            wallpaperSettings.wallpaperDate = date
            await saveWallpaperSettings()
          }
        }
      }
      // 如果有缓存，直接使用
      else if (hasDailyRequestCache(date)) {
        const cache = getDailyRequestCache(date)
        const transitionSuccess = await transitionToWallpaper(cache.url)
        if (transitionSuccess) {
          wallpaperSettings.wallpaperUrl = cache.url
          wallpaperSettings.wallpaperDate = date
          await saveWallpaperSettings()
        }
      }
      return
    }
    
    // 创建请求Promise并添加到活跃请求中
    const requestPromise = fetchBingWallpaper(date)
    activeRequests.value.set(date, requestPromise)
    requestStates.value.set(date, 'pending')
    
    try {
      const result = await requestPromise
      requestStates.value.set(date, 'completed')
      return result
    } catch (error) {
      requestStates.value.set(date, 'failed')
      // 清理活跃请求
      activeRequests.value.delete(date)
      throw error
    } finally {
      // 清理活跃请求（只在成功时清理，失败时已经在catch中清理）
      if (requestStates.value.get(date) === 'completed') {
        activeRequests.value.delete(date)
      }
    }
  }
  
  // 从API获取Bing壁纸 - 增强版本，带重试和错误处理
  const fetchBingWallpaper = async (date) => {
    try {
      // 使用带重试的API请求
      const data = await fetchWithRetry(`https://bing.ee123.net/img/4k?type=json&date=${date}`)
      
      // 验证响应数据
      if (!data.imgurl || typeof data.imgurl !== 'string') {
        throw new Error('Invalid wallpaper URL in API response')
      }
      
      // 验证URL格式
      try {
        new URL(data.imgurl)
      } catch (urlError) {
        throw new Error('Invalid URL format in API response')
      }
      
      // 使用增强的过渡系统
      const transitionSuccess = await transitionToWallpaper(
        data.imgurl, 
        wallpaperSettings.wallpaperUrl // 使用当前壁纸作为fallback
      )
      
      // 无论过渡是否成功，都更新设置
      wallpaperSettings.wallpaperUrl = data.imgurl
      wallpaperSettings.wallpaperDate = date
      await saveWallpaperSettings()
      
      // 设置日期缓存
      setDailyRequestCache(date, data.imgurl)
      
      if (transitionSuccess) {
        debugLog('Bing壁纸更新成功')
      } else {
        debugLog('Bing壁纸更新完成（使用fallback机制）')
      }
      
    } catch (err) {
      // 静默处理错误，不显示给用户，但记录用于调试
      await handleWallpaperFetchError(err, date)
      // 重新抛出错误以便请求去重系统能够正确处理
      throw err
    } finally {
      wallpaperLoading.value = false
    }
  }
  
  // 处理壁纸获取错误的fallback策略
  const handleWallpaperFetchError = async (error, date) => {
    debugLog(`壁纸获取失败，启用fallback策略: ${error.message}`)
    
    // Fallback策略1: 尝试使用缓存的壁纸
    if (wallpaperSettings.wallpaperUrl && wallpaperSettings.wallpaperDate) {
      try {
        const fallbackSuccess = await transitionToWallpaper(wallpaperSettings.wallpaperUrl)
        if (fallbackSuccess) {
          debugLog('使用缓存壁纸作为fallback成功')
          return
        }
      } catch (fallbackError) {
        debugLog(`缓存壁纸fallback失败: ${fallbackError.message}`)
      }
    }
    
    // Fallback策略2: 尝试获取前一天的壁纸
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = formatDateToString(yesterday)
      
      if (isValidDateString(yesterdayStr) && yesterdayStr !== date) {
        debugLog('尝试获取前一天的壁纸作为fallback')
        const fallbackData = await fetchWithRetry(
          `https://bing.ee123.net/img/4k?type=json&date=${yesterdayStr}`,
          {},
          2 // 减少重试次数
        )
        
        if (fallbackData && fallbackData.imgurl) {
          const fallbackSuccess = await transitionToWallpaper(fallbackData.imgurl)
          if (fallbackSuccess) {
            // 不更新日期，保持当前日期以便下次重试
            wallpaperSettings.wallpaperUrl = fallbackData.imgurl
            await saveWallpaperSettings()
            debugLog('使用前一天壁纸作为fallback成功')
            return
          }
        }
      }
    } catch (fallbackError) {
      debugLog(`前一天壁纸fallback失败: ${fallbackError.message}`)
    }
    
    // Fallback策略3: 保持当前壁纸不变
    if (currentWallpaper.value) {
      debugLog('保持当前壁纸，等待下次自动重试')
    } else {
      debugLog('无可用的fallback壁纸，将在下次检查时重试')
    }
  }
  
  // 获取固定壁纸列表 - 增强版本，带错误处理
  const getFixedWallpapers = async (page = 0) => {
    try {
      wallpaperLoading.value = true
      const wallpapers = []
      const today = new Date()
      
      for (let i = 0; i < wallpapersPerPage; i++) {
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() - (page * wallpapersPerPage + i))
        const dateStr = formatDateToString(targetDate)
        
        // 验证生成的日期格式
        if (!isValidDateString(dateStr)) {
          debugLog(`跳过无效日期: ${dateStr}`)
          continue
        }
        
        const imageUrl = `https://bing.ee123.net/img/?date=${dateStr}&size=320x240`
        wallpapers.push({
          date: dateStr,
          previewUrl: imageUrl,
          fullUrl: `https://bing.ee123.net/img/?date=${dateStr}&size=4k`,
          displayDate: targetDate.toLocaleDateString('zh-CN')
        })
      }
      
      if (page === 0) {
        fixedWallpapers.value = wallpapers
      } else {
        fixedWallpapers.value.push(...wallpapers)
      }
      
      currentPage.value = page
      
      if (wallpapers.length > 0) {
        debugLog(`成功加载${wallpapers.length}个固定壁纸选项`)
      }
      
    } catch (err) {
      // 静默处理错误，记录用于调试
      debugLog(`获取壁纸列表失败: ${err.message}`)
    } finally {
      wallpaperLoading.value = false
    }
  }
  
  // 选择固定壁纸 - 增强版本，带错误处理
  const selectFixedWallpaper = async (wallpaper) => {
    try {
      wallpaperLoading.value = true
      
      // 验证壁纸对象
      if (!wallpaper || !wallpaper.fullUrl || !wallpaper.date) {
        debugLog('无效的壁纸对象')
        return
      }
      
      // 使用过渡系统应用新壁纸
      const transitionSuccess = await transitionToWallpaper(
        wallpaper.fullUrl,
        currentWallpaper.value // 使用当前壁纸作为fallback
      )
      
      wallpaperSettings.wallpaperMode = 'fixed'
      wallpaperSettings.fixedWallpaperDate = wallpaper.date
      wallpaperSettings.wallpaperUrl = wallpaper.fullUrl
      await saveWallpaperSettings()
      
      if (transitionSuccess) {
        log(`已选择 ${wallpaper.displayDate} 的壁纸`)
      } else {
        log(`已选择 ${wallpaper.displayDate} 的壁纸（使用fallback机制）`)
      }
    } catch (err) {
      // 静默处理错误，记录用于调试
      debugLog(`设置壁纸失败: ${err.message}`)
    } finally {
      wallpaperLoading.value = false
    }
  }
  
  // 上传本地图片 - 增强版本，带错误处理
  const uploadLocalWallpaper = async (file) => {
    try {
      // 验证文件
      if (!file) {
        error('未选择文件')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        error('请选择有效的图片文件')
        return
      }
      
      // 检查文件大小（限制为10MB）
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        error('图片文件过大，请选择小于10MB的图片')
        return
      }
      
      wallpaperLoading.value = true
      
      // 创建本地 URL
      const localUrl = URL.createObjectURL(file)
      
      // 使用过渡系统应用本地壁纸
      const transitionSuccess = await transitionToWallpaper(
        localUrl,
        currentWallpaper.value // 使用当前壁纸作为fallback
      )
      
      wallpaperSettings.wallpaperMode = 'local'
      wallpaperSettings.wallpaperLocalPath = localUrl
      wallpaperSettings.wallpaperUrl = localUrl
      await saveWallpaperSettings()
      
      if (transitionSuccess) {
        log('本地壁纸设置成功')
      } else {
        log('本地壁纸设置成功（使用fallback机制）')
      }
    } catch (err) {
      // 静默处理错误，记录用于调试
      debugLog(`上传本地壁纸失败: ${err.message}`)
    } finally {
      wallpaperLoading.value = false
    }
  }
  
  // 加载下一页壁纸
  const loadMoreWallpapers = () => {
    getFixedWallpapers(currentPage.value + 1)
  }
  
  // 日期格式化工具函数
  const formatDateToString = (date = new Date()) => {
    return date.toISOString().split('T')[0].replace(/-/g, '')
  }
  
  // 验证日期字符串格式 (YYYYMMDD)
  const isValidDateString = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || dateString.length !== 8) {
      return false
    }
    
    const year = parseInt(dateString.substring(0, 4))
    const month = parseInt(dateString.substring(4, 6))
    const day = parseInt(dateString.substring(6, 8))
    
    // 基本范围检查
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false
    }
    
    // 创建日期对象验证日期是否真实存在
    const testDate = new Date(year, month - 1, day)
    return testDate.getFullYear() === year && 
           testDate.getMonth() === month - 1 && 
           testDate.getDate() === day
  }
  
  // 比较两个日期字符串
  const compareDateStrings = (date1, date2) => {
    // 验证日期格式
    if (!isValidDateString(date1) || !isValidDateString(date2)) {
      return false
    }
    
    return date1 === date2
  }
  
  // Request deduplication functions
  
  // 检查是否已有相同日期的请求正在进行
  const hasActiveRequest = (dateString) => {
    return activeRequests.value.has(dateString) && requestStates.value.get(dateString) === 'pending'
  }
  
  // 检查是否已有相同日期的成功请求缓存
  const hasDailyRequestCache = (dateString) => {
    const cache = dailyRequestCache.value.get(dateString)
    if (!cache) return false
    
    // 检查缓存是否在同一天内（防止跨天使用旧缓存）
    const cacheDate = new Date(cache.timestamp)
    const today = new Date()
    const isSameDay = cacheDate.toDateString() === today.toDateString()
    
    return isSameDay && Boolean(cache.url)
  }
  
  // 获取日期的缓存结果
  const getDailyRequestCache = (dateString) => {
    return dailyRequestCache.value.get(dateString)
  }
  
  // 设置日期的缓存结果
  const setDailyRequestCache = (dateString, url) => {
    dailyRequestCache.value.set(dateString, {
      url,
      timestamp: Date.now()
    })
  }
  
  // 清理过期的请求缓存（保留当天和前一天的缓存）
  const cleanupExpiredRequestCache = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const todayStr = formatDateToString(today)
    const yesterdayStr = formatDateToString(yesterday)
    
    // 清理activeRequests中已完成的请求
    for (const [dateString, promise] of activeRequests.value.entries()) {
      const state = requestStates.value.get(dateString)
      if (state !== 'pending') {
        activeRequests.value.delete(dateString)
      }
    }
    
    // 清理过期的请求状态
    for (const [dateString] of requestStates.value.entries()) {
      if (dateString !== todayStr && dateString !== yesterdayStr) {
        requestStates.value.delete(dateString)
      }
    }
    
    // 清理过期的日期缓存
    for (const [dateString] of dailyRequestCache.value.entries()) {
      if (dateString !== todayStr && dateString !== yesterdayStr) {
        dailyRequestCache.value.delete(dateString)
      }
    }
  }
  
  // 等待现有请求完成
  const waitForActiveRequest = async (dateString) => {
    const activeRequest = activeRequests.value.get(dateString)
    if (activeRequest) {
      try {
        await activeRequest
        return true
      } catch (error) {
        debugLog(`等待现有请求完成时发生错误: ${error.message}`)
        return false
      }
    }
    return false
  }
  
  // 验证请求是否应该被执行（防止重复请求）
  const shouldExecuteRequest = (dateString) => {
    // 检查是否有活跃的请求
    if (hasActiveRequest(dateString)) {
      debugLog(`跳过重复请求，日期 ${dateString} 已有请求正在进行`)
      return false
    }
    
    // 检查是否有当天的缓存
    if (hasDailyRequestCache(dateString)) {
      debugLog(`跳过重复请求，日期 ${dateString} 已有缓存结果`)
      return false
    }
    
    return true
  }
  
  // 检查日期是否发生变化 - 增强版本，带静默错误处理
  const checkForDateChange = async () => {
    try {
      const today = formatDateToString()
      
      // 验证当前日期格式
      if (!isValidDateString(today)) {
        debugLog('日期格式验证失败，跳过此次检查')
        return
      }
      
      // 只在Bing模式下检查日期变化
      if (wallpaperSettings.wallpaperMode === 'bing') {
        // 检查是否需要更新壁纸
        const needsUpdate = !compareDateStrings(lastCheckedDate.value, today) || 
                           !compareDateStrings(wallpaperSettings.wallpaperDate, today) ||
                           !wallpaperSettings.wallpaperUrl
        
        if (needsUpdate) {
          // 更新最后检查日期
          lastCheckedDate.value = today
          
          // 触发壁纸更新
          await getBingDailyWallpaper()
          
          // 记录日期变化检测（用于调试）
          debugLog(`日期变化检测: 从 ${wallpaperSettings.wallpaperDate} 更新到 ${today}`)
        }
      }
    } catch (err) {
      // 静默处理错误，避免影响定时器继续运行
      debugLog(`日期变化检测过程中发生错误: ${err.message}`)
    }
  }
  
  // 检测日期变化并验证缓存有效性 - 增强版本，带错误处理
  const detectDateChangeAndValidateCache = async () => {
    try {
      const currentDate = formatDateToString()
      
      // 验证当前日期格式
      if (!isValidDateString(currentDate)) {
        debugLog('当前日期格式无效，跳过缓存验证')
        return false
      }
      
      // 验证缓存的壁纸日期
      if (wallpaperSettings.wallpaperDate && !isValidDateString(wallpaperSettings.wallpaperDate)) {
        debugLog('检测到无效的缓存日期格式，清理缓存')
        wallpaperSettings.wallpaperDate = ''
        wallpaperSettings.wallpaperUrl = ''
        await saveWallpaperSettings()
      }
      
      // 检查日期变化
      if (wallpaperSettings.wallpaperMode === 'bing') {
        const hasDateChanged = !compareDateStrings(wallpaperSettings.wallpaperDate, currentDate)
        const hasCachedWallpaper = wallpaperSettings.wallpaperUrl && wallpaperSettings.wallpaperDate
        
        if (hasDateChanged || !hasCachedWallpaper) {
          debugLog(`日期变化检测触发更新: 缓存日期=${wallpaperSettings.wallpaperDate}, 当前日期=${currentDate}`)
          await getBingDailyWallpaper()
          return true
        }
      }
      
      return false
    } catch (err) {
      // 静默处理错误
      debugLog(`缓存验证过程中发生错误: ${err.message}`)
      return false
    }
  }
  
  // 启动自动更新定时器
  const startAutoUpdateTimer = () => {
    // 清除现有定时器
    stopAutoUpdateTimer()
    
    // 只在Bing模式下启动定时器
    if (wallpaperSettings.wallpaperMode === 'bing') {
      // 立即进行日期变化检测和缓存验证
      detectDateChangeAndValidateCache()
      
      // 每分钟检查一次日期变化
      autoUpdateTimer.value = setInterval(() => {
        checkForDateChange()
      }, 60000) // 60秒 = 1分钟
    }
  }
  
  // 停止自动更新定时器
  const stopAutoUpdateTimer = () => {
    if (autoUpdateTimer.value) {
      clearInterval(autoUpdateTimer.value)
      autoUpdateTimer.value = null
    }
  }
  
  // 初始化壁纸
  const initializeWallpaper = async () => {
    switch (wallpaperSettings.wallpaperMode) {
      case 'bing':
        await getBingDailyWallpaper()
        // 启动自动更新定时器
        startAutoUpdateTimer()
        break
      case 'fixed':
        // 如果已有选中的壁纸，直接使用
        if (wallpaperSettings.wallpaperUrl && wallpaperSettings.fixedWallpaperDate) {
          currentWallpaper.value = wallpaperSettings.wallpaperUrl
        } else {
          // 如果没有选中的壁纸，则加载壁纸列表
          await getFixedWallpapers(0)
        }
        // 停止自动更新定时器
        stopAutoUpdateTimer()
        break
      case 'local':
        if (wallpaperSettings.wallpaperLocalPath) {
          currentWallpaper.value = wallpaperSettings.wallpaperLocalPath
        }
        // 停止自动更新定时器
        stopAutoUpdateTimer()
        break
    }
  }
  
  // 监听壁纸模式变化
  watch(() => wallpaperSettings.wallpaperMode, async (newMode) => {
    // 只在设置加载完成后才响应模式变化
    if (!isWallpaperLoaded.value) return
    
    switch (newMode) {
      case 'bing':
        await getBingDailyWallpaper()
        // 启动自动更新定时器
        startAutoUpdateTimer()
        break
      case 'fixed':
        // 停止自动更新定时器
        stopAutoUpdateTimer()
        // 如果已有选中的壁纸，直接使用，否则加载列表
        if (wallpaperSettings.wallpaperUrl && wallpaperSettings.fixedWallpaperDate) {
          currentWallpaper.value = wallpaperSettings.wallpaperUrl
        } else {
          await getFixedWallpapers(0)
        }
        break
      case 'local':
        // 停止自动更新定时器
        stopAutoUpdateTimer()
        // 保持当前本地壁纸
        if (wallpaperSettings.wallpaperLocalPath) {
          currentWallpaper.value = wallpaperSettings.wallpaperLocalPath
        }
        break
    }
    await saveWallpaperSettings() // 静默保存，不显示toast
  })
  
  // 监听壁纸URL变化
  watch(() => wallpaperSettings.wallpaperUrl, (newUrl) => {
    if (newUrl) {
      currentWallpaper.value = newUrl
    }
  })
  
  // 监听本地壁纸路径变化
  watch(() => wallpaperSettings.wallpaperLocalPath, (newPath) => {
    if (newPath && wallpaperSettings.wallpaperMode === 'local') {
      currentWallpaper.value = newPath
    }
  })
  
  // 监听固定壁纸日期变化
  watch(() => wallpaperSettings.fixedWallpaperDate, (newDate) => {
    if (newDate && wallpaperSettings.wallpaperMode === 'fixed' && wallpaperSettings.wallpaperUrl) {
      currentWallpaper.value = wallpaperSettings.wallpaperUrl
    }
  })
  
  // 监听设置加载完成
  watch(isWallpaperLoaded, (loaded) => {
    if (loaded) {
      initializeWallpaper()
    }
  })

  onMounted(async () => {
    await loadWallpaperSettings()
    // 如果已经加载完成，立即初始化
    if (isWallpaperLoaded.value) {
      initializeWallpaper()
    }
  })
  
  // 组件卸载时清理定时器和请求缓存
  onUnmounted(() => {
    stopAutoUpdateTimer()
    // 清理请求去重相关的状态
    activeRequests.value.clear()
    requestStates.value.clear()
    dailyRequestCache.value.clear()
  })
  
  return {
    wallpaperSettings,
    isWallpaperLoaded,
    currentWallpaper,
    wallpaperLoading,
    fixedWallpapers,
    currentPage,
    getBingDailyWallpaper,
    getFixedWallpapers,
    selectFixedWallpaper,
    uploadLocalWallpaper,
    loadMoreWallpapers,
    initializeWallpaper,
    saveWallpaperSettings,
    startAutoUpdateTimer,
    stopAutoUpdateTimer,
    checkForDateChange,
    detectDateChangeAndValidateCache,
    formatDateToString,
    isValidDateString,
    compareDateStrings,
    preloadWallpaper,
    transitionToWallpaper,
    fetchWithRetry,
    handleWallpaperFetchError,
    calculateBackoffDelay,
    // Request deduplication functions
    hasActiveRequest,
    hasDailyRequestCache,
    getDailyRequestCache,
    setDailyRequestCache,
    cleanupExpiredRequestCache,
    waitForActiveRequest,
    shouldExecuteRequest,
    fetchBingWallpaperWithDeduplication,
    // Internal state for testing
    activeRequests,
    requestStates,
    dailyRequestCache
  }
}
