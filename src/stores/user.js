import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '../api/userApi'
import { useCartStore } from './cart'
import { useFavoriteStore } from './favorite'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref('')
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!user.value && !!token.value)
  const userName = computed(() => user.value?.username || '用户')
  const userId = computed(() => user.value?.id || null)
  const points = computed(() => Number(user.value?.points) || 0)
  const balance = computed(() => Number(user.value?.balance) || 0)

  const login = (userData, tokenData = '') => {
    user.value = userData
    token.value = tokenData
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenData)
    // 登录后把游客本地购物车/收藏合并到数据库，并以数据库数据为准
    Promise.allSettled([
      useCartStore().syncAfterLogin(),
      useFavoriteStore().syncAfterLogin()
    ]).catch(() => {})
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    sessionStorage.removeItem('redirectUrl')
    try {
      useCartStore().resetToGuest()
      useFavoriteStore().resetToGuest()
    } catch {
      // store 未就绪时忽略
    }
  }

  const loadUser = () => {
    const userData = localStorage.getItem('user')
    const tokenData = localStorage.getItem('token')
    if (userData && tokenData) {
      try {
        user.value = JSON.parse(userData)
        token.value = tokenData
      } catch {
        logout()
      }
    } else {
      // localStorage 无数据时同步清空内存状态，避免残留已登出用户
      user.value = null
      token.value = ''
    }
  }

  const updateUser = (updates) => {
    if (user.value) {
      user.value = { ...user.value, ...updates }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // 从后端拉取最新资料（积分、余额、角色），与数据库保持一致
  const refreshProfile = async () => {
    if (!token.value) return null
    try {
      const res = await userApi.getProfile()
      if (res?.success && res.data) {
        user.value = { ...(user.value || {}), ...res.data }
        localStorage.setItem('user', JSON.stringify(user.value))
        return res.data
      }
    } catch {
      return null
    }
    return null
  }

  // 账户充值，返回最新余额
  const recharge = async (amount) => {
    const res = await userApi.recharge(amount)
    const newBalance = Number(res?.data?.balance)
    if (Number.isFinite(newBalance)) {
      updateUser({ balance: newBalance })
    }
    return newBalance
  }

  return {
    user,
    token,
    isLoading,
    isLoggedIn,
    userName,
    userId,
    points,
    balance,
    login,
    logout,
    loadUser,
    updateUser,
    refreshProfile,
    recharge
  }
})
