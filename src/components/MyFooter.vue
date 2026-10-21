<template>
  <div class="myfooter">
    <div class="footer-container">
      <div class="footer-columns">
        <div class="footer-col">
          <h4>关于轻舟</h4>
          <ul>
            <li>品牌介绍</li>
            <li>加入我们</li>
            <li>媒体报道</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>购物指南</h4>
          <ul>
            <li>购物流程</li>
            <li>会员介绍</li>
            <li>常见问题</li>
            <li>联系客服</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>售后服务</h4>
          <ul>
            <li>退换货政策</li>
            <li>退换货流程</li>
            <li>价格保护</li>
            <li>退款说明</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>联系我们</h4>
          <ul>
            <li>客服热线：400-000-0000</li>
            <li>服务时间：9:00 - 18:00</li>
            <li>邮箱：service@qingzhou-mall.com</li>
          </ul>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <p>© {{ year }} 轻舟商城 · 前后端分离全栈实践项目</p>
        <p class="beian">京ICP备XXXXXXXX号-1（备案占位）</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
const year = ref(new Date().getFullYear())
</script>

<style scoped>
.myfooter {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.footer-col h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 14px;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-col li {
  font-size: 13px;
  line-height: 24px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.footer-divider {
  height: 1px;
  background: var(--border-color);
  margin: 28px 0 20px;
}

.footer-bottom {
  text-align: center;
}

.footer-bottom p {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.footer-bottom .beian {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .footer-container {
    padding: 28px 20px;
  }

  .footer-columns {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
</style>
