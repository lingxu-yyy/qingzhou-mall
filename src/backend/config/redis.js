import { createClient } from 'redis';
import logger from '../utils/logger.js';

const client = createClient({
  // 强制使用 RESP2 协议：node_redis v6 默认 RESP3（连接时发送 HELLO 3），
  // 而 RESP3/HELLO 命令需要 Redis 6.0+，本机为 Redis 5.0.10，故指定 RESP2 以保证兼容
  RESP: 2,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 200, 2000)
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB) || 0
});

client.on('error', (err) => {
  logger.error(`Redis 错误: ${err.message}`);
});

client.on('connect', () => {
  logger.info('Redis 连接成功');
});

// 并发连接请求合并到同一个 Promise，避免多次调用 client.connect()
let connectingPromise = null;

export const ensureRedisConnected = async () => {
  if (client.isOpen) return client;
  if (connectingPromise) return connectingPromise;
  connectingPromise = (async () => {
    try {
      await client.connect();
      return client;
    } finally {
      connectingPromise = null;
    }
  })();
  return connectingPromise;
};

export const isRedisReady = () => client.isReady;

export default client;
