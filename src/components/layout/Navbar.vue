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
// import { useGoogleAuth } from '../../composables/useGoogleAuth';

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
// const { isGoogleSignedIn, googleUser, signInWithGoogle, signOutGoogle } = useGoogleAuth();

// const loginWithGoogle = async () => {
//   try {
//     const result = await signInWithPopup(auth, provider);
//     // You may want to send result.user info to your backend to get a JWT
//     // For now, we'll use a placeholder token (replace with real backend call)
//     console.log(result);
//     const fakeJwt = 'FAKE.JWT.TOKEN'; // TODO: Replace with real backend call
//     authService.setToken(fakeJwt, true);
//     user.value = authService.getUser();
//   } catch (err) {
//     console.error('Google sign-in error:', err);
//     // Optionally show error to user
//   }
// };
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
  isDropdownOpen.value = false;
  router.push('/sign-in');
}

defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button class="toggle-btn" @click="$emit('toggle-sidebar')">
        ☰
      </button>
      <h1 class="page-title">{{pageTitle}}</h1>
    </div>
    
    <div class="navbar-right">
      <div class="notifications">
        <!-- <span class="notification-icon">🔔</span>
        <span class="notification-badge">3</span> -->
      </div>
      <div class="online-status" @click="isStatusDropdownOpen = !isStatusDropdownOpen">
        <span v-if="pendingRequestCount > 0">🟠 {{ t('common.pending') }}</span>
        <span v-else-if="!isOnline">🔴 {{ t('app.offline') }}</span>
        <span v-else>🟢 {{ t('app.online') }}</span>
        <div v-if="isStatusDropdownOpen" :class="['status-dropdown', { 'status-dropdown-ar': locale === 'ar' }]">
          <div class="status-dropdown-content">
            <span>{{ t('common.requests') }}: {{ pendingRequestCount  }}</span>
            <span>{{ t('common.syncStatus') }}: {{ syncStatus.isCurrentlySyncing ? t('common.syncing') : t('common.idle') }}</span>
            <span>{{ t('common.lastSync') }}: {{ syncStatus.lastSuccessfulSync ? new Date(syncStatus.lastSuccessfulSync).toLocaleString() : t('common.never') }}</span>
          </div>
        </div>
      </div>
      <LanguageSwitcher />
      <!-- <div v-if="!isGoogleSignedIn">
        <button class="google-icon-btn" title="Sign in with Google" @click="signInWithGoogle">
          <svg class="google-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="32" height="32">
            <g>
              <circle cx="24" cy="24" r="24" fill="#fff"/>
              <path d="M43.6 20.5h-1.8V20H24v8h11.2c-1.5 4-5.2 6.9-9.2 6.9-5.5 0-10-4.5-10-10s4.5-10 10-10c2.4 0 4.6.8 6.3 2.2l6.1-6.1C33.7 7.6 29.1 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19c9.5 0 18-7.5 18-18 0-1.2-.1-2.1-.4-3.5z" fill="#fbbc05"/>
              <path d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.4 0 4.6.8 6.3 2.2l6.1-6.1C33.7 7.6 29.1 6 24 6c-7.1 0-13.2 3.7-16.7 8.7z" fill="#ea4335"/>
              <path d="M24 44c5.1 0 9.7-1.7 13.3-4.7l-6.1-5c-1.7 1.3-3.9 2.1-6.2 2.1-4-0.1-7.5-2.7-8.9-6.3l-6.6 5.1C10.8 40.3 16.9 44 24 44z" fill="#34a853"/>
              <path d="M43.6 20.5h-1.8V20H24v8h11.2c-0.7 2-2.1 3.7-3.9 4.9l6.1 5C41.7 36.2 44 31.9 44 27c0-1.2-.1-2.1-.4-3.5z" fill="#4285f4"/>
            </g>
          </svg>
        </button>
      </div>
      <div v-else class="google-signedin-indicator" title="Signed in with Google">
        <div class="google-icon-btn google-signedin" @click="signOutGoogle" style="cursor:pointer;">
          <img v-if="googleUser && googleUser.photoURL" :src="googleUser.photoURL" class="google-avatar" alt="Google Avatar" />
          <svg v-else class="google-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="32" height="32">
            <g>
              <circle cx="24" cy="24" r="24" fill="#fff"/>
              <path d="M43.6 20.5h-1.8V20H24v8h11.2c-1.5 4-5.2 6.9-9.2 6.9-5.5 0-10-4.5-10-10s4.5-10 10-10c2.4 0 4.6.8 6.3 2.2l6.1-6.1C33.7 7.6 29.1 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19c9.5 0 18-7.5 18-18 0-1.2-.1-2.1-.4-3.5z" fill="#fbbc05"/>
              <path d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.4 0 4.6.8 6.3 2.2l6.1-6.1C33.7 7.6 29.1 6 24 6c-7.1 0-13.2 3.7-16.7 8.7z" fill="#ea4335"/>
              <path d="M24 44c5.1 0 9.7-1.7 13.3-4.7l-6.1-5c-1.7 1.3-3.9 2.1-6.2 2.1-4-0.1-7.5-2.7-8.9-6.3l-6.6 5.1C10.8 40.3 16.9 44 24 44z" fill="#34a853"/>
              <path d="M43.6 20.5h-1.8V20H24v8h11.2c-0.7 2-2.1 3.7-3.9 4.9l6.1 5C41.7 36.2 44 31.9 44 27c0-1.2-.1-2.1-.4-3.5z" fill="#4285f4"/>
            </g>
          </svg>
          <span class="google-checkmark">
            <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#34a853"/><polyline points="5,10 8,13 13,6" fill="none" stroke="#fff" stroke-width="2"/></svg>
          </span>
        </div>
      </div> -->
      <div class="dropdown">
        <a class="btn dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          {{ user.Name }}
        </a>
        <ul class="dropdown-menu">
          <!-- <li><span class="dropdown-item">{{ user.email }}</span></li>
          <li><hr class="dropdown-divider"></li> -->
          <li><a class="dropdown-item" @click="handleLogout">{{ t('navigation.logout') }}</a></li>
        </ul>
      </div>
 
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #ffffff;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 100% !important;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
  transition: background-color 0.2s ease;
  border-radius: 4px;
}

