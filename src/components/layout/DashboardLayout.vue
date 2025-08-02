<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
// import Navbar from './Navbar.vue';
// import Sidebar from './Sidebar.vue';
import Navbar from '../layout/Navbar.vue';
import Sidebar from '../layout/Sidebar.vue';

const { locale } = useI18n();

const isSidebarCollapsed = ref(false);

// Mobile detection
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768;
  }
  return false;
});

// Initialize sidebar state based on screen size
const initializeSidebarState = () => {
  if (typeof window !== 'undefined') {
    isSidebarCollapsed.value = window.innerWidth <= 768;
  }
};

// RTL detection
const isRTL = computed(() => {
  return locale.value === 'ar';
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const expandSidebar = () => {
  isSidebarCollapsed.value = false;
};

const closeSidebar = () => {
  isSidebarCollapsed.value = true;
};

const handleOverlayClick = () => {
  if (isMobile.value) {
    closeSidebar();
  }
};

// Handle window resize to update sidebar state
const handleResize = () => {
  if (isMobile.value) {
    // Close sidebar on mobile
    isSidebarCollapsed.value = true;
  } else {
    // On desktop, keep the current state or expand if it was collapsed due to mobile
    // You can modify this behavior as needed
  }
};

// Initialize sidebar state on mount
onMounted(() => {
  initializeSidebarState();
  window.addEventListener('resize', handleResize);
});

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const navbarStyle = computed(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      width: '100%',
      zIndex: 100,
      maxWidth: '100%',
    };
  }
  const sidebarWidth = isSidebarCollapsed.value ? 80 : 220;
  if (isRTL.value) {
    return {
      position: 'fixed',
      top: '0',
      right: `${sidebarWidth}px`,
      left: '0',
      width: `calc(100% - ${sidebarWidth}px)`,
      zIndex: 100,
      maxWidth: '100%'
    };
  } else {
    return {
      position: 'fixed',
      top: '0',
      left: `${sidebarWidth}px`,
      right: '0',
      width: `calc(100% - ${sidebarWidth}px)`,
      zIndex: 100,
      maxWidth: '100%'
    };
  }
});
</script>

<template>
  <div class="dashboard-layout" :class="{ 
    'sidebar-collapsed': isSidebarCollapsed,
    'rtl': isRTL 
  }">
    <Sidebar 
      :is-collapsed="isSidebarCollapsed"
      @expand-sidebar="expandSidebar"
      @close-sidebar="closeSidebar"
      class="sidebar"
    />
    <div class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <Navbar 
        @toggle-sidebar="toggleSidebar"
        :style="navbarStyle"
      />
      <main class="content">
        <router-view />
      </main>
    </div>
    <!-- Mobile overlay - only show on mobile when sidebar is open -->
    <div 
      v-if="!isSidebarCollapsed && isMobile" 
      class="mobile-overlay"
      @click="handleOverlayClick"
    ></div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
  position: relative;
  overflow: hidden;
}

/* RTL Support */
.dashboard-layout.rtl {
  flex-direction: row-reverse;
}

@media (max-width:768px) {
  .dashboard-layout {
    max-width: 100% !important;
  } 
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.3s ease;
}

/* RTL Sidebar positioning */
.dashboard-layout.rtl .sidebar {
  left: auto;
  right: 0;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100% !important;
}

/* RTL Main content positioning */
.dashboard-layout.rtl .main-content {
  margin-left: 0;
  margin-right: 220px;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
  @media (max-width:768px) {
    margin-left: 0;
  }
}

/* RTL Collapsed sidebar positioning */
.dashboard-layout.rtl .main-content.sidebar-collapsed {
  margin-left: 0;
  margin-right: 80px;
  @media (max-width:768px) {
    margin-right: 0;
  }
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 99;
  max-width: 100% !important;
}

.content {
  flex: 1;
  padding-top: 1.5rem;
  /* padding: 1.5rem; */
  overflow-y: auto;
  margin-top: 70px;
}

/* Mobile overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
  cursor: pointer;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .sidebar {
    /* On mobile, sidebar should overlay the content when expanded */
    transform: translateX(0);
    transition: transform 0.3s ease, width 0.3s ease;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .dashboard-layout.rtl .main-content {
    margin-right: 0;
  }
  
  .dashboard-layout.sidebar-collapsed .sidebar {
    transform: translateX(-100%);
  }
  
  /* RTL mobile sidebar transform */
  .dashboard-layout.rtl.sidebar-collapsed .sidebar {
    transform: translateX(100%);
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .content {
    padding: 1rem;
  }

  .navbar {
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    margin: 0 !important;
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .content {
    padding: 0.75rem;


  }
  .dashboard-layout {
    max-width: 100% !important;
  } 
  @media (max-width: 996px) {
    .content {
      margin-top: 115px;
    }
  }
}
</style> 