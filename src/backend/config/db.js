import mysql from 'mysql2';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'qingzhou_mall',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000
});

pool.getConnection((err, connection) => {
  if (err) {
    logger.error(`数据库连接失败: ${err.message}`);
    process.exit(1);
    return;
  }
  logger.info('数据库连接成功!');
  connection.release();
});

pool.on('connection', (connection) => {
  logger.debug(`新建数据库连接: ${connection.threadId}`);
  
  connection.on('error', (err) => {
    logger.error(`连接 ${connection.threadId} 出错: ${err.message}`);
  });
  
  connection.on('close', (err) => {
    if (err) {
      logger.warn(`连接 ${connection.threadId} 异常关闭: ${err.message}`);
    } else {
      logger.debug(`连接 ${connection.threadId} 正常关闭`);
    }
  });
});

export default pool.promise();