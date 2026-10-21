<template>
  <div class="myheader">
    <div class="top-nav">
      <div class="top-inner">
        <div class="right-links">
          <template v-if="userStore.isLoggedIn">
            <span>欢迎{{ userStore.userName }}</span>
            <span>|</span>
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
            <span>|</span>
            <router-link to="/register">注册</router-link>
          </template>
        </div>
      </div>
    </div>
    
    <div class="main-header">
      <div class="header-inner">
        <div class="logo">
          <router-link to="/"><h1>轻舟商城</h1></router-link>
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
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.myheader {
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.top-nav {
  height: 36px;
  line-height: 36px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
}

.top-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
}

.top-nav a {
  margin: 0 12px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 12px;
  transition: color 0.2s ease;
}

.top-nav a:hover {
  color: #93c5fd;
}

.top-nav span {
  color: #e2e8f0;
  margin: 0 5px;
  font-weight: 500;
}

.member-dropdown {
  position: relative;
  display: inline-block;
}

.member-link {
  cursor: pointer;
  font-size: 12px;
  color: #cbd5e1;
  text-decoration: none;
  margin: 0 12px;
  transition: color 0.2s ease;
}

.member-link:hover {
  color: #93c5fd;
}

.dropdown-menu {
  position: absolute;
  top: 34px;
  right: 0;
  min-width: 150px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
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
  padding: 12px 20px;
  font-size: 14px;
  color: #334155 !important;
  text-decoration: none;
  margin: 0;
  transition: all 0.25s ease;
  white-space: nowrap;
  font-weight: 500;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #1e40af !important;
  padding-left: 24px;
}

.dropdown-item.admin-entry {
  color: #c2410c !important;
  font-weight: 600;
}

.dropdown-item.logout:hover {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc3545 !important;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.main-header {
  padding: 16px 0;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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

.logo h1 {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 28px;
  margin: 0;
  font-weight: 700;
}

.logo a {
  text-decoration: none;
}

.search-box {
  flex: 1;
  max-width: 450px;
  margin: 0 30px;
  display: flex;
}

.search-input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 2px solid #e2e8f0;
  border-right: none;
  font-size: 14px;
  border-radius: 10px 0 0 10px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-btn {
  height: 40px;
  padding: 0 26px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 0 10px 10px 0;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.search-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.cart-wrapper {
  position: relative;
  display: inline-block;
}

.cart-icon {
  font-size: 28px;
  color: #64748b;
  cursor: pointer;
  padding: 10px 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.cart-icon:hover {
  color: #3b82f6;
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.cart-icon svg {
  width: 26px;
  height: 26px;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

.cart-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 360px;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  padding: 12px;
  border-radius: 12px;
}

.cart-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
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
  border-bottom: 1px solid #f5f5f5;
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
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.cart-item-price {
  font-size: 12px;
  color: #999;
}

.cart-item-total {
  font-size: 14px;
  color: #f40;
  font-weight: bold;
}

.cart-summary {
  padding: 10px 0;
  border-top: 1px solid #eee;
  margin-top: 10px;
  text-align: right;
}

.cart-total-text {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.checkout-btn {
  width: 100%;
  background: #f40;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.checkout-btn:hover {
  background: #e33;
}

.cart-empty {
  padding: 30px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .logo h1 {
    font-size: 20px;
  }
  
  .search-box {
    display: none;
  }
  
  .top-nav a {
    margin: 0 8px;
    font-size: 12px;
  }
}
</style>
