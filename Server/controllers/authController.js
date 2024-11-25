const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validateUsername, validatePassword } = require('../utils/validator');
const { cache, deleteCache } = require('../utils/cache');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!validateUsername(username) || !validatePassword(password)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: '用户名或密码格式无效'
        }
      });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }

    // 生成token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

exports.logout = async (req, res) => {
  // 由于使用JWT，服务器端不需要处理登出
  res.json({ message: 'Successfully logged out' });
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}`;

    // 尝试从缓存获取
    const cachedUser = cache.get(cacheKey);
    if (cachedUser) {
      return res.json(cachedUser);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在'
        }
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      balance: user.balance
    };

    // 设置缓存
    cache.set(cacheKey, userData, 300); // 缓存5分钟

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!validateUsername(username) || !validatePassword(password)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: '用户名或密码格式无效'
        }
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'USERNAME_TAKEN',
          message: '用户名已被使用'
        }
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      password
    });

    res.json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '服务器内部错误'
      }
    });
  }
}; 