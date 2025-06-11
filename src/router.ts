// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import signIn from './components/modules/Auth/signIn.vue'
import DashboardLayout from './components/layout/DashboardLayout.vue'
import Dashboard from './views/Dashboard.vue'
import HelloWorld from './components/HelloWorld.vue'
import { authService } from './services/authService'
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
        meta: { title: 'Dashboard', requiresAuth: true },
        component: Dashboard
      },
      {
        path: 'attendance',
        name: 'Attendance',
        meta: { title: 'Record Attendance', requiresAuth: true },
        component: Attendance
      },
      {
        path: 'attendance-history',
        name: 'AttendanceHistory',
        meta: { title: 'Attendance History', requiresAuth: true },
        component: AttendanceHistory
      },
      {
        path : 'adminstrations',
        name : 'Adminstrations',
        meta : { title : 'Adminstrations', requiresAuth : true },
        component : Adminstrations,
        children : [
          {
            path : 'admins',
            name : 'Admins',
            meta : { title : 'Admins', requiresAuth : true },
            component : Admins
          },
          {
            path : 'roles',
            name : 'Roles',
            meta : { title : 'Roles', requiresAuth : true },
            component : Roles
          },
          {
            path : 'roles/create',
            name : 'CreateRole',
            meta : { title : 'New Role', requiresAuth : true },
            component : roleForm
          },
          {
            path : 'roles/edit/:id',
            name : 'EditRole',
            meta : { title : 'Edit Role', requiresAuth : true },
            component : roleForm
          },
          {
            path : 'admins/create',
            name : 'CreateAdmin',
            meta : { title : 'New Admin', requiresAuth : true },
            component : adminForm
          },
          {
            path : 'admins/edit/:id',
            name : 'EditAdmin',
            meta : { title : 'Edit Admin', requiresAuth : true },
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
  const isAuthenticated = authService.isAuthenticated();

  if (requiresAuth && !isAuthenticated) {
    next('/sign-in');
  } else if (to.path === '/sign-in' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router
