import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth -- public routes (no header/footer)
    {
      path: '/login',
      component: () => import('@/features/auth/pages/LoginPage.vue'),
      meta: { public: true, showHeader: false, showTab: false },
    },
    {
      path: '/register',
      component: () => import('@/features/auth/pages/RegisterPage.vue'),
      meta: { public: true, showHeader: false, showTab: false },
    },
    {
      path: '/forgot-password',
      component: () => import('@/features/auth/pages/ForgotPasswordPage.vue'),
      meta: { public: true, showHeader: false, showTab: false },
    },
    // Photo-word
    {
      path: '/',
      component: () => import('@/features/photo-word/pages/HomePage.vue'),
      meta: { title: '大眼睛看世界', showSettings: true, showTab: true },
    },
    {
      path: '/photo-word/result',
      component: () => import('@/features/photo-word/pages/ResultPage.vue'),
      meta: { title: '', showBack: true, showTab: false },
    },
    // Picture-book routes
    {
      path: '/books',
      component: () => import('@/features/picture-book/pages/BookListPage.vue'),
      meta: { title: '我的绘本', showSettings: true, showTab: true },
    },
    {
      path: '/books/capture',
      component: () => import('@/features/picture-book/pages/CapturePage.vue'),
      meta: { title: '拍摄绘本', showBack: true, showTab: false },
    },
    {
      path: '/books/:id',
      component: () => import('@/features/picture-book/pages/BookPlaybackPage.vue'),
      meta: { title: '', showBack: true, showTab: false, headerSlot: true },
    },
    // Catch-all redirect
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Route guard: force redirect to /login when not logged in
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
