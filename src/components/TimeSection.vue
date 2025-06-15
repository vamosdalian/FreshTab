<template>
  <section class="time-section">
    <div class="time-display">{{ currentTime }}</div>
    <div class="greeting">{{ greeting }}</div>
    <!-- 临时主题切换按钮用于测试 -->
    <div class="theme-switcher">
      <button @click="toggleTheme" class="theme-toggle-btn">
        {{ isDarkMode ? '🌞' : '🌙' }} 切换主题
      </button>
    </div>
  </section>
</template>

<script>
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
    }
  },
  data() {
    return {
      isDarkMode: document.documentElement.getAttribute('data-theme') === 'dark'
    }
  },
  mounted() {
    // 监听主题变化
    const observer = new MutationObserver(() => {
      this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  },
  methods: {
    toggleTheme() {
      const newTheme = this.isDarkMode ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', newTheme)
      this.isDarkMode = !this.isDarkMode
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

.greeting {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  transition: color 0.3s ease;
}

/* Dark mode adjustments */
:root[data-theme="dark"] .time-display {
  color: #e0e0e0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

:root[data-theme="dark"] .greeting {
  color: rgba(224, 224, 224, 0.7);
}

.theme-switcher {
  margin-top: 1rem;
  text-align: center;
}

.theme-toggle-btn {
  background: var(--button-bg, rgba(255, 255, 255, 0.2));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 25px;
  color: var(--text-color, white);
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.theme-toggle-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.3));
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .time-display {
    font-size: 3rem;
  }
  
  .greeting {
    font-size: 1.2rem;
  }
}
</style>
