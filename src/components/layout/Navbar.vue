<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { SyncStatus } from '../../interfaces/syncStatus';
import statusService from '../../services/statusService';
import { offlineStore } from '../../services/offlineStore';
import { authService } from '../../services/authService';
import { dataService } from '../../services/dataContext';
import LanguageSwitcher from '../shared/LanguageSwitcher.vue'

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
        <div v-if="isStatusDropdownOpen" class="status-dropdown">
          <div class="status-dropdown-content">
            <span>{{ t('common.requests') }}: {{ pendingRequestCount  }}</span>
            <span>{{ t('common.syncStatus') }}: {{ syncStatus.isCurrentlySyncing ? t('common.syncing') : t('common.idle') }}</span>
            <span>{{ t('common.lastSync') }}: {{ syncStatus.lastSuccessfulSync ? new Date(syncStatus.lastSuccessfulSync).toLocaleString() : t('common.never') }}</span>
          </div>
        </div>
      </div>
      <LanguageSwitcher />
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

.status-dropdown-content {
  padding: 12px;
  color: #2c3e50;
  font-size: 0.9rem;
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