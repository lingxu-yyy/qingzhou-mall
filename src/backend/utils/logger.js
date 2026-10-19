import winston from 'winston';
import { mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// 以 backend 目录为基准定位 logs 目录，避免受启动时 cwd 影响
const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = resolve(__dirname, '../../logs');

try {
  mkdirSync(LOG_DIR, { recursive: true });
} catch (err) {
  // 目录创建失败时降级到只输出控制台，避免影响服务启动
  console.error(`创建日志目录失败: ${err.message}`);
}

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: join(LOG_DIR, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: join(LOG_DIR, 'combined.log') })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
