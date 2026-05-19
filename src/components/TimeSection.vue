<template>
  <section class="time-section">
    <div class="time-display" :class="timeFormatClass">{{ formattedTime }}</div>
    <div v-if="showDate" class="date-display">{{ currentDate }}</div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settingsStore'

const settingsStore = useSettingsStore()
const { locale } = useI18n()
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
  const activeLocale = settingsStore.settings.uiLocale || locale.value
  
  return new Intl.DateTimeFormat(activeLocale, {
    hour12: timeFormat.value === '12h',
    hour: timeFormat.value === '12h' ? 'numeric' : '2-digit',
    minute: '2-digit',
    second: showSeconds.value ? '2-digit' : undefined
  }).format(now)
})

const currentDate = computed(() => {
  timeUpdateTrigger.value // trigger reactivity
  const now = new Date()
  const activeLocale = settingsStore.settings.uiLocale || locale.value

  return new Intl.DateTimeFormat(activeLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
    .format(now)
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

.time-display {
  font-size: 4rem;
  font-weight: 200;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

/* Dark mode adjustments */
:root[data-theme="dark"] .time-display {
  color: #e0e0e0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

:root[data-theme="dark"] .date-display {
  color: #e0e0e0;
}

.date-display {
  font-size: 1rem;
  color: white;
  font-weight: 300;
  margin-top: 0.5rem;
  transition: color 0.3s ease;
}

.time-12h {
  font-family: 'Courier New', monospace;
}

.time-24h {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
}
</style>
