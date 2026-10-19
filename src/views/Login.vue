<template>
  <div class="login-page">
    <div class="page-container">
      <div class="page-header">
        <h1>用户登录</h1>
        <div class="breadcrumb">
          <router-link to="/">首页</router-link>
          <span class="breadcrumb-arrow">/</span>
          <span>用户登录</span>
        </div>
      </div>
      
      <div class="login-container">
        <div class="login-image">
          <div class="image-wrapper">
            <img src="../images/login.png" alt="登录图片" />
            <div class="image-overlay"></div>
          </div>
          <div class="image-content">
            <h3>欢迎来到 ESChop</h3>
            <p>一站式购物体验，品质生活从这里开始</p>
          </div>
        </div>
        
        <div class="login-form-wrapper">
          <div class="login-form">
            <div class="form-header">
              <h2>用户登录</h2>
              <p>请输入您的账号信息</p>
            </div>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  用户名或手机号
                </label>
                <input 
                  type="text" 
                  v-model="form.username" 
                  placeholder="请输入用户名或手机号" 
                  class="form-input" 
                />
              </div>
              <div class="form-group">
                <label class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  密码
                </label>
                <input 
                  type="password" 
                  v-model="form.password" 
                  placeholder="请输入密码" 
                  class="form-input" 
                />
              </div>
              <div class="form-group">
                <button type="submit" class="login-btn">
                  <span class="btn-text">登录</span>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19V5M5 12l7-7 7 7"></path>
                  </svg>
                </button>
              </div>
              <div class="form-group login-link">
                <router-link to="/register" class="link-primary">还没有账号？立即注册</router-link>
              </div>
            </form>
          </div>
          <div class="form-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '../api/userApi'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  if (!form.username || !form.password) {
    ElMessage.error('请输入用户名和密码')
    return
  }
  
  try {
    const result = await userApi.login(form.username, form.password)
    if (result.success) {
      userStore.login(result.data, result.token)
      ElMessage.success('登录成功')
      const redirectUrl = sessionStorage.getItem('redirectUrl')
      sessionStorage.removeItem('redirectUrl')
      // 以 JWT/用户记录中的 role 字段判断管理员身份，与路由守卫保持一致
      const isAdmin = result.data?.role === 'admin'
      router.push(isAdmin ? '/admin' : (redirectUrl || '/'))
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请稍后重试')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(244, 67, 54, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.login-page::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-weight: 700;
  letter-spacing: 2px;
}

.breadcrumb {
  font-size: 14px;
  color: var(--text-muted);
}

.breadcrumb a {
  color: var(--secondary-color);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.breadcrumb a:hover {
  color: var(--secondary-hover);
}

.breadcrumb-arrow {
  margin: 0 12px;
  color: var(--border-color);
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  padding: 40px 0;
}

.login-image {
  width: 520px;
  height: 400px;
  flex-shrink: 0;
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%);
}

.image-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  color: white;
}

.image-content h3 {
  font-size: 26px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.image-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.login-form-wrapper {
  position: relative;
  width: 420px;
}

.login-form {
  background: var(--bg-primary);
  padding: 48px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 2;
}

.form-header {
  text-align: center;
  margin-bottom: 36px;
}

.form-header h2 {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.form-header p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 10px;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: var(--secondary-color);
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
}

.form-input:focus {
  border-color: var(--secondary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.login-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-icon {
  width: 18px;
  height: 18px;
  transition: transform var(--transition-normal);
}

.login-btn:hover .btn-icon {
  transform: translateX(3px);
}

.login-link {
  text-align: center;
}

.link-primary {
  font-size: 14px;
  color: var(--secondary-color);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.link-primary:hover {
  color: var(--secondary-hover);
  text-decoration: underline;
}

.form-decoration {
  position: absolute;
  top: -30px;
  right: -30px;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%);
}

.circle-1 {
  width: 60px;
  height: 60px;
  top: 0;
  right: 0;
}

.circle-2 {
  width: 40px;
  height: 40px;
  top: 40px;
  right: 60px;
  animation: float 3s ease-in-out infinite;
}

.circle-3 {
  width: 30px;
  height: 30px;
  top: 100px;
  right: 20px;
  animation: float 4s ease-in-out infinite 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@media (max-width: 1000px) {
  .login-image {
    display: none;
  }
  
  .login-form-wrapper {
    width: 100%;
    max-width: 400px;
  }
}
</style>
