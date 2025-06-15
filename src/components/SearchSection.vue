<template>
  <section class="search-section">
    <div class="search-container">
      <div class="search-box">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="搜索或输入网址..."
          class="search-input"
          ref="searchInput"
        />
        <button @click="handleSearch" class="search-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="21 21l-4.35-4.35"></path>
          </svg>
        </button>
      </div>
      
      <div class="search-engines">
        <button
          v-for="engine in searchEngines"
          :key="engine.name"
          @click="setSearchEngine(engine)"
          :class="['engine-btn', { active: currentEngine.name === engine.name }]"
        >
          {{ engine.name }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SearchSection',
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    searchEngines: {
      type: Array,
      required: true
    },
    currentEngine: {
      type: Object,
      required: true
    }
  },
  emits: ['update:searchQuery', 'search', 'setEngine'],
  methods: {
    handleSearch() {
      this.$emit('search')
    },
    setSearchEngine(engine) {
      this.$emit('setEngine', engine)
    }
  }
}
</script>

<style scoped>
.search-section {
  margin-bottom: 3rem;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.search-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.search-engines {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.engine-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.engine-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.engine-btn.active {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .search-container {
    max-width: 90%;
  }
  
  .search-input {
    font-size: 0.9rem;
    padding: 0.8rem 2.5rem 0.8rem 0.8rem;
  }
  
  .engine-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
