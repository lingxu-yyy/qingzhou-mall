<template>
  <div class="myheader" :class="{ 'is-scrolled': isScrolled }">
    <div class="top-nav">
      <div class="top-inner">
        <div class="welcome-text">
          {{ userStore.isLoggedIn ? `你好，${userStore.userName}` : '你好，欢迎来到轻舟商城' }}
        </div>
        <div class="right-links">
          <template v-if="userStore.isLoggedIn">
            <div class="member-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
              <router-link to="/member" class="member-link">会员中心</router-link>
              <div v-show="showDropdown" class="dropdown-menu">
                <router-link
                  v-if="userStore.user?.role === 'admin'"
                  to="/admin"
                  class="dropdown-item admin-entry"
                >
                  管理控制台
                </router-link>
                <router-link to="/member" class="dropdown-item">个人中心</router-link>
                <router-link to="/member?tab=contacts" class="dropdown-item">收货地址</router-link>
                <router-link to="/member?tab=favorites" class="dropdown-item">我的收藏</router-link>
                <router-link to="/member?tab=history" class="dropdown-item">个人足迹</router-link>
                <router-link to="/member?tab=orders" class="dropdown-item">我的订单</router-link>
                <router-link to="/member?tab=unpaid" class="dropdown-item">未支付订单</router-link>
                <router-link to="/member?tab=recharge" class="dropdown-item">账户充值</router-link>
                <router-link to="/member?tab=settings" class="dropdown-item">个人设置</router-link>
                <div class="dropdown-divider"></div>
                <a href="javascript:void(0)" class="dropdown-item logout" @click="logout">退出登录</a>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link to="/login">登录</router-link>
            <span class="divider">|</span>
            <router-link to="/register">注册</router-link>
          </template>
        </div>
      </div>
    </div>

    <div class="main-header">
      <div class="header-inner">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <span class="logo-mark">舟</span>
            <h1>轻舟商城</h1>
          </router-link>
        </div>
        <div class="search-box">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="请输入查询关键字"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">搜索</button>
        </div>
        <div class="cart-wrapper" @mouseenter="handleCartEnter" @mouseleave="showCart = false">
          <div class="cart-icon" @click="goToCart">
            <ShoppingCart />
            <span v-if="cartStore.totalCount > 0" class="cart-badge">{{ cartStore.totalCount }}</span>
          </div>

          <div v-show="userStore.isLoggedIn && showCart" class="cart-dropdown">
            <div class="cart-title">购物车</div>
            <div class="cart-items" v-if="cartStore.items.length > 0">
              <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
                <img :src="item.image" alt="商品图片" class="cart-item-img" />
                <div class="cart-item-info">
                  <div class="cart-item-name">{{ item.name }}</div>
                  <div class="cart-item-price">¥{{ Number(item.price || 0).toFixed(2) }} x {{ item.quantity }}</div>
                </div>
                <div class="cart-item-total">¥{{ (Number(item.price || 0) * (item.quantity || 0)).toFixed(2) }}</div>
              </div>
              <div class="cart-summary">
                <span class="cart-total-text">共: ¥{{ Number(cartStore.totalPrice || 0).toFixed(2) }}</span>
              </div>
              <button class="checkout-btn" @click.stop="goToCart">去购物车</button>
            </div>
            <div class="cart-empty" v-else>
              <span>购物车是空的</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sub-nav">
      <div class="sub-inner">
        <router-link to="/" :class="{ active: route.path === '/' }">首页</router-link>
        <router-link to="/category" :class="{ active: route.path === '/category' }">全部分类</router-link>
        <router-link to="/">新品</router-link>
        <router-link
          to="/member?tab=orders"
          :class="{ active: route.path === '/member' && route.query.tab === 'orders' }"
        >我的订单</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const userStore = useUserStore()

const showDropdown = ref(false)
const searchKeyword = ref('')
const showCart = ref(false)
const isScrolled = ref(false)

const onScroll = () => {
  isScrolled.value = window.scrollY > 0
}

const handleCartEnter = () => {
  if (!userStore.isLoggedIn) return
  cartStore.loadCart()
  showCart.value = true
}

const logout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const goToCart = () => {
  showCart.value = false
  router.push('/cart')
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/category', query: { keyword } })
  } else {
    ElMessage.warning('请输入搜索关键词')
  }
}

const handleStorageChange = () => {
  userStore.loadUser()
  cartStore.loadCart()
}

watch(() => route.path, () => {
  userStore.loadUser()
  cartStore.loadCart()
})

