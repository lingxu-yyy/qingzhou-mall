import Address from '../models/Address.js';
import logger from '../utils/logger.js';

const PHONE_RE = /^1[3-9]\d{9}$/;

// 校验收货地址表单，返回错误信息或 null
const validatePayload = (body) => {
  const { receiverName, phone, detail } = body;
  if (!receiverName || !String(receiverName).trim()) return '请填写收货人姓名';
  if (!phone || !PHONE_RE.test(phone)) return '请输入正确的收货人手机号';
  if (!detail || !String(detail).trim()) return '请填写详细收货地址';
  return null;
};

const list = async (req, res) => {
  try {
    const data = await Address.list(req.user.userId);
    res.json({ success: true, data });
  } catch (error) {
    logger.error(`获取收货地址失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取收货地址失败' });
  }
};

const create = async (req, res) => {
  try {
    const error = validatePayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const { receiverName, phone, region, detail, isDefault } = req.body;
    const addr = await Address.create(req.user.userId, {
      receiverName: String(receiverName).trim(),
      phone,
      region: region ? String(region).trim() : null,
      detail: String(detail).trim(),
      isDefault: !!isDefault
    });
    res.status(201).json({ success: true, message: '收货地址已添加', data: addr });
  } catch (e) {
    logger.error(`新增收货地址失败: ${e.message}`);
    res.status(500).json({ success: false, message: '新增收货地址失败' });
  }
};

const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: '地址ID不合法' });
    const error = validatePayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const { receiverName, phone, region, detail, isDefault } = req.body;
    const addr = await Address.update(id, req.user.userId, {
      receiverName: String(receiverName).trim(),
      phone,
      region: region ? String(region).trim() : null,
      detail: String(detail).trim(),
      isDefault
    });
    if (!addr) return res.status(404).json({ success: false, message: '收货地址不存在' });
    res.json({ success: true, message: '收货地址已更新', data: addr });
  } catch (e) {
    logger.error(`更新收货地址失败: ${e.message}`);
    res.status(500).json({ success: false, message: '更新收货地址失败' });
  }
};

const setDefault = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: '地址ID不合法' });
    const addr = await Address.setDefault(id, req.user.userId);
    if (!addr) return res.status(404).json({ success: false, message: '收货地址不存在' });
    res.json({ success: true, message: '默认地址已设置', data: addr });
  } catch (e) {
    logger.error(`设置默认地址失败: ${e.message}`);
    res.status(500).json({ success: false, message: '设置默认地址失败' });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: '地址ID不合法' });
    const ok = await Address.remove(id, req.user.userId);
    if (!ok) return res.status(404).json({ success: false, message: '收货地址不存在' });
    res.json({ success: true, message: '收货地址已删除' });
  } catch (e) {
    logger.error(`删除收货地址失败: ${e.message}`);
    res.status(500).json({ success: false, message: '删除收货地址失败' });
  }
};

export default { list, create, update, setDefault, remove };
