<template>
  <Transition name="loading-fade" appear>
    <div v-if="isLoading" class="global-loading-overlay">
      <div class="loading-content">
        <!-- Simple spinner -->
        <div class="spinner"></div>
        
        <!-- Loading text -->
        <p class="loading-text">{{ t('globalLoading.loading') }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { loadingService } from '../../services/loadingService';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isLoading = loadingService.getLoadingState()
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  text-align: center;
  min-width: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

.loading-text {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 500;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Transition animations */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.2s ease;
}

.loading-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.loading-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .loading-content {
    padding: 2rem 2.5rem;
    margin: 0 1rem;
  }
  
  .loading-text {
    font-size: 14px;
  }
  
  .spinner {
    width: 35px;
    height: 35px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-content {
    background: #1f2937;
    border: 1px solid #374151;
  }
  
  .loading-text {
    color: #f9fafb;
  }
  
  .spinner {
    border-color: #374151;
    border-top-color: #3b82f6;
  }
}
</style> 