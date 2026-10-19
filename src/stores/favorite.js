import { ref } from 'vue'
import { defineStore } from 'pinia'
import { favoriteApi } from '../api/accountApi'
import { resolveProductImage } from '../utils/productImage.js'

const LOCAL_KEY = 'favorites'
const isLoggedIn = () => !!localStorage.getItem('token')

const readLocal = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    return Array.isArray(arr) ? arr.map(Number).filter(Boolean) : []
  } catch {
    return []
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  // 收藏的商品编号集合
  const ids = ref([])

  const isFavorite = (productId) => ids.value.includes(Number(productId))

  const loadLocal = () => {
    ids.value = readLocal()
  }

  const saveLocal = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids.value))
  }

  const pullServer = async () => {
    const res = await favoriteApi.ids()
    ids.value = (res.data || []).map(Number)
  }

  // 初始化：登录读取数据库收藏，游客读取本地
  const loadFavorites = async () => {
    if (isLoggedIn()) {
      try {
        await pullServer()
      } catch {
        loadLocal()
      }
    } else {
      loadLocal()
    }
  }

  // 登录后把游客本地收藏合并进数据库，再以数据库为准
  const syncAfterLogin = async () => {
    const local = readLocal()
    try {
      for (const pid of local) {
        await favoriteApi.add(pid)
      }
      localStorage.removeItem(LOCAL_KEY)
      await pullServer()
    } catch {
      loadLocal()
    }
  }

  const resetToGuest = () => {
    ids.value = []
    localStorage.removeItem(LOCAL_KEY)
  }

  // 切换收藏，返回切换后的状态（true=已收藏）
  const toggle = async (productId) => {
    const pid = Number(productId)
    if (isLoggedIn()) {
      const res = await favoriteApi.toggle(pid)
      const favorited = !!res.data?.favorited
      ids.value = favorited
        ? Array.from(new Set([...ids.value, pid]))
        : ids.value.filter(id => id !== pid)
      return favorited
    }
    if (ids.value.includes(pid)) {
      ids.value = ids.value.filter(id => id !== pid)
      saveLocal()
      return false
    }
    ids.value = [...ids.value, pid]
    saveLocal()
    return true
  }

  const remove = async (productId) => {
    const pid = Number(productId)
    if (isLoggedIn()) {
      await favoriteApi.remove(pid)
    }
    ids.value = ids.value.filter(id => id !== pid)
    if (!isLoggedIn()) saveLocal()
  }

  // 会员中心：收藏商品明细（含商品快照），图片解析为可访问资源
  const fetchProducts = async () => {
    const res = await favoriteApi.list()
    return (res.data || []).map(item => ({ ...item, image: resolveProductImage(item.image) }))
  }

  return {
    ids,
    isFavorite,
    loadFavorites,
    syncAfterLogin,
    resetToGuest,
    toggle,
    remove,
    fetchProducts
  }
})
