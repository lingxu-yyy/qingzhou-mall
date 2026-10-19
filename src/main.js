import './assets/common.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import VueLazyload from 'vue3-lazyload';
import { setRouterInstance } from './utils/routerHelper';

import App from './App.vue';
import router from './router';

const app = createApp(App);

setRouterInstance(router);  // 设置 router 实例

app.use(createPinia());
app.use(router);
app.use(ElementPlus);
app.use(VueLazyload, {
  loading: '',
  error: '',
  observer: true
});

app.mount('#app');