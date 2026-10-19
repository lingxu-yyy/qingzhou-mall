import client, { ensureRedisConnected } from '../config/redis.js';

const parseInfo = (raw) => {
  const pick = (key) => {
    const match = raw.match(new RegExp(`^${key}:(.+)$`, 'm'));
    return match ? match[1].trim() : null;
  };
  const db0 = pick('db0');
  const db0Keys = db0 ? (db0.match(/keys=(\d+)/) || [])[1] : '0';
  return {
    version: pick('redis_version'),
    port: pick('tcp_port'),
    usedMemory: pick('used_memory_human'),
    connectedClients: pick('connected_clients'),
    uptimeDays: pick('uptime_in_days'),
    dbKeys: db0Keys ? parseInt(db0Keys) : 0
  };
};

export const pingRedis = async (req, res) => {
  const start = Date.now();
  try {
    await ensureRedisConnected();
    const pong = await client.ping();
    const latencyMs = Date.now() - start;
    const info = parseInfo(await client.info());
    const keyCount = await client.dbSize();

    res.json({
      success: true,
      message: 'Redis 连接正常',
      data: {
        connected: true,
        pong,
        latencyMs,
        version: info.version,
        port: info.port,
        usedMemory: info.usedMemory,
        connectedClients: info.connectedClients ? parseInt(info.connectedClients) : null,
        uptimeDays: info.uptimeDays ? parseInt(info.uptimeDays) : null,
        keyCount
      }
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      message: `Redis 连接失败：${err.message}`,
      data: { connected: false }
    });
  }
};

const KEY_PATTERN = /^[\w:.\-]{1,128}$/;
const GLOB_PATTERN = /^[\w:.*?\[\]\-]{1,128}$/;
const MAX_VALUE_LENGTH = 4096;

const validators = {
  GET: (args) => {
    if (args.length !== 1 || !KEY_PATTERN.test(args[0])) throw new Error('GET 需要 1 个合法的 key 参数');
    return () => client.get(args[0]);
  },
  SET: (args) => {
    if (args.length < 2 || !KEY_PATTERN.test(args[0])) throw new Error('SET 需要 key 和 value 两个参数');
    const value = String(args[1]);
    if (value.length > MAX_VALUE_LENGTH) throw new Error(`value 长度不能超过 ${MAX_VALUE_LENGTH} 个字符`);
    return () => client.set(args[0], value);
  },
  DEL: (args) => {
    if (args.length !== 1 || !KEY_PATTERN.test(args[0])) throw new Error('DEL 需要 1 个合法的 key 参数');
    return () => client.del(args[0]);
  },
  EXISTS: (args) => {
    if (args.length !== 1 || !KEY_PATTERN.test(args[0])) throw new Error('EXISTS 需要 1 个合法的 key 参数');
    return () => client.exists(args[0]);
  },
  EXPIRE: (args) => {
    const seconds = parseInt(args[1]);
    if (args.length !== 2 || !KEY_PATTERN.test(args[0]) || !Number.isInteger(seconds) || seconds < 1 || seconds > 2592000) {
      throw new Error('EXPIRE 需要 key 和 1~2592000 之间的秒数');
    }
    return () => client.expire(args[0], seconds);
  },
  KEYS: (args) => {
    const pattern = args[0] || '*';
    if (!GLOB_PATTERN.test(pattern)) throw new Error('KEYS 匹配模式包含非法字符');
    // 用 SCAN 替代 KEYS，避免阻塞 Redis；最多扫描 1000 个游标步以限制返回规模
    return async () => {
      const found = [];
      let cursor = '0';
      do {
        const reply = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = reply[0];
        found.push(...reply[1]);
        if (found.length >= 1000) break;
      } while (cursor !== '0');
      return found;
    };
  },
  PING: () => () => client.ping(),
  INFO: () => async () => parseInfo(await client.info())
};

export const executeRedisCommand = async (req, res) => {
  const { command, args = [] } = req.body || {};
  const upperCommand = String(command || '').toUpperCase();

  if (!validators[upperCommand]) {
    return res.status(400).json({
      success: false,
      message: `不支持的命令：${command}，允许 PING/INFO/GET/SET/DEL/EXISTS/EXPIRE/KEYS`
    });
  }

  if (!Array.isArray(args)) {
    return res.status(400).json({ success: false, message: 'args 必须是数组' });
  }

  let run;
  try {
    run = validators[upperCommand](args);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  try {
    await ensureRedisConnected();
    const result = await run();
    res.json({ success: true, message: '命令执行成功', data: { command: upperCommand, result } });
  } catch (err) {
    res.status(503).json({ success: false, message: `Redis 操作失败：${err.message}` });
  }
};
