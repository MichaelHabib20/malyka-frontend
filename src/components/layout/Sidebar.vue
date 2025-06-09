<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import statusService from '../../services/statusService';
interface NavItem {
  title: string;
  icon?: string;
  path?: string;
  children?: NavItem[];
  isReady?: () => boolean;
}

const props = defineProps<{
  isCollapsed: boolean;
}>();

const router = useRouter();
const expandedItems = ref<Set<string>>(new Set());
  const isOnline = ref(statusService.isOnline());
const currentRoute = computed(() => router.currentRoute.value.path);
onMounted(() => {
  statusService.subscribe((status) => {
    isOnline.value = status;
  });
})
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

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    icon: 'fa-solid fa-house',
    path: '/dashboard'
  },
  {
    title: 'Administration',
    icon: 'fa-solid fa-user-tie',
    children: [
    {
        title: 'Admins',
        icon: 'fa-solid fa-user-gear',
        path: '/administration/admins'
      },
      {
        title: 'Roles',
        icon: 'fa-solid fa-user-shield',
        path: '/administration/roles'
      }

    ]
  },
  {
    title: 'Attendance',
    icon: 'fa-solid fa-clipboard-user',
    children: [
      {
        title: 'Record',
        path: '/attendance'
      },
      {
        title: 'History',
        path: '/view-attendance'
      }
    ]
  //   isReady: () => {
  //   return isOnline || isDataCached('attendance');
  // }
  }
  // {
  //   title: 'Users',
  //   icon: 'fa-solid fa-users',
  //   children: [
  //     {
  //       title: 'All Users',
  //       icon: '👤',
  //       path: '/users'
  //     },
  //     {
  //       title: 'Add User',
  //       icon: '➕',
  //       path: '/users/add'
  //     }
  //   ]
  // },
  // {
  //   title: 'Settings',
  //   icon: '⚙️',
  //   children: [
  //     {
  //       title: 'Profile',
  //       icon: '👤',
  //       path: '/settings/profile'
  //     },
  //     {
  //       title: 'Security',
  //       icon: '🔒',
  //       path: '/settings/security'
  //     }
  //   ]
  // }
];

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

const navigateTo = (path?: string) => {
  if (path) {
    router.push(path);
  }
};
const isDataCached = (title: string) => {
  return false;
}
</script>

<template>
  <aside class="sidebar" :style="{ width: sidebarWidth }">
    <div class="sidebar-header">
      <!-- <img src="/vite.svg" alt="Logo" class="logo" v-if="!isCollapsed" />
      <img src="/vite.svg" alt="Logo" class="logo-small" v-else /> -->
      <h2 v-if="!isCollapsed">Malika</h2>
      <h2 v-else>M</h2>
    </div>
    
    <nav class="sidebar-nav">
      <div v-for="item in navItems" :key="item.title" class="nav-item">
        <div 
          class="nav-item-header"
          @click="item.children ? toggleItem(item.title) : navigateTo(item.path)"
          :class="{ 
            'has-children': item.children,
            'active': isParentActive(item)
          }"
        >
          <template v-if="item.icon">
            <i :class="item.icon"></i>
          </template>
          <span class="title ms-3" v-if="!isCollapsed">{{ item.title }}</span>
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
            @click="navigateTo(child.path)"
          >
            <span class="title">{{ child.title }}</span>
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
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #2c3e50;
  
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
</style> 