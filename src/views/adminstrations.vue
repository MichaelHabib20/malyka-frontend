<template>
    <div class="container-fluid">
        <div class="d-flex gap-2 border-bottom pb-3">
            <button 
                v-if="authService.hasPermission('View Admins')"
                @click="navigateToAdmins" 
                :class="['btn', isAdminsActive ? 'btn-primary' : 'btn-outline-primary']"
            >
                Admins
            </button>
            <button 
                v-if="authService.hasPermission('View Roles')"
                @click="navigateToRoles" 
                :class="['btn', isRolesActive ? 'btn-primary' : 'btn-outline-primary']"
            >
                Roles
            </button>
        </div>
        <div class="mb-3">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {authService} from '../services/authService'
const route = useRoute()
const router = useRouter()

// Computed properties to check active routes
const isAdminsActive = computed(() => route.name === 'Admins' || route.name === 'CreateAdmin' || route.name === 'EditAdmin')
const isRolesActive = computed(() => route.name === 'Roles' || route.name === 'CreateRole' || route.name === 'EditRole')

// Navigation functions
const navigateToAdmins = () => {
    router.push({ name: 'Admins' })
}

const navigateToRoles = () => {
    router.push({ name: 'Roles' })
}
</script>

<style scoped>
.container-fluid{
    max-width: 1200px;
    margin: 0 auto;
}
.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}
.btn-outline-primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}
</style>