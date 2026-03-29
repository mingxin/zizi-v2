import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth -- public routes
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
    // Photo-word
    {
      path: '/',
      component: () => import('@/features/photo-word/pages/HomePage.vue'),
    },
    {
      path: '/photo-word/result',
      component: () => import('@/features/photo-word/pages/ResultPage.vue'),
    },
    // Picture-book routes
    {
      path: '/books',
      component: () => import('@/features/picture-book/pages/BookListPage.vue'),
    },
    {
      path: '/books/capture',
      component: () => import('@/features/picture-book/pages/CapturePage.vue'),
    },
    {
      path: '/books/:id',
      component: () => import('@/features/picture-book/pages/BookPlaybackPage.vue'),
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
