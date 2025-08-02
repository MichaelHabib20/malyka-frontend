<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { SyncStatus } from '../../interfaces/syncStatus';
import statusService from '../../services/statusService';
import { offlineStore } from '../../services/offlineStore';
import { authService } from '../../services/authService';
import { dataService } from '../../services/dataContext';
import LanguageSwitcher from '../shared/LanguageSwitcher.vue'
import { useGoogleAuth } from '../../composables/useGoogleAuth';

const { t, locale } = useI18n();

const route = useRoute()
const router = useRouter()
const pageTitle = computed(() => {
  const meta = route.meta as any;
  return locale.value === 'ar' && meta.title_ar ? meta.title_ar : meta.title;
})
const isDropdownOpen = ref(false)
const user = ref<any>({
  name: '',
  email: ''
})

const { isGoogleSignedIn, googleUser, isLoading, signInWithGoogle, signOutGoogle } = useGoogleAuth();

const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle();
  } catch (error: any) {
    console.error('Google sign-in failed:', error);
    // You can add toast notification here
  }
};

const handleGoogleSignOut = async () => {
  try {
    await signOutGoogle();
  } catch (error: any) {
    console.error('Google sign-out failed:', error);
    // You can add toast notification here
  }
};
const syncStatus = ref<SyncStatus>({
  isCurrentlySyncing: offlineStore.isCurrentlySyncing,
  lastSuccessfulSync: offlineStore.lastSuccessfulSync
});
const isOnline = ref(statusService.isOnline());
const isStatusDropdownOpen = ref(false);
const pendingRequestCount = ref<number>(0);

onMounted(async () => {
  statusService.subscribe((status) => {
    isOnline.value = status;
  });
  offlineStore.pendingRequestCountEmitter.on('pendingRequestCount', updateCount)
  offlineStore.syncStatusEmitter.on('sync-status', handleSyncStatus);

  user.value = authService.getUser();
  
  // Load initial pending request count
  try {
    const initialCount = await offlineStore.getPendingRequestCount();
    pendingRequestCount.value = initialCount;
  } catch (error) {
    console.error('Error loading initial pending request count:', error);
    pendingRequestCount.value = 0;
  }
  
});

const handleSyncStatus = (status: SyncStatus) => {
  syncStatus.value = status;
};
const updateCount = (count: number) => {
  pendingRequestCount.value = count
}
const handleLogout = () => {
  authService.clearUser();
  dataService.clearAuthToken();
  handleGoogleSignOut();
  isDropdownOpen.value = false;
  router.push('/sign-in');
}

defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();
</script>

