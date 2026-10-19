import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import { navigateTo } from '../utils/routerHelper';
import { logger } from '../utils/logger';

let loadingInstance = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const showLoading = () => {
  if (!loadingInstance) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.5)'
    });
  }
};

const hideLoading = () => {
  if (loadingInstance) {
    loadingInstance.close();
    loadingInstance = null;
  }
};

api.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    config._startTime = startTime;

    if (config.showLoading !== false) {
      showLoading();
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    logger.api('请求开始', {
      url: config.url,
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      params: config.params || {},
      data: config.data ? (typeof config.data === 'string' ? config.data : JSON.stringify(config.data)) : undefined,
      headers: Object.fromEntries(Object.entries(config.headers || {}).filter(([k]) => !k.toLowerCase().includes('authorization'))),
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
    
    return config;
  },
  (error) => {
    hideLoading();
    logger.error('请求异常', {
      error: error.message,
      config: error.config?.url,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

const errorMessages = {
  400: '请求参数错误',
  401: '请先登录',
  403: '权限不足',
  404: '请求资源不存在',
  429: '请求过于频繁，请稍后重试',
  500: '服务器错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
};

api.interceptors.response.use(
  (response) => {
    hideLoading();
    
    const duration = Date.now() - (response.config._startTime || Date.now());
    
    logger.api('请求成功', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    const { data } = response;

    // 统一返回 response.data，使调用方拿到的结构一致（后端响应均包含 success 字段）
    return data;
  },
  (error) => {
    hideLoading();
    
    const duration = Date.now() - (error.config?._startTime || Date.now());
    
    const { response, message } = error;
    
    if (response) {
      const { status, data } = response;
      const errorMsg = data?.message || errorMessages[status] || '请求失败';
      
      logger.error('请求失败', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: status,
        duration: `${duration}ms`,
        error: errorMsg,
        responseData: data,
        timestamp: new Date().toISOString()
      });
      
      if (status === 401) {
        logger.warn('Token失效', {
          action: '清除用户信息并跳转登录页',
          timestamp: new Date().toISOString()
        });
        // 通过 Pinia store 统一登出，确保响应式状态与 localStorage 同步清理
        // 动态加载 user store，避免 request 与 stores/user 之间的循环依赖
        import('../stores/user')
          .then(({ useUserStore }) => useUserStore().logout())
          .catch(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          });
        sessionStorage.setItem('redirectUrl', window.location.pathname);
        setTimeout(() => {
          navigateTo('/login');
        }, 1000);
      }

      if (status !== 401 || import.meta.env.DEV) {
        ElMessage.error(errorMsg);
      }
    } else if (message?.includes('timeout')) {
      logger.error('请求超时', {
        url: error.config?.url,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      ElMessage.error('请求超时，请稍后重试');
    } else if (message?.includes('Network Error')) {
      logger.error('网络错误', {
        url: error.config?.url,
        error: message,
        timestamp: new Date().toISOString()
      });
      ElMessage.error('网络连接失败，请检查网络');
    } else {
      logger.error('未知错误', {
        url: error.config?.url,
        error: message,
        timestamp: new Date().toISOString()
      });
      ElMessage.error(message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

export const get = (url, params = {}, config = {}) => {
  return api.get(url, { params, ...config });
};

export const post = (url, data = {}, config = {}) => {
  return api.post(url, data, config);
};

export const put = (url, data = {}, config = {}) => {
  return api.put(url, data, config);
};

export const del = (url, config = {}) => {
  return api.delete(url, config);
};

export default api;
