import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { cartApi } from '../api/accountApi'
import { resolveProductImage } from '../utils/productImage.js'

const LOCAL_KEY = 'cart'
const isLoggedIn = () => !!localStorage.getItem('token')

// 校验本地购物车项结构
const sanitizeLocal = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .filter(item => item && item.id != null && Number.isFinite(Number(item.price)) && Number.isFinite(Number(item.quantity)))
    .map(item => ({
      ...item,
      price: Number(item.price),
      quantity: Math.max(1, Math.floor(Number(item.quantity))),
      selected: item.selected !== false
    }))

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  )

  // 勾选结算的商品金额与数量
  const selectedItems = computed(() => items.value.filter(item => item.selected !== false))
  const selectedPrice = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  )

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
  )

  // ---------- 游客：本地存储 ----------
  const loadLocal = () => {
    const data = localStorage.getItem(LOCAL_KEY)
    items.value = data ? sanitizeLocal(JSON.parse(data || '[]')) : []
  }

  const saveLocal = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items.value))
  }

  // ---------- 登录用户：数据库购物车 ----------
  const fetchServer = async () => {
    const res = await cartApi.list()
    items.value = (res.data || []).map(item => ({
      ...item,
      selected: item.selected !== false,
      image: resolveProductImage(item.image)
    }))
  }

  // 初始化加载：登录拉取数据库购物车，游客读取本地
  const loadCart = async () => {
    if (isLoggedIn()) {
      try {
        await fetchServer()
      } catch {
        loadLocal()
      }
    } else {
      loadLocal()
    }
  }

  // 登录成功后：把游客本地购物车合并进数据库，再以数据库为准
  const syncAfterLogin = async () => {
    const local = sanitizeLocal(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'))
    try {
      for (const item of local) {
        await cartApi.add(item.id, item.quantity)
      }
      localStorage.removeItem(LOCAL_KEY)
      await fetchServer()
    } catch {
      loadLocal()
    }
  }

  // 登出后回到游客空购物车
  const resetToGuest = () => {
    items.value = []
    localStorage.removeItem(LOCAL_KEY)
  }

  const addItem = async (product, quantity = 1) => {
    const qty = Number.isFinite(Number(quantity)) ? Number(quantity) : 1
    if (isLoggedIn()) {
      await cartApi.add(product.id, qty)
      await fetchServer()
      return
    }
    const existing = items.value.find(item => item.id === product.id)
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty
    } else {
      items.value.push({ ...product, quantity: Math.max(1, qty), selected: true })
    }
    saveLocal()
  }

  const updateQuantity = async (productId, quantity) => {
    const numQuantity = Number(quantity)
    if (!Number.isFinite(numQuantity)) return
    const newQuantity = Math.max(0, Math.floor(numQuantity))
    const item = items.value.find(i => i.id === productId)
    if (!item) return

    if (isLoggedIn()) {
      if (!item.cartId) return
      const res = await cartApi.update(item.cartId, { quantity: newQuantity })
      if (res.data && res.data.removed) {
        items.value = items.value.filter(i => i.id !== productId)
      } else {
        await fetchServer()
      }
      return
    }

    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      item.quantity = newQuantity
      saveLocal()
    }
  }

  const setSelected = async (productId, selected) => {
    const item = items.value.find(i => i.id === productId)
    if (!item) return
    if (isLoggedIn()) {
      if (!item.cartId) return
      await cartApi.update(item.cartId, { selected: !!selected })
      item.selected = !!selected
    } else {
      item.selected = !!selected
      saveLocal()
    }
  }

  const removeItem = async (productId) => {
    const item = items.value.find(i => i.id === productId)
    if (isLoggedIn()) {
      if (item?.cartId) await cartApi.remove(item.cartId)
      items.value = items.value.filter(i => i.id !== productId)
      return
    }
    const index = items.value.findIndex(i => i.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveLocal()
    }
  }

  const clearCart = async () => {
    if (isLoggedIn()) {
      await cartApi.clear()
    }
    items.value = []
    localStorage.removeItem(LOCAL_KEY)
  }

  const getItemQuantity = (productId) => {
    const item = items.value.find(i => i.id === productId)
    return item?.quantity || 0
  }

  return {
    items,
    totalPrice,
    totalCount,
    selectedItems,
    selectedPrice,
    loadCart,
    syncAfterLogin,
    resetToGuest,
    addItem,
    updateQuantity,
    setSelected,
    removeItem,
    clearCart,
    getItemQuantity
  }
})
