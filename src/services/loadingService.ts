import { ref, computed } from 'vue'

class LoadingService {
  private loadingCount = ref(0)
  private isLoading = computed(() => this.loadingCount.value > 0)

  public startLoading(): void {
    this.loadingCount.value++
  }

  public endLoading(): void {
    if (this.loadingCount.value > 0) {
      this.loadingCount.value--
    }
  }

  public getLoadingState() {
    return this.isLoading
  }

  public resetLoading(): void {
    this.loadingCount.value = 0
  }
}

// Export singleton instance
export const loadingService = new LoadingService() 