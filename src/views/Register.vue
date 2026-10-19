<template>
  <div class="register-page">
    <div class="page-container">
      <div class="page-header">
        <h1>用户注册</h1>
        <div class="breadcrumb">
          <router-link to="/">首页</router-link>
          <span class="breadcrumb-arrow">/</span>
          <span>用户注册</span>
        </div>
      </div>
      
      <div class="register-container">
        <div class="register-image">
          <div class="image-wrapper">
            <img src="../images/zhuce.png" alt="注册图片" />
            <div class="image-overlay"></div>
          </div>
          <div class="image-content">
            <h3>开启购物之旅</h3>
            <p>注册成为会员，享受专属优惠</p>
          </div>
        </div>
        
        <div class="register-form-wrapper">
          <div class="register-form">
            <div class="form-header">
              <h2>用户注册</h2>
              <p>创建您的账号，开启精彩购物体验</p>
            </div>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  用户名
                </label>
                <input 
                  type="text" 
                  v-model="form.username" 
                  placeholder="请输入用户名" 
                  class="form-input" 
                />
                <span v-if="errors.username" class="error">{{ errors.username }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  手机号
                </label>
                <input 
                  type="text" 
                  v-model="form.phone" 
                  placeholder="请输入手机号" 
                  class="form-input" 
                />
                <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
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
                <span v-if="errors.password" class="error">{{ errors.password }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  确认密码
                </label>
                <input 
                  type="password" 
                  v-model="form.confirmPassword" 
                  placeholder="确认密码" 
                  class="form-input" 
                />
                <span v-if="errors.confirmPassword" class="error">{{ errors.confirmPassword }}</span>
              </div>
              <div class="form-group">
                <button type="submit" class="register-btn">
                  <span class="btn-text">立即注册</span>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19V5M5 12l7-7 7 7"></path>
                  </svg>
                </button>
              </div>
              <div class="form-group register-link">
                <router-link to="/login" class="link-primary">已有账号？立即登录</router-link>
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

const router = useRouter()

const form = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  let isValid = true
  
  if (!form.username || form.username.length < 3) {
    errors.username = '用户名至少需要3个字符'
    isValid = false
  } else {
    errors.username = ''
  }
  
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入正确的手机号码'
    isValid = false
  } else {
    errors.phone = ''
  }
  
  if (!form.password || form.password.length < 8) {
    errors.password = '密码至少需要8个字符'
    isValid = false
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
    errors.password = '密码必须包含字母和数字'
    isValid = false
  } else {
    errors.password = ''
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  } else {
    errors.confirmPassword = ''
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    const result = await userApi.register(form.username, form.phone, form.password)
    if (result.success) {
      ElMessage.success('注册成功!')
      router.push('/login')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('注册失败，请稍后重试')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
}

.register-page::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.register-page::after {
  content: '';
  position: absolute;
  bottom: -20%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(244, 67, 54, 0.08) 0%, transparent 70%);
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

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  padding: 40px 0;
}

.register-image {
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

.register-form-wrapper {
  position: relative;
  width: 420px;
}

.register-form {
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

.error {
  display: block;
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 8px;
}

.register-btn {
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

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-icon {
  width: 18px;
  height: 18px;
  transition: transform var(--transition-normal);
}

.register-btn:hover .btn-icon {
  transform: translateX(3px);
}

.register-link {
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
  bottom: -30px;
  left: -30px;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
}

.circle-1 {
  width: 60px;
  height: 60px;
  bottom: 0;
  left: 0;
}

.circle-2 {
  width: 40px;
  height: 40px;
  bottom: 40px;
  left: 60px;
  animation: float 3s ease-in-out infinite;
}

.circle-3 {
  width: 30px;
  height: 30px;
  bottom: 100px;
  left: 20px;
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
  .register-image {
    display: none;
  }
  
  .register-form-wrapper {
    width: 100%;
    max-width: 400px;
  }
}
</style>