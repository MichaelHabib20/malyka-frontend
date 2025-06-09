// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import signIn from './components/modules/Auth/signIn.vue'
import DashboardLayout from './components/layout/DashboardLayout.vue'
import Dashboard from './views/Dashboard.vue'
import HelloWorld from './components/HelloWorld.vue'
import { authService } from './services/authService'
import Attendance from './views/attendance.vue'
import AttendanceHistory from './views/attendanceHistory.vue'

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
        path: 'view-attendance',
        name: 'AttendanceHistory',
        meta: { title: 'Attendance History', requiresAuth: true },
        component: AttendanceHistory
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
