<script setup lang="ts">

</script>

<template>
  <div class="dashboard">

  </div>
</template>

<style scoped>
.dashboard {
  padding: 1rem;
}

.dashboard h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dashboard-card h3 {
  margin: 0;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

.dashboard-card .number {
  margin: 0.5rem 0 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}
</style> 