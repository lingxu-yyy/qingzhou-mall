<template>
  <div class="myfooter">
    <div class="footer-container">
      <p>© {{ year }} ECShop在线商城 - 毕业设计</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
const year = ref(new Date().getFullYear())
</script>

<style scoped>
.myfooter {
  color: #ccc;
  padding: 0;
  text-align: center;
  line-height: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-container p {
  margin: 0;
  font-size: 13px;
}
</style>
