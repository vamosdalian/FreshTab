import { ref, onMounted, watch } from 'vue'
import { useToast } from './useToast'

export function useWallpaper(settings) {
  const { error, warning, log } = useToast()
  
  const currentWallpaper = ref('')
  const wallpaperLoading = ref(false)
  const fixedWallpapers = ref([])
  const currentPage = ref(0)
  const wallpapersPerPage = 10
  
  // 获取Bing每日一图
  const getBingDailyWallpaper = async () => {
    try {
      wallpaperLoading.value = true
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      
      // 检查缓存
      if (settings.wallpaperDate === today && settings.wallpaperUrl) {
        // 检查URL是否可访问（可能已被浏览器缓存）
        const img = new Image()
        img.onload = () => {
          currentWallpaper.value = settings.wallpaperUrl
          wallpaperLoading.value = false
        }
        img.onerror = () => {
          // 如果缓存的URL不可用，重新获取
          fetchBingWallpaper(today)
        }
        img.src = settings.wallpaperUrl
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
        settings.wallpaperUrl = data.imgurl
        settings.wallpaperDate = date
        currentWallpaper.value = data.imgurl
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
      settings.wallpaperMode = 'fixed'
      settings.fixedWallpaperDate = wallpaper.date
      settings.wallpaperUrl = wallpaper.fullUrl
      currentWallpaper.value = wallpaper.fullUrl
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
      
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        error('图片文件大小不能超过5MB')
        return
      }
      
      wallpaperLoading.value = true
      
      // 转换为base64存储
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Data = e.target.result
        settings.wallpaperMode = 'local'
        settings.wallpaperLocalPath = base64Data
        settings.wallpaperUrl = base64Data
        currentWallpaper.value = base64Data
        wallpaperLoading.value = false
        log('本地壁纸已上传')
      }
      
      reader.onerror = () => {
        error('读取图片文件失败')
        wallpaperLoading.value = false
      }
      
      reader.readAsDataURL(file)
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
    switch (settings.wallpaperMode) {
      case 'bing':
        await getBingDailyWallpaper()
        break
      case 'fixed':
        if (settings.wallpaperUrl) {
          currentWallpaper.value = settings.wallpaperUrl
        }
        break
      case 'local':
        if (settings.wallpaperLocalPath) {
          currentWallpaper.value = settings.wallpaperLocalPath
        }
        break
    }
  }
  
  // 监听壁纸模式变化
  watch(() => settings.wallpaperMode, (newMode) => {
    switch (newMode) {
      case 'bing':
        getBingDailyWallpaper()
        break
      case 'fixed':
        getFixedWallpapers(0)
        break
      case 'local':
        // 保持当前本地壁纸
        break
    }
  })
  
  onMounted(() => {
    initializeWallpaper()
  })
  
  return {
    currentWallpaper,
    wallpaperLoading,
    fixedWallpapers,
    currentPage,
    getBingDailyWallpaper,
    getFixedWallpapers,
    selectFixedWallpaper,
    uploadLocalWallpaper,
    loadMoreWallpapers,
    initializeWallpaper
  }
}
