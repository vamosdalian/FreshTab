<template>
  <section class="time-section">
    <h2 class="text-lg md:text-xl font-medium text-gray-300 mb-2">当前时间</h2>
    <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">{{ formattedTime }}</h1>
    
    <!-- Date Display as Countdown-style boxes -->
    <div v-if="showDate" id="countdown" class="flex justify-center space-x-2 md:space-x-4 mb-8">
      <div class="countdown-box rounded-lg p-3 md:p-5 w-auto min-w-[80px] md:min-w-[112px]">
        <div class="text-3xl md:text-5xl font-bold">{{ dateComponents.year }}</div>
        <div class="text-xs md:text-sm text-gray-400">年</div>
      </div>
      <div class="countdown-box rounded-lg p-3 md:p-5 w-20 md:w-28">
        <div class="text-3xl md:text-5xl font-bold">{{ dateComponents.month }}</div>
        <div class="text-xs md:text-sm text-gray-400">月</div>
      </div>
      <div class="countdown-box rounded-lg p-3 md:p-5 w-20 md:w-28">
        <div class="text-3xl md:text-5xl font-bold">{{ dateComponents.day }}</div>
        <div class="text-xs md:text-sm text-gray-400">日</div>
      </div>
    </div>

    <!-- Weekday info -->
    <div v-if="showDate" class="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-gray-300">
      <div class="flex items-center space-x-2">
        <span>{{ dateComponents.weekday }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'

const settingsStore = useSettingsStore()
const timeUpdateTrigger = ref(0)

const timeFormat = computed(() => settingsStore.settings.timeFormat || '24h')
const showDate = computed(() => settingsStore.settings.showDate !== false)
const showSeconds = computed(() => settingsStore.settings.showSeconds || false)

const updateTime = () => {
  timeUpdateTrigger.value++
}

const timeFormatClass = computed(() => {
  return {
    'time-12h': timeFormat.value === '12h',
    'time-24h': timeFormat.value === '24h'
  }
})

const formattedTime = computed(() => {
  timeUpdateTrigger.value // trigger reactivity
  const now = new Date()
  
  if (timeFormat.value === '12h') {
    return now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: showSeconds.value ? '2-digit' : undefined
    })
  } else {
    return now.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds.value ? '2-digit' : undefined
    })
  }
})

const currentDate = computed(() => {
  timeUpdateTrigger.value // trigger reactivity
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const dateComponents = computed(() => {
  timeUpdateTrigger.value // trigger reactivity
  const now = new Date()
  return {
    year: now.getFullYear().toString(),
    month: String(now.getMonth() + 1).padStart(2, '0'),
    day: String(now.getDate()).padStart(2, '0'),
    weekday: now.toLocaleDateString('zh-CN', { weekday: 'long' })
  }
})

let timeInterval

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.time-section {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  color: white;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

h2 {
  color: #d1d5db;
}

.countdown-box {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.countdown-box > div:first-child {
  color: white;
  font-weight: bold;
}

.countdown-box .text-gray-400 {
  color: #9ca3af;
}
</style>
