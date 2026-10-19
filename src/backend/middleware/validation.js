import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('用户名至少需要3个字符'),
  
  body('phone')
    .isMobilePhone('zh-CN')
    .withMessage('请输入正确的手机号码'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('密码至少需要8个字符')
    .matches(/(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }
    next();
  }
];

export const validateLogin = [
  body('username')
    .notEmpty().withMessage('请输入用户名')
    .isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50个字符之间'),
  body('password')
    .notEmpty().withMessage('请输入密码')
    .isLength({ min: 8, max: 72 }).withMessage('密码长度必须在8-72个字符之间'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }
    next();
  }
];