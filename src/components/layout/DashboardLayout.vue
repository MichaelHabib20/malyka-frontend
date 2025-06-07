<script setup lang="ts">
import { ref } from 'vue';
// import Navbar from './Navbar.vue';
// import Sidebar from './Sidebar.vue';
import Navbar from '../layout/Navbar.vue';
import Sidebar from '../layout/Sidebar.vue';
const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<template>
  <div class="dashboard-layout">
    <Sidebar 
      :is-collapsed="isSidebarCollapsed"
      class="sidebar"
    />
    <div class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <Navbar 
        @toggle-sidebar="toggleSidebar"
        class="navbar"
      />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.3s ease;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 99;
}

.content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
</style> 