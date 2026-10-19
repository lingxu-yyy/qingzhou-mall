import api from '../api/request.js'

// 前端不直连 Redis，仅展示连接信息与调用后端管理接口；密码等敏感信息不应出现在前端配置
export const redisConfig = {
  host: import.meta.env.VITE_REDIS_HOST || 'localhost',
  port: import.meta.env.VITE_REDIS_PORT || 6379,
  db: import.meta.env.VITE_REDIS_DB || 0,
  connectTimeout: 10000
}

export function getRedisConfig() {
  return {
    ...redisConfig,
    url: `redis://${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`
  }
}

export class RedisService {
  async ping() {
    const res = await api.get('/admin/redis/ping')
    return res.data
  }

  async executeCommand(command, args = []) {
    const res = await api.post('/admin/redis/command', { command, args })
    return res.data.result
  }

  get(key) {
    return this.executeCommand('GET', [key])
  }

  set(key, value) {
    return this.executeCommand('SET', [key, value])
  }

  del(key) {
    return this.executeCommand('DEL', [key])
  }

  exists(key) {
    return this.executeCommand('EXISTS', [key])
  }

  expire(key, seconds) {
    return this.executeCommand('EXPIRE', [key, seconds])
  }

  keys(pattern = '*') {
    return this.executeCommand('KEYS', [pattern])
  }
}

export const redisService = new RedisService()
