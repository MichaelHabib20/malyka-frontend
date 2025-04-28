<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { dataService } from '../services/dataContext';
import statusService from '../services/statusService';
import { offlineStore } from '../services/offlineStore';
interface SyncStatus {
  isCurrentlySyncing: boolean;
  lastSuccessfulSync: Date | null;
}
defineProps<{ msg: string }>()


  const users = ref<any[]>([]);
  const isLoading = ref(false) // Added loading state
  const error = ref<Error | null>(null) // Added error state
  const isOnline = ref(statusService.isOnline());
  let unsubscribe: () => void;
  const pendingRequestCount = ref<number>(0);
  const syncStatus = ref<SyncStatus>({
  isCurrentlySyncing: offlineStore.isCurrentlySyncing,
  lastSuccessfulSync: offlineStore.lastSuccessfulSync
  });
  const handleSyncStatus = (status: SyncStatus) => {
  syncStatus.value = status;
};
  const formData = ref({
    name: '',
    email: '',
    password: 'Nibo123@',
    role_id : 20
  })
  const errors = ref({
    name: '',
    email: '',
    password: '',
    role_id: ''
  })
  const isSubmitting = ref(false)
 


  onMounted(async () => {
  isLoading.value = true
  try {
    const response = await getUsers()
    const roles = await getRoles()
    users.value = response.data || response // Handle different response structures
    roles.value = roles.data || roles // Handle different response structures
  } catch (err) {
    // Error is already handled in getUsers
  } finally {
    isLoading.value = false
  }
  offlineStore.syncStatusEmitter.on('sync-status', handleSyncStatus);
  const count = await offlineStore.getPendingRequestCount()
  pendingRequestCount.value = count
  offlineStore.pendingRequestCountEmitter.on('pendingRequestCount', updateCount)
  unsubscribe = statusService.subscribe((status) => {
    isOnline.value = status;
    console.log('Connection status changed:', status);
  });
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const updateCount = (count: number) => {
  pendingRequestCount.value = count
}
const getUsers = async () => {
  try {
    const response = await dataService.get<any>('/api/admin/admins?page=1')
    return response.data
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = err as Error // Store the error
    throw err
  }
}
const getRoles = async () => {
  try {
    const response = await dataService.get<any>('/api/admin/roles?page=1')
    return response.data
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = err as Error // Store the error
    throw err
  }
} 
const handleActiveChange = async (user: any) => {
  if(user.active){
    await dataService.post(`/api/admin/admins/${user.id}/deactivate`, { deactivation_notes: 'msh 3uzo' })
  }else{
     await dataService.post(`/api/admin/admins/${user.id}/activate`, {  })
  }
}
const handleSubmit = async () => {
    if (formData.value.name == "" || formData.value.email == "") return
    isSubmitting.value = true
    try {
      const response = await dataService.post('/api/admin/admins', formData.value)
      if (response.status === 200) {
        const res = await getUsers()
        users.value = res.data || res 
        isSubmitting.value = false
        formData.value.name = ''
        formData.value.email = ''
      }else{
        isSubmitting.value = false
        formData.value.name = ''
        formData.value.email = ''
      }

    }
    catch (err) {
      console.error('Error submitting form:', err)
      error.value = err as Error // Store the error
      throw err
    }
  }
</script>

<template>
 <section>
  <section>
    <div>
    <span v-if="isOnline">🟢 Online Mode (API)</span>
    <span v-else>🔴 Offline Mode (IndexedDB)</span>
  </div>
  <p>You have {{ pendingRequestCount }} pending requests. {{ syncStatus.isCurrentlySyncing ? 'Syncing...' : 'Not Syncing' }} </p>
  <p>Last successful sync: {{ syncStatus.lastSuccessfulSync ? new Date(syncStatus.lastSuccessfulSync).toLocaleString() : 'Never' }}</p>
  </section>

  <div class="form-container">
    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label for="name">Name *</label>
        <input 
          type="text"
          id="name"
          v-model="formData.name"
          :class="{'error': errors.name}"
          placeholder="Enter name"
        >
        <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          type="email" 
          id="email"
          v-model="formData.email"
          :class="{'error': errors.email}"
          placeholder="Enter email"
        >
        <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </button>
    </form>
  </div>
  <div class="users-container">
    <!-- Show loading state -->
    <div v-if="isLoading" class="loading">
      Loading users...
    </div>

    <!-- Show error state -->
    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>

    <!-- Show users list -->
    <div v-else class="users-list">
      <div v-if="users.length === 0" class="no-users">
        No users found
      </div>
      <div v-else class="users-list">
        <span>{{ users.length }}</span>
        <div v-for="user in users" :key="user.id" class="user-item ">
          <div class="user-item-header">
            <h3>{{ user.name }}</h3>
            <input type="checkbox" :checked="Boolean(user.active)"   @change="handleActiveChange(user)" />
          </div>
          <p>Email: {{ user.email }}</p>
          <p>Created at: {{ new Date(user.created_at).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
  </div>
 </section>
</template>

<style scoped>
  .form-container {
    max-width: 500px;
    margin: 0 auto 2rem;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .user-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: bold;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  input.error {
    border-color: #dc3545;
  }

  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

.read-the-docs {
  color: #888;
}
.users-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
}

.error {
  color: #dc3545;
}

.users-list {
  display: flex;
  justify-content:  center;
  flex-wrap: wrap;
  /* grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); */
  gap: 20px;
  padding: 20px 0;
}

.no-users {
  text-align: center;
  font-style: italic;
  color: #666;
}

.user-item {
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  margin-bottom: 5px;
}

.user-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-item h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.user-item p {
  margin: 5px 0;
  color: #666;
}
.user-item-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
