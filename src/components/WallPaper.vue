<template>
  <div class="wallpaper-background" :style="wallpaperStyle"></div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settingsStore';

const settingsStore = useSettingsStore();

const wallpaperPath = computed(() => settingsStore.settings.wallpaperPath)
const wallpaperMode = computed(() => settingsStore.settings.wallpaperMode)

const currentWallpaper = ref('')
const wallpaperStyle = computed(() => {
  if (currentWallpaper.value) {
    return {
      background: `url(${currentWallpaper.value}) center/cover no-repeat`,
    }
  }
  return {}
})

function loadWallpaperImage(imageUrl) {
  if (!imageUrl) return

  const img = new Image()
  img.onload = () => {
    currentWallpaper.value = imageUrl
  }
  img.onerror = () => {
    console.error('Failed to preload wallpaper image:', imageUrl)
  }
  img.src = imageUrl
}

async function fetchBingWallpaper() {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const response = await fetch(`https://bing.ee123.net/img/4k?type=json&date=${today}`)
    const data = await response.json()

    if (data && data.imgurl && data.imgurl !== wallpaperPath.value) {
      await settingsStore.updateSettings({ "wallpaperPath": data.imgurl })
    }
  } catch (error) {
    console.error('Failed to fetch Bing wallpaper:', error)
  }
}

onMounted(async () => {
  loadWallpaperImage(wallpaperPath.value)

  if (wallpaperMode.value === 'bing') {
    await fetchBingWallpaper()
  }
})

// Watch for wallpaperPath changes and update wallpaper accordingly
watch(wallpaperPath, (newPath) => {
  loadWallpaperImage(newPath)
}, { immediate: false })

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

[data-theme="dark"] .wallpaper-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 1;
}
</style>