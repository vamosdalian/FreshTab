<template>
  <section v-if="showWeather" class="weather-section">
    <div class="weather-container">
      <div v-if="weatherLoading" class="weather-loading">
        <div class="loading-spinner"></div>
        <span>获取天气信息中...</span>
      </div>
      
      <div v-else-if="weatherError" class="weather-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>天气信息获取失败</span>
      </div>
      
      <div v-else-if="weatherData" class="weather-info">
        <div class="weather-main">
          <div class="weather-icon">
            <img :src="getWeatherIcon(weatherData.weather[0].icon)" :alt="weatherData.weather[0].description" />
          </div>
          <div class="weather-temp">{{ Math.round(weatherData.main.temp) }}°C</div>
        </div>
        
        <div class="weather-details">
          <div class="weather-description">{{ weatherData.weather[0].description }}</div>
          <div class="weather-location">{{ weatherData.name }}</div>
          <div class="weather-extra">
            <span>体感温度: {{ Math.round(weatherData.main.feels_like) }}°C</span>
            <span>湿度: {{ weatherData.main.humidity }}%</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'WeatherSection',
  props: {
    showWeather: {
      type: Boolean,
      default: false
    },
    weatherData: {
      type: Object,
      default: null
    },
    weatherLoading: {
      type: Boolean,
      default: false
    },
    weatherError: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getWeatherIcon(iconCode) {
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    }
  }
}
</script>

<style scoped>
.weather-section {
  margin-bottom: 2rem;
}

.weather-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.weather-loading,
.weather-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.weather-error {
  color: rgba(255, 100, 100, 0.9);
}

.weather-info {
  color: white;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.weather-icon img {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.weather-temp {
  font-size: 2.5rem;
  font-weight: 300;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.weather-details {
  text-align: center;
}

.weather-description {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.weather-location {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
}

.weather-extra {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .weather-container {
    max-width: 90%;
  }
  
  .weather-main {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .weather-temp {
    font-size: 2rem;
  }
  
  .weather-extra {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
