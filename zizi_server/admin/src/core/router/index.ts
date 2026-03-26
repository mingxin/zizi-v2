import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
        { path: 'users', component: () => import('@/pages/UsersPage.vue') },
        { path: 'books', component: () => import('@/pages/BooksPage.vue') },
        { path: 'photo-words', component: () => import('@/pages/PhotoWordsPage.vue') },
        { path: 'config', component: () => import('@/pages/ConfigPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(to => {
  const token = localStorage.getItem('zizi_admin_token')
  if (!to.meta.public && !token) return '/login'
  if (to.meta.public && token) return '/dashboard'
})

export default router
