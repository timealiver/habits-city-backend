const User = require('../models/User.js');
const Role = require('../models/Role.js');
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_TOKEN_URL,
} = require('../config/config.js');
const qs = require('querystring');
const { createTokens } = require('../utils/createTokens.js');
const axios = require('axios');
async function generateUsername() {
  let username;
  let isUnique = false;
  while (!isUnique) {
    // Генерация случайного 8-значного числа
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    username = `User${randomNumber}`;

    // Проверка уникальности username в базе данных
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      isUnique = true;
    }
  }
  return username;
}
class oauthController {
  async googleAuth(req, res) {
    try {
      const code = req.query.code;
      if (!code) {
        return res.status(400).json({
          message: 'Не был получен код от Google. Повторите попытку входа.',
        });
      }
      const values = {
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'authorization_code',
      };
      const googleTokens = await axios.post(
        GOOGLE_TOKEN_URL,
        qs.stringify(values),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log(googleTokens.data.access_token);
      const google_user = await axios.get(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: {
            Authorization: `Bearer ${googleTokens.data.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { id: googleId, email } = google_user.data;
      var user = await User.findOne({ googleId });
      const userRole = await Role.findOne({ value: 'USER' });
      if (!user) {
        var isEmail = await User.findOne({ email });
        if (isEmail) {
          return res.status(400).json({
            message: `Пользователь с почтой ${email} уже зарегистрирован`,
          });
        }
        const newUsername = await generateUsername();
        user = new User({
          username: newUsername,
          roles: [userRole.value],
          isOauth: true,
          email,
          googleId,
        });
        user.save();
        const AccessToken = await createTokens(user._id, res);
        return res.status(201).json({
          message: 'Пользователь успешно зарегистрирован',
          AccessToken: AccessToken,
        });
      }
      const AccessToken = await createTokens(user._id, res);
      return res.status(200).json({
        message: 'Пользователь успешно авторизован',
        AccessToken: AccessToken,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json(
          { message: 'Ошибка при валидации Google-пользователя.' },
          err.toString(),
        );
    }
  }
  async yandexAuth(req, res) {
    try {
      const yandex_token = req.query.code;
      const user_info = await axios.get(
        'https://login.yandex.ru/info?format=json',
        {
          headers: {
            Authorization: `OAuth ${yandex_token}`,
          },
        },
      );
      const { id: yandexId, default_email } = user_info.data;
      console.log(user_info.data);
      var user = await User.findOne({ yandexId });
      const userRole = await Role.findOne({ value: 'USER' });
      if (!user) {
        var isEmail = await User.findOne({ email: default_email });
        if (isEmail) {
          return res.status(400).json({
            message: 'Пользователь с такой почтой уже зарегистрирован',
          });
        }
        const newUsername = generateUsername();
        user = new User({
          username: newUsername,
          roles: [userRole.value],
          isOauth: true,
          email: default_email,
          yandexId,
        });
        user.save();
        const AccessToken = await createTokens(user._id, res);
        return res.status(201).json({
          message: 'Пользователь успешно зарегистрирован',
          AccessToken: AccessToken,
        });
      }
      const AccessToken = await createTokens(user._id, res);
      return res.status(200).json({
        message: 'Пользователь успешно авторизован',
        AccessToken: AccessToken,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.toString());
    }
  }
}

module.exports = new oauthController();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Аутентификация через Google
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Код авторизации, вовзращенный от Google
 *     responses:
 *       200:
 *         description: Пользователь успешно авторизован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 AccessToken:
 *                   type: string
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
 * /auth/yandex:
 *   get:
 *     summary: Аутентификация пользователя через Yandex
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Код авторизации, возвращаемый Yandex
 *     responses:
 *       200:
 *         description: Пользователь успешно авторизован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 AccessToken:
 *                   type: string
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
