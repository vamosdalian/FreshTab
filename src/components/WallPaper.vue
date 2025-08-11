<template>
  <div class="wallpaper-container">
    <!-- Previous wallpaper for smooth transitions -->
    <div 
      v-if="previousWallpaper" 
      class="wallpaper-background wallpaper-previous" 
      :style="previousWallpaperStyle"
    ></div>
    
    <!-- Current wallpaper -->
    <div 
      class="wallpaper-background wallpaper-current" 
      :class="{ 'wallpaper-transitioning': isTransitioning }"
      :style="currentWallpaperStyle"
    ></div>
    
    <!-- Loading indicator for wallpaper transitions -->
    <div v-if="wallpaperLoading" class="wallpaper-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useWallpaper } from '../composables/useWallpaper'

const { 
  currentWallpaper, 
  wallpaperLoading, 
  isWallpaperLoaded,
  initializeWallpaper 
} = useWallpaper()

// Transition state management
const previousWallpaper = ref('')
const isTransitioning = ref(false)
const transitionTimeout = ref(null)

// Computed styles for wallpapers
const currentWallpaperStyle = computed(() => {
  if (currentWallpaper.value) {
    return {
      background: `url(${currentWallpaper.value}) center/cover no-repeat`,
      opacity: isTransitioning.value ? 1 : 1
    }
  }
  return { opacity: 0 }
})

const previousWallpaperStyle = computed(() => {
  if (previousWallpaper.value) {
    return {
      background: `url(${previousWallpaper.value}) center/cover no-repeat`,
      opacity: isTransitioning.value ? 0 : 1
    }
  }
  return { opacity: 0 }
})

// Handle smooth transitions between wallpapers
const handleWallpaperTransition = (newWallpaper, oldWallpaper) => {
  if (!newWallpaper || newWallpaper === oldWallpaper) return
  
  // Clear any existing transition timeout
  if (transitionTimeout.value) {
    clearTimeout(transitionTimeout.value)
  }
  
  // Set up transition
  previousWallpaper.value = oldWallpaper
  isTransitioning.value = true
  
  // Complete transition after animation duration
  transitionTimeout.value = setTimeout(() => {
    isTransitioning.value = false
    previousWallpaper.value = ''
    transitionTimeout.value = null
  }, 800) // Match CSS transition duration
}

// Watch for wallpaper changes and trigger smooth transitions
watch(currentWallpaper, (newWallpaper, oldWallpaper) => {
  if (isWallpaperLoaded.value) {
    handleWallpaperTransition(newWallpaper, oldWallpaper)
  }
}, { immediate: false })

// Cleanup on unmount
onUnmounted(() => {
  if (transitionTimeout.value) {
    clearTimeout(transitionTimeout.value)
  }
})

</script>

<style lang="scss" scoped>
.wallpaper-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.wallpaper-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity;
}

.wallpaper-current {
  z-index: 2;
}

.wallpaper-previous {
  z-index: 1;
}

.wallpaper-transitioning {
  opacity: 1 !important;
}

.wallpaper-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  pointer-events: none;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Dark theme overlay
[data-theme="dark"] .wallpaper-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: opacity 0.3s ease;
}

// Prevent visual glitches during transitions
.wallpaper-background {
  // Ensure smooth rendering
  backface-visibility: hidden;
  transform: translateZ(0);
  
  // Prevent flickering on some devices
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}

// Responsive optimizations
@media (max-width: 768px) {
  .wallpaper-background {
    // Faster transitions on mobile for better performance
    transition: opacity 0.5s ease;
  }
  
  .loading-spinner {
    width: 30px;
    height: 30px;
    border-width: 2px;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .wallpaper-background::before {
    background-color: rgba(0, 0, 0, 0.3) !important;
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .wallpaper-background {
    transition: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}
</style>