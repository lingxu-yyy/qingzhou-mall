<template>
  <div class="admin-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="admin-sidebar">
      <div class="brand">
        <div class="brand-mark">E</div>
        <div class="brand-copy">
          <strong>{{ settings.systemName }}</strong>
          <span>ADMIN CONSOLE</span>
        </div>
      </div>

      <nav class="admin-nav" aria-label="管理端导航">
        <button
          v-for="item in navigationItems"
          :key="item.key"
          type="button"
          class="nav-item"
          :class="{ active: activeMenu === item.key }"
          :aria-current="activeMenu === item.key ? 'page' : undefined"
          @click="handleMenuSelect(item.key)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="operator-avatar">{{ adminInitial }}</div>
        <div class="operator-copy">
          <strong>{{ userStore.userName }}</strong>
          <span>系统管理员</span>
        </div>
      </div>
    </aside>

    <div class="admin-workspace">
      <header class="admin-header">
        <div class="header-leading">
          <el-tooltip :content="sidebarCollapsed ? '展开侧栏' : '折叠侧栏'">
            <el-button
              class="icon-button collapse-button"
              :icon="sidebarCollapsed ? Expand : Fold"
              circle
              aria-label="切换侧栏"
              @click="sidebarCollapsed = !sidebarCollapsed"
            />
          </el-tooltip>
          <div class="header-copy">
            <h1>{{ pageTitle }}</h1>
            <span>{{ pageSubtitle }}</span>
          </div>
        </div>

        <div class="header-actions">
          <el-tooltip v-if="activeMenu === 'dashboard'" content="刷新运行状态">
            <el-button
              class="icon-button"
              :icon="Refresh"
              circle
              aria-label="刷新运行状态"
              :loading="healthLoading"
              @click="checkHealth"
            />
          </el-tooltip>
          <el-button :icon="Shop" @click="goToStorefront">返回商城</el-button>
          <el-button class="logout-button" :icon="SwitchButton" @click="handleLogout">
            退出
          </el-button>
        </div>
      </header>

      <main class="admin-main">
        <Transition name="admin-fade" mode="out-in">
          <section v-if="activeMenu === 'dashboard'" key="dashboard" class="page-section">
            <div class="metric-grid">
              <article
                v-for="metric in dashboardMetrics"
                :key="metric.label"
                class="metric-card"
              >
                <div class="metric-icon" :class="`tone-${metric.tone}`">
                  <el-icon><component :is="metric.icon" /></el-icon>
                </div>
                <div class="metric-content">
                  <span>{{ metric.label }}</span>
                  <strong>{{ metric.value }}</strong>
                  <small>{{ metric.detail }}</small>
                </div>
              </article>
            </div>

            <div class="dashboard-grid">
              <section class="surface status-surface">
                <div class="surface-header">
                  <div>
                    <h2>系统运行状态</h2>
                    <p>最近检测：{{ healthStatus.lastChecked }}</p>
                  </div>
                  <el-tag :type="healthTagType" effect="plain">
                    {{ healthStatusLabel }}
                  </el-tag>
                </div>

                <div class="status-list">
                  <div class="status-row">
                    <div class="status-name">
                      <span class="status-dot" :class="healthStatus.state"></span>
                      <div>
                        <strong>后端 API</strong>
                        <small>{{ apiBaseUrl }}</small>
                      </div>
                    </div>
                    <div class="status-value">
                      <strong>{{ healthStatusLabel }}</strong>
                      <span>{{ healthStatus.latency ?? '--' }} ms</span>
                    </div>
                  </div>
                  <div class="status-row">
                    <div class="status-name">
                      <span class="status-dot online"></span>
                      <div>
                        <strong>前端应用</strong>
                        <small>{{ frontendOrigin }}</small>
                      </div>
                    </div>
                    <div class="status-value">
                      <strong>运行中</strong>
                      <span>Vite</span>
                    </div>
                  </div>
                  <div class="status-row">
                    <div class="status-name">
                      <span
                        class="status-dot"
                        :class="healthStatus.database === 'connected' ? 'online' : 'offline'"
                      ></span>
                      <div>
                        <strong>MySQL 数据库</strong>
                        <small>ecshop 用户数据</small>
                      </div>
                    </div>
                    <div class="status-value">
                      <strong>{{ healthStatus.database === 'connected' ? '已连接' : '未确认' }}</strong>
                      <span>用户 {{ healthStatus.totalUsers }} 条</span>
                    </div>
                  </div>
                  <div class="status-row">
                    <div class="status-name">
                      <span
                        class="status-dot"
                        :class="redisState.connected ? 'online' : 'reserved'"
                      ></span>
                      <div>
                        <strong>Redis 服务</strong>
                        <small>{{ settings.redisHost }}:{{ settings.redisPort }}</small>
                      </div>
                    </div>
                    <div class="status-value">
                      <strong>{{ redisState.connected ? '已连接' : '待检测' }}</strong>
                      <span>{{ redisState.connected ? `${redisState.info.keyCount} 个键` : 'Redis 管理页检测' }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section class="surface quick-surface">
                <div class="surface-header">
                  <div>
                    <h2>快捷操作</h2>
                    <p>常用页面与配置入口</p>
                  </div>
                </div>
                <div class="quick-list">
                  <button type="button" @click="goToStorefront">
                    <span class="quick-icon"><el-icon><Shop /></el-icon></span>
                    <span>
                      <strong>查看商城前台</strong>
                      <small>检查商品展示与购买流程</small>
                    </span>
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                  <button type="button" @click="router.push('/member')">
                    <span class="quick-icon"><el-icon><UserFilled /></el-icon></span>
                    <span>
                      <strong>查看会员中心</strong>
                      <small>检查订单、收藏和个人资料</small>
                    </span>
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                  <button type="button" @click="handleMenuSelect('redis')">
                    <span class="quick-icon"><el-icon><Coin /></el-icon></span>
                    <span>
                      <strong>Redis 集成状态</strong>
                      <small>查看缓存服务预留配置</small>
                    </span>
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                  <button type="button" @click="handleMenuSelect('settings')">
                    <span class="quick-icon"><el-icon><Setting /></el-icon></span>
                    <span>
                      <strong>系统设置</strong>
                      <small>维护控制台与服务参数</small>
                    </span>
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>
              </section>
            </div>

            <section class="surface module-surface">
              <div class="surface-header">
                <div>
                  <h2>业务模块</h2>
                  <p>按当前项目实际实现状态汇总</p>
                </div>
              </div>
              <div class="table-scroll">
                <table class="module-table">
                  <thead>
                    <tr>
                      <th>模块</th>
                      <th>数据来源</th>
                      <th>当前状态</th>
                      <th>入口</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="module in businessModules" :key="module.name">
                      <td>
                        <div class="module-name">
                          <el-icon><component :is="module.icon" /></el-icon>
                          <strong>{{ module.name }}</strong>
                        </div>
                      </td>
                      <td>{{ module.source }}</td>
                      <td>
                        <el-tag :type="module.tagType" effect="plain">
                          {{ module.status }}
                        </el-tag>
                      </td>
                      <td>
                        <el-button
                          link
                          type="primary"
                          :icon="ArrowRight"
                          @click="openModule(module)"
                        >
                          打开
                        </el-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <section v-else-if="activeMenu === 'users'" key="users" class="page-section">
            <section class="surface users-surface">
              <div class="surface-header users-header">
                <div>
                  <h2>注册用户</h2>
                  <p>数据直接读取自 MySQL users 表</p>
                </div>
                <div class="user-tools">
                  <el-input
                    v-model="userSearch"
                    :prefix-icon="Search"
                    clearable
                    placeholder="搜索用户名或手机号"
                  />
                  <el-tooltip content="刷新用户列表">
                    <el-button
                      :icon="Refresh"
                      circle
                      aria-label="刷新用户列表"
                      :loading="usersLoading"
                      @click="loadUsers"
                    />
                  </el-tooltip>
                </div>
              </div>

              <el-table
                v-loading="usersLoading"
                :data="filteredUsers"
                row-key="id"
                empty-text="暂无用户数据"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" min-width="150">
                  <template #default="{ row }">
                    <div class="user-cell">
                      <span class="table-avatar">{{ row.username.slice(0, 1).toUpperCase() }}</span>
                      <strong>{{ row.username }}</strong>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="phone" label="手机号" min-width="150">
                  <template #default="{ row }">
                    {{ row.phone || '未填写' }}
                  </template>
                </el-table-column>
                <el-table-column label="账号类型" width="120">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.role === 'admin' ? 'warning' : 'info'"
                      effect="plain"
                    >
                      {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="积分" width="100">
                  <template #default="{ row }">
                    <span>{{ Number(row.points || 0) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="钱包余额" width="110">
                  <template #default="{ row }">
                    <span>¥{{ Number(row.balance || 0).toFixed(2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="注册时间" min-width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                  </template>
                </el-table-column>
              </el-table>

              <div class="table-footer">
                共 {{ filteredUsers.length }} 条
              </div>
            </section>
          </section>

          <section v-else-if="activeMenu === 'orders'" key="orders" class="page-section">
            <section class="surface orders-surface">
              <div class="surface-header users-header">
                <div>
                  <h2>订单管理</h2>
                  <p>订单数据读取自 MySQL orders 表，可执行发货与完成操作</p>
                </div>
                <div class="user-tools">
                  <el-select
                    v-model="orderStatusFilter"
                    placeholder="全部状态"
                    clearable
                    style="width: 140px"
                    @change="handleOrderFilterChange"
                  >
                    <el-option label="已下单" value="已下单" />
                    <el-option label="已付款" value="已付款" />
                    <el-option label="已发货" value="已发货" />
                    <el-option label="已完成" value="已完成" />
                    <el-option label="已取消" value="已取消" />
                  </el-select>
                  <el-input
                    v-model="orderKeyword"
                    :prefix-icon="Search"
                    clearable
                    placeholder="搜索订单号或用户名"
                    style="width: 240px"
                    @keyup.enter="handleOrderFilterChange"
                    @clear="handleOrderFilterChange"
                  />
                  <el-tooltip content="刷新订单列表">
                    <el-button
                      :icon="Refresh"
                      circle
                      aria-label="刷新订单列表"
                      :loading="ordersLoading"
                      @click="loadOrders"
                    />
                  </el-tooltip>
                </div>
              </div>

              <div class="order-stat-bar">
                <el-tag
                  v-for="stat in orderStats"
                  :key="stat.status"
                  :type="orderTagType(stat.status)"
                  effect="plain"
                >
                  {{ stat.status }}：{{ stat.count }} 单
                </el-tag>
              </div>

              <el-table
                v-loading="ordersLoading"
                :data="orderList"
                row-key="id"
                empty-text="暂无订单数据"
              >
                <el-table-column prop="order_no" label="订单号" min-width="170" />
                <el-table-column prop="user_name" label="下单用户" min-width="110" />
                <el-table-column label="订单状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="orderTagType(row.status)" effect="plain">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="商品明细" min-width="240">
                  <template #default="{ row }">
                    <div class="order-items-cell">
                      <div v-for="item in row.items" :key="item.id" class="order-item-line">
                        {{ item.product_name }} ×{{ item.quantity }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="实付金额" width="110">
                  <template #default="{ row }">
                    <strong>¥{{ Number(row.final_amount).toFixed(2) }}</strong>
                  </template>
                </el-table-column>
                <el-table-column label="下单时间" min-width="160">
                  <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="110" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      v-if="row.status === '已付款'"
                      type="primary"
                      size="small"
                      @click="handleShipOrder(row)"
                    >
                      发货
                    </el-button>
                    <el-button
                      v-else-if="row.status === '已发货'"
                      type="success"
                      size="small"
                      @click="handleCompleteOrder(row)"
                    >
                      完成
                    </el-button>
                    <span v-else class="order-action-muted">--</span>
                  </template>
                </el-table-column>
              </el-table>

              <div class="order-pagination">
                <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :total="orderPagination.total"
                  :page-size="orderPagination.pageSize"
                  :current-page="orderPagination.page"
                  @current-change="handleOrderPageChange"
                />
              </div>
            </section>
          </section>

          <section v-else-if="activeMenu === 'redis'" key="redis" class="page-section">
            <section class="surface redis-summary">
              <div class="surface-header">
                <div>
                  <h2>Redis 集成状态</h2>
                  <p>连接信息来自当前管理端配置，由后端代理发起连接</p>
                </div>
                <el-tag :type="redisState.connected ? 'success' : 'warning'" effect="plain">
                  {{ redisState.connected ? '已连接' : '未连接' }}
                </el-tag>
              </div>

              <el-alert
                v-if="redisState.connected"
                :title="`Redis ${redisState.info.version} 连接正常，响应延迟 ${redisState.info.latencyMs}ms`"
                type="success"
                :closable="false"
                show-icon
              />
              <el-alert
                v-else
                title="尚未连接 Redis 服务，请点击“检测状态”测试后端到 Redis 的连通性。"
                type="warning"
                :closable="false"
                show-icon
              />

              <div class="config-grid">
                <div class="config-item">
                  <span>主机</span>
                  <strong>{{ settings.redisHost }}</strong>
                </div>
                <div class="config-item">
                  <span>端口</span>
                  <strong>{{ settings.redisPort }}</strong>
                </div>
                <div class="config-item">
                  <span>数据库</span>
                  <strong>DB {{ settings.redisDb }}</strong>
                </div>
                <div class="config-item">
                  <span>键数量</span>
                  <strong>{{ redisState.connected ? redisState.info.keyCount : '--' }}</strong>
                </div>
              </div>

              <div class="config-grid" v-if="redisState.connected">
                <div class="config-item">
                  <span>内存占用</span>
                  <strong>{{ redisState.info.usedMemory || '--' }}</strong>
                </div>
                <div class="config-item">
                  <span>连接客户端</span>
                  <strong>{{ redisState.info.connectedClients ?? '--' }}</strong>
                </div>
                <div class="config-item">
                  <span>运行天数</span>
                  <strong>{{ redisState.info.uptimeDays ?? '--' }} 天</strong>
                </div>
                <div class="config-item">
                  <span>协议</span>
                  <strong>RESP2</strong>
                </div>
              </div>

              <div class="probe-bar">
                <div>
                  <strong>接口检测</strong>
                  <span :class="{ 'probe-success': redisState.connected }">{{ redisProbeMessage }}</span>
                </div>
                <el-button
                  :icon="Connection"
                  :loading="redisChecking"
                  @click="checkRedisIntegration"
                >
                  检测状态
                </el-button>
              </div>
            </section>

            <section class="surface command-surface">
              <div class="surface-header">
                <div>
                  <h2>命令能力</h2>
                  <p>仅开放白名单内的只读与字符串缓存操作，危险命令已在后端拦截</p>
                </div>
              </div>
              <div class="command-grid">
                <div v-for="command in redisCommands" :key="command.name" class="command-item">
                  <code>{{ command.name }}</code>
                  <span>{{ command.description }}</span>
                  <el-tag :type="redisState.connected ? 'success' : 'info'" effect="plain">
                    {{ redisState.connected ? '已启用' : '未启用' }}
                  </el-tag>
                </div>
              </div>
            </section>

            <section class="surface redis-console">
              <div class="surface-header">
                <div>
                  <h2>缓存操作</h2>
                  <p>选择命令并填写参数，执行结果由后端返回</p>
                </div>
              </div>
              <div class="redis-form">
                <el-select v-model="redisForm.command" style="width: 130px">
                  <el-option label="SET 写入" value="SET" />
                  <el-option label="GET 读取" value="GET" />
                  <el-option label="EXISTS 检查" value="EXISTS" />
                  <el-option label="DEL 删除" value="DEL" />
                  <el-option label="EXPIRE 过期" value="EXPIRE" />
                  <el-option label="KEYS 列表" value="KEYS" />
                </el-select>
                <el-input
                  v-model="redisForm.key"
                  placeholder="键名，如 ecshop:home:hot"
                  style="width: 240px"
                  :disabled="redisForm.command === 'KEYS'"
                />
                <el-input
                  v-if="redisForm.command === 'SET'"
                  v-model="redisForm.value"
                  placeholder="缓存内容"
                  style="width: 220px"
                />
                <el-input-number
                  v-if="redisForm.command === 'EXPIRE'"
                  v-model="redisForm.seconds"
                  :min="1"
                  :max="2592000"
                  placeholder="秒"
                  style="width: 150px"
                />
                <el-input
                  v-if="redisForm.command === 'KEYS'"
                  v-model="redisForm.pattern"
                  placeholder="匹配模式，如 ecshop:*"
                  style="width: 220px"
                />
                <el-button
                  type="primary"
                  :loading="redisForm.running"
                  :disabled="!redisState.connected"
                  @click="runRedisCommand"
                >
                  执行
                </el-button>
              </div>
              <div class="redis-result">
                <span class="result-label">执行结果</span>
                <pre>{{ redisForm.result || '暂无' }}</pre>
              </div>
            </section>
          </section>

          <section v-else key="settings" class="page-section">
            <section class="surface settings-surface">
              <div class="surface-header">
                <div>
                  <h2>控制台设置</h2>
                  <p>设置保存在当前浏览器中</p>
                </div>
              </div>

              <el-form class="settings-form" label-position="top">
                <div class="form-grid">
                  <el-form-item label="控制台名称">
                    <el-input
                      v-model="settings.systemName"
                      maxlength="24"
                      show-word-limit
                    />
                  </el-form-item>
                  <el-form-item label="API 地址">
                    <el-input :model-value="apiBaseUrl" disabled />
                  </el-form-item>
                  <el-form-item label="Redis 主机">
                    <el-input v-model="settings.redisHost" maxlength="120" />
                  </el-form-item>
                  <el-form-item label="Redis 端口">
                    <el-input-number
                      v-model="settings.redisPort"
                      :min="1"
                      :max="65535"
                      controls-position="right"
                    />
                  </el-form-item>
                  <el-form-item label="Redis 数据库">
                    <el-input-number
                      v-model="settings.redisDb"
                      :min="0"
                      :max="15"
                      controls-position="right"
                    />
                  </el-form-item>
                  <el-form-item label="自动重连">
                    <div class="switch-field">
                      <el-switch v-model="settings.autoReconnect" />
                      <span>{{ settings.autoReconnect ? '已开启' : '已关闭' }}</span>
                    </div>
                  </el-form-item>
                </div>

                <div class="form-actions">
                  <el-button :icon="RefreshLeft" @click="resetSettings">恢复默认</el-button>
                  <el-button type="primary" :icon="Check" @click="saveSettings">
                    保存设置
                  </el-button>
                </div>
              </el-form>
            </section>
          </section>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowRight,
  Check,
  Coin,
  CollectionTag,
  Connection,
  Expand,
  Fold,
  Goods,
  Monitor,
  Refresh,
  RefreshLeft,
  Search,
  Setting,
  Shop,
  ShoppingCart,
  SwitchButton,
  UserFilled
} from '@element-plus/icons-vue'
import api from '@/api/request'
import { adminApi } from '@/api/shopApi'
import { redisConfig, redisService } from '@/config/redis'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const validSections = ['dashboard', 'users', 'orders', 'redis', 'settings']
const initialSection = validSections.includes(route.query.section) ? route.query.section : 'dashboard'
const activeMenu = ref(initialSection)
const sidebarCollapsed = ref(false)
const healthLoading = ref(false)
const redisChecking = ref(false)
const redisProbeMessage = ref('等待检测')
const redisState = reactive({
  connected: false,
  info: {}
})
const redisForm = reactive({
  command: 'SET',
  key: 'ecshop:demo',
  value: '',
  seconds: 60,
  pattern: 'ecshop:*',
  result: '',
  running: false
})
const users = ref([])
const usersLoading = ref(false)
const userSearch = ref('')

// 订单管理
const ordersLoading = ref(false)
const orderList = ref([])
const orderStats = ref([])
const orderPagination = reactive({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
const orderStatusFilter = ref('')
const orderKeyword = ref('')

const SETTINGS_KEY = 'ecshop-admin-settings'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const frontendOrigin = window.location.origin

const defaultSettings = {
  systemName: 'ESChop 管理控制台',
  redisHost: redisConfig.host,
  redisPort: Number(redisConfig.port),
  redisDb: Number(redisConfig.db),
  autoReconnect: true
}

const settings = reactive({ ...defaultSettings })
const healthStatus = reactive({
  state: 'checking',
  latency: null,
  lastChecked: '尚未检测',
  message: '正在检查后端服务',
  database: 'unknown',
  totalUsers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalSales: 0,
  pendingShipCount: 0,
  shippingCount: 0,
  uptimeSeconds: 0
})

const navigationItems = [
  { key: 'dashboard', label: '运营概览', icon: Monitor },
  { key: 'users', label: '用户管理', icon: UserFilled },
  { key: 'orders', label: '订单管理', icon: ShoppingCart },
  { key: 'redis', label: 'Redis 管理', icon: Coin },
  { key: 'settings', label: '系统设置', icon: Setting }
]

const redisCommands = [
  { name: 'GET / SET', description: '读取与写入字符串缓存' },
  { name: 'DEL / EXISTS', description: '删除并检查缓存键' },
  { name: 'EXPIRE', description: '设置缓存有效期' },
  { name: 'PING / INFO', description: '服务连通性与运行信息' }
]

const businessModules = computed(() => [
  {
    name: '用户认证',
    source: 'Express + MySQL',
    status: healthStatus.state === 'online' ? '服务正常' : '等待检测',
    tagType: healthStatus.state === 'online' ? 'success' : 'warning',
    icon: UserFilled,
    section: 'users'
  },
  {
    name: '商品目录',
    source: 'Express + MySQL',
    status: `${healthStatus.totalProducts} 个商品`,
    tagType: 'primary',
    icon: Goods,
    target: '/category'
  },
  {
    name: '购物车与订单',
    source: 'Express + MySQL',
    status: `${healthStatus.totalOrders} 笔订单`,
    tagType: 'success',
    icon: ShoppingCart,
    section: 'orders'
  },
  {
    name: 'Redis 缓存',
    source: 'Express + Redis',
    status: redisState.connected ? `${redisState.info.keyCount} 个键` : '待检测',
    tagType: redisState.connected ? 'success' : 'warning',
    icon: Coin,
    section: 'redis'
  }
])

const healthStatusLabel = computed(() => {
  const labels = {
    checking: '检测中',
    online: '运行正常',
    offline: '连接异常'
  }
  return labels[healthStatus.state]
})

const healthTagType = computed(() => {
  const types = {
    checking: 'info',
    online: 'success',
    offline: 'danger'
  }
  return types[healthStatus.state]
})

const dashboardMetrics = computed(() => [
  {
    label: '后端服务',
    value: healthStatusLabel.value,
    detail: healthStatus.state === 'online'
      ? `响应 ${healthStatus.latency} ms`
      : healthStatus.message,
    icon: Connection,
    tone: healthStatus.state === 'online' ? 'green' : 'orange'
  },
  {
    label: '注册用户',
    value: String(healthStatus.totalUsers),
    detail: 'MySQL users 表',
    icon: UserFilled,
    tone: 'blue'
  },
  {
    label: '商品条目',
    value: String(healthStatus.totalProducts),
    detail: 'MySQL products 表',
    icon: Goods,
    tone: 'orange'
  },
  {
    label: '订单总数',
    value: String(healthStatus.totalOrders),
    detail: `待发货 ${healthStatus.pendingShipCount} / 配送中 ${healthStatus.shippingCount}`,
    icon: ShoppingCart,
    tone: 'teal'
  },
  {
    label: '累计销售额',
    value: `¥${healthStatus.totalSales.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    detail: '已付款及之后订单金额',
    icon: CollectionTag,
    tone: 'green'
  }
])

const pageTitle = computed(() => {
  const titles = {
    dashboard: '运营概览',
    users: '用户管理',
    orders: '订单管理',
    redis: 'Redis 管理',
    settings: '系统设置'
  }
  return titles[activeMenu.value]
})

const pageSubtitle = computed(() => {
  const subtitles = {
    dashboard: '系统状态与业务模块',
    users: '注册账号与用户信息',
    orders: '订单查询、发货与完成处理',
    redis: '缓存服务配置与集成状态',
    settings: '管理控制台参数'
  }
  return subtitles[activeMenu.value]
})

const adminInitial = computed(() => userStore.userName.slice(0, 1).toUpperCase())

const filteredUsers = computed(() => {
  const keyword = userSearch.value.trim().toLowerCase()
  if (!keyword) return users.value

  return users.value.filter((user) => {
    return user.username.toLowerCase().includes(keyword)
      || String(user.phone || '').includes(keyword)
  })
})

const loadSettings = () => {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    Object.assign(settings, {
      ...defaultSettings,
      ...savedSettings
    })
  } catch {
    Object.assign(settings, defaultSettings)
  }
}

const handleMenuSelect = (section) => {
  if (!validSections.includes(section)) return
  activeMenu.value = section
  const query = { ...route.query }
  if (section === 'dashboard') {
    delete query.section
  } else {
    query.section = section
  }
  router.replace({ path: '/admin', query })

  if (section === 'users' && users.value.length === 0) {
    loadUsers()
  }

  if (section === 'orders' && orderList.value.length === 0) {
    loadOrders()
  }

  if (section === 'redis' && !redisState.connected && !redisChecking.value) {
    checkRedisIntegration()
  }
}

const checkHealth = async () => {
  if (healthLoading.value) return

  healthLoading.value = true
  healthStatus.state = 'checking'
  const startTime = performance.now()

  try {
    const response = await api.get('/admin/overview', {
      showLoading: false,
      timeout: 5000
    })
    const payload = response.data ?? response

    if (payload.status !== 'ok') {
      throw new Error(payload.message || '服务状态异常')
    }

    healthStatus.state = 'online'
    healthStatus.latency = Math.max(1, Math.round(performance.now() - startTime))
    healthStatus.message = '管理接口运行正常'
    healthStatus.database = payload.database
    healthStatus.totalUsers = payload.totalUsers
    healthStatus.totalProducts = payload.totalProducts ?? healthStatus.totalProducts
    healthStatus.totalOrders = payload.totalOrders ?? healthStatus.totalOrders
    healthStatus.totalSales = payload.totalSales ?? healthStatus.totalSales
    healthStatus.pendingShipCount = payload.pendingShipCount ?? healthStatus.pendingShipCount
    healthStatus.shippingCount = payload.shippingCount ?? healthStatus.shippingCount
    healthStatus.uptimeSeconds = payload.uptimeSeconds
    checkRedisIntegration(true)
  } catch (error) {
    healthStatus.state = 'offline'
    healthStatus.latency = null
    healthStatus.message = error.message || '无法连接后端服务'
    healthStatus.database = 'unknown'
  } finally {
    healthStatus.lastChecked = new Date().toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    healthLoading.value = false
  }
}

const loadUsers = async () => {
  if (usersLoading.value) return

  usersLoading.value = true
  try {
    const response = await api.get('/admin/users', {
      showLoading: false
    })
    users.value = Array.isArray(response.data) ? response.data : []
  } catch {
    users.value = []
  } finally {
    usersLoading.value = false
  }
}

const formatDate = (dateValue) => {
  if (!dateValue) return '--'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const orderTagType = (status) => {
  const typeMap = {
    已下单: 'info',
    已付款: 'warning',
    已发货: 'primary',
    已完成: 'success',
    已取消: 'info'
  }
  return typeMap[status] || 'info'
}

const loadOrders = async () => {
  if (ordersLoading.value) return

  ordersLoading.value = true
  try {
    const result = await adminApi.getOrders({
      status: orderStatusFilter.value || undefined,
      keyword: orderKeyword.value.trim() || undefined,
      page: orderPagination.page,
      pageSize: orderPagination.pageSize
    })
    orderList.value = result.list
    orderStats.value = result.stats
    orderPagination.total = result.pagination.total
    orderPagination.totalPages = result.pagination.totalPages
  } catch {
    orderList.value = []
    orderStats.value = []
  } finally {
    ordersLoading.value = false
  }
}

const handleOrderFilterChange = () => {
  orderPagination.page = 1
  loadOrders()
}

const handleOrderPageChange = (page) => {
  orderPagination.page = page
  loadOrders()
}

const handleShipOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认对订单 ${order.order_no} 执行发货吗？`,
      '订单发货',
      { confirmButtonText: '确认发货', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  try {
    await adminApi.updateOrderStatus(order.id, '已发货')
    ElMessage.success('发货成功')
    loadOrders()
    checkHealth()
  } catch {
  }
}

const handleCompleteOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认订单 ${order.order_no} 已完成吗？`,
      '完成订单',
      { confirmButtonText: '确认完成', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  try {
    await adminApi.updateOrderStatus(order.id, '已完成')
    ElMessage.success('订单已完成')
    loadOrders()
    checkHealth()
  } catch {
  }
}

const checkRedisIntegration = async (silent = false) => {
  if (redisChecking.value) return

  redisChecking.value = true
  try {
    const info = await redisService.ping()
    redisState.connected = true
    redisState.info = info
    redisProbeMessage.value = `连接正常（PONG，${info.latencyMs}ms，${info.version}）`
    if (!silent) ElMessage.success('Redis 连接正常')
  } catch {
    redisState.connected = false
    redisState.info = {}
    redisProbeMessage.value = '连接失败，请检查 Redis 服务是否启动'
  } finally {
    redisChecking.value = false
  }
}

const runRedisCommand = async () => {
  if (redisForm.running) return

  const key = redisForm.key.trim()
  const { command } = redisForm
  if (command !== 'KEYS' && !key) {
    ElMessage.warning('请输入键名')
    return
  }
  if (command === 'SET' && !redisForm.value) {
    ElMessage.warning('请输入缓存内容')
    return
  }

  let args = []
  if (command === 'SET') args = [key, redisForm.value]
  else if (command === 'EXPIRE') args = [key, redisForm.seconds]
  else if (command === 'KEYS') args = [redisForm.pattern.trim() || '*']
  else args = [key]

  redisForm.running = true
  try {
    const result = await redisService.executeCommand(command, args)
    const display = result === null ? '(nil) 键不存在'
      : Array.isArray(result) ? result.length ? result.join('\n') : '(empty list)'
      : String(result)
    redisForm.result = `${command} ${args.join(' ')}\n> ${display}`
    checkRedisIntegration()
  } catch {
    redisForm.result = `${command} 执行失败`
  } finally {
    redisForm.running = false
  }
}

const openModule = (module) => {
  if (module.section) {
    handleMenuSelect(module.section)
    return
  }
  router.push(module.target)
}

const goToStorefront = () => {
  router.push('/')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定退出管理控制台吗？', '退出登录', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.replace('/login')
  } catch {
  }
}

const saveSettings = () => {
  const systemName = settings.systemName.trim()
  const redisHost = settings.redisHost.trim()

  if (!systemName || !redisHost) {
    ElMessage.warning('控制台名称和 Redis 主机不能为空')
    return
  }

  settings.systemName = systemName
  settings.redisHost = redisHost
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings }))
  ElMessage.success('设置已保存')
}

const resetSettings = async () => {
  try {
    await ElMessageBox.confirm('确定恢复默认设置吗？', '恢复默认', {
      confirmButtonText: '恢复',
      cancelButtonText: '取消',
      type: 'warning'
    })
    Object.assign(settings, defaultSettings)
    localStorage.removeItem(SETTINGS_KEY)
    ElMessage.success('已恢复默认设置')
  } catch {
  }
}

watch(
  () => route.query.section,
  (section) => {
    activeMenu.value = validSections.includes(section) ? section : 'dashboard'
    if (activeMenu.value === 'users' && users.value.length === 0) {
      loadUsers()
    }
    if (activeMenu.value === 'orders' && orderList.value.length === 0) {
      loadOrders()
    }
    if (activeMenu.value === 'redis' && !redisState.connected) {
      checkRedisIntegration()
    }
  }
)

onMounted(() => {
  loadSettings()
  checkHealth()
  if (activeMenu.value === 'users') {
    loadUsers()
  }
  if (activeMenu.value === 'orders') {
    loadOrders()
  }
  if (activeMenu.value === 'redis') {
    checkRedisIntegration()
  }
})
</script>

<style scoped>
.admin-shell {
  --admin-sidebar: #182230;
  --admin-sidebar-muted: #9aa7b6;
  --admin-accent: #e8590c;
  --admin-blue: #2563eb;
  --admin-green: #16803c;
  --admin-teal: #0f766e;
  --admin-border: #dfe4ea;
  --admin-text: #1c2530;
  --admin-muted: #667085;
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr);
  min-height: 100vh;
  background: #f4f6f8;
  color: var(--admin-text);
  transition: grid-template-columns 0.2s ease;
}

.admin-shell.sidebar-collapsed {
  grid-template-columns: 72px minmax(0, 1fr);
}

.admin-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--admin-sidebar);
  border-right: 1px solid #2b3748;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 72px;
  padding: 0 18px;
  border-bottom: 1px solid #2b3748;
}

.brand-mark {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 8px;
  background: var(--admin-accent);
  color: #fff;
  font-size: 19px;
  font-weight: 800;
}

.brand-copy,
.operator-copy {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.brand-copy strong,
.operator-copy strong {
  display: block;
  overflow: hidden;
  color: #fff;
  font-size: 14px;
  text-overflow: ellipsis;
}

.brand-copy span,
.operator-copy span {
  display: block;
  color: var(--admin-sidebar-muted);
  font-size: 10px;
}

.admin-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 16px 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #bdc6d1;
  font-size: 14px;
  text-align: left;
}

.nav-item:hover {
  background: #243246;
  color: #fff;
}

.nav-item.active {
  background: #303e52;
  color: #fff;
  box-shadow: inset 3px 0 0 var(--admin-accent);
}

.nav-item .el-icon {
  flex: 0 0 20px;
  font-size: 19px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 72px;
  padding: 14px 17px;
  border-top: 1px solid #2b3748;
}

.operator-avatar {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid #536174;
  border-radius: 50%;
  background: #263449;
  color: #fff;
  font-weight: 700;
}

.sidebar-collapsed .brand {
  justify-content: center;
  padding: 0;
}

.sidebar-collapsed .brand-copy,
.sidebar-collapsed .nav-item span,
.sidebar-collapsed .operator-copy {
  display: none;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 0;
}

.sidebar-collapsed .sidebar-footer {
  justify-content: center;
  padding: 14px 0;
}

.admin-workspace {
  min-width: 0;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 28px;
  border-bottom: 1px solid var(--admin-border);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
}

.header-leading,
.header-actions {
  display: flex;
  align-items: center;
}

.header-leading {
  gap: 14px;
}

.header-actions {
  gap: 10px;
}

.header-copy h1 {
  margin: 0;
  color: var(--admin-text);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}

.header-copy span {
  display: block;
  margin-top: 2px;
  color: var(--admin-muted);
  font-size: 12px;
}

.icon-button {
  color: #475467;
}

.logout-button {
  color: #b42318;
}

.admin-main {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 24px 28px 40px;
}

.page-section {
  width: 100%;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  min-height: 116px;
  padding: 20px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.metric-icon {
  display: grid;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  font-size: 22px;
}

.tone-green {
  background: #ecfdf3;
  color: var(--admin-green);
}

.tone-blue {
  background: #eff6ff;
  color: var(--admin-blue);
}

.tone-orange {
  background: #fff4ed;
  color: var(--admin-accent);
}

.tone-teal {
  background: #f0fdfa;
  color: var(--admin-teal);
}

.metric-content {
  min-width: 0;
}

.metric-content span,
.metric-content small {
  display: block;
  overflow: hidden;
  color: var(--admin-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-content strong {
  display: block;
  overflow: hidden;
  margin: 4px 0 3px;
  color: var(--admin-text);
  font-size: 23px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.8fr);
  gap: 18px;
  margin-bottom: 18px;
}

.surface {
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.surface-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 68px;
  padding: 14px 20px;
  border-bottom: 1px solid #edf0f3;
}

.surface-header h2 {
  margin: 0;
  color: var(--admin-text);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
}

.surface-header p {
  margin: 3px 0 0;
  color: var(--admin-muted);
  font-size: 12px;
}

.status-list {
  padding: 2px 20px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 74px;
  border-bottom: 1px solid #edf0f3;
}

.status-row:last-child {
  border-bottom: 0;
}

.status-name {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.status-name div,
.status-value {
  min-width: 0;
}

.status-name strong,
.status-name small,
.status-value strong,
.status-value span {
  display: block;
}

.status-name strong,
.status-value strong {
  color: #344054;
  font-size: 13px;
}

.status-name small,
.status-value span {
  overflow: hidden;
  color: var(--admin-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-value {
  flex: 0 0 138px;
  text-align: right;
}

.status-dot {
  flex: 0 0 9px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #98a2b3;
  box-shadow: 0 0 0 4px #f2f4f7;
}

.status-dot.online {
  background: #12b76a;
  box-shadow: 0 0 0 4px #ecfdf3;
}

.status-dot.offline {
  background: #f04438;
  box-shadow: 0 0 0 4px #fef3f2;
}

.status-dot.checking,
.status-dot.reserved {
  background: #f79009;
  box-shadow: 0 0 0 4px #fffaeb;
}

.quick-list {
  padding: 8px;
}

.quick-list button {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 58px;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  background: #fff;
  color: #475467;
  text-align: left;
}

.quick-list button:hover {
  background: #f7f8fa;
  color: var(--admin-blue);
}

.quick-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--admin-border);
  border-radius: 7px;
  background: #fff;
  color: #475467;
  font-size: 17px;
}

.quick-list strong,
.quick-list small {
  display: block;
}

.quick-list strong {
  color: #344054;
  font-size: 13px;
}

.quick-list small {
  color: var(--admin-muted);
  font-size: 11px;
}

.module-surface {
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.module-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
}

.module-table th,
.module-table td {
  height: 54px;
  padding: 0 20px;
  border-bottom: 1px solid #edf0f3;
  color: #475467;
  font-size: 13px;
  text-align: left;
}

.module-table th {
  height: 42px;
  background: #f8f9fb;
  color: #667085;
  font-size: 12px;
  font-weight: 600;
}

.module-table tbody tr:last-child td {
  border-bottom: 0;
}

.module-table tbody tr:hover {
  background: #fafbfc;
}

.module-name {
  display: flex;
  align-items: center;
  gap: 9px;
}

.module-name .el-icon {
  color: #667085;
  font-size: 17px;
}

.module-name strong {
  color: #344054;
  font-size: 13px;
}

.users-surface {
  overflow: hidden;
}

.user-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-tools :deep(.el-input) {
  width: 240px;
}

.users-surface :deep(.el-table) {
  --el-table-border-color: #edf0f3;
  --el-table-header-bg-color: #f8f9fb;
  --el-table-row-hover-bg-color: #fafbfc;
  color: #475467;
}

.users-surface :deep(.el-table th.el-table__cell) {
  color: #667085;
  font-size: 12px;
  font-weight: 600;
}

.users-surface :deep(.el-table td.el-table__cell) {
  height: 58px;
  font-size: 13px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-cell strong {
  color: #344054;
  font-size: 13px;
}

.table-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  background: #eff6ff;
  color: var(--admin-blue);
  font-size: 12px;
  font-weight: 700;
}

.table-footer {
  padding: 12px 20px;
  border-top: 1px solid #edf0f3;
  color: var(--admin-muted);
  font-size: 12px;
  text-align: right;
}

.orders-surface {
  overflow: hidden;
}

.order-stat-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid #edf0f3;
}

.orders-surface :deep(.el-table) {
  --el-table-border-color: #edf0f3;
  --el-table-header-bg-color: #f8f9fb;
  --el-table-row-hover-bg-color: #fafbfc;
  color: #475467;
}

.orders-surface :deep(.el-table th.el-table__cell) {
  color: #667085;
  font-size: 12px;
  font-weight: 600;
}

.orders-surface :deep(.el-table td.el-table__cell) {
  height: 58px;
  font-size: 13px;
}

.order-items-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-item-line {
  color: #475467;
  font-size: 13px;
  line-height: 1.5;
}

.order-action-muted {
  color: #98a2b3;
  font-size: 13px;
}

.order-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 14px 20px;
  border-top: 1px solid #edf0f3;
}

.redis-summary,
.command-surface,
.settings-surface {
  overflow: hidden;
}

.redis-summary :deep(.el-alert) {
  width: auto;
  margin: 20px;
  border-radius: 6px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid #edf0f3;
  border-bottom: 1px solid #edf0f3;
}

.config-item {
  min-width: 0;
  padding: 18px 20px;
  border-right: 1px solid #edf0f3;
}

.config-item:last-child {
  border-right: 0;
}

.config-item span,
.config-item strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-item span {
  color: var(--admin-muted);
  font-size: 12px;
}

.config-item strong {
  margin-top: 6px;
  color: #344054;
  font-size: 15px;
}

.probe-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}

.probe-bar strong,
.probe-bar span {
  display: block;
}

.probe-bar strong {
  color: #344054;
  font-size: 13px;
}

.probe-bar span {
  margin-top: 3px;
  color: var(--admin-muted);
  font-size: 12px;
}

.command-surface {
  margin-top: 18px;
}

.command-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.command-item {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 66px;
  padding: 12px 20px;
  border-right: 1px solid #edf0f3;
  border-bottom: 1px solid #edf0f3;
}

.command-item:nth-child(2n) {
  border-right: 0;
}

.command-item:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.command-item code {
  color: #344054;
  font-size: 12px;
  font-weight: 700;
}

.command-item span {
  color: var(--admin-muted);
  font-size: 12px;
}

.probe-success {
  color: #16803c !important;
}

.redis-console {
  margin-top: 18px;
}

.redis-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-top: 1px solid #edf0f3;
}

.redis-result {
  padding: 14px 20px 18px;
  border-top: 1px solid #edf0f3;
}

.redis-result .result-label {
  display: block;
  margin-bottom: 8px;
  color: #344054;
  font-size: 13px;
  font-weight: 600;
}

.redis-result pre {
  margin: 0;
  padding: 12px 14px;
  background: #101828;
  color: #d1fadf;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 220px;
  overflow: auto;
}

.settings-form {
  padding: 22px 20px 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 24px;
}

.settings-form :deep(.el-form-item__label) {
  color: #475467;
  font-size: 13px;
  font-weight: 600;
}

.settings-form :deep(.el-input-number) {
  width: 100%;
}

.switch-field {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 32px;
  color: var(--admin-muted);
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #edf0f3;
}

.settings-form :deep(.el-button--primary) {
  border-color: var(--admin-blue);
  background: var(--admin-blue);
}

.admin-fade-enter-active,
.admin-fade-leave-active {
  transition: opacity 0.16s ease;
}

.admin-fade-enter-from,
.admin-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1100px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .admin-shell {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .brand {
    justify-content: center;
    padding: 0;
  }

  .brand-copy,
  .nav-item span,
  .operator-copy {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 0;
  }

  .sidebar-footer {
    justify-content: center;
    padding: 14px 0;
  }

  .collapse-button {
    display: none;
  }

  .admin-header {
    padding: 0 18px;
  }

  .admin-main {
    padding: 18px;
  }

  .config-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .config-item:nth-child(2) {
    border-right: 0;
  }

  .config-item:nth-child(-n + 2) {
    border-bottom: 1px solid #edf0f3;
  }

  .command-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .users-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .user-tools,
  .user-tools :deep(.el-input) {
    width: 100%;
  }

  .command-item,
  .command-item:nth-child(2n) {
    border-right: 0;
    border-bottom: 1px solid #edf0f3;
  }

  .command-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 600px) {
  .admin-shell,
  .admin-shell.sidebar-collapsed {
    display: block;
  }

  .admin-sidebar {
    position: sticky;
    z-index: 30;
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr);
    width: 100%;
    height: 58px;
    border-right: 0;
    border-bottom: 1px solid #2b3748;
  }

  .brand {
    width: 58px;
    height: 58px;
    border-bottom: 0;
    border-right: 1px solid #2b3748;
  }

  .brand-mark {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    font-size: 17px;
  }

  .admin-nav {
    flex-direction: row;
    gap: 5px;
    padding: 7px;
  }

  .nav-item {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
  }

  .nav-item.active {
    box-shadow: inset 0 -3px 0 var(--admin-accent);
  }

  .sidebar-footer {
    display: none;
  }

  .admin-header {
    height: 64px;
    padding: 0 14px;
  }

  .header-copy span,
  .header-actions .el-button span {
    display: none;
  }

  .header-actions :deep(.el-button) {
    width: 32px;
    padding: 8px;
  }

  .admin-main {
    padding: 14px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .metric-card {
    min-height: 92px;
    padding: 16px;
  }

  .surface-header {
    padding: 12px 14px;
  }

  .status-list {
    padding: 0 14px;
  }

  .status-value {
    flex-basis: 96px;
  }

  .status-name small {
    max-width: 180px;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-item,
  .config-item:nth-child(2) {
    border-right: 0;
    border-bottom: 1px solid #edf0f3;
  }

  .config-item:last-child {
    border-bottom: 0;
  }

  .probe-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .command-item {
    grid-template-columns: 94px minmax(0, 1fr);
  }

  .command-item .el-tag {
    grid-column: 2;
    justify-self: start;
  }

  .settings-form {
    padding: 18px 14px 14px;
  }

  .user-tools :deep(.el-input) {
    min-width: 0;
  }
}
</style>
