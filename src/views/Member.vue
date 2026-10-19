<template>
  <div class="member-page">
    <div class="page-container">
      <div class="user-card">
        <div class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ userStore.userName }}</h2>
          <p class="user-level">
            <span class="level-icon">⭐</span>
            <span>黄金会员</span>
          </p>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-value">¥{{ balance.toLocaleString() }}</span>
            <span class="stat-label">余额</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ allOrders.length }}</span>
            <span class="stat-label">订单</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ favorites.length }}</span>
            <span class="stat-label">收藏</span>
          </div>
        </div>
      </div>
      
      <div class="nav-tabs">
        <button :class="['tab', { active: activeTab === 'orders' }]" @click="activeTab = 'orders'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9"></path>
          </svg>
          <span>我的订单</span>
        </button>
        <button :class="['tab', { active: activeTab === 'contacts' }]" @click="activeTab = 'contacts'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>收货地址</span>
        </button>
        <button :class="['tab', { active: activeTab === 'favorites' }]" @click="activeTab = 'favorites'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>我的收藏</span>
        </button>
        <button :class="['tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>个人足迹</span>
        </button>
        <button :class="['tab', { active: activeTab === 'settings' }]" @click="activeTab = 'settings'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12.222 2h-.444a2 2 0 0 0-2 2v.188a2 2 0 0 1-1 1.732l-.458.228a2 2 0 0 1-2 0l-.158-.078a2 2 0 0 0-2.732 1l-.159.271a2 2 0 0 0 1 2.732l.158.078a2 2 0 0 1 1 1.732V10a2 2 0 0 0 2 2h.444a2 2 0 0 1 2 2v.188a2 2 0 0 1-1 1.732l-.158.078a2 2 0 0 0-1 2.732l.159.271a2 2 0 0 0 2.732 1l.158-.078a2 2 0 0 1 1.732-1H14a2 2 0 0 0 2-2v-.188a2 2 0 0 1 1-1.732l.158-.078a2 2 0 0 0 1-2.732l-.159-.271a2 2 0 0 0-2.732-1l-.158.078a2 2 0 0 1-1.732-1V12a2 2 0 0 0-2-2h-.444z"></path>
          </svg>
          <span>个人设置</span>
        </button>
        <button :class="['tab', { active: activeTab === 'recharge' }]" @click="activeTab = 'recharge'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>充值</span>
        </button>
        <button :class="['tab', { active: activeTab === 'unpaid' }]" @click="activeTab = 'unpaid'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="9" r="6"></circle>
            <path d="M20.317 18.986A10.05 10.05 0 0 1 12 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21"></path>
          </svg>
          <span>待付款</span>
        </button>
      </div>
      
      <div class="content-area">
        <div v-if="activeTab === 'contacts'" class="tab-content">
          <h2>收货地址</h2>
          <table class="contacts-table">
            <thead>
              <tr>
                <th>默认地址</th>
                <th>收货人</th>
                <th>联系电话</th>
                <th>详细地址</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contact in contacts" :key="contact.id">
                <td><input type="radio" name="default" :checked="contact.isDefault" @change="setDefault(contact.id)" /></td>
                <td>{{ contact.name }}</td>
                <td>{{ contact.phone }}</td>
                <td>{{ contact.address }}</td>
                <td>
                  <button class="edit-btn" @click="editContact(contact)">编辑</button>
                  <button class="delete-btn" @click="deleteContact(contact)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="add-contact">
            <div class="form-row">
              <div class="form-group">
                <label>姓名*</label>
                <input type="text" v-model="contactForm.name" class="form-input" />
              </div>
              <div class="form-group">
                <label>电话*</label>
                <input type="text" v-model="contactForm.phone" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label>所在地区</label>
              <input type="text" v-model="contactForm.region" class="form-input" placeholder="如 湖南省岳阳市" />
            </div>
            <div class="form-group">
              <label>详细地址*</label>
              <input type="text" v-model="contactForm.address" class="form-input" placeholder="街道、门牌号" />
            </div>
            <button class="save-btn" @click="saveContact">{{ editingId === null ? '保存地址' : '更新地址' }}</button>
          </div>
        </div>
        
        <div v-if="activeTab === 'recharge'" class="tab-content">
          <h2>账户充值</h2>
          <div class="balance-info">
            <span>当前电子钱包账户余额为: <strong>¥{{ balance }}</strong></span>
          </div>
          <div class="recharge-form">
            <label>请输入充值金额*</label>
            <input type="text" v-model="rechargeAmount" class="form-input" placeholder="100" />
            <button class="recharge-btn" @click="handleRecharge">充值</button>
          </div>
        </div>
        
        <div v-if="activeTab === 'settings'" class="tab-content">
          <h2>个人信息设置</h2>
          <div class="settings-section">
            <h3>个人信息</h3>
            <div class="form-row">
              <div class="form-group">
                <label>昵称</label>
                <input type="text" v-model="settingsForm.nickname" class="form-input" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="text" v-model="settingsForm.email" class="form-input" />
              </div>
            </div>
            <button class="save-btn" @click="handleSaveProfile">保存</button>
          </div>
          
          <div class="settings-section">
            <h3>修改密码</h3>
            <div class="form-group">
              <label>输入当前密码</label>
              <input type="password" v-model="settingsForm.oldPassword" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>新密码</label>
                <input type="password" v-model="settingsForm.newPassword" class="form-input" />
              </div>
              <div class="form-group">
                <label>确认密码</label>
                <input type="password" v-model="settingsForm.confirmPassword" class="form-input" />
              </div>
            </div>
            <button class="save-btn" @click="handleSavePassword">保存</button>
          </div>
        </div>
        
        <div v-if="activeTab === 'history'" class="tab-content">
          <div class="history-header">
            <h2>个人足迹</h2>
            <button v-if="groupedHistory.length > 0" class="clear-history-btn" @click="clearHistory">清空足迹</button>
          </div>
          
          <div v-if="groupedHistory.length === 0" class="empty-history">
            <p>暂无浏览记录</p>
            <button class="go-shopping-btn" @click="goToCategory">去逛逛</button>
          </div>
          
          <div v-for="(group, date) in groupedHistory" :key="date" class="history-group">
            <h3>{{ formatDate(date) }}</h3>
            <div class="history-list">
              <div 
                v-for="item in group" 
                :key="item.id" 
                class="history-item"
                @click="goToProduct(item.id)"
              >
                <img :src="item.image" alt="商品" class="small-img" />
                <div class="history-item-info">
                  <span class="history-item-name">{{ item.name }}</span>
                  <span class="history-item-price">¥{{ item.price.toFixed(2) }}</span>
                </div>
                <button class="remove-history-item" @click.stop="removeHistoryItem(item.id)">×</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 我的订单 -->
        <div v-if="activeTab === 'orders'" class="tab-content">
          <h2>我的订单</h2>
          <table class="orders-table">
            <thead>
              <tr>
                <th>订单编号</th>
                <th>收货人</th>
                <th>联系电话</th>
                <th>订单状态</th>
                <th>订单金额</th>
                <th>下单时间</th>
                <th>订单详情</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in paidOrders" :key="order.id">
                <td>{{ order.order_no }}</td>
                <td>{{ order.contact_name }}</td>
                <td>{{ order.contact_phone }}</td>
                <td>{{ order.status }}</td>
                <td>¥{{ Number(order.final_amount).toFixed(2) }}</td>
                <td>{{ formatOrderTime(order.created_at) }}</td>
                <td><button class="detail-btn" @click="goToOrderDetail(order.id)">订单详情</button></td>
              </tr>
              <tr v-if="paidOrders.length === 0">
                <td colspan="7" class="empty-row">暂无订单</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 未支付订单 -->
        <div v-if="activeTab === 'unpaid'" class="tab-content">
          <h2>待付款订单</h2>
          <table class="orders-table">
            <thead>
              <tr>
                <th>订单编号</th>
                <th>收货人</th>
                <th>联系电话</th>
                <th>订单状态</th>
                <th>订单金额</th>
                <th>下单时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in unpaidOrders" :key="order.id">
                <td>{{ order.order_no }}</td>
                <td>{{ order.contact_name }}</td>
                <td>{{ order.contact_phone }}</td>
                <td>{{ order.status }}</td>
                <td>¥{{ Number(order.final_amount).toFixed(2) }}</td>
                <td>{{ formatOrderTime(order.created_at) }}</td>
                <td><button class="detail-btn" @click="goToOrderDetail(order.id)">去支付</button></td>
              </tr>
              <tr v-if="unpaidOrders.length === 0">
                <td colspan="7" class="empty-row">暂无待付款订单</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 我的收藏 -->
        <div v-if="activeTab === 'favorites'" class="tab-content">
          <h2>个人收藏</h2>
          <table class="favorites-table">
            <thead>
              <tr>
                <th>商品图片</th>
                <th>商品简介</th>
                <th>市场价格</th>
                <th>店内价格</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in favorites" :key="item.id">
                <td><img :src="item.image" alt="商品" class="small-img" /></td>
                <td>{{ item.name }}</td>
                <td>¥{{ item.originalPrice != null ? Number(item.originalPrice).toFixed(2) : '--' }}</td>
                <td>¥{{ Number(item.price).toFixed(2) }}</td>
                <td>
                  <button class="cancel-btn" @click="removeFavorite(item)">删除收藏</button>
                  <button class="view-btn" @click="viewProduct(item.id)">查看商品</button>
                </td>
              </tr>
              <tr v-if="favorites.length === 0">
                <td colspan="5" class="empty-row">暂无收藏商品</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi, productApi } from '@/api/shopApi'
import { addressApi } from '@/api/accountApi'
import { userApi } from '@/api/userApi'
import { useUserStore } from '@/stores/user'
import { useFavoriteStore } from '@/stores/favorite'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const activeTab = ref('contacts')

const allOrders = ref([])

const loadOrders = async () => {
  try {
    allOrders.value = await orderApi.getMyOrders()
  } catch (error) {
  }
}

const unpaidOrders = computed(() => allOrders.value.filter(o => o.status === '已下单'))
const paidOrders = computed(() => allOrders.value.filter(o => o.status !== '已下单'))

const formatOrderTime = (timeStr) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString('zh-CN', { hour12: false })
}

const goToOrderDetail = (orderId) => {
  router.push(`/order-detail?id=${orderId}`)
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

const goToCategory = () => {
  router.push('/category')
}

const history = ref([])

const loadHistory = () => {
  try {
    const historyData = localStorage.getItem('history')
    if (historyData) {
      history.value = JSON.parse(historyData)
    }
  } catch (error) {
    ElMessage.error('加载足迹失败')
  }
}

const groupedHistory = computed(() => {
  const groups = {}
  history.value.forEach(item => {
    const date = item.browseTime ? new Date(item.browseTime).toLocaleDateString('zh-CN') : '未知日期'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  return groups
})

const formatDate = (dateStr) => {
  const today = new Date().toLocaleDateString('zh-CN')
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-CN')
  if (dateStr === today) {
    return '今天'
  } else if (dateStr === yesterday) {
    return '昨天'
  }
  return dateStr
}

const removeHistoryItem = (id) => {
  history.value = history.value.filter(item => item.id !== id)
  localStorage.setItem('history', JSON.stringify(history.value))
}

const clearHistory = () => {
  if (confirm('确定要清空所有浏览记录吗？')) {
    history.value = []
    localStorage.removeItem('history')
  }
}

const updateActiveTab = () => {
  const tab = route.query.tab
  if (tab) {
    const tabMap = {
      'favorites': 'favorites',
      'orders': 'orders',
      'contacts': 'contacts',
      'history': 'history',
      'settings': 'settings',
      'recharge': 'recharge',
      'unpaid': 'unpaid'
    }
    if (tabMap[tab]) {
      activeTab.value = tabMap[tab]
    }
  }
}

const handleStorageChange = (e) => {
  if (e.key === 'favorites') {
    loadFavorites()
  }
}

onMounted(async () => {
  userStore.loadUser()
  await userStore.refreshProfile()
  updateActiveTab()
  loadHistory()
  await loadContacts()
  await loadFavorites()
  loadOrders()

  // 加载已保存的个人资料（昵称、邮箱）
  try {
    const profileRes = await userApi.getProfile()
    settingsForm.nickname = profileRes.data.nickname || ''
    settingsForm.email = profileRes.data.email || ''
  } catch {
    settingsForm.nickname = ''
    settingsForm.email = ''
  }

  // 监听收藏变化（游客本地收藏跨标签同步）
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

// 监听路由参数变化
watch(() => route.query.tab, () => {
  updateActiveTab()
})

const contacts = ref([])

const mapContact = (a) => ({
  id: a.id,
  name: a.receiverName,
  phone: a.phone,
  region: a.region || '',
  detail: a.detail || '',
  address: `${a.region ? a.region + ' ' : ''}${a.detail || ''}`,
  isDefault: !!a.isDefault
})

const loadContacts = async () => {
  try {
    const res = await addressApi.list()
    contacts.value = (res.data || []).map(mapContact)
  } catch {
    contacts.value = []
  }
}

const contactForm = reactive({ name: '', phone: '', region: '', address: '' })
const editingId = ref(null)
const resetContactForm = () => {
  contactForm.name = ''
  contactForm.phone = ''
  contactForm.region = ''
  contactForm.address = ''
  editingId.value = null
}

const favorites = ref([])

const loadFavorites = async () => {
  try {
    await favoriteStore.loadFavorites()
    if (localStorage.getItem('token')) {
      favorites.value = await favoriteStore.fetchProducts()
      return
    }
    // 游客：本地收藏编号 + 商品详情
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (favoriteIds.length === 0) {
      favorites.value = []
      return
    }
    const results = await Promise.all(
      favoriteIds.map(id => productApi.getProduct(id).catch(() => null))
    )
    favorites.value = results.filter(Boolean)
  } catch {
    favorites.value = []
  }
}

const removeFavorite = async (item) => {
  if (!confirm('确定要删除这个收藏吗？')) return
  await favoriteStore.remove(item.id)
  favorites.value = favorites.value.filter(f => f.id !== item.id)
}

const viewProduct = (id) => {
  router.push(`/product/${id}`)
}

const setDefault = async (id) => {
  try {
    await addressApi.setDefault(id)
    await loadContacts()
  } catch {
    ElMessage.error('设置默认地址失败')
  }
}

const editContact = (contact) => {
  contactForm.name = contact.name
  contactForm.phone = contact.phone
  contactForm.region = contact.region || ''
  contactForm.address = contact.detail || ''
  editingId.value = contact.id
}

const deleteContact = async (contact) => {
  if (!confirm('确定要删除这个收货地址吗？')) return
  try {
    await addressApi.remove(contact.id)
    if (editingId.value === contact.id) resetContactForm()
    await loadContacts()
  } catch {
    ElMessage.error('删除失败')
  }
}

const saveContact = async () => {
  if (!contactForm.name.trim() || !/^1[3-9]\d{9}$/.test(contactForm.phone) || !contactForm.address.trim()) {
    ElMessage.warning('请填写姓名、正确的手机号和详细地址')
    return
  }
  const payload = {
    receiverName: contactForm.name.trim(),
    phone: contactForm.phone,
    region: contactForm.region.trim(),
    detail: contactForm.address.trim()
  }
  try {
    if (editingId.value === null) {
      await addressApi.create(payload)
    } else {
      await addressApi.update(editingId.value, payload)
    }
    ElMessage.success(editingId.value === null ? '收货地址已添加' : '收货地址已更新')
    resetContactForm()
    await loadContacts()
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '保存失败')
  }
}

const settingsForm = reactive({
  nickname: '',
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rechargeAmount = ref('')
// 余额来自数据库 users.balance，由用户资料接口提供，不再使用本地缓存或硬编码
const balance = computed(() => Number(userStore.balance) || 0)

const handleRecharge = async () => {
  const amount = parseFloat(rechargeAmount.value)

  if (!amount || amount <= 0) {
    ElMessage.warning('请输入有效的充值金额')
    return
  }

  if (amount > 50000) {
    ElMessage.warning('单次充值金额不能超过50000元')
    return
  }

  if (!confirm(`确认充值 ¥${amount} 吗？`)) return

  try {
    const newBalance = await userStore.recharge(amount)
    ElMessage.success(`充值成功！当前余额：¥${Number(newBalance).toFixed(2)}`)
    rechargeAmount.value = ''
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '充值失败，请稍后重试')
  }
}

const handleSaveProfile = async () => {
  try {
    await userApi.updateProfile(settingsForm.nickname, settingsForm.email)
    ElMessage.success('资料保存成功')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '资料保存失败')
  }
}

const handleSavePassword = async () => {
  if (!settingsForm.oldPassword || !settingsForm.newPassword) {
    return ElMessage.warning('请填写当前密码和新密码')
  }
  if (settingsForm.newPassword !== settingsForm.confirmPassword) {
    return ElMessage.error('两次输入的新密码不一致')
  }
  try {
    await userApi.changePassword(settingsForm.oldPassword, settingsForm.newPassword)
    ElMessage.success('密码修改成功')
    settingsForm.oldPassword = ''
    settingsForm.newPassword = ''
    settingsForm.confirmPassword = ''
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  }
}
</script>

<style scoped>
.member-page {
  padding: 24px 0;
  min-height: calc(100vh - 200px);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(244, 67, 54, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f40 0%, #ff8c00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.4);
}

.user-avatar svg {
  width: 40px;
  height: 40px;
  color: white;
}

.user-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.user-name {
  font-size: 24px;
  color: white;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.user-level {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.level-icon {
  font-size: 16px;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #f40;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

.nav-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border-light);
  flex-wrap: wrap;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;
}

.tab svg {
  width: 16px;
  height: 16px;
}

.tab::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--primary-gradient);
  transition: width var(--transition-normal);
}

.tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--bg-hover);
}

.tab.active {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.tab.active::before {
  width: 60%;
}

.content-area {
  background: var(--bg-card);
  padding: 28px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

.tab-content h2 {
  font-size: 20px;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab-content h2::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

.contacts-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 28px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.contacts-table th,
.contacts-table td {
  padding: 18px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.contacts-table th {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.contacts-table tr:hover {
  background: var(--bg-hover);
}

.contacts-table tr:nth-child(even) {
  background: var(--bg-secondary);
}

.contacts-table tr:nth-child(even):hover {
  background: var(--bg-hover);
}

.edit-btn {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: var(--secondary-color);
  border: 2px solid var(--secondary-color);
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.edit-btn:hover {
  background: var(--secondary-gradient);
  color: white;
  border-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: var(--danger-color);
  border: 2px solid var(--danger-color);
  padding: 8px 16px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.delete-btn:hover {
  background: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.add-contact {
  padding: 28px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
}

.add-contact:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  height: 46px;
  padding: 0 16px;
  border: 2px solid var(--border-color);
  box-sizing: border-box;
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all var(--transition-normal);
  background: var(--bg-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.15);
}

.save-btn {
  background: linear-gradient(135deg, #007bff 0%, #0069d9 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
}

.balance-info {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #fff9f5 0%, #fff3e0 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.balance-info strong {
  color: var(--danger-color);
  font-size: 32px;
  font-weight: 700;
}

.recharge-form {
  padding: 28px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.recharge-form label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-weight: 600;
}

.recharge-btn {
  background: linear-gradient(135deg, #f40 0%, #ff6b35 100%);
  color: white;
  border: none;
  padding: 14px 36px;
  cursor: pointer;
  margin-top: 20px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.recharge-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
}

.settings-section {
  margin-bottom: 28px;
  padding: 28px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.settings-section h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--border-light);
}

.history-group {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
}

.history-group h3 {
  font-size: 15px;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.small-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
}

.favorites-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}

.favorites-table th,
.favorites-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.favorites-table th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-weight: 600;
  color: #495057;
}

.favorites-table tr:hover {
  background: #fff9f5;
}

.cancel-btn {
  background: white;
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 8px;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #dc3545;
  color: white;
}

.view-btn {
  background: white;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: #007bff;
  color: white;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}

.orders-table th,
.orders-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.orders-table th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-weight: 600;
  color: #495057;
}

.orders-table tr:hover {
  background: #fff9f5;
}

.detail-btn {
  background: white;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.detail-btn:hover {
  background: #007bff;
  color: white;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.clear-history-btn {
  background: white;
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 6px 14px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background: #dc3545;
  color: white;
}

.empty-history {
  text-align: center;
  padding: 60px 0;
  background: #fafafa;
  border-radius: 10px;
}

.empty-row {
  text-align: center;
  padding: 32px 0;
  color: #95a5a6;
  font-size: 14px;
}

.empty-history p {
  font-size: 16px;
  color: #95a5a6;
  margin-bottom: 15px;
}

.go-shopping-btn {
  background: linear-gradient(135deg, #f40 0%, #ff6b35 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.history-group {
  margin-bottom: 30px;
}

.history-group h3 {
  font-size: 15px;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-weight: 600;
  padding-left: 12px;
  border-left: 3px solid #f40;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.history-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.history-item:hover {
  background: #fff9f5;
  transform: translateY(-2px);
}

.history-item .small-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
}

.history-item-info {
  flex: 1;
}

.history-item-name {
  display: block;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item-price {
  display: block;
  font-size: 14px;
  color: #e74c3c;
  font-weight: 600;
}

.remove-history-item {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-item:hover .remove-history-item {
  opacity: 1;
}

.remove-history-item:hover {
  background: #dc3545;
}

@media (max-width: 900px) {
  .history-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>