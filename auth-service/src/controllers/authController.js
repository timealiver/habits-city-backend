const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { SMS_MAIL, SMS_API } = require('../config/config.js');
const AuthCode = require('../models/AuthCode.js');
const { createTokens } = require('../utils/createTokens.js');
const { SmsAero, SmsAeroError, SmsAeroHTTPError } = require('smsaero');
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
      if (candidate) {
        if (candidate.username === username) {
          return res
            .status(400)
            .json({ message: 'Пользователь с таким именем уже существует' });
        } else if (candidate.phone === phone) {
          return res.status(400).json({
            message: 'Пользователь с таким номером телефона уже существует',
          });
        }
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: 'USER' });
      const user = new User({
        username,
        password: hashPassword,
        phone: phone,
        roles: [userRole.value],
        isOauth: false,
      });
      await user.save();
      console.log(user);
      const AccessToken = await createTokens(user._id, res);
      return res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        AccessToken: AccessToken,
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
        const AccessToken = await createTokens(user._id, res);
        return res.status(200).json({ AccessToken: AccessToken });
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
      return res.status(400).json(error.toString());
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
      const AccessToken = await createTokens(user._id, res);
      await AuthCode.deleteMany({ userId: user._id });
      return res.status(200).json({ AccessToken: AccessToken });
    } catch (error) {
      return res.status(400).json(error);
    }
  }
}

module.exports = new authController();

/**
 * @swagger
 * /auth/registration:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 AccessToken:
 *                   type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjliM2I5YjlkOWQ0NDAwMDBkNGYwMDAiLCJpYXQiOjE2MDUzMjA5MzMsImV4cCI6MTYwNjUyMDkzM30.9Rb2kQn7-HK380q5K6QJ7V4321; HttpOnly; Max-Age=604800; Path=/; SameSite=Strict
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пользователь успешно авторизован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 AccessToken:
 *                   type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjliM2I5YjlkOWQ0NDAwMDBkNGYwMDAiLCJpYXQiOjE2MDUzMjA5MzMsImV4cCI6MTYwNjUyMDkzM30.9Rb2kQn7-HK380q5K6QJ7V4321; HttpOnly; Max-Age=604800; Path=/; SameSite=Strict
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /auth/sms_auth:
 *   post:
 *     summary: Аутентификация через СМС
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Авторизация прошла успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 AccessToken:
 *                   type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjliM2I5YjlkOWQ0NDAwMDBkNGYwMDAiLCJpYXQiOjE2MDUzMjA5MzMsImV4cCI6MTYwNjUyMDkzM30.9Rb2kQn7-HK380q5K6QJ7V4321; HttpOnly; Max-Age=604800; Path=/; SameSite=Strict
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - roles
 *         - isOauth
 *       properties:
 *         _id:
 *           type: string
 *           description: уникальный идентификатор пользователя
 *         username:
 *           type: string
 *           description: уникальное имя пользователя
 *         password:
 *           type: string
 *           description: Хэшированный пароль
 *         phone:
 *           type: string
 *           description: Телефонный номер пользователя
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: Роль, прикрепленная к пользователю
 *         isOauth:
 *           type: boolean
 *           description: Указывает, есть ли авторизация через сторонние сервисы
 *         googleId:
 *           type: string
 *           description: При наличии авторизации через Google содержит googleId
 *         yandexId:
 *           type: string
 *           description: При наличии авторизации через Yandex содержит yandexId
 *       example:
 *         _id: 5f9b3b9b9d9d440000d4f000
 *         username: johndoe
 *         password: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
 *         phone: +1234567890
 *         roles:
 *           - USER
 *         isOauth: false
 *         googleId: null
 *         yandexId: null
 */