<template>
  <nav class="navbar navbar-light bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3">
      <button class="btn btn-link text-decoration-none p-2 rounded" @click="$emit('toggle-sidebar')">
        ☰
      </button>
      <h1 class="h5 mb-0 fw-semibold text-dark">{{pageTitle}}</h1>
    </div>
    
    <div class="d-flex align-items-center gap-3">
      <div class="position-relative">
        <!-- <span class="fs-5">🔔</span>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span> -->
      </div>
      <div class="position-relative">
        <div class="d-flex justify-content-start align-items-center fw-medium fs-6 p-2 bg-light rounded shadow-sm" 
             style="cursor: pointer; min-width: fit-content;" 
             @click="isStatusDropdownOpen = !isStatusDropdownOpen">
          <span v-if="pendingRequestCount > 0" class="d-flex align-items-center gap-2">🟠 {{ t('common.pending') }}</span>
          <span v-else-if="!isOnline" class="d-flex align-items-center gap-2">🔴 {{ t('app.offline') }}</span>
          <span v-else class="d-flex align-items-center gap-2">🟢 {{ t('app.online') }}</span>
          <div v-if="isStatusDropdownOpen" 
               :class="['position-absolute top-100 start-0 mt-2 bg-white rounded shadow', { 'start-auto end-0': locale === 'ar' }]"
               style="z-index: 1000; min-width: 150px; width: 240px;">
            <div class="p-3 text-dark fs-6">
              <span class="d-block">{{ t('common.requests') }}: {{ pendingRequestCount  }}</span>
              <span class="d-block">{{ t('common.syncStatus') }}: {{ syncStatus.isCurrentlySyncing ? t('common.syncing') : t('common.idle') }}</span>
              <span class="d-block">{{ t('common.lastSync') }}: {{ syncStatus.lastSuccessfulSync ? new Date(syncStatus.lastSuccessfulSync).toLocaleString() : t('common.never') }}</span>
            </div>
          </div>
        </div>
      </div>
      <LanguageSwitcher />
      
      <!-- Google Sign-In Component -->
      <div v-if="!isGoogleSignedIn" class="d-flex align-items-center">
        <button 
          class="btn btn-light border rounded d-flex align-items-center gap-2 shadow-sm" 
          :disabled="isLoading"
          @click="handleGoogleSignIn"
          :title="isLoading ? 'Signing in...' : 'Sign in with Google'"
          style="font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 500; color: #3c4043; min-width: 120px; transition: all 0.2s ease;"
        >
          <div class="d-flex align-items-center gap-2 w-100 justify-content-center">
            <svg class="flex-shrink-0" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span v-if="!isLoading" class="text-nowrap">Sign in</span>
            <div v-else class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </button>
      </div>
      
      <!-- Google profile image will be shown in the dropdown when signed in -->
      <img 
              v-if="isGoogleSignedIn && googleUser?.image" 
              :src="googleUser.image" 
              :alt="googleUser.name"
              class="rounded-circle"
              style="width: 36px; height: 36px; object-fit: cover; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
            />
            <div v-else-if="isGoogleSignedIn && !googleUser?.image" 
                 class="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                 style="width: 36px; height: 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); font-size: 16px;">
              {{ googleUser?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <!-- <div v-else 
                 class="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                 style="width: 36px; height: 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); font-size: 16px;">
              {{ user.Name?.charAt(0)?.toUpperCase() || 'U' }}
            </div> -->
      <div class="dropdown">
        <a class="btn btn-link text-decoration-none p-0" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <div class="d-flex align-items-center gap-3 p-2 bg-light rounded border" 
               style="transition: all 0.2s ease; cursor: pointer;">

            <span class="fw-semibold text-dark fs-6 text-nowrap text-truncate" style="max-width: 120px;">
              {{ isGoogleSignedIn ? googleUser?.name : user.Name }}
            </span>
            <svg class="text-muted flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s ease;">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </a>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" @click="handleLogout">{{ t('navigation.logout') }}</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Responsive styles that can't be easily converted to Bootstrap */
@media (max-width: 600px) {
  .navbar {
    flex-direction: column !important;
    align-items: stretch !important;
    padding: 0.5rem 0.5rem !important;
    min-width: 0 !important;
    gap: 0.5rem !important;
  }
  
  .navbar > div:first-child {
    display: flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
    width: 100% !important;
  }
  
  .navbar > div:last-child {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    gap: 0.5rem !important;
    flex-wrap: wrap !important;
    max-height: 60px !important;
  }
  
  .h5 {
    font-size: 1rem !important;
    flex: 1 !important;
    text-align: left !important;
    margin-left: 0.5rem !important;
  }
  
  .btn-link {
    font-size: 1.2rem !important;
    padding: 0.3rem !important;
  }
  
  .fw-medium {
    font-size: 0.8rem !important;
    padding: 4px 8px !important;
    min-width: 0 !important;
    flex-shrink: 0 !important;
  }
  
  .position-absolute {
    min-width: 120px !important;
    width: 180px !important;
    left: 0 !important;
  }
  
  .dropdown-menu {
    left: 0 !important;
    min-width: 120px !important;
    width: 100% !important;
  }
  
  /* Mobile Google Auth Styles */
  .btn-light {
    padding: 4px 8px !important;
    min-width: 80px !important;
    font-size: 11px !important;
    flex-shrink: 0 !important;
  }
  
  .gap-2 {
    gap: 4px !important;
  }
  
  .text-nowrap {
    font-size: 11px !important;
  }
  
  /* Mobile User Profile Styles */
  .d-flex.align-items-center.gap-3.p-2 {
    padding: 4px 8px !important;
    gap: 6px !important;
    flex-shrink: 0 !important;
  }
  
  .rounded-circle {
    width: 24px !important;
    height: 24px !important;
    font-size: 10px !important;
  }
  
  .fw-semibold.text-dark.fs-6 {
    font-size: 11px !important;
    max-width: 60px !important;
  }
  
  svg[width="12"][height="12"] {
    width: 8px !important;
    height: 8px !important;
  }
  
  .dropdown-menu {
    min-width: 200px !important;
  }
  
  .dropdown-item {
    padding: 10px 12px !important;
    font-size: 12px !important;
    gap: 8px !important;
  }
  
  /* Language switcher adjustments */
  .language-switcher {
    flex-shrink: 0 !important;
  }
}

/* Hover effects that can't be easily done with Bootstrap */
.btn-link:hover {
  background-color: #f8f9fa !important;
}

.d-flex.align-items-center.gap-3.p-2:hover {
  background: #e9ecef !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.btn-light:hover:not(:disabled) {
  background: #f8f9fa !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-1px) !important;
}

.btn-light:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}
</style> 