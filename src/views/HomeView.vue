<template>
  <div class="home-page">
    <div class="page-container">
      <h2>欢迎来到轻舟商城</h2>
      
      <div class="main-content">
        <div class="category-sidebar">
          <div class="category-header">分类</div>
          <div class="category-list">
            <div :class="['category-item', { active: currentCategory === 'all' }]" @click="currentCategory = 'all'">全部商品</div>
            <div
              v-for="cat in categories"
              :key="cat.name"
              :class="['category-item', { active: currentCategory === cat.name }]"
              @click="currentCategory = cat.name"
            >
              {{ cat.name }}
            </div>
            <div class="more-category" @click="goToCategoryList">查看更多分类</div>
          </div>
        </div>
        
        <div class="product-area">
          <!-- 轮播图 -->
          <div class="banner">
            <div class="banner-content">
              <img :src="banners[currentBannerIndex]" alt="广告横幅" />
            </div>
            <div class="banner-nav">
              <span v-for="(banner, index) in banners" :key="index" :class="['nav-dot', { active: currentBannerIndex === index }]" @click="currentBannerIndex = index"></span>
            </div>
          </div>
          
          <!-- 热销商品 -->
          <div class="section">
            <h3 class="section-title">🔥 热销商品</h3>
            <div class="product-grid">
              <div class="product-card" v-for="product in filteredProducts" :key="product.id" @click="goToProduct(product.id)">
                <div class="product-image">
                  <img :src="product.image" alt="商品图片" />
                  <span class="favorite-icon" @click.stop="toggleFavorite(product)">{{ favoriteStore.isFavorite(product.id) ? '★' : '☆' }}</span>
                </div>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-meta">{{ product.meta }}</div>
                <div class="product-price">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span class="original-price">¥{{ product.originalPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productApi } from '@/api/shopApi'
import { useFavoriteStore } from '../stores/favorite'
import b1 from '@/images/b1.png'
import b2 from '@/images/b2.png'
import b3 from '@/images/b3.png'
import b4 from '@/images/b4.png'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const currentCategory = ref('all')
const currentBannerIndex = ref(0)
let carouselTimer = null

const banners = [b1, b2, b3, b4]

const products = ref([])
const categories = ref([])

const filteredProducts = computed(() => {
  if (currentCategory.value === 'all') {
    return products.value
  }
  return products.value.filter(p => p.category === currentCategory.value)
})

const loadProducts = async () => {
  try {
    const { list } = await productApi.getProducts({ page: 1, pageSize: 50 })
    products.value = list
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

const toggleFavorite = async (product) => {
  try {
    const favorited = await favoriteStore.toggle(product.id)
    ElMessage.success(favorited ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '收藏操作失败')
  }
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

const goToCategoryList = () => {
  router.push('/category')
}

const startCarousel = () => {
  carouselTimer = setInterval(() => {
    currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.length
  }, 3000)
}

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
  }
}

onMounted(() => {
  startCarousel()
  loadProducts()
  loadCategories()
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<style scoped>
.home-page {
  padding: 24px 0;
  min-height: calc(100vh - 200px);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-container h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 28px 0;
  padding-bottom: 14px;
  border-bottom: 3px solid #f40;
  display: inline-block;
  position: relative;
}

.page-container h2::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #f40 0%, #ff8c00 100%);
  border-radius: 2px;
}

.main-content {
  display: flex;
  gap: 20px;
}

.category-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.category-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
}

.category-list {
  padding: 8px 0;
}

.category-item {
  padding: 14px 20px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.25s ease;
  border-left: 3px solid transparent;
  position: relative;
}

.category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #f40 0%, #ff8c00 100%);
  transition: height 0.25s ease;
}

.category-item:hover {
  background: #fef3c7;
  color: #d97706;
}

.category-item:hover::before {
  height: 60%;
}

.category-item.active {
  background: #fffbeb;
  color: #f40;
  font-weight: 600;
}

.category-item.active::before {
  height: 60%;
}

.more-category {
  padding: 12px 16px;
  font-size: 13px;
  color: #999;
  text-align: center;
  cursor: pointer;
  border-top: 1px dashed #eee;
  margin-top: 8px;
}

.more-category:hover {
  color: #f40;
}

.product-area {
  flex: 1;
}

.banner {
  position: relative;
  margin-bottom: 28px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.banner img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.banner:hover img {
  transform: scale(1.03);
}

.banner-nav {
  position: absolute;
  bottom: 16px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.nav-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.nav-dot:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.2);
}

.nav-dot.active {
  background: #f40;
  border-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.product-card {
  background: white;
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid #f1f5f9;
}

.product-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #f40;
}

.product-image {
  position: relative;
  margin-bottom: 14px;
  border-radius: 10px;
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

.favorite-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 22px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.favorite-icon:hover {
  color: #f40;
  transform: scale(1.1);
}

.product-name {
  font-size: 15px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.current-price {
  font-size: 22px;
  color: #dc2626;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
}

.original-price {
  font-size: 13px;
  color: #bdc3c7;
  text-decoration: line-through;
}

@media (max-width: 900px) {
  .category-sidebar {
    display: none;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>