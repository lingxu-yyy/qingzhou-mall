const isDev = import.meta.env.DEV;

const formatTime = () => {
  const now = new Date();
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const logTypes = {
  INFO: { color: '#009688', label: 'INFO' },
  WARN: { color: '#ff9800', label: 'WARN' },
  ERROR: { color: '#f44336', label: 'ERROR' },
  DEBUG: { color: '#2196f3', label: 'DEBUG' },
  SUCCESS: { color: '#4caf50', label: 'SUCCESS' },
  ROUTE: { color: '#9c27b0', label: 'ROUTE' },
  API: { color: '#03a9f4', label: 'API' }
};

const log = (type, title, data = null) => {
  if (!isDev) return;

  const { color, label } = logTypes[type] || logTypes.INFO;
  const time = formatTime();
  
  console.group(`%c[${label}] ${title}`, `color: ${color}; font-weight: bold;`);
  console.log(`%c时间: ${time}`, 'color: #666; font-size: 12px;');
  
  if (data !== null) {
    if (typeof data === 'object') {
      console.log('%c详细信息:', 'color: #888;');
      console.dir(data, { depth: null });
    } else {
      console.log(`%c${data}`, 'color: #555;');
    }
  }
  
  console.groupEnd();
};

export const logger = {
  info: (title, data) => log('INFO', title, data),
  warn: (title, data) => log('WARN', title, data),
  error: (title, data) => log('ERROR', title, data),
  debug: (title, data) => log('DEBUG', title, data),
  success: (title, data) => log('SUCCESS', title, data),
  route: (title, data) => log('ROUTE', title, data),
  api: (title, data) => log('API', title, data)
};

export default logger;