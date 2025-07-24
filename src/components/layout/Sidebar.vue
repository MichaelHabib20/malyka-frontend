<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import statusService from '../../services/statusService';
import { dataService } from '../../services/dataContext';
import { authService } from '../../services/authService';
import type { NavItem } from '../../interfaces/NavItem';

const { t, locale } = useI18n();

const props = defineProps<{
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'expand-sidebar'): void;
  (e: 'close-sidebar'): void;
}>();

const router = useRouter();
const expandedItems = ref<Set<string>>(new Set());
const isOnline = ref(statusService.isOnline());
const currentRoute = computed(() => router.currentRoute.value.path);

// Mobile detection
const isMobile = ref(false);

// RTL detection
const isRTL = computed(() => {
  return locale.value === 'ar';
});

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  statusService.subscribe((status) => {
    isOnline.value = status;
  });
  
  // Check mobile on mount
  checkMobile();
  
  // Add resize listener
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const isActive = (path?: string) => {
  if (!path) return false;
  return currentRoute.value === path;
};

const isParentActive = (item: NavItem) => {
  if (item.path && isActive(item.path)) return true;
  if (item.children) {
    return item.children.some(child => isActive(child.path));
  }
  return false;
};

const navItems = computed(() => [
  {
    title: t('navigation.dashboard'),
    icon: 'fa-solid fa-house',
    path: '/dashboard',
    isReady: () => {
      return isOnline.value;
    },
    permissions: ['dashboard'],
    rolesId: [1]
  },
  {
    title: t('navigation.students'),
    icon: 'fa-solid fa-user-graduate',
    path: '/students',
    permissions :['View students'],
    rolesId : [1],
    children: [
      {
        title: t('navigation.students'),
        icon: 'fa-solid fa-user-graduate',
        path: '/students',
        permissions :['View students'],
        rolesId : [1],
        isReady: () => {
          return isOnline.value;
        } 
      },
      {
        title: t('students.registerStudents'),
        icon: 'fa-solid fa-user-graduate',
        path: '/register-students',
        permissions :['View students'],
        rolesId : [1],  
        isReady: () => {
          return isOnline.value;
        }
      }
    ]
  },

  {
    title: t('navigation.attendance'),
    icon: 'fa-solid fa-clipboard-user',
    permissions :['View bc boys attendance','View bc girls attendance',
    'View kg1 boys attendance', 'View Kg1 girls attendance',
    'View Kg2 boys attendance', 'View kg2 girls attendance',
    'View Prim1 boys attendance','Bc boys attendance','Bc girls attendance',
    'kg1 boys attendance','kg1 girls attendance',
    'kg2 boys attendance','kg2 girls attendance',
    'Prim1 boys attendance'
    ],
    children: [
      {
        title: t('attendance.record'),
        path: '/attendance',
        permissions :['Bc boys attendance','Bc girls attendance', 'kg1 boys attendance', 'Kg1 girls attendance', 'kg2 boys attendance', 'kg2 girls attendance',  'Prim1 boys attendance'],
        rolesId: [1]
      },
      {
        title: t('attendance.history'),
        path: '/attendance-history',
        permissions :['View bc boys attendance','View bc girls attendance', 'View kg1 boys attendance', 'View Kg1 girls attendance', 'View Kg2 boys attendance', 'View kg2 girls attendance',  'View Prim1 boys attendance'],
        rolesId : [1],
        isReady: () => {
          return isOnline.value;
        }
      }
    ]

  },
  {
    title: t('navigation.administration'),
    icon: 'fa-solid fa-user-tie',
    permissions :['View admins','View roles'],
    rolesId : [1],
    children: [
    {
        title: t('navigation.admins'),
        icon: 'fa-solid fa-user-gear',
        path: '/adminstrations/admins',
        permissions :['View admins'],
        rolesId : [1],
        isReady: () => {
          return isOnline.value;
        }
      },
      {
        title: t('navigation.roles'),
        icon: 'fa-solid fa-user-shield',
        path: '/adminstrations/roles',
        permissions :['View roles'],
        rolesId : [1],
        isReady: () => {
          return isOnline.value;
        }
      }

    ]
  },
  {
    title: t('navigation.gradeLevels'),
    icon: 'fa-solid fa-graduation-cap',
    children: [
      {
        title: t('navigation.grades'),
        icon: 'fa-solid fa-graduation-cap',
        path: '/grade-levels/grades',
        permissions: [''],
        rolesId: [1]
      },
      {
        title: t('navigation.classes'),
        icon: 'fa-solid fa-graduation-cap',
        path: '/grade-levels/classes',
        permissions: [''],
        rolesId: [1]
      }
    ]
  },
  {
    title: t('navigation.events'),
    icon: 'fa-solid fa-calendar-days',
    path: '/events/enrollments',
    permissions :['View events'],
    rolesId : [1],
    children: [
      {
        title: t('events.enrollment'),
        path: '/events/enrollments',
        permissions :['View events'],
        rolesId : [1],
      }
    ]
  }

]);

const toggleItem = (title: string) => {
  if (expandedItems.value.has(title)) {
    expandedItems.value.delete(title);
  } else {
    expandedItems.value.add(title);
  }
};

const isItemExpanded = (title: string) => {
  return expandedItems.value.has(title);
};

const sidebarWidth = computed(() => props.isCollapsed ? '80px' : '220px');

const navigateTo = (item: NavItem) => {
  if (!item.isReady || (item.isReady && item.isReady())) {
    if (item.path) {
      router.push(item.path);
      
      // Close sidebar on mobile after navigation
      if (isMobile.value) {
        emit('close-sidebar');
      }
    }
  } else {
    dataService.createAlertMessage(t('common.offlineMessage'), 'warning');
  }
};

// New function to handle icon clicks when sidebar is collapsed
const handleIconClick = (item: NavItem, event: Event) => {
  if (props.isCollapsed) {
    // Prevent the default click behavior
    event.stopPropagation();
    
    // Expand the sidebar first
    emit('expand-sidebar');
    
    // If the item has children, expand it after a short delay to allow sidebar animation
    if (item.children) {
      setTimeout(() => {
        toggleItem(item.title);
      }, 300); // Wait for sidebar expansion animation
    } else if (item.path) {
      // If no children but has path, navigate after sidebar expansion
      setTimeout(() => {
        navigateTo(item);
      }, 300);
    }
  }
};

// New function to handle navigation with mobile consideration
const handleNavigation = (item: NavItem) => {
  if (item.children) {
    toggleItem(item.title);
  } else {
    navigateTo(item);
  }
};

// const isDataCached = (title: string) => {
//   return false;
// }

// Filter navigation items based on user permissions and roles
const filteredNavItems = computed(() => {
  return navItems.value.filter(item => {
    // If user has role ID 1, they have full access (super admin)
    if (authService.hasRole(1)) {
      return true;
    }
    
    // For non-role-1 users, only check permissions, ignore roles
    if (item.permissions && item.permissions.length > 0) {
      if (!authService.hasAnyPermission(item.permissions)) {
        return false;
      }
    }
    
    // Filter children if they exist
    if (item.children) {
      const filteredChildren = item.children.filter(child => {
        // If user has role ID 1, they have full access to children too
        if (authService.hasRole(1)) {
          return true;
        }
        
        // For non-role-1 users, only check child permissions, ignore roles
        if (child.permissions && child.permissions.length > 0) {
          if (!authService.hasAnyPermission(child.permissions)) {
            return false;
          }
        }
        
        return true;
      });
      
      // Only show parent if it has visible children
      return filteredChildren.length > 0;
    }
    
    return true;
  }).map(item => {
    // Create a new object with filtered children
    if (item.children) {
      const filteredChildren = item.children.filter(child => {
        // If user has role ID 1, they have full access to children too
        if (authService.hasRole(1)) {
          return true;
        }
        
        // For non-role-1 users, only check child permissions, ignore roles
        if (child.permissions && child.permissions.length > 0) {
          if (!authService.hasAnyPermission(child.permissions)) {
            return false;
          }
        }
        
        return true;
      });
      
      return {
        ...item,
        children: filteredChildren
      };
    }
    
    return item;
  });
});
</script>

