<template>
  <section class="time-section">
    <div class="time-display">{{ currentTime }}</div>
    <div class="date-display">{{ currentDate }}</div>
    <div class="greeting">{{ greeting }}</div>
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
    currentDate: {
      type: String,
      required: true
    },
    greeting: {
      type: String,
      required: true
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
  margin-bottom: 0.5rem;
}

.date-display {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.greeting {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

@media (max-width: 768px) {
  .time-display {
    font-size: 3rem;
  }
  
  .date-display {
    font-size: 1rem;
  }
  
  .greeting {
    font-size: 1.2rem;
  }
}
</style>
