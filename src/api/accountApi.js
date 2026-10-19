// 账户域接口：收货地址、购物车、商品收藏（均需登录，请求拦截器自动携带 token）
import api from './request.js'

// 收货地址
export const addressApi = {
  // 地址列表（默认地址排在最前）
  list() {
    return api.get('/addresses')
  },
  // 新增地址
  create(data) {
    return api.post('/addresses', data)
  },
  // 更新地址
  update(id, data) {
    return api.put(`/addresses/${id}`, data)
  },
  // 设置默认地址
  setDefault(id) {
    return api.put(`/addresses/${id}/default`)
  },
  // 删除地址
  remove(id) {
    return api.delete(`/addresses/${id}`)
  }
}

// 购物车
export const cartApi = {
  // 购物车列表（含商品快照），返回 { data, totalCount }
  list() {
    return api.get('/cart')
  },
  // 加入购物车（同款累加）
  add(productId, quantity = 1) {
    return api.post('/cart', { productId, quantity })
  },
  // 修改数量/勾选状态，cartId 为购物车项编号
  update(cartId, payload) {
    return api.put(`/cart/${cartId}`, payload)
  },
  // 删除购物车项
  remove(cartId) {
    return api.delete(`/cart/${cartId}`)
  },
  // 清空购物车
  clear() {
    return api.delete('/cart')
  }
}

// 商品收藏
export const favoriteApi = {
  // 收藏商品列表（含商品快照）
  list() {
    return api.get('/favorites')
  },
  // 当前用户收藏的商品编号集合
  ids() {
    return api.get('/favorites/ids')
  },
  add(productId) {
    return api.post('/favorites', { productId })
  },
  // 切换收藏，返回 { favorited }
  toggle(productId) {
    return api.post('/favorites/toggle', { productId })
  },
  remove(productId) {
    return api.delete(`/favorites/${productId}`)
  }
}

export default api
