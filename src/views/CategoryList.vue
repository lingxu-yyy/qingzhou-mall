<template>
  <div class="category-page">
    <div class="page-container">
      <div class="category-title">
        当前分类: {{ currentCategory === 'all' ? '全部商品' : currentCategory }}
      </div>
      <div class="category-nav">
        <div 
          :class="['nav-item', { active: currentCategory === 'all' }]" 
          @click="currentCategory = 'all'"
        >
          全部商品
        </div>
        <div
          v-for="category in categories"
          :key="category.name"
          :class="['nav-item', { active: currentCategory === category.name }]"
          @click="currentCategory = category.name"
        >
          {{ category.name }}
        </div>
      </div>
      <div class="category-content">
          <div class="carousel">
            <div class="carousel-track">
              <div 
                v-for="(banner, index) in banners" 
                :key="index"
                class="carousel-item"
                :class="{ active: currentBannerIndex === index }"
              >
                <img :src="banner" alt="轮播图" />
              </div>
            </div>
            <div class="carousel-indicators">
              <span 
                v-for="(_, index) in banners" 
                :key="index"
                :class="['indicator', { active: currentBannerIndex === index }]"
                @click="goToBanner(index)"
              ></span>
            </div>
          </div>
          
          <div class="content-header">
            <h2>{{ currentCategory === 'all' ? '全部商品' : currentCategory }}</h2>
            <span class="count">共 {{ totalCount }} 件商品</span>
          </div>
          
          <div class="product-grid">
            <div class="product-card" v-for="product in products" :key="product.id">
              <div class="product-image" @click="goToProduct(product.id)">
                <img :src="product.image" alt="商品图片" />
                <span class="favorite-icon" @click.stop="toggleFavorite(product.id)">
                  {{ isFavorite(product.id) ? '★' : '☆' }}
                </span>
              </div>
              <div class="product-name" @click="goToProduct(product.id)">{{ product.name }}</div>
              <div class="product-meta">{{ product.meta }}</div>
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price">¥{{ product.originalPrice }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="products.length === 0" class="empty-state">
            <p>暂无相关商品</p>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productApi } from '@/api/shopApi'
import { useFavoriteStore } from '../stores/favorite'
import b1 from '@/images/b1.png'
import b2 from '@/images/b2.png'
import b3 from '@/images/b3.png'
import b4 from '@/images/b4.png'

const router = useRouter()
const route = useRoute()
const favoriteStore = useFavoriteStore()
const searchKeyword = ref('')
const currentCategory = ref('all')
const currentBannerIndex = ref(0)
let carouselTimer = null

const banners = [b1, b2, b3, b4]

const products = ref([])
const categories = ref([])
const totalCount = ref(0)

const loadProducts = async () => {
  try {
    const { list, pagination } = await productApi.getProducts({
      category: currentCategory.value === 'all' ? undefined : currentCategory.value,
      keyword: searchKeyword.value || undefined,
      page: 1,
      pageSize: 50
    })
    products.value = list
    totalCount.value = pagination.total
  } catch (error) {
    ElMessage.error('加载商品失败')
    console.error('加载商品失败', error)
  }
}

const loadCategories = async () => {
  try {
    categories.value = await productApi.getCategories()
  } catch (error) {
  }
}

watch([currentCategory, searchKeyword], () => {
  loadProducts()
})

// 在分类页内通过顶部搜索或分类链接再次导航时，query 变化不会重新挂载组件，
// 需要监听路由参数并同步搜索关键词与分类
watch(() => route.query, (query) => {
  const keyword = (query.keyword || '').trim()
  const category = query.category
  searchKeyword.value = keyword
  currentCategory.value = category && category !== 'all' ? String(category) : 'all'
})

const nextBanner = () => {
  currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.length
}

const goToBanner = (index) => {
  currentBannerIndex.value = index
}

const startCarousel = () => {
  carouselTimer = setInterval(nextBanner, 3000)
}

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
  }
}

onMounted(() => {
  startCarousel()
  // 支持通过路由参数进入指定分类或搜索结果
  let queryChanged = false
  const keyword = route.query.keyword
  if (keyword && keyword.trim()) {
    searchKeyword.value = keyword
    queryChanged = true
  }
  const category = route.query.category
  if (category && category !== 'all') {
    currentCategory.value = String(category)
    queryChanged = true
  }
  loadCategories()
  // 无路由参数时监听器不会触发，需要主动加载一次全部商品
  if (!queryChanged) {
    loadProducts()
  }
})

onUnmounted(() => {
  stopCarousel()
})

const isFavorite = (id) => {
  return favoriteStore.isFavorite(id)
}

const toggleFavorite = async (id) => {
  try {
    const favorited = await favoriteStore.toggle(id)
    ElMessage.success(favorited ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '收藏操作失败')
  }
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}
</script>

<style scoped>
.category-page {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 200px);
  padding: 28px 0;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.category-title {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
  display: none;
}

.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 28px;
}

.nav-item {
  padding: 12px 26px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  border-radius: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
}

.nav-item:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  border-color: #93c5fd;
}

.nav-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  border-color: #3b82f6;
}

.category-content {
  width: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.content-header h2 {
  font-size: 20px;
  color: #1e293b;
  margin: 0;
  font-weight: 600;
  position: relative;
}

.content-header h2::after {
  content: '';
  position: absolute;
  bottom: -18px;
  left: 0;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 2px;
}

.count {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: white;
  padding: 18px;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
}

.product-image {
  position: relative;
  margin-bottom: 16px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.product-image img {
  width: 100%;
  height: 190px;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.carousel {
  position: relative;
  width: 100%;
  margin-bottom: 28px;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
}

.carousel-track {
  display: flex;
  transition: transform 0.3s ease;
}

.carousel-item {
  flex-shrink: 0;
  width: 100%;
  display: none;
}

.carousel-item.active {
  display: block;
}

.carousel-item img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.carousel:hover .carousel-item img {
  transform: scale(1.02);
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.2);
}

.indicator.active {
  background: #3366ff;
  border-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.product-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 22px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.favorite-icon:hover {
  color: #ff6600;
  transform: scale(1.1);
}

.product-name {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 8px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  font-size: 12px;
  color: #95a5a6;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.current-price {
  font-size: 20px;
  color: #e74c3c;
  font-weight: 700;
}

.original-price {
  font-size: 13px;
  color: #95a5a6;
  text-decoration: line-through;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #95a5a6;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.empty-state p {
  font-size: 16px;
}

@media (max-width: 900px) {
  .category-sidebar {
    display: none;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>