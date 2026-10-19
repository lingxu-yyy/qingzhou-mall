<template>
  <div class="product-detail-page">
    <div class="page-container">
      <div class="product-breadcrumb">
        <router-link to="/">首页</router-link>
        <span class="breadcrumb-arrow">/</span>
        <router-link to="/category">商品分类</router-link>
        <span class="breadcrumb-arrow">/</span>
        <span>{{ currentProduct ? currentProduct.name : '...' }}</span>
      </div>
      
      <div v-if="!currentProduct" class="loading-state">
        <p>商品加载中或不存在...</p>
      </div>

      <div class="product-main" v-if="currentProduct">
        <div class="product-images">
          <div class="main-image-wrapper">
            <div class="main-image">
              <img :src="currentProduct.image" alt="商品图片" />
            </div>
            <div class="image-actions">
              <button :class="['action-btn', { active: isFavorite }]" @click="toggleFavorite(currentProduct)">
                <svg viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="thumbnails">
            <div 
              v-for="i in 5" 
              :key="i" 
              :class="['thumbnail-item', { active: activeThumbnail === i - 1 }]"
              @click="activeThumbnail = i - 1"
            >
              <img :src="currentProduct.image" alt="缩略图" />
            </div>
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-title">
            <h1>{{ currentProduct.name }}</h1>
          </div>
          
          <div class="price-section">
            <div class="price-row">
              <span class="sale-price">¥{{ currentProduct.price.toFixed(2) }}</span>
              <span class="market-price" v-if="currentProduct.originalPrice">市场价 ¥{{ currentProduct.originalPrice.toFixed(2) }}</span>
            </div>
            <div class="discount-badge" v-if="currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price">省 ¥{{ (currentProduct.originalPrice - currentProduct.price).toFixed(2) }}</div>
          </div>

          <div class="product-meta">
            <div class="meta-item">
              <span class="meta-label">库存</span>
              <span class="meta-value in-stock">{{ currentProduct.stock > 0 ? `有货(剩${currentProduct.stock}件)` : '暂时缺货' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">销量</span>
              <span class="meta-value">{{ currentProduct.sales }}件</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">好评率</span>
              <span class="meta-value">98%</span>
            </div>
          </div>
          
          <div class="description">{{ currentProduct.meta }}</div>
          
          <div class="quantity-section">
            <span class="qty-label">购买数量</span>
            <div class="qty-control">
              <button class="qty-btn" @click="decreaseQty" :disabled="quantity <= 1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="12" x2="6" y2="12"></line>
                </svg>
              </button>
              <input type="number" v-model="quantity" class="qty-input" min="1" />
              <button class="qty-btn" @click="increaseQty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="18" x2="12" y2="6"></line>
                  <line x1="6" y1="12" x2="18" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="add-cart-btn" @click="addToCart">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.99-1.61L23 6H6"></path>
              </svg>
              <span>加入购物车</span>
            </button>
            <button class="buy-now-btn" @click="buyNow">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>立即购买</span>
            </button>
          </div>
          
          <div class="service-tags">
            <span class="service-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              正品保障
            </span>
            <span class="service-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              七天无理由
            </span>
            <span class="service-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10M8 20V4M3 4h18M4 4l5 5-5 5M19 4l-5 5 5 5"></path>
              </svg>
              极速发货
            </span>
          </div>
        </div>
        
        <div class="hot-products">
          <div class="section-header">
            <h3>🔥 热销推荐</h3>
            <a href="/category" class="view-more">查看更多</a>
          </div>
          <div class="hot-list">
            <div
              class="hot-item"
              v-for="(product, index) in hotProducts"
              :key="index"
              @click="goToProduct(product.id)"
            >
              <div class="hot-image">
                <img :src="product.image" alt="热销商品" />
              </div>
              <div class="hot-info">
                <span class="hot-name">{{ product.name }}</span>
                <div class="hot-price">
                  <span class="hot-current">¥{{ product.price.toFixed(2) }}</span>
                  <span class="hot-original" v-if="product.originalPrice">¥{{ product.originalPrice.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>  
      </div>
      
      <div class="product-tabs" v-if="currentProduct">
        <div class="tabs-nav">
          <button :class="['tab', { active: activeTab === 'description' }]" @click="activeTab = 'description'">商品详情</button>
          <button :class="['tab', { active: activeTab === 'reviews' }]" @click="activeTab = 'reviews'">用户评价({{ currentReviews.length }})</button>
        </div>

        <div class="tabs-content">
          <div v-if="activeTab === 'description'" class="tab-panel">
            <div class="description-content">
              <h3>商品详情</h3>
              <p v-if="currentProduct.description">{{ currentProduct.description }}</p>
              <p>{{ currentProduct.name }}：{{ currentProduct.meta }}。详细介绍产品特性、材质、规格等信息。</p>
              <p>本产品采用优质材料制作，经过严格的质量检测，确保每一件商品都达到最高标准。</p>
              <p>使用说明：请仔细阅读产品说明书，按照指导正确使用。如有任何问题，请联系客服。</p>
              <div class="feature-list">
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>高品质材料</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>严格质量控制</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>专业客服支持</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>安全可靠</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'reviews'" class="tab-panel">
            <div class="reviews-header">
              <div class="rating-summary">
                <div class="rating-stars">
                  <span class="star">★</span>
                  <span class="star">★</span>
                  <span class="star">★</span>
                  <span class="star">★</span>
                  <span class="star">★</span>
                </div>
                <span class="rating-value">4.9</span>
                <span class="rating-count">共 {{ currentReviews.length }} 条评价</span>
              </div>
            </div>

            <div class="review-item" v-for="(review, index) in currentReviews" :key="index">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div class="reviewer-detail">
                    <span class="author">{{ review.author }}</span>
                    <span class="date">{{ review.date }}</span>
                  </div>
                </div>
                <div class="review-stars">
                  <span v-for="n in 5" :key="n" :class="['star', { filled: n <= review.stars }]">★</span>
                </div>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </div>
            
            <div class="add-review">
              <h4>发表评价</h4>
              <textarea v-model="reviewContent" placeholder="分享您的使用体验..."></textarea>
              <div class="review-actions">
                <div class="star-rating">
                  <span v-for="n in 5" :key="n" @click="setRating(n)" :class="['star', { active: rating >= n }]">★</span>
                </div>
                <button class="submit-btn" @click="submitReview">提交评价</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '../stores/cart'
import { useFavoriteStore } from '../stores/favorite'
import { productApi } from '@/api/shopApi'

const quantity = ref(1)
const activeThumbnail = ref(0)
const activeTab = ref('description')

const currentProduct = ref(null)
const hotProducts = ref([])

const reviewMap = reactive({
  1: [
    { author: '张三', date: '2022-10-14 10:19', stars: 5, content: '葡萄很甜，颗粒饱满！' },
    { author: '李四', date: '2022-10-13 15:30', stars: 5, content: '非常新鲜，物流很快！' },
    { author: '王五', date: '2022-10-12 09:45', stars: 4, content: '不错，下次还会买' }
  ],
  2: [
    { author: '小明', date: '2022-10-14 11:20', stars: 5, content: '这个苹果很好吃！' },
    { author: '小红', date: '2022-10-13 14:15', stars: 5, content: '又脆又甜，非常满意！' },
    { author: '小华', date: '2022-10-11 16:30', stars: 4, content: '品质不错' }
  ],
  3: [
    { author: '阿强', date: '2022-10-14 08:30', stars: 5, content: '萝卜很新鲜，炖汤很好喝！' },
    { author: '阿美', date: '2022-10-12 19:45', stars: 4, content: '新鲜度不错' }
  ],
  4: [
    { author: '李姐', date: '2022-10-14 12:00', stars: 5, content: '梨子很甜，水分充足！' },
    { author: '王哥', date: '2022-10-13 10:30', stars: 5, content: '非常满意，回购了！' }
  ],
  5: [
    { author: '吃货小王', date: '2022-10-14 13:20', stars: 5, content: '汉堡很好吃，牛肉很嫩！' },
    { author: '美食家', date: '2022-10-12 18:15', stars: 4, content: '味道不错，值得推荐' }
  ],
  6: [
    { author: '橙子控', date: '2022-10-14 14:00', stars: 5, content: '橙子很甜，汁水很多！' },
    { author: '水果达人', date: '2022-10-11 09:00', stars: 5, content: '正宗赣南脐橙，非常好吃！' }
  ],
  7: [
    { author: '健身达人', date: '2022-10-14 15:30', stars: 5, content: '牛油果很新鲜，做沙拉很棒！' },
    { author: '健康生活', date: '2022-10-13 11:20', stars: 4, content: '品质不错' }
  ],
  8: [
    { author: '职场新人', date: '2022-10-14 16:00', stars: 5, content: '非常轻薄，携带方便，办公性能足够！' },
    { author: '程序员小王', date: '2022-10-13 14:30', stars: 5, content: '性价比很高，推荐！' },
    { author: '设计师小李', date: '2022-10-12 10:15', stars: 4, content: '屏幕素质不错' }
  ],
  9: [
    { author: '果粉小张', date: '2022-10-14 17:20', stars: 5, content: '手机非常流畅，拍照效果一流！' },
    { author: '科技达人', date: '2022-10-13 15:45', stars: 5, content: '芯片性能强大，游戏体验极佳！' },
    { author: '数码爱好者', date: '2022-10-11 09:30', stars: 5, content: '拍照功能很实用' }
  ],
  10: [
    { author: '学生党', date: '2022-10-14 18:00', stars: 5, content: '非常轻薄，续航也不错！' },
    { author: '商务人士', date: '2022-10-12 11:30', stars: 4, content: '适合日常使用，性价比高' }
  ],
  11: [
    { author: '电竞选手', date: '2022-10-14 19:00', stars: 5, content: '游戏性能爆表，散热非常给力！' },
    { author: '游戏主播', date: '2022-10-13 16:20', stars: 5, content: '高刷屏太爽了，画面丝滑！' },
    { author: '硬件发烧友', date: '2022-10-10 10:00', stars: 5, content: '品质值得信赖' }
  ],
  12: [
    { author: '宝妈小李', date: '2022-10-14 10:00', stars: 5, content: '面料很舒服，孩子很喜欢！' },
    { author: '时尚辣妈', date: '2022-10-13 14:30', stars: 5, content: '款式漂亮，质量很好！' },
    { author: '新手妈妈', date: '2022-10-11 09:15', stars: 4, content: '尺码标准，穿着合适' }
  ],
  13: [
    { author: '运动达人爸爸', date: '2022-10-14 11:20', stars: 5, content: '孩子穿上很帅气，运动很方便！' },
    { author: '细心妈妈', date: '2022-10-12 16:00', stars: 5, content: '面料透气，做工精细' },
    { author: '潮流家长', date: '2022-10-10 10:30', stars: 4, content: '颜色很正，孩子喜欢' }
  ],
  14: [
    { author: '小公主妈妈', date: '2022-10-14 12:00', stars: 5, content: '女儿穿上像小公主一样，太美了！' },
    { author: '派对策划师', date: '2022-10-13 15:45', stars: 5, content: '质量很好，款式精美！' },
    { author: '外婆奶奶', date: '2022-10-11 08:30', stars: 5, content: '送给孙女的礼物，她非常喜欢' }
  ],
  15: [
    { author: '装修达人', date: '2022-10-14 10:00', stars: 5, content: '安装师傅很专业，供暖效果很好！' },
    { author: '品质生活', date: '2022-10-13 14:30', stars: 5, content: '品牌值得信赖，运行很安静' },
    { author: '温暖之家', date: '2022-10-11 09:15', stars: 4, content: '节能效果不错' }
  ],
  16: [
    { author: '懒人福音', date: '2022-10-14 11:20', stars: 5, content: '解放双手，清洁效果很好！' },
    { author: '科技控', date: '2022-10-12 16:00', stars: 5, content: '避障能力很强，不会撞家具' },
    { author: '智能家居', date: '2022-10-10 10:30', stars: 4, content: '续航能力不错' }
  ],
  17: [
    { author: '家庭主妇', date: '2022-10-14 12:00', stars: 5, content: '熨烫效果很好，衣服变得很平整！' },
    { author: '职场白领', date: '2022-10-13 15:45', stars: 5, content: '节省时间，使用方便' },
    { author: '精致生活', date: '2022-10-11 08:30', stars: 4, content: '蒸汽很足' }
  ],
  18: [
    { author: '安全第一', date: '2022-10-14 13:00', stars: 5, content: '安全防护很到位，用着放心！' },
    { author: '热水需求', date: '2022-10-12 17:20', stars: 5, content: '热水供应稳定，洗澡很舒服' },
    { author: '品质保障', date: '2022-10-10 09:00', stars: 5, content: '售后服务很好' }
  ]
})

const currentReviews = computed(() => reviewMap[currentProduct.value?.id] || [])

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()

const loadProduct = async (productId) => {
  if (!productId) return
  try {
    currentProduct.value = await productApi.getProduct(productId)
    quantity.value = 1
    activeThumbnail.value = 0
    addToHistory(currentProduct.value)
  } catch (error) {
    currentProduct.value = null
  }
}

const loadHotProducts = async () => {
  try {
    const { list } = await productApi.getProducts({ page: 1, pageSize: 4 })
    hotProducts.value = list
  } catch (error) {
    ElMessage.error('加载热销商品失败')
    console.error('加载热销商品失败', error)
  }
}

const addToHistory = (product) => {
  let history = JSON.parse(localStorage.getItem('history') || '[]')
  history = history.filter(item => item.id !== product.id)
  history.unshift({
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    originalPrice: product.originalPrice,
    browseTime: new Date().toISOString()
  })
  if (history.length > 50) {
    history = history.slice(0, 50)
  }
  localStorage.setItem('history', JSON.stringify(history))
}

const getRouteProductId = () => {
  return parseInt(route.params.id) || parseInt(route.query.id) || null
}

watch(() => route.fullPath, () => {
  loadProduct(getRouteProductId())
})

onMounted(() => {
  loadProduct(getRouteProductId())
  loadHotProducts()
  favoriteStore.loadFavorites()
})

// 监听用户直接在输入框修改数量，防止超过库存或小于 1
watch(quantity, (val) => {
  const num = Number(val)
  if (!Number.isFinite(num) || num < 1) {
    quantity.value = 1
    return
  }
  const stock = Number(currentProduct.value?.stock) || 0
  if (stock > 0 && num > stock) {
    quantity.value = stock
    ElMessage.warning(`购买数量不能超过库存（剩余 ${stock} 件）`)
  } else {
    quantity.value = Math.floor(num)
  }
})

const reviewContent = ref('')
const rating = ref(5)

const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--
}

const increaseQty = () => {
  if (currentProduct.value && quantity.value >= currentProduct.value.stock) {
    ElMessage.warning('已达库存上限')
    return
  }
  quantity.value++
}

const setRating = (n) => {
  rating.value = n
}

const submitReview = () => {
  if (!reviewContent.value.trim()) {
    alert('请输入评论内容')
    return
  }
  
  const newReview = {
    author: '当前用户',
    date: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-'),
    stars: rating.value,
    content: reviewContent.value
  }
  
  const productId = currentProduct.value.id
  if (!reviewMap[productId]) {
    reviewMap[productId] = []
  }
  reviewMap[productId].push(newReview)
  reviewContent.value = ''
  rating.value = 5

  alert('评论提交成功！')
}

const addToCart = async () => {
  if (!currentProduct.value) return
  const stock = Number(currentProduct.value.stock) || 0
  if (stock <= 0) {
    ElMessage.warning('该商品暂时缺货')
    return
  }
  if (quantity.value > stock) {
    ElMessage.warning(`购买数量不能超过库存（剩余 ${stock} 件）`)
    quantity.value = stock
    return
  }
  try {
    await cartStore.addItem({
      id: currentProduct.value.id,
      name: currentProduct.value.name,
      price: currentProduct.value.price,
      image: currentProduct.value.image
    }, quantity.value)
    ElMessage.success(`已将 ${quantity.value} 件 "${currentProduct.value.name}" 加入购物车！`)
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '加入购物车失败')
  }
}

const buyNow = () => {
  if (!currentProduct.value) return
  const stock = Number(currentProduct.value.stock) || 0
  if (stock <= 0) {
    ElMessage.warning('该商品暂时缺货')
    return
  }
  if (quantity.value > stock) {
    ElMessage.warning(`购买数量不能超过库存（剩余 ${stock} 件）`)
    quantity.value = stock
    return
  }
  const items = [{
    id: currentProduct.value.id,
    name: currentProduct.value.name,
    price: currentProduct.value.price,
    image: currentProduct.value.image,
    quantity: quantity.value
  }]
  sessionStorage.setItem('buyNowItems', JSON.stringify(items))
  router.push('/payment?from=buynow')
}

// 收藏状态来自收藏 store：登录用户同步数据库，游客保存在本地
const isFavorite = computed(() => {
  if (!currentProduct.value) return false
  return favoriteStore.isFavorite(currentProduct.value.id)
})

const toggleFavorite = async () => {
  if (!currentProduct.value) return
  try {
    const favorited = await favoriteStore.toggle(currentProduct.value.id)
    ElMessage.success(favorited ? '已加入收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '收藏操作失败')
  }
}
</script>

<style scoped>
.product-detail-page {
  padding: 24px 0;
  min-height: calc(100vh - 200px);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.loading-state {
  text-align: center;
  padding: 80px 0;
  color: #94a3b8;
  font-size: 16px;
}

.product-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--text-muted);
}

.product-breadcrumb a {
  color: var(--secondary-color);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.product-breadcrumb a:hover {
  color: var(--secondary-hover);
}

.breadcrumb-arrow {
  color: var(--border-color);
}

.product-main {
  display: flex;
  gap: 28px;
  margin-bottom: 28px;
}

.product-images {
  width: 420px;
  flex-shrink: 0;
}

.main-image-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.main-image {
  width: 100%;
  height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-image:hover img {
  transform: scale(1.03);
}

.image-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.action-btn svg {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.action-btn:hover {
  background: var(--primary-color);
  transform: scale(1.1);
}

.action-btn:hover svg {
  color: white;
}

.action-btn.active svg {
  color: #f56c6c;
  fill: currentColor;
}

.action-btn.active:hover svg {
  color: #f56c6c;
}

.thumbnails {
  display: flex;
  gap: 12px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-item:hover {
  border-color: var(--secondary-color);
  transform: scale(1.05);
}

.thumbnail-item.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.product-info {
  flex: 1;
  padding: 28px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

.product-title h1 {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-weight: 600;
  line-height: 1.5;
}

.price-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 12px;
}

.sale-price {
  font-size: 36px;
  color: var(--danger-color);
  font-weight: 700;
  font-family: 'Arial', sans-serif;
}

.market-price {
  font-size: 15px;
  color: var(--text-muted);
  text-decoration: line-through;
}

.discount-badge {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  color: var(--danger-color);
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-full);
}

.product-meta {
  display: flex;
  gap: 28px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: var(--text-muted);
}

.meta-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.meta-value.in-stock {
  color: var(--success-color);
}

.description {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.7;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.qty-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 38px;
  height: 38px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.qty-btn svg {
  width: 16px;
  height: 16px;
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
  width: 65px;
  height: 38px;
  text-align: center;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  background: var(--bg-primary);
}

.qty-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.add-cart-btn {
  flex: 1;
  height: 48px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: var(--bg-dark);
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
}

.add-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5);
}

.add-cart-btn svg {
  width: 18px;
  height: 18px;
}

.buy-now-btn {
  flex: 1;
  height: 48px;
  background: linear-gradient(135deg, #f40 0%, #ff6b35 100%);
  color: white;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

.buy-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
}

.buy-now-btn svg {
  width: 18px;
  height: 18px;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.service-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text-secondary);
}

.service-tag svg {
  width: 14px;
  height: 14px;
  color: var(--secondary-color);
}

.hot-products {
  width: 260px;
  flex-shrink: 0;
  padding: 24px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 17px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
}

.view-more {
  font-size: 13px;
  color: var(--secondary-color);
  text-decoration: none;
}

.view-more:hover {
  text-decoration: underline;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hot-item {
  display: flex;
  gap: 14px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.hot-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}

.hot-image {
  width: 70px;
  height: 70px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.hot-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hot-name {
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hot-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.hot-current {
  font-size: 15px;
  color: var(--danger-color);
  font-weight: 700;
}

.hot-original {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: line-through;
}

.product-tabs {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  border-bottom: 1px solid var(--border-light);
}

.tab {
  padding: 16px 32px;
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all var(--transition-normal);
}

.tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--primary-gradient);
  border-radius: 2px;
  transition: width var(--transition-normal);
}

.tab:hover {
  color: var(--primary-color);
}

.tab.active {
  color: var(--primary-color);
  font-weight: 600;
}

.tab.active::after {
  width: 60%;
}

.tabs-content {
  padding: 28px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.description-content h3 {
  font-size: 18px;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-weight: 600;
}

.description-content p {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 16px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.feature-icon {
  color: var(--success-color);
  font-weight: 700;
}

.reviews-header {
  margin-bottom: 24px;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%);
  border-radius: var(--radius-lg);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .star {
  font-size: 24px;
  color: #fbbf24;
}

.rating-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.rating-count {
  font-size: 14px;
  color: var(--text-muted);
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--border-light);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-hover) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewer-avatar svg {
  width: 20px;
  height: 20px;
  color: white;
}

.reviewer-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
}

.date {
  font-size: 12px;
  color: var(--text-muted);
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-stars .star {
  font-size: 16px;
  color: #ddd;
}

.review-stars .star.filled {
  color: #fbbf24;
}

.review-content {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.add-review {
  margin-top: 28px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.add-review h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-weight: 600;
}

.add-review textarea {
  width: 100%;
  height: 120px;
  padding: 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  resize: none;
  transition: all var(--transition-normal);
  background: var(--bg-primary);
}

.add-review textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.1);
}

.review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.review-actions .star-rating {
  display: flex;
  gap: 8px;
}

.review-actions .star {
  font-size: 28px;
  color: #ddd;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.review-actions .star:hover,
.review-actions .star.active {
  color: #fbbf24;
  transform: scale(1.1);
}

.review-actions .submit-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c00 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.review-actions .submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(244, 67, 54, 0.4);
}

@media (max-width: 1200px) {
  .product-main {
    flex-direction: column;
  }
  
  .product-images {
    width: 100%;
  }
  
  .main-image {
    height: auto;
  }
  
  .hot-products {
    width: 100%;
  }
  
  .hot-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .hot-item {
    width: calc(50% - 8px);
  }
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .product-meta {
    flex-wrap: wrap;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style>