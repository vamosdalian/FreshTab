import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from './useToast'

export function useWallpaper() {
  const { error, warning, log } = useToast()
  
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
  
  // 加载壁纸设置
  const loadWallpaperSettings = async () => {
    try {
      const result = await chrome.storage.sync.get(['wallpaperSettings'])
      const loadedData = result.wallpaperSettings || getDefaultWallpaperSettings()
      
      Object.assign(wallpaperSettings, loadedData)
      isWallpaperLoaded.value = true
    } catch (chromeError) {
      error('加载壁纸设置失败，使用默认设置')
      Object.assign(wallpaperSettings, getDefaultWallpaperSettings())
      isWallpaperLoaded.value = true
    }
  }
  
  // 保存壁纸设置
  const saveWallpaperSettings = async () => {
    try {
      await chrome.storage.sync.set({ wallpaperSettings: { ...wallpaperSettings } })
      log('壁纸设置已保存')
    } catch (chromeError) {
      error('保存壁纸设置失败')
    }
  }
  
  // 获取Bing每日一图
  const getBingDailyWallpaper = async () => {
    try {
      wallpaperLoading.value = true
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      
      // 检查缓存
      if (wallpaperSettings.wallpaperDate === today && wallpaperSettings.wallpaperUrl) {
        // 检查URL是否可访问（可能已被浏览器缓存）
        const img = new Image()
        img.onload = () => {
          currentWallpaper.value = wallpaperSettings.wallpaperUrl
          wallpaperLoading.value = false
        }
        img.onerror = () => {
          // 如果缓存的URL不可用，重新获取
          fetchBingWallpaper(today)
        }
        img.src = wallpaperSettings.wallpaperUrl
      } else {
        // 获取新的壁纸
        await fetchBingWallpaper(today)
      }
    } catch (err) {
      error('获取Bing每日壁纸失败')
      wallpaperLoading.value = false
    }
  }
  
  // 从API获取Bing壁纸
  const fetchBingWallpaper = async (date) => {
    try {
      const response = await fetch('https://bing.ee123.net/img/4k?type=json')
      const data = await response.json()
      
      if (data && data.imgurl) {
        wallpaperSettings.wallpaperUrl = data.imgurl
        wallpaperSettings.wallpaperDate = date
        currentWallpaper.value = data.imgurl
        await saveWallpaperSettings()
        log('Bing每日壁纸已更新')
      }
    } catch (err) {
      error('获取Bing壁纸API失败')
    } finally {
      wallpaperLoading.value = false
    }
  }
  
  // 获取固定壁纸列表
  const getFixedWallpapers = async (page = 0) => {
    try {
      wallpaperLoading.value = true
      const wallpapers = []
      const today = new Date()
      
      for (let i = 0; i < wallpapersPerPage; i++) {
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() - (page * wallpapersPerPage + i))
        const dateStr = targetDate.toISOString().split('T')[0].replace(/-/g, '')
        
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
    } catch (err) {
      error('获取壁纸列表失败')
    } finally {
      wallpaperLoading.value = false
    }
  }
  
  // 选择固定壁纸
  const selectFixedWallpaper = async (wallpaper) => {
    try {
      wallpaperSettings.wallpaperMode = 'fixed'
      wallpaperSettings.fixedWallpaperDate = wallpaper.date
      wallpaperSettings.wallpaperUrl = wallpaper.fullUrl
      currentWallpaper.value = wallpaper.fullUrl
      await saveWallpaperSettings()
      log(`已选择 ${wallpaper.displayDate} 的壁纸`)
    } catch (err) {
      error('设置固定壁纸失败')
    }
  }
  
  // 上传本地图片
  const uploadLocalWallpaper = async (file) => {
    try {
      if (!file || !file.type.startsWith('image/')) {
        error('请选择有效的图片文件')
        return
      }
      
      wallpaperLoading.value = true
      
      // 创建本地 URL
      const localUrl = URL.createObjectURL(file)
      
      wallpaperSettings.wallpaperMode = 'local'
      wallpaperSettings.wallpaperLocalPath = localUrl
      wallpaperSettings.wallpaperUrl = localUrl
      currentWallpaper.value = localUrl
      await saveWallpaperSettings()
      wallpaperLoading.value = false
      log('本地壁纸已设置')
    } catch (err) {
      error('上传本地壁纸失败')
      wallpaperLoading.value = false
    }
  }
  
  // 加载下一页壁纸
  const loadMoreWallpapers = () => {
    getFixedWallpapers(currentPage.value + 1)
  }
  
  // 初始化壁纸
  const initializeWallpaper = async () => {
    switch (wallpaperSettings.wallpaperMode) {
      case 'bing':
        await getBingDailyWallpaper()
        break
      case 'fixed':
        // 如果已有选中的壁纸，直接使用
        if (wallpaperSettings.wallpaperUrl && wallpaperSettings.fixedWallpaperDate) {
          currentWallpaper.value = wallpaperSettings.wallpaperUrl
        } else {
          // 如果没有选中的壁纸，则加载壁纸列表
          await getFixedWallpapers(0)
        }
        break
      case 'local':
        if (wallpaperSettings.wallpaperLocalPath) {
          currentWallpaper.value = wallpaperSettings.wallpaperLocalPath
        }
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
        break
      case 'fixed':
        // 如果已有选中的壁纸，直接使用，否则加载列表
        if (wallpaperSettings.wallpaperUrl && wallpaperSettings.fixedWallpaperDate) {
          currentWallpaper.value = wallpaperSettings.wallpaperUrl
        } else {
          await getFixedWallpapers(0)
        }
        break
      case 'local':
        // 保持当前本地壁纸
        if (wallpaperSettings.wallpaperLocalPath) {
          currentWallpaper.value = wallpaperSettings.wallpaperLocalPath
        }
        break
    }
    await saveWallpaperSettings()
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
    saveWallpaperSettings
  }
}
