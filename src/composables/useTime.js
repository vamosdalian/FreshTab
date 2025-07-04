import { ref, onMounted, onUnmounted } from 'vue'

export function useTime() {
  const currentTime = ref('')
  const greeting = ref('')

  const updateTime = () => {
    const now = new Date()
    
    // 格式化时间 - 24小时制
    const hours = now.getHours()
    const minutes = now.getMinutes()
    currentTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const updateGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    
    if (hour < 6) {
      greeting.value = '夜深了，早点休息！'
    } else if (hour < 12) {
      greeting.value = '早上好！'
    } else if (hour < 18) {
      greeting.value = '下午好！'
    } else {
      greeting.value = '晚上好！'
    }
  }

  let timeInterval
  let greetingInterval

  onMounted(() => {
    updateTime()
    updateGreeting()
    
    // 每秒更新时间
    timeInterval = setInterval(updateTime, 1000)
    
    // 每分钟更新问候语
    greetingInterval = setInterval(updateGreeting, 60000)
  })

  onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval)
    if (greetingInterval) clearInterval(greetingInterval)
  })

  return {
    currentTime,
    greeting
  }
}