onMounted(() => {
  userStore.loadUser()
  cartStore.loadCart()
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.myheader {
  width: 100%;
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 900;
  transition: box-shadow var(--transition-fast);
}

.myheader.is-scrolled {
  box-shadow: var(--shadow-sm);
}

/* ===== 顶部信息条 ===== */
.top-nav {
  height: 36px;
  line-height: 36px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.top-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.welcome-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.right-links {
  display: flex;
  align-items: center;
}

.right-links > a {
  margin: 0 12px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  transition: color var(--transition-fast);
}

.right-links > a:hover {
  color: var(--primary-color);
}

.right-links .divider {
  color: var(--border-color);
  font-size: 12px;
}

.member-dropdown {
  position: relative;
  display: inline-block;
  margin-left: 12px;
}

.member-link {
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.member-link:hover {
  color: var(--primary-color);
}

.dropdown-menu {
  position: absolute;
  top: 34px;
  right: 0;
  min-width: 150px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  padding: 8px 0;
  overflow: hidden;
  transform-origin: top right;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dropdown-menu .dropdown-item,
.dropdown-menu .dropdown-item:link,
.dropdown-menu .dropdown-item:visited {
  display: block;
  padding: 10px 20px;
  font-size: 13px;
  color: var(--text-primary) !important;
  text-decoration: none;
  margin: 0;
  transition: all var(--transition-fast);
  white-space: nowrap;
  font-weight: 500;
}

.dropdown-item:hover {
  background: var(--primary-light);
  color: var(--primary-color) !important;
  padding-left: 24px;
}

.dropdown-item.admin-entry {
  color: var(--primary-color) !important;
  font-weight: 600;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
  color: var(--danger-color) !important;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

/* ===== 主头部 ===== */
.main-header {
  padding: 14px 0;
  background: var(--bg-primary);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-mark {
  width: 22px;
  height: 22px;
  margin-right: 8px;
  background: var(--primary-color);
  color: var(--text-white);
  font-size: 14px;
  font-weight: 700;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo h1 {
  color: var(--text-primary);
  font-size: 26px;
  margin: 0;
  font-weight: 700;
  line-height: 1;
}

/* ===== 搜索框（一体化） ===== */
.search-box {
  flex: 1;
  max-width: 450px;
  margin: 0 30px;
  display: flex;
  height: 44px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 68, 0, 0.08);
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 0 14px;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  width: 88px;
  height: 100%;
  background: var(--primary-color);
  color: var(--text-white);
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background var(--transition-fast);
}

.search-btn:hover {
  background: var(--primary-hover);
}

/* ===== 购物车 ===== */
.cart-wrapper {
  position: relative;
  display: inline-block;
}

.cart-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.cart-icon:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}

.cart-icon svg {
  width: 22px;
  height: 22px;
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary-color);
  color: var(--text-white);
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.cart-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 360px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  padding: 12px;
  border-radius: var(--radius-md);
}

.cart-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--text-primary);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 10px;
}

.cart-items {
  max-height: 300px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.cart-item-price {
  font-size: 12px;
  color: var(--text-muted);
}

.cart-item-total {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: bold;
}

.cart-summary {
  padding: 10px 0;
  border-top: 1px solid var(--border-light);
  margin-top: 10px;
  text-align: right;
}

.cart-total-text {
  font-size: 14px;
  font-weight: bold;
  color: var(--text-primary);
}

.checkout-btn {
  width: 100%;
  background: var(--primary-color);
  color: var(--text-white);
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.checkout-btn:hover {
  background: var(--primary-hover);
}

.cart-empty {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

/* ===== 子导航 ===== */
.sub-nav {
  height: 44px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.sub-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: stretch;
  gap: 28px;
}

.sub-nav a {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.sub-nav a:hover {
  color: var(--primary-color);
}

.sub-nav a.active {
  color: var(--primary-color);
  font-weight: 600;
}

.sub-nav a.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--primary-color);
}

/* ===== 键盘焦点可见性 ===== */
.myheader a:focus-visible,
.myheader button:focus-visible,
.myheader .cart-icon:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: 2px;
}

.myheader .cart-icon:focus-visible {
  border-radius: var(--radius-sm);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .logo h1 {
    font-size: 20px;
  }

  .logo-mark {
    width: 18px;
    height: 18px;
    font-size: 12px;
  }

  .search-box {
    display: none;
  }

  .welcome-text {
    font-size: 12px;
  }

  .sub-inner {
    overflow-x: auto;
    white-space: nowrap;
    gap: 20px;
    -webkit-overflow-scrolling: touch;
  }

  .sub-nav a {
    flex-shrink: 0;
  }
}
</style>
