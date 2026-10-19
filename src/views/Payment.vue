<template>
  <div class="payment-page">
    <div class="page-container">
      <div class="page-header">
        <h1>💳 确认支付</h1>
        <span class="step-indicator">
          <span class="step active">1.确认订单</span>
          <span class="arrow">→</span>
          <span class="step active">2.选择支付</span>
          <span class="arrow">→</span>
          <span class="step">3.完成支付</span>
        </span>
      </div>
      
      <div class="order-card">
        <div class="card-header">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9"></path>
            </svg>
            <span>订单信息</span>
          </h2>
        </div>
        
        <div class="order-items">
          <div class="order-item" v-for="item in cartItems" :key="item.id">
            <div class="item-image">
              <img :src="item.image" alt="商品" />
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-meta">
                <span class="quantity">数量: {{ item.quantity }}</span>
                <span class="separator">|</span>
                <span class="price">¥{{ item.price.toFixed(2) }}</span>
              </div>
            </div>
            <div class="item-total">¥{{ item.total }}</div>
          </div>
        </div>
        
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总价</span>
            <span>¥{{ totalAmount }}</span>
          </div>
          <div class="summary-row">
            <span>运费</span>
            <span class="free">包邮</span>
          </div>
          <div class="summary-row discount" v-if="usePoints && pointsDiscount > 0">
            <span>积分抵扣</span>
            <span class="discount-value">-¥{{ Number(pointsDiscount).toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>应付金额</span>
            <span class="total-price">¥{{ finalAmount }}</span>
          </div>
        </div>
      </div>
      
      <div class="contact-card">
        <div class="card-header">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>收货地址</span>
          </h2>
        </div>
        
        <div class="contact-options">
          <p v-if="addresses.length === 0" class="no-address-tip">暂无收货地址，请点击下方按钮新增</p>
          <label v-for="contact in addresses" :key="contact.id" :class="['contact-item', { active: selectedAddressId === contact.id }]">
            <input type="radio" name="contact" :value="contact.id" :checked="selectedAddressId === contact.id" @change="selectedAddressId = contact.id" />
            <div class="contact-info">
              <div class="contact-header">
                <span class="contact-name">{{ contact.name }}</span>
                <span class="contact-phone">{{ contact.phone }}</span>
                <span v-if="contact.isDefault" class="default-tag">默认</span>
              </div>
              <p class="contact-address">{{ contact.address }}</p>
            </div>
            <div class="check-icon" v-if="selectedAddressId === contact.id">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </label>
        </div>

        <div class="address-add">
          <button type="button" class="add-address-btn" @click="showAddressForm = !showAddressForm">
            {{ showAddressForm ? '收起' : '+ 新增收货地址' }}
          </button>
          <div v-if="showAddressForm" class="address-form">
            <div class="form-row">
              <input v-model="addressForm.receiverName" type="text" placeholder="收货人姓名" />
              <input v-model="addressForm.phone" type="text" maxlength="11" placeholder="收货人手机号" />
            </div>
            <div class="form-row">
              <input v-model="addressForm.region" type="text" placeholder="所在地区，如 湖南省岳阳市" />
            </div>
            <div class="form-row">
              <input v-model="addressForm.detail" type="text" placeholder="详细地址，如 街道、门牌号" />
            </div>
            <button type="button" class="save-address-btn" :disabled="savingAddress" @click="saveAddress">保存地址</button>
          </div>
        </div>
      </div>
      
      <div class="points-card">
        <div class="card-header">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>积分抵扣</span>
          </h2>
        </div>
        
        <div class="points-info">
          <div class="points-balance">
            <span class="label">当前积分</span>
            <span class="balance-value">{{ points }} 积分</span>
            <span class="balance-hint">（1积分=0.01元）</span>
          </div>
          <label class="points-switch">
            <input type="checkbox" v-model="usePoints" />
            <div class="switch-track">
              <div class="switch-thumb"></div>
            </div>
            <span>启用积分抵扣</span>
          </label>
        </div>
      </div>
      
      <div class="payment-card">
        <div class="card-header">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>支付方式</span>
          </h2>
        </div>
        
        <div class="method-options">
          <label class="method-item" :class="{ active: selectedPayment === 'wechat' }">
            <input type="radio" name="payment" value="wechat" :checked="selectedPayment === 'wechat'" @change="selectedPayment = 'wechat'" />
            <div class="method-icon-wrapper wechat">
              <img :src="wechatImg" alt="微信支付" />
            </div>
            <span>微信支付</span>
            <div class="check-mark" v-if="selectedPayment === 'wechat'">✓</div>
          </label>
          
          <label class="method-item" :class="{ active: selectedPayment === 'alipay' }">
            <input type="radio" name="payment" value="alipay" :checked="selectedPayment === 'alipay'" @change="selectedPayment = 'alipay'" />
            <div class="method-icon-wrapper alipay">
              <img :src="alipayImg" alt="支付宝" />
            </div>
            <span>支付宝</span>
            <div class="check-mark" v-if="selectedPayment === 'alipay'">✓</div>
          </label>
          
          <label class="method-item" :class="{ active: selectedPayment === 'wallet' }">
            <input type="radio" name="payment" value="wallet" :checked="selectedPayment === 'wallet'" @change="selectedPayment = 'wallet'" />
            <div class="method-icon-wrapper wallet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="9" r="6"></circle>
                <path d="M20.317 18.986A10.05 10.05 0 0 1 12 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21"></path>
              </svg>
            </div>
            <span>电子钱包</span>
            <span class="wallet-balance" :class="{ insufficient: Number(finalAmount) > walletBalance }">余额 ¥{{ walletBalance.toFixed(2) }}</span>
            <div class="check-mark" v-if="selectedPayment === 'wallet'">✓</div>
          </label>
        </div>
        
        <div class="pay-button-wrapper">
          <div class="pay-amount">
            <span class="label">应付金额</span>
            <span class="amount">¥{{ finalAmount }}</span>
          </div>
          <button class="pay-btn" :disabled="submitting" @click="handlePayment">{{ submitting ? '支付处理中...' : '确认支付' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api/shopApi'
import { addressApi } from '@/api/accountApi'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import wechatImg from '@/images/微信.png'
import alipayImg from '@/images/支付宝.png'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const userStore = useUserStore()
const submitting = ref(false)
const cartItems = ref([])

// 判断是否为"立即购买"模式（商品详情页点"立即购买"会写入 sessionStorage.buyNowItems）
const isBuyNowMode = computed(() => {
  return route.query.from === 'buynow' || !!sessionStorage.getItem('buyNowItems')
})

// ---------------- 收货地址（来自数据库 addresses 表）----------------
const addresses = ref([])
const selectedAddressId = ref(null)
const showAddressForm = ref(false)
const savingAddress = ref(false)
const addressForm = reactive({ receiverName: '', phone: '', region: '', detail: '' })

const mapAddress = (a) => ({
  id: a.id,
  name: a.receiverName,
  phone: a.phone,
  address: `${a.region ? a.region + ' ' : ''}${a.detail || ''}`,
  isDefault: !!a.isDefault
})

const loadAddresses = async () => {
  try {
    const res = await addressApi.list()
    addresses.value = (res.data || []).map(mapAddress)
    const def = addresses.value.find(a => a.isDefault)
    selectedAddressId.value = def ? def.id : (addresses.value[0]?.id ?? null)
  } catch {
    addresses.value = []
    selectedAddressId.value = null
  }
}

const saveAddress = async () => {
  if (!addressForm.receiverName.trim()) return ElMessage.warning('请填写收货人姓名')
  if (!/^1[3-9]\d{9}$/.test(addressForm.phone)) return ElMessage.warning('请输入正确的收货人手机号')
  if (!addressForm.detail.trim()) return ElMessage.warning('请填写详细收货地址')
  savingAddress.value = true
  try {
    const res = await addressApi.create({
      receiverName: addressForm.receiverName.trim(),
      phone: addressForm.phone,
      region: addressForm.region.trim(),
      detail: addressForm.detail.trim(),
      isDefault: addresses.value.length === 0
    })
    if (res.success) {
      ElMessage.success('收货地址已添加')
      Object.assign(addressForm, { receiverName: '', phone: '', region: '', detail: '' })
      showAddressForm.value = false
      await loadAddresses()
      if (res.data?.id) selectedAddressId.value = res.data.id
    }
  } finally {
    savingAddress.value = false
  }
}

// ---------------- 积分 / 支付方式 ----------------
const points = ref(0)
const usePoints = ref(false)
const selectedPayment = ref('alipay')
const walletBalance = computed(() => Number(userStore.balance) || 0)

const normalizeItems = (source) =>
  source
    .filter(item => item && Number.isFinite(Number(item.price)) && Number.isFinite(Number(item.quantity)))
    .map(item => {
      const price = Number(item.price)
      const quantity = Math.max(1, Math.floor(Number(item.quantity)))
      return { ...item, price, quantity, total: (price * quantity).toFixed(2) }
    })

const totalAmount = computed(() =>
  cartItems.value.reduce((sum, item) => {
    const val = parseFloat(item.total)
    return sum + (Number.isFinite(val) ? val : 0)
  }, 0).toFixed(2)
)

// 实际可使用的积分数：不能超过用户余额，且抵扣金额不能超过订单总额
const actualPointsUsed = computed(() => {
  if (!usePoints.value) return 0
  const baseAmount = parseFloat(totalAmount.value)
  const maxPointsByAmount = Math.floor(baseAmount / 0.01)
  return Math.min(points.value, maxPointsByAmount)
})

// 积分抵扣金额（与实际使用积分对应）
const pointsDiscount = computed(() => Math.round(actualPointsUsed.value * 0.01 * 100) / 100)

const finalAmount = computed(() => {
  const baseAmount = parseFloat(totalAmount.value)
  return Math.max(0, Math.round((baseAmount - pointsDiscount.value) * 100) / 100).toFixed(2)
})

const handlePayment = async () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }
  if (submitting.value) return

  const contact = addresses.value.find(c => c.id === selectedAddressId.value)
  if (!contact) {
    ElMessage.warning('请选择或新增收货地址')
    showAddressForm.value = true
    return
  }

  const payAmount = Number(finalAmount.value)
  if (selectedPayment.value === 'wallet' && payAmount > walletBalance.value) {
    ElMessage.error(`钱包余额不足，当前余额 ¥${walletBalance.value.toFixed(2)}，应付 ¥${payAmount.toFixed(2)}，请先到会员中心充值`)
    return
  }

  submitting.value = true
  try {
    const order = await orderApi.create({
      items: cartItems.value.map(item => ({ product_id: item.id, quantity: item.quantity })),
      paymentMethod: selectedPayment.value,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactAddress: contact.address,
      addressId: contact.id,
      pointsUsed: actualPointsUsed.value,
      fromCart: !isBuyNowMode.value
    })

    await orderApi.pay(order.id)

    ElMessage.success('支付成功！订单已提交。')

    // 从后端刷新积分/余额/购物车，保证与数据库一致
    await userStore.refreshProfile()
    if (isBuyNowMode.value) {
      sessionStorage.removeItem('buyNowItems')
    } else {
      await cartStore.loadCart()
    }
    cartItems.value = []
    router.push(`/order-detail?id=${order.id}`)
  } catch (error) {
    const msg = error?.response?.data?.message || '支付失败，请稍后重试'
    ElMessage.error(msg)
    console.error('支付失败', error)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // 拉取最新积分与钱包余额
  await userStore.refreshProfile()
  points.value = Number(userStore.user?.points) || 0

  let source = []
  if (isBuyNowMode.value) {
    try {
      const raw = sessionStorage.getItem('buyNowItems')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) source = parsed
      }
    } catch {
      source = []
    }
  } else {
    await cartStore.loadCart()
    source = cartStore.selectedItems
  }
  cartItems.value = normalizeItems(source)

  await loadAddresses()

  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，请先添加商品')
    router.push('/category')
  }
})
</script>

<style scoped>
.payment-page {
  padding: 24px 0;
  min-height: calc(100vh - 200px);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.page-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 28px;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-weight: 700;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.step {
  color: var(--text-muted);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
}

.step.active {
  color: var(--primary-color);
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.arrow {
  color: var(--text-muted);
}

.order-card,
.contact-card,
.points-card,
.payment-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-title svg {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
}

.order-items {
  padding: 16px 24px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.separator {
  color: var(--border-color);
}

.item-meta .price {
  color: var(--danger-color);
  font-weight: 600;
}

.item-total {
  font-size: 18px;
  font-weight: 700;
  color: var(--danger-color);
}

.order-summary {
  padding: 20px 24px;
  background: var(--bg-secondary);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.summary-row .free {
  color: var(--success-color);
  font-weight: 500;
}

.summary-row.discount .discount-value {
  color: var(--danger-color);
}

.summary-row.total {
  padding-top: 15px;
  margin-top: 10px;
  border-top: 2px solid var(--border-color);
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--danger-color);
}

.contact-options {
  padding: 16px 24px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.contact-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.contact-item.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.contact-item input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-color);
  cursor: pointer;
  flex-shrink: 0;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 6px;
}

.contact-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.contact-phone {
  font-size: 14px;
  color: var(--text-secondary);
}

.contact-address {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-icon {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-icon svg {
  width: 14px;
  height: 14px;
  color: white;
}

.points-info {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.points-balance {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.points-balance .label {
  font-size: 14px;
  color: var(--text-secondary);
}

.balance-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
}

.balance-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.points-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.points-switch input {
  display: none;
}

.switch-track {
  width: 48px;
  height: 26px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  position: relative;
  transition: background var(--transition-normal);
}

.points-switch input:checked + .switch-track {
  background: var(--primary-color);
}

.switch-thumb {
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.points-switch input:checked + .switch-track .switch-thumb {
  transform: translateX(22px);
}

.points-switch span {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.method-options {
  padding: 16px 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 150px;
  position: relative;
}

.method-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.method-item.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.method-item input {
  display: none;
}

.method-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-icon-wrapper.wechat {
  background: #07c160;
}

.method-icon-wrapper.alipay {
  background: #1677ff;
}

.method-icon-wrapper.wallet {
  background: linear-gradient(135deg, #f40 0%, #ff6b35 100%);
}

.method-icon-wrapper img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.method-icon-wrapper.wallet svg {
  width: 24px;
  height: 24px;
  color: white;
}

.method-item span {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.check-mark {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  margin-left: auto;
}

.pay-button-wrapper {
  padding: 20px 24px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pay-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.pay-amount .label {
  font-size: 14px;
  color: var(--text-secondary);
}

.pay-amount .amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--danger-color);
}

.pay-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #f40 0%, #ff6b35 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

.pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
}

.no-address-tip {
  margin: 0;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.default-tag {
  font-size: 12px;
  color: #fff;
  background: var(--primary-color);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  margin-left: 4px;
}

.address-add {
  padding: 0 24px 20px;
}

.add-address-btn {
  border: 1px dashed var(--primary-color);
  color: var(--primary-color);
  background: transparent;
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
}

.address-form {
  margin-top: 14px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.form-row input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: #fff;
}

.save-address-btn {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--primary-color);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.wallet-balance {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 4px;
}

.wallet-balance.insufficient {
  color: var(--danger-color);
  font-weight: 600;
}
</style>