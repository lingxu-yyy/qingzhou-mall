<template>
  <div class="order-detail-page">
    <div class="page-container">
      <div class="page-header">
        <h1>📦 订单详情</h1>
        <div class="back-link" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          <span>返回</span>
        </div>
      </div>
      
      <div v-if="!currentOrder" class="loading-state">
        <p>订单加载中...</p>
      </div>

      <template v-else>
      <div class="status-card">
        <div class="status-header">
          <div class="order-id">
            <span class="label">订单编号</span>
            <span class="value">{{ currentOrder.order_no }}</span>
          </div>
          <div :class="['status-badge', statusClass]">
            <span class="status-icon">{{ statusIcon }}</span>
            <span>{{ currentOrder.status }}</span>
          </div>
        </div>
        
        <div class="timeline">
          <div :class="['timeline-item', { active: true }]">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-title">订单创建</span>
              <span class="timeline-desc">订单已提交</span>
            </div>
          </div>
          <div :class="['timeline-item', { active: isPaid }]">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-title">已付款</span>
              <span class="timeline-desc">支付成功</span>
            </div>
          </div>
          <div :class="['timeline-item', { active: isShipped }]">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-title">已发货</span>
              <span class="timeline-desc">商品已发出</span>
            </div>
          </div>
          <div :class="['timeline-item', { active: isCompleted }]">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-title">已完成</span>
              <span class="timeline-desc">订单已完成</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="address-card">
        <div class="card-header">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>收货信息</span>
          </h2>
        </div>
        <div class="address-content">
          <div class="address-header">
            <span class="contact-name">{{ currentOrder.contact_name }}</span>
            <span class="contact-phone">{{ currentOrder.contact_phone }}</span>
          </div>
          <p class="address-text">{{ currentOrder.contact_address }}</p>
        </div>
      </div>
      
      <div class="products-card">
        <div class="card-header">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7h-9M7 10V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5M17 14H7m10 0v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-5m10 0h-2.5"/>
            </svg>
            <span>商品清单</span>
          </h2>
        </div>
        
        <div class="product-list">
          <div class="product-item" v-for="item in currentOrder.items" :key="item.id">
            <div class="product-image">
              <img :src="resolveImage(item.product_image)" alt="商品" />
            </div>
            <div class="product-details">
              <h3 class="product-name">{{ item.product_name }}</h3>
              <span class="product-option">单价：¥{{ Number(item.price).toFixed(2) }}</span>
            </div>
            <div class="product-price">¥{{ Number(item.price).toFixed(2) }}</div>
            <div class="product-qty">×{{ item.quantity }}</div>
            <div class="product-total">¥{{ Number(item.subtotal).toFixed(2) }}</div>
          </div>
        </div>

        <div class="products-summary">
          <div class="summary-row">
            <span>商品数量</span>
            <span>{{ totalQuantity }} 件</span>
          </div>
          <div class="summary-row" v-if="currentOrder.points_discount > 0">
            <span>积分抵扣</span>
            <span>-¥{{ Number(currentOrder.points_discount).toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>实付金额</span>
            <span class="total-price">¥{{ Number(currentOrder.final_amount).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="action-bar">
        <template v-if="currentOrder.status === '已下单'">
          <button class="action-btn primary" :disabled="processing" @click="handlePayment">{{ processing ? '处理中...' : '立即支付' }}</button>
          <button class="action-btn" :disabled="processing" @click="handleCancel">取消订单</button>
        </template>
        <template v-else-if="currentOrder.status === '已付款'">
          <div class="completed-state">
            <span class="check-icon">🚚</span>
            <span>支付成功，等待商家发货</span>
          </div>
          <button class="action-btn" :disabled="processing" @click="handleCancel">取消订单</button>
        </template>
        <button v-else-if="currentOrder.status === '已发货'" class="action-btn primary" :disabled="processing" @click="confirmReceipt">{{ processing ? '处理中...' : '确认收货' }}</button>
        <div v-else-if="currentOrder.status === '已取消'" class="completed-state">
          <span class="check-icon">✕</span>
          <span>订单已取消</span>
        </div>
        <div v-else class="completed-state">
          <span class="check-icon">✓</span>
          <span>订单已完成</span>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api/shopApi'
import { resolveProductImage } from '@/utils/productImage'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const currentOrder = ref(null)
const processing = ref(false)

const resolveImage = (imagePath) => resolveProductImage(imagePath)

const loadOrder = async () => {
  const id = parseInt(route.query.id)
  if (!id) {
    currentOrder.value = null
    return
  }
  try {
    currentOrder.value = await orderApi.getOrder(id)
  } catch (error) {
    currentOrder.value = null
  }
}

const statusClass = computed(() => {
  const status = currentOrder.value?.status
  if (status === '已下单') return 'pending'
  if (status === '已付款') return 'paid'
  if (status === '已发货') return 'shipped'
  if (status === '已完成') return 'completed'
  return ''
})

const statusIcon = computed(() => {
  const status = currentOrder.value?.status
  if (status === '已下单') return '⏳'
  if (status === '已付款') return '✓'
  if (status === '已发货') return '🚚'
  if (status === '已完成') return '✅'
  return ''
})

const isPaid = computed(() => {
  const status = currentOrder.value?.status
  return status === '已付款' || status === '已发货' || status === '已完成'
})

const isShipped = computed(() => {
  const status = currentOrder.value?.status
  return status === '已发货' || status === '已完成'
})

const isCompleted = computed(() => {
  return currentOrder.value?.status === '已完成'
})

const totalQuantity = computed(() => {
  if (!currentOrder.value) return 0
  return currentOrder.value.items.reduce((sum, item) => sum + Number(item.quantity), 0)
})

const goBack = () => {
  router.back()
}

const handlePayment = async () => {
  if (!currentOrder.value) return
  if (processing.value) return
  processing.value = true
  try {
    await orderApi.pay(currentOrder.value.id)
    ElMessage.success('支付成功')
    await loadOrder()
  } catch (error) {
    ElMessage.error('支付失败，请稍后重试')
    console.error('支付失败', error)
  } finally {
    processing.value = false
  }
}

const confirmReceipt = async () => {
  if (!currentOrder.value) return
  if (processing.value) return
  processing.value = true
  try {
    await orderApi.complete(currentOrder.value.id)
    ElMessage.success('收货成功！感谢您的购买。')
    await loadOrder()
  } catch (error) {
    ElMessage.error('确认收货失败')
    console.error('确认收货失败', error)
  } finally {
    processing.value = false
  }
}

const handleCancel = async () => {
  if (!currentOrder.value) return
  if (processing.value) return
  if (!confirm('确认取消该订单？取消后库存将被还原，已使用的积分将退还。')) return
  processing.value = true
  try {
    const result = await orderApi.cancel(currentOrder.value.id)
    ElMessage.success(result?.message || '订单已取消')
    // 同步退还用户积分
    const order = currentOrder.value
    if (order.points_used > 0) {
      userStore.updateUser({ points: (Number(userStore.user?.points) || 0) + Number(order.points_used) })
    }
    await loadOrder()
  } catch (error) {
    const msg = error?.response?.data?.message || '取消订单失败'
    ElMessage.error(msg)
    console.error('取消订单失败', error)
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail-page {
  padding: 24px 0;
  min-height: calc(100vh - 200px);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.loading-state {
  text-align: center;
  padding: 80px 0;
  color: #94a3b8;
  font-size: 16px;
}

.page-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 700;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.back-link:hover {
  background: var(--bg-secondary);
}

.back-link svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.back-link span {
  font-size: 14px;
  color: var(--text-secondary);
}

.status-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: var(--radius-xl);
  padding: 24px;
  margin-bottom: 20px;
  color: white;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.order-id {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-id .label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.order-id .value {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 14px;
}

.status-badge.pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.status-badge.paid {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-badge.shipped {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-badge.completed {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.status-icon {
  font-size: 16px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 24px;
  width: 2px;
  height: calc(100% + 4px);
  background: rgba(255, 255, 255, 0.2);
}

.timeline-item.active:not(:last-child)::before {
  background: linear-gradient(180deg, #f40 0%, rgba(244, 67, 54, 0.3) 100%);
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.timeline-item.active .timeline-dot {
  background: #f40;
  box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.3);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.timeline-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.address-card,
.products-card {
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

.address-content {
  padding: 20px 24px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.contact-phone {
  font-size: 14px;
  color: var(--text-secondary);
}

.address-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.product-list {
  padding: 16px 24px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-option {
  font-size: 13px;
  color: var(--text-muted);
}

.product-price,
.product-qty {
  font-size: 14px;
  color: var(--text-secondary);
  min-width: 80px;
  text-align: center;
}

.product-total {
  font-size: 16px;
  font-weight: 700;
  color: var(--danger-color);
  min-width: 100px;
  text-align: right;
}

.products-summary {
  padding: 20px 24px;
  background: var(--bg-secondary);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.summary-row.total {
  padding-top: 15px;
  margin-top: 8px;
  border-top: 2px solid var(--border-color);
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: var(--danger-color);
}

.action-bar {
  position: sticky;
  bottom: 0;
  padding: 20px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  margin: 20px -24px -24px;
  padding: 20px 24px;
}

.action-btn {
  width: 100%;
  padding: 14px 40px;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn.primary {
  background: linear-gradient(135deg, #f40 0%, #ff6b35 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
}

.completed-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 40px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
}

.check-icon {
  width: 24px;
  height: 24px;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}
</style>