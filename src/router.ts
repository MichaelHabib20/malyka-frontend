// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import signIn from './components/modules/Auth/signIn.vue'
import DashboardLayout from './components/layout/DashboardLayout.vue'
import Dashboard from './views/Dashboard.vue'
import HelloWorld from './components/HelloWorld.vue'
import { authService } from './services/authService'
import { statusService } from './services/statusService'
import Attendance from './views/attendance.vue'
import AttendanceHistory from './views/attendanceHistory.vue'
import Adminstrations from './views/adminstrations.vue'
import Admins from './views/admins.vue'
import Roles from './views/roles.vue'
import roleForm from './views/roleForm.vue'
import adminForm from './views/adminForm.vue'
const routes = [
  { 
    path: '/sign-in', 
    name: 'signIn', 
    component: signIn,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: { title: 'Dashboard', requiresAuth: true, },
        component: Dashboard
      },
      {
        path: 'attendance',
        name: 'Attendance',
        meta: { title: 'Record Attendance',
                requiresAuth: true,
                permissions :['Bc boys attendance','Bc girls attendance', 'kg1 boys attendance', 'Kg1 girls attendance', 'kg2 boys attendance', 'kg2 girls attendance',  'Prim1 boys attendance'],
                rolesId : [1]
              },
        component: Attendance
      },  
      {
        path: 'attendance-history',
        name: 'AttendanceHistory',
        meta: { title: 'Attendance History',
             requiresAuth: true, requiredNetwork : true,
             permissions :['View bc boys attendance','View bc girls attendance', 'View kg1 boys attendance', 'View Kg1 girls attendance', 'View Kg2 boys attendance', 'View kg2 girls attendance',  'View Prim1 boys attendance'],
             rolesId : [1]
            },
        component: AttendanceHistory
      },
      {
        path : 'adminstrations',
        name : 'Adminstrations',
        meta : { title : 'Adminstrations',
                requiresAuth : true ,
                requiredNetwork : true,
                rolesId : [1]
              },
        component : Adminstrations,
        children : [
          {
            path : 'admins',
            name : 'Admins',
            meta : { title : 'Admins',
                    requiresAuth : true,
                    requiredNetwork : true,
                    permissions : ['View admins'],
                    rolesId : [1]
              },
            component : Admins
          },
          {
            path : 'roles',
            name : 'Roles',
            meta : { title : 'Roles',  
                    requiresAuth : true,
                    requiredNetwork : true,
                    permissions : ['View roles'],
                    rolesId : [1]
            },
            component : Roles
          },
          {
            path : 'roles/create',
            name : 'CreateRole',
            meta : { title : 'New Role',
                    requiresAuth : true,
                    requiredNetwork : true,
                    permissions : ['Add roles'],
                    rolesId : [1]
            },
            component : roleForm
          },
          {
            path : 'roles/edit/:id',
            name : 'EditRole',
            meta : { title : 'Edit Role',
                    requiresAuth : true,
                    requiredNetwork : true,
                    permissions : ['Update roles'],
                    rolesId : [1]
            },
            component : roleForm
          },
          {
            path : 'admins/create',
            name : 'CreateAdmin',
            meta : { title : 'New Admin',
                    requiresAuth : true,
                    requiredNetwork : true,
                    permissions : ['Add admins'],
                    rolesId : [1]
            },
            component : adminForm
          },
          {
            path : 'admins/edit/:id',
            name : 'EditAdmin',
            meta : { title : 'Edit Admin',
                    requiresAuth : true,
                    requiredNetwork : true,
                    permissions : ['Update admins'],
                    rolesId : [1]
            },
            component : adminForm
          }
        ]
      },
      {
        path: 'ziko',
        name: 'ziko',
        meta: { requiresAuth: true },
        component: HelloWorld
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(), // use createWebHashHistory() if you prefer hash mode
  routes,
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresNetwork = to.matched.some(record => record.meta.requiredNetwork);
  const isAuthenticated = authService.isAuthenticated();
  const isOnline = statusService.isOnline();

  // Check authentication first
  if (requiresAuth && !isAuthenticated) {
    next('/sign-in');
    return;
  }

  // If user is authenticated but trying to access sign-in page, redirect to home
  if (to.path === '/sign-in' && isAuthenticated) {
    next('/');
    return;
  }

  // Check network requirement
  if (requiresNetwork && !isOnline) {
    ElMessage({
      message: 'This page requires an internet connection. Please check your network and try again.',
      type: 'warning'
    });
    next(from.path);
    return;
  }

  // Check permissions and roles for authenticated routes
  if (requiresAuth && isAuthenticated) {
    // If user has role ID 1 (super admin), allow access immediately
    console.log(authService.hasRole(1))
    if (authService.hasRole(1)) {
      next();
      return;
    }

    // For non-super admin users, check only permissions
    const hasRequiredPermissions = to.matched.every(record => {
      const requiredPermissions = record.meta.permissions as string[] | undefined;
      console.log(requiredPermissions)
      return !requiredPermissions || authService.hasAnyPermission(requiredPermissions);
    });
    console.log(hasRequiredPermissions)
    if (!hasRequiredPermissions) {
      ElMessage({
        message: 'You do not have the required permissions to access this page.',
        type: 'error'
      });
      next(from.path);
      return;
    }
  }

  next();
});

export default router
