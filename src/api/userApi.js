// src/api/userApi.js

import api from './request.js'

export const userApi = {
  async login(username, password) {
    const response = await api.post('/users/login', { username, password })
    return response
  },
  
  async register(username, phone, password) {
    const response = await api.post('/users/register', { username, phone, password })
    return response
  },
  
  async getProfile() {
    const response = await api.get('/users/profile')
    return response
  },

  // 账户充值（模拟在线充值），返回最新余额
  async recharge(amount) {
    const response = await api.post('/users/recharge', { amount })
    return response
  },

  // 更新个人资料（昵称、邮箱）
  async updateProfile(nickname, email) {
    const response = await api.put('/users/profile', { nickname, email })
    return response
  },

  // 修改密码（校验当前密码）
  async changePassword(oldPassword, newPassword) {
    const response = await api.put('/users/password', { oldPassword, newPassword })
    return response
  }
}

export default api