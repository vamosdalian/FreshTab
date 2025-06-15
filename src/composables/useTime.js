import { ref, onMounted, onUnmounted } from 'vue'

export function useTime() {
  const currentTime = ref('')
  const currentDate = ref('')
  const greeting = ref('')

  const updateTime = () => {
    const now = new Date()
    
    // 格式化时间 - 24小时制
    const hours = now.getHours()
    const minutes = now.getMinutes()
    currentTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    // 格式化日期
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    
    const weekday = weekdays[now.getDay()]
    const month = months[now.getMonth()]
    const day = now.getDate()
    
    currentDate.value = `${weekday}, ${month}${day}日`
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
    currentDate,
    greeting
  }
}
