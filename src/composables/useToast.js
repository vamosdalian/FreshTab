import { reactive, ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const addToast = (message, type = 'log', duration = 3000) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type,
      visible: true
    }
    
    toasts.value.push(toast)
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const error = (message, duration = 3000) => {
    return addToast(message, 'error', duration)
  }
  
  const warning = (message, duration = 3000) => {
    return addToast(message, 'warning', duration)
  }
  
  const log = (message, duration = 3000) => {
    return addToast(message, 'log', duration)
  }
  
  return {
    toasts,
    addToast,
    removeToast,
    error,
    warning,
    log
  }
}