<template>
  <aside class="sidebar" :class="{ 'rtl': isRTL }" :style="{ width: sidebarWidth }">
    <div class="sidebar-header">
      <!-- <img src="/vite.svg" alt="Logo" class="logo" v-if="!isCollapsed" />
      <img src="/vite.svg" alt="Logo" class="logo-small" v-else /> -->
      <h2 v-if="!isCollapsed">{{ t('app.title') }}</h2>
      <h2 v-else>M</h2>
    </div>
    
    <nav class="sidebar-nav">
      <div v-for="item in filteredNavItems" :key="item.title" class="nav-item">
        <div 
          class="nav-item-header"
          @click="props.isCollapsed ? handleIconClick(item, $event) : handleNavigation(item)"
          :class="{ 
            'has-children': item.children,
            'active': isParentActive(item)
          }"
        >
          <template v-if="item.icon">
            <i :class="item.icon"></i>
          </template>
          <span class="title" :class="{ 'ms-3': !isRTL, 'me-3': isRTL }" v-if="!isCollapsed">{{ item.title }}</span>
          <span 
            class="expand-icon" 
            v-if="item.children && !isCollapsed"
            :class="{ 'expanded': isItemExpanded(item.title) }"
          >
            <i class="fa-solid fa-chevron-down"></i>
          </span>
        </div>
        
        <div 
          v-if="item.children && !isCollapsed && isItemExpanded(item.title)"
          class="nav-children"
        >
          <div 
            v-for="child in item.children" 
            :key="child.title"
            class="nav-child-item"
            :class="{ 'active': isActive(child.path) }"
            @click="navigateTo(child)"
          >
            <span class="title">{{ child.title  }}</span>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease;
  overflow-x: hidden;
}

/* RTL Sidebar shadow */
.sidebar.rtl {
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.logo {
  height: 40px;
  width: auto;
}

.logo-small {
  height: 30px;
  width: 30px;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-item-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #2c3e50;
}

.nav-item-header:hover {
  background-color: #f8f9fa;
}

.nav-item-header.has-children {
  justify-content: space-between;
}

.nav-item-header.active {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.nav-item-header.active:hover {
  background-color: #bbdefb;
}

.icon {
  font-size: 1.25rem;
  margin-right: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

/* RTL Icon positioning */
.sidebar.rtl .icon {
  margin-right: 0;
  margin-left: 1rem;
}

.title {
  flex: 1;
  white-space: nowrap;
}

.expand-icon {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.nav-children {
  /* padding-left: 2.5rem; */
  margin-top: 0.25rem;
}

.nav-child-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem 3.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #2c3e50;
  
}

/* RTL Child item padding */
.sidebar.rtl .nav-child-item {
  padding: 0.5rem 3.5rem 0.5rem 1rem;
}

.nav-child-item:hover {
  background-color: #f8f9fa;
}

.nav-child-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.nav-child-item.active:hover {
  background-color: #bbdefb;
}

.nav-child-item .icon {
  font-size: 1rem;
  margin-right: 0.75rem;
}

/* RTL Child item icon */
.sidebar.rtl .nav-child-item .icon {
  margin-right: 0;
  margin-left: 0.75rem;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .sidebar {
    width: 280px !important; /* Fixed width on mobile */
    max-width: 85vw;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar.rtl {
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-header {
    padding: 1.25rem 1rem;
  }
  
  .sidebar-header h2 {
    font-size: 1.5rem;
  }
  
  .nav-item-header {
    padding: 1rem;
    min-height: 56px; /* Better touch target */
  }
  
  .nav-child-item {
    padding: 0.75rem 1rem 0.75rem 3.5rem;
    min-height: 48px; /* Better touch target */
  }
  
  .sidebar.rtl .nav-child-item {
    padding: 0.75rem 3.5rem 0.75rem 1rem;
  }
  
  .icon {
    font-size: 1.5rem;
    margin-right: 1.25rem;
    min-width: 2rem;
  }
  
  .sidebar.rtl .icon {
    margin-right: 0;
    margin-left: 1.25rem;
  }
  
  .title {
    font-size: 1rem;
  }
  
  .expand-icon {
    font-size: 1rem;
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .sidebar {
    width: 260px !important;
  }
  
  .nav-item-header {
    padding: 0.875rem 1rem;
  }
  
  .nav-child-item {
    padding: 0.625rem 1rem 0.625rem 3.5rem;
  }
  
  .sidebar.rtl .nav-child-item {
    padding: 0.625rem 3.5rem 0.625rem 1rem;
  }
  
  .icon {
    font-size: 1.375rem;
    margin-right: 1rem;
  }
  
  .sidebar.rtl .icon {
    margin-right: 0;
    margin-left: 1rem;
  }
  
  .title {
    font-size: 0.95rem;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .nav-item-header:hover {
    background-color: transparent;
  }
  
  .nav-item-header:active {
    background-color: #f8f9fa;
  }
  
  .nav-child-item:hover {
    background-color: transparent;
  }
  
  .nav-child-item:active {
    background-color: #f8f9fa;
  }
}
</style> 