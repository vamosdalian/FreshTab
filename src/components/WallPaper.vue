<template>
    <div 
      class="wallpaper-background"
      :style="wallpaperStyle"
    ></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getConfig, setConfig, onConfigChange } from '../services/configManager'

const config = ref({})
const currentWallpaper = ref('')

const wallpaperStyle = computed(() => {
  if (currentWallpaper.value) {
    return {
      background: `url(${currentWallpaper.value}) center/cover no-repeat`,
    }
  }
  return {}
})

async function fetchBingWallpaper() {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const response = await fetch(`https://bing.ee123.net/img/4k?type=json&date=${today}`)
    const data = await response.json()
    
    if (data && data.imgurl) {
      if (data.imgurl !== config.value.wallpaperPath) {
        config.value.wallpaperPath = data.imgurl
        await setConfig(config.value)
      }
      
      // Preload image before updating currentWallpaper to avoid loading stutter
      const img = new Image()
      img.onload = () => {
        currentWallpaper.value = data.imgurl
      }
      img.onerror = () => {
        console.error('Failed to preload wallpaper image:', data.imgurl)
      }
      img.src = data.imgurl
    }
  } catch (error) {
    console.error('Failed to fetch Bing wallpaper:', error)
  }
}

async function updateWallpaper() {
  if (config.value.wallpaperMode === 'bing') {
    await fetchBingWallpaper()
  } else {
    currentWallpaper.value = config.value.wallpaperPath || ''
  }
}

function handleConfigChange(newConfig) {
  config.value = newConfig
  updateWallpaper()
  console.log('Wallpaper config updated:', config.value)
}

onMounted(async () => {
  config.value = await getConfig()
  
  // Apply current wallpaper immediately if available
  if (config.value.wallpaperPath) {
    currentWallpaper.value = config.value.wallpaperPath
  }
  console.log('Wallpaper init config:', config.value)
  
  // Then fetch latest wallpaper asynchronously
  updateWallpaper()
  
  onConfigChange(handleConfigChange)
})

</script>

<style lang="scss" scoped>
.wallpaper-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: opacity 0.3s ease;
}
</style>