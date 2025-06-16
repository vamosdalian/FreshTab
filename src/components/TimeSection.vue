<template>
  <section class="time-section">
    <div class="time-display" :class="timeFormatClass">{{ formattedTime }}</div>
    <div v-if="showDate" class="date-display">{{ currentDate }}</div>
  </section>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'TimeSection',
  props: {
    currentTime: {
      type: String,
      required: true
    },
    greeting: {
      type: String,
      required: true
    },
    timeFormat: {
      type: String,
      default: '24h' // '12h' | '24h'
    },
    showDate: {
      type: Boolean,
      default: true
    },
    showSeconds: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const timeFormatClass = computed(() => {
      return {
        'time-12h': props.timeFormat === '12h',
        'time-24h': props.timeFormat === '24h'
      }
    })
    
    const formattedTime = computed(() => {
      const now = new Date()
      
      if (props.timeFormat === '12h') {
        return now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: 'numeric',
          minute: '2-digit',
          second: props.showSeconds ? '2-digit' : undefined
        })
      } else {
        return now.toLocaleTimeString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: props.showSeconds ? '2-digit' : undefined
        })
      }
    })
    
    const currentDate = computed(() => {
      const now = new Date()
      return now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    })
    
    return {
      timeFormatClass,
      formattedTime,
      currentDate
    }
  }
}
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
  font-family: 'Georgia', serif;
}

.time-24h {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .time-display {
    font-size: 3rem;
  }
}
</style>
