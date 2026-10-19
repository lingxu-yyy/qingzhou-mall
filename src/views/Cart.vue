<template>
  <div class="cart-page">
    <div class="page-container">
      <div class="page-header">
        <h1>🛒 我的购物车</h1>
        <span class="item-count">共 {{ cartStore.items.length }} 件商品</span>
      </div>
      
      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.99-1.61L23 6H6"></path>
          </svg>
        </div>
        <p class="empty-title">购物车是空的</p>
        <p class="empty-desc">快去挑选心仪的商品吧</p>
        <button class="empty-btn" @click="continueShopping">去购物</button>
      </div>
      
      <template v-else>
        <div class="cart-list">
          <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
            <div class="item-checkbox">
              <input type="checkbox" :checked="item.selected !== false" @change="cartStore.setSelected(item.id, $event.target.checked)" />
            </div>
            <div class="item-image" @click="goToProduct(item.id)">
              <img :src="item.image" alt="商品图片" />
            </div>
            <div class="item-info">
              <h3 class="item-name" @click="goToProduct(item.id)">{{ item.name }}</h3>
              <p class="item-spec">规格：默认</p>
            </div>
            <div class="item-price">
              <span class="current-price">¥{{ Number(item.price || 0).toFixed(2) }}</span>
            </div>
            <div class="item-quantity">
              <div class="qty-control">
                <button class="qty-btn" @click="updateQty(item, item.quantity - 1)" :disabled="item.quantity <= 1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="12" x2="6" y2="12"></line>
                  </svg>
                </button>
                <input type="number" v-model="item.quantity" class="qty-input" min="1" @change="updateQty(item, item.quantity)" />
                <button class="qty-btn" @click="updateQty(item, item.quantity + 1)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="18" x2="12" y2="6"></line>
                    <line x1="6" y1="12" x2="18" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div class="item-total">
              <span class="total-price">¥{{ (Number(item.price || 0) * item.quantity).toFixed(2) }}</span>
            </div>
            <div class="item-actions">
              <button class="action-btn delete-btn" @click="cartStore.removeItem(item.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="cart-footer">
          <div class="footer-left">
            <label class="select-all">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
              <span>全选</span>
            </label>
            <button class="clear-btn" @click="confirmClear">清空购物车</button>
          </div>
          <div class="footer-right">
            <div class="total-info">
              <span class="total-label">合计(已选 {{ cartStore.selectedItems.length }} 件):</span>
              <span class="total-amount">¥{{ Number(cartStore.selectedPrice || 0).toFixed(2) }}</span>
            </div>
            <button class="pay-btn" @click="goToPayment">立即结算</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const isAllSelected = computed(() => {
  return cartStore.items.length > 0 && cartStore.items.every(item => item.selected !== false)
})

const updateQty = (item, quantity) => {
  cartStore.updateQuantity(item.id, quantity)
}

const toggleSelectAll = async () => {
  const target = !isAllSelected.value
  for (const item of cartStore.items) {
    if ((item.selected !== false) !== target) {
      await cartStore.setSelected(item.id, target)
    }
  }
}

const confirmClear = async () => {
  if (confirm('确定要清空购物车吗？')) {
    await cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }
}

const continueShopping = () => {
  router.push('/category')
}

const goToPayment = () => {
  if (cartStore.selectedItems.length === 0) {
    ElMessage.warning('请先勾选要结算的商品')
    return
  }
  router.push('/payment')
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

onMounted(() => {
  cartStore.loadCart()
})
</script>

<style scoped>
.cart-page {
  padding: 24px 0;
  min-height: calc(100vh - 200px);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 700;
}

.item-count {
  font-size: 14px;
  color: var(--text-muted);
  padding: 6px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.empty-cart {
  text-align: center;
  padding: 80px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  color: var(--text-muted);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 24px 0;
}

.empty-btn {
  padding: 12px 32px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.empty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.cart-list {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  transition: background var(--transition-fast);
}

.cart-item:hover {
  background: var(--bg-secondary);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-checkbox {
  padding-right: 16px;
}

.item-checkbox input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-color);
  cursor: pointer;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-right: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 200px;
}

.item-name {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.item-name:hover {
  color: var(--primary-color);
}

.item-spec {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.item-price {
  width: 100px;
  text-align: center;
}

.current-price {
  font-size: 18px;
  color: var(--danger-color);
  font-weight: 700;
}

.item-quantity {
  width: 120px;
  text-align: center;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 34px;
  height: 34px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.qty-btn svg {
  width: 14px;
  height: 14px;
  color: var(--text-secondary);
}

.qty-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: var(--primary-color);
}

.qty-btn:hover:not(:disabled) svg {
  color: white;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 55px;
  height: 34px;
  text-align: center;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
}

.qty-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.item-total {
  width: 120px;
  text-align: center;
}

.total-price {
  font-size: 20px;
  color: var(--danger-color);
  font-weight: 700;
}

.item-actions {
  width: 80px;
  text-align: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.delete-btn {
  color: var(--text-muted);
}

.delete-btn:hover {
  background: var(--danger-color);
  color: white;
  transform: scale(1.1);
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
}

.select-all input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.clear-btn {
  padding: 10px 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.clear-btn:hover {
  background: var(--danger-color);
  color: white;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 16px;
  color: var(--text-secondary);
}

.total-info .total-amount {
  font-size: 28px;
  color: var(--danger-color);
  font-weight: 700;
}

.pay-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #f40 0%, #ff6b35 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
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

@media (max-width: 900px) {
  .cart-item {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .item-info {
    min-width: 100%;
  }
  
  .item-price,
  .item-quantity,
  .item-total,
  .item-actions {
    width: auto;
    text-align: left;
  }
  
  .footer-right {
    flex-direction: column;
    gap: 12px;
  }
  
  .total-info {
    align-self: flex-start;
  }
}
</style>