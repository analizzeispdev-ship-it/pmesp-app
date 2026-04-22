import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/primeiro-acesso',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePasswordView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/efetivo',
    name: 'Efetivo',
    component: () => import('@/views/EfetivoView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/gestao/usuarios',
    name: 'GestaoUsuarios',
    component: () => import('@/views/GestaoUsuariosView.vue'),
    meta: { requiresAuth: true, requiresCargo: 'p1' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) return true

  if (!auth.isAuthenticated) return '/login'

  if (auth.needsPasswordChange && to.name !== 'ChangePassword') {
    return '/primeiro-acesso'
  }

  if (!auth.needsPasswordChange && to.name === 'ChangePassword') {
    return '/'
  }

  if (to.meta.requiresCargo && auth.user?.cargo !== to.meta.requiresCargo && auth.user?.role !== 'admin') {
    return '/'
  }

  return true
})

export default router
