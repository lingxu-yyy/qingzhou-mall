<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MyHeader from './components/MyHeader.vue'
import MyFooter from './components/MyFooter.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import { useUserStore } from './stores/user'
import { useCartStore } from './stores/cart'
import { useFavoriteStore } from './stores/favorite'

const route = useRoute()
const isAdminLayout = computed(() => route.meta.layout === 'admin')

// 应用启动时按登录状态初始化：登录用户从数据库加载购物车/收藏/资料，游客读取本地
const userStore = useUserStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
userStore.loadUser()
cartStore.loadCart()
favoriteStore.loadFavorites()
if (userStore.isLoggedIn) {
  userStore.refreshProfile()
}
</script>

<template>
  <div class="common-layout">
    <LoadingOverlay />
    <router-view v-if="isAdminLayout" v-slot="{ Component }">
      <Transition name="slide-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    <el-container v-else>
      <el-header><MyHeader></MyHeader></el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <Transition name="slide-fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </el-main>
      <el-footer><MyFooter></MyFooter></el-footer>
    </el-container>
  </div>
</template>


<style scoped>
.el-header {
  padding: 0;
  height: auto;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 999;
}

.el-main {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 180px);
  padding: 0;
}

.el-footer {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #e2e8f0;
  text-align: center;
  line-height: 60px;
  height: 60px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
