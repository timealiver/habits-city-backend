const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { secret, SMS_MAIL, SMS_API } = require('../config/config.js');
const RefreshToken = require('../models/RefreshToken.js');
const AuthCode = require('../models/AuthCode.js');
const axios = require('axios');
const { SmsAero, SmsAeroError, SmsAeroHTTPError } = require('smsaero');

const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: '48h' });
};

const generateRefreshToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: '30d' });
};
const generateAuthCode = () => {
  const codeLength = 6;
  const possibleChars = '0123456789';
  let authCode = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * possibleChars.length);
    authCode += possibleChars.charAt(randomIndex);
  }

  return authCode;
};
async function sendSMSS(phone, code) {
  const client = new SmsAero(SMS_MAIL, SMS_API);
  try {
    const response = await client.send(
      phone,
      `Ваш код для входа в HabitsCity: ${code}. Не передавайте его третьим лицам!`,
    );
  } catch (error) {
    if (error instanceof SmsAeroError) {
      console.error('Не удалось из-за ошибки SmsAero:', error.message);
    } else if (error instanceof SmsAeroHTTPError) {
      console.error('Не удалось из-за HTTP ошибки:', error.message);
    } else {
      console.error('Произошла неизвестная ошибка:', error);
    }
  }
}
class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsObject = errors.array();
        return res.status(400).json({ message: errorsObject[0].msg });
      }
      const { username, password, phone } = req.body;

      const candidate = await User.findOne({
        $or: [{ username }, { phone: { $ne: null } }],
      });
      console.log(candidate);
      if (candidate) {
        let message = '';
        if (candidate.username === username) {
          message += 'Пользователь с таким именем уже существует';
        } else if (candidate.phone === phone) {
          message += 'Пользователь с таким номером телефона уже существует';
        }
        return res.status(400).json({ message: message });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: 'USER' });
      const user = new User({
        username,
        password: hashPassword,
        phone: phone,
        roles: [userRole.value],
      });
      await user.save();
      const AccessToken = generateAccessToken(user._id);
      const RefrToken = generateRefreshToken(user._id);

      const refToken = new RefreshToken({
        userId: user._id,
        token: RefrToken,
        createdAt: new Date(Date.now()),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await refToken.save();
      return res.status(200).json({
        message: 'Пользователь успешно зарегистрирован',
        AccessToken: AccessToken,
        RefreshToken: RefrToken,
      });
    } catch (e) {
      console.log(e);
      res.status(400).json(e);
    }
  }
  async login(req, res) {
    try {
      const { username, password, phone } = req.body;
      if (username != null) {
        const user = await User.findOne({ username });
        if (!user) {
          return res
            .status(400)
            .json({ message: `Пользователь ${username} не найден` });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: 'Введен неверный пароль' });
        }
        const AccToken = generateAccessToken(user._id);
        const RefrToken = generateRefreshToken(user._id);
        await RefreshToken.deleteMany({
          userId: user._id,
        });
        const refToken = new RefreshToken({
          userId: user._id,
          token: RefrToken,
          createdAt: new Date(Date.now()),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        await refToken.save();
        return res.json({ AccessToken: AccToken, RefreshToken: RefrToken });
      } else if (phone != null) {
        const user = await User.findOne({ phone });
        if (!user) {
          return res.status(400).json({ message: `Номер не зарегистрирован` });
        }
        await AuthCode.deleteMany({ userId: user._id });
        const code = generateAuthCode();
        const authCode = new AuthCode({
          userId: user._id,
          code: code,
          expiresAt: new Date(Date.now() + 1000 * 60 * 10),
        });
        authCode.save();
        console.log(code);
        //sendSMSS(phone, code);
        return res.status(200).json({
          message:
            'Код сгенерирован и сохранен в БД. СМС отправлено. Отправьте еще один запрос на /auth/sms_auth с полями phone и code',
        });
      } else {
        return res
          .status(200)
          .json({ message: 'Не введен ни логин, ни номер' });
      }
    } catch (error) {
      return res.status(400).json(error);
    }
  }
  async smsAuth(req, res) {
    try {
      const { code, phone } = req.body;
      if (!code || !phone) {
        return res
          .status(400)
          .json({ message: 'Ошибка при формировании запроса' });
      }
      const user = await User.findOne({ phone: phone });
      if (!user) {
        return res
          .status(400)
          .json({ message: 'Номер телефона не зарегистрирован' });
      }
      const code_saved = await AuthCode.findOne({ userId: user._id });
      const currentTime = new Date().getTime();
      if (!code_saved || code_saved.expiresAt.getTime() < currentTime) {
        return res
          .status(400)
          .json({ message: 'Код устарел или удален - запросите код заново' });
      }
      if (!(code_saved.code === code)) {
        return res.status(400).json({ message: 'Код введен неверно' });
      }
      const AccToken = generateAccessToken(user._id);
      const RefrToken = generateAccessToken(user._id);
      await RefreshToken.deleteMany({
        userId: user._id,
      });
      const refToken = new RefreshToken({
        userId: user._id,
        token: RefrToken,
        createdAt: new Date(Date.now()),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await refToken.save();
      await AuthCode.deleteMany({ userId: user._id });
      return res
        .status(200)
        .json({ AccessToken: AccToken, RefreshToken: RefrToken });
    } catch (error) {
      return res.status(400).json(error);
    }
  }
}

module.exports = new authController();