.toggle-btn:hover {
  background-color: #f8f9fa;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.notifications {
  position: relative;
  cursor: pointer;
}

.notification-icon {
  font-size: 1.25rem;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #dc3545;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: #f8f9fa;
}

.user-avatar {
  font-size: 1.5rem;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}
.dropdown-menu {
  left: -14px !important;
}


.logout-icon {
  font-size: 1rem;
}
.online-status {
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  width: fit-content;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.online-status span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
  width: 240px;
}
.status-dropdown-ar {
  left: -102px !important;
}

.status-dropdown-content {
  padding: 12px;
  color: #2c3e50;
  font-size: 0.9rem;
}

.google-icon-btn {
  background: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(60,60,60,0.08);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  padding: 0;
}
.google-icon-btn:hover {
  box-shadow: 0 4px 16px rgba(66,133,244,0.18);
  transform: translateY(-2px) scale(1.07);
}
.google-icon-svg {
  width: 32px;
  height: 32px;
  display: block;
}

.google-signedin-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}
.google-signedin {
  position: relative;
  border: 2px solid #34a853;
}
.google-checkmark {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(60,60,60,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.google-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem 0.5rem;
    min-width: 0;
  }
  .navbar-left, .navbar-right {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
  }
  .navbar-left {
    margin-bottom: 0.5rem;
  }
  .page-title {
    font-size: 1rem;
    flex: 1;
    text-align: left;
    margin-left: 0.5rem;
  }
  .navbar-right {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .online-status {
    font-size: 0.9rem;
    padding: 6px 8px;
    min-width: 0;
  }
  .status-dropdown {
    min-width: 120px;
    width: 180px;
    left: 0;
  }
  .dropdown-menu {
    left: 0 !important;
    min-width: 120px;
  }
  .toggle-btn {
    font-size: 1.2rem;
    padding: 0.3rem;
  }
  .user-profile, .user-name {
    font-size: 0.95rem;
  }
  .notifications {
    display: none;
  }
}
</style> 