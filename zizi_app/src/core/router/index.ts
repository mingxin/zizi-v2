import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth — 公开路由
    {
      path: '/login',
      component: () => import('@/features/auth/pages/LoginPage.vue'),
      meta: { public: true }
    },
    {
      path: '/register',
      component: () => import('@/features/auth/pages/RegisterPage.vue'),
      meta: { public: true }
    },
    {
      path: '/forgot-password',
      component: () => import('@/features/auth/pages/ForgotPasswordPage.vue'),
      meta: { public: true }
    },
    // Photo-word (里程碑 4)
    {
      path: '/',
      component: () => import('@/features/photo-word/pages/HomePage.vue'),
    },
    {
      path: '/photo-word/result',
      component: () => import('@/features/photo-word/pages/ResultPage.vue'),
    },
    // Picture-book (里程碑 5 占位)
    // { path: '/books', component: () => import('@/features/picture-book/pages/BookListPage.vue') },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 路由守卫：未登录强制跳转 /login
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return { path: '/login' }
  }
  if (to.meta.public && auth.isLoggedIn && to.path !== '/') {
    return { path: '/' }
  }
})

export default router
