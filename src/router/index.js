import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { logger } from '../utils/logger'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  { 
    path: '/member', 
    name: 'Member', 
    component: () => import('../views/Member.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/product/:id', 
    name: 'ProductDetail', 
    component: () => import('../views/ProductDetail.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/payment', 
    name: 'Payment', 
    component: () => import('../views/Payment.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/category', 
    name: 'CategoryList', 
    component: () => import('../views/CategoryList.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/admin', 
    name: 'Admin', 
    component: () => import('../views/Admin.vue'),
    meta: {
      requiresAuth: true,
      adminOnly: true,
      layout: 'admin',
      title: '轻舟商城 · 管理控制台'
    }
  },
  { 
    path: '/order-detail', 
    name: 'OrderDetail', 
    component: () => import('../views/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/cart', 
    name: 'Cart', 
    component: () => import('../views/Cart.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

router.beforeEach((to, from) => {
  const startTime = Date.now();
  
  const userStore = useUserStore()
  
  if (!userStore.user) {
    userStore.loadUser()
  }
  
  const isLoggedIn = userStore.isLoggedIn
  // 通过 JWT/用户记录中的 role 字段判断管理员身份，避免依赖用户名
  const isAdmin = isLoggedIn && userStore.user?.role === 'admin'
  
  const routeInfo = {
    from: {
      path: from.path,
      name: from.name,
      params: from.params,
      query: from.query
    },
    to: {
      path: to.path,
      name: to.name,
      params: to.params,
      query: to.query,
      fullPath: to.fullPath,
      meta: { ...to.meta }
    },
    isLoggedIn,
    user: isLoggedIn ? { id: userStore.userId, username: userStore.userName } : null,
    timestamp: new Date().toISOString()
  };
  
  logger.route('路由导航开始', routeInfo);
  
  let navigationTarget = true

  if (to.meta.requiresAuth && !isLoggedIn) {
    logger.warn('路由拦截 - 未登录', {
      targetPath: to.path,
      redirectTo: '/login',
      action: '保存重定向地址并跳转登录页'
    });
    sessionStorage.setItem('redirectUrl', to.fullPath)
    navigationTarget = '/login'
  } else if (to.meta.adminOnly && !isAdmin) {
    logger.warn('路由拦截 - 非管理员访问管理端', {
      targetPath: to.path,
      redirectTo: '/',
      username: userStore.userName
    });
    navigationTarget = '/'
  } else if (to.meta.guestOnly && isLoggedIn) {
    const redirectUrl = sessionStorage.getItem('redirectUrl')
    sessionStorage.removeItem('redirectUrl')
    const targetUrl = isAdmin ? '/admin' : (redirectUrl || '/')
    
    logger.info('路由拦截 - 已登录用户访问登录页', {
      currentPath: to.path,
      redirectTo: targetUrl,
      action: '跳转到之前的页面或首页'
    });
    
    navigationTarget = targetUrl
  } else {
    logger.debug('路由放行', {
      path: to.path,
      requiresAuth: to.meta.requiresAuth,
      adminOnly: to.meta.adminOnly,
      isLoggedIn
    });
  }
  
  const duration = Date.now() - startTime;
  logger.route(`路由导航完成 (${duration}ms)`, {
    from: from.path,
    to: to.path,
    duration: `${duration}ms`,
    navigationTarget
  });

  return navigationTarget
})

router.afterEach((to, from) => {
  document.title = to.meta.title || '轻舟商城 - 在线购物商城'
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  logger.route('路由导航结束', {
    from: from.path,
    to: to.path,
    timestamp: new Date().toISOString()
  });
})

router.onError((error) => {
  logger.error('路由错误', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

export default router
