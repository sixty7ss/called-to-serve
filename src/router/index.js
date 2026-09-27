import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'

import { getCurrentUser, isAdmin, logout } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },

    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: {
        requiresAdmin: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) {
    return true
  }

  const user = await getCurrentUser()

  if (!user) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (!isAdmin(user)) {
    await logout()

    return {
      name: 'login',
      query: {
        unauthorized: '1',
      },
    }
  }

  return true
})

export default router
