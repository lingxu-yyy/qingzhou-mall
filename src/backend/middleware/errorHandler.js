import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // 优先使用业务异常自带的 statusCode，其次看 res.statusCode，最后降级为 500
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  const errorResponse = {
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === 'production' ? '服务器错误' : err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  logger.error(`[${req.method}] ${req.path} - ${statusCode} - ${err.message}`, {
    stack: err.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;