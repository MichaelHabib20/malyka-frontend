// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import signIn from './components/modules/Auth/signIn.vue'
import DashboardLayout from './components/layout/DashboardLayout.vue'
import Dashboard from './views/Dashboard.vue'
import HelloWorld from './components/HelloWorld.vue'

const routes = [
  { 
    path: '/sign-in', 
    name: 'signIn', 
    component: signIn 
  },
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: { title: 'Dashboard' },
        component: Dashboard
      },
      {
        path: 'ziko',
        name : 'ziko',
        component : HelloWorld
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(), // use createWebHashHistory() if you prefer hash mode
  routes,
})

export default router
