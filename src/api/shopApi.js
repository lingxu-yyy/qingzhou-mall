import api from './request.js'
import { resolveProductImage } from '../utils/productImage.js'

const normalizeProduct = (p) => {
  if (!p || typeof p !== 'object') return null;
  const price = Number(p.price);
  const stock = Number(p.stock);
  const sales = Number(p.sales);
  return {
    id: p.id,
    name: p.name || '',
    meta: p.meta || '',
    description: p.description || '',
    price: Number.isFinite(price) ? price : 0,
    originalPrice: p.original_price != null ? Number(p.original_price) : null,
    image: resolveProductImage(p.image),
    category: p.category || '',
    stock: Number.isFinite(stock) ? stock : 0,
    sales: Number.isFinite(sales) ? sales : 0
  };
}

export const productApi = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params })
    return {
      list: (res.data || []).map(normalizeProduct).filter(Boolean),
      pagination: res.pagination || { total: 0, totalPages: 1 }
    }
  },

  async getCategories() {
    const res = await api.get('/products/categories')
    return res.data || []
  },

  async getProduct(id) {
    const res = await api.get(`/products/${id}`)
    return normalizeProduct(res.data)
  }
}

export const orderApi = {
  async create(payload) {
    const res = await api.post('/orders', payload)
    return res.data
  },

  async getMyOrders() {
    const res = await api.get('/orders')
    return res.data || []
  },

  async getOrder(id) {
    const res = await api.get(`/orders/${id}`)
    return res.data
  },

  async pay(id) {
    const res = await api.put(`/orders/${id}/pay`)
    return res.data
  },

  async complete(id) {
    const res = await api.put(`/orders/${id}/complete`)
    return res.data
  },

  async cancel(id) {
    const res = await api.put(`/orders/${id}/cancel`)
    return res.data
  }
}

export const adminApi = {
  async getOverview() {
    const res = await api.get('/admin/overview')
    return res.data
  },

  async getOrders(params = {}) {
    const res = await api.get('/admin/orders', { params })
    return {
      list: res.data || [],
      stats: res.stats || [],
      pagination: res.pagination || { total: 0, totalPages: 1 }
    }
  },

  async updateOrderStatus(id, status) {
    const res = await api.put(`/admin/orders/${id}/status`, { status })
    return res.data
  }
}

export default api
