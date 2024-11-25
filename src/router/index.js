import { createRouter, createWebHistory } from 'vue-router'
import Casino from '@/components/Casino.vue'
import ApiDoc from '../views/ApiDoc.vue'
import NotFound from '../views/NotFound.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import GameSelect from '../views/GameSelect.vue'
import TripleDice from '@/components/TripleDice.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/games'  // 修改为直接跳转到游戏选择页
  },
  {
    path: '/games',
    name: 'GameSelect',
    component: GameSelect,
    meta: { requiresAuth: true }
  },
  {
    path: '/casino',
    name: 'Casino',
    component: Casino,
    meta: { requiresAuth: true }
  },
  {
    path: '/apidoc',
    name: 'ApiDoc',
    component: ApiDoc
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/triple-dice',
    name: 'TripleDice',
    component: TripleDice,
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/StatsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  
  // 需要认证的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 尝试从 localStorage 恢复认证状态
    if (!authStore.initAuth()) {
      return { name: 'Login' }
    }
  }
  
  // 已登录用户访问登录和注册页时重定向到游戏选择页
  if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    return { name: 'GameSelect' }
  }

  return true
})

export default router 