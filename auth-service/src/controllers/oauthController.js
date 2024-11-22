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
const ApiResponse = require('../interfaces/response.js');
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
      const locale = req.headers['x-locale-language'];
      if (!code) {
        return res
          .status(400)
          .json(ApiResponse.createError(locale, 'GOOGLE_CODE_EMPTY', null));
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
          return res
            .status(400)
            .json(ApiResponse.createError(locale, 'EMAIL_TAKEN', null));
        }
        const newUsername = await generateUsername();
        user = new User({
          username: newUsername,
          roles: [userRole.value],
          isOauth: true,
          email,
          googleId,
          createdAt: new Date(Date.now()),
        });
        user.save();
        const AccessToken = await createTokens(user._id, res);
        return res.status(201).json(
          ApiResponse.createSuccess(locale, 'USER_CREATED', {
            AccessToken: AccessToken,
          }),
        );
      }
      const AccessToken = await createTokens(user._id, res);
      return res.status(200).json(
        ApiResponse.createSuccess(locale, 'LOGGED_IN', {
          AccessToken: AccessToken,
        }),
      );
    } catch (err) {
      console.log(err);
      const locale = req.headers['x-locale-language'];
      return res.status(400).json(
        ApiResponse.createError(locale, 'UNKNOWN_ERROR', {
          error: err.toString(),
        }),
      );
    }
  }
  async yandexAuth(req, res) {
    try {
      const yandex_token = req.query.code;
      const locale = req.headers['x-locale-language'];
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
          return res
            .status(400)
            .json(ApiResponse.createError(locale, 'EMAIL_TAKEN', null));
        }
        const newUsername = await generateUsername();
        user = new User({
          username: newUsername,
          roles: [userRole.value],
          isOauth: true,
          email: default_email,
          yandexId,
          createdAt: new Date(Date.now()),
        });
        user.save();
        const AccessToken = await createTokens(user._id, res);
        return res.status(201).json(
          ApiResponse.createSuccess(locale, 'USER_CREATED', {
            AccessToken: AccessToken,
          }),
        );
      }
      const AccessToken = await createTokens(user._id, res);
      return res.status(200).json(
        ApiResponse.createSuccess(locale, 'LOGGED_IN', {
          AccessToken: AccessToken,
        }),
      );
    } catch (error) {
      const locale = req.headers['x-locale-language'];
      console.log(error);
      return res.status(400).json(
        ApiResponse.createError(locale, 'UNKNOWN_ERROR', {
          error: err.toString(),
        }),
      );
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
 *         description: Код авторизации, возвращенный от Google
 *     responses:
 *       200:
 *         description: Пользователь успешно авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *               $ref: '#/components/schemas/ApiResponse'
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
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
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, error]
 *         code:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             AccessToken:
 *               type: string
 *       example:
 *         status: success
 *         code: USER_CREATED
 *         message: User data updated successfully.
 *         data:
 *           AccessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjliM2I5YjlkOWQ0NDAwMDBkNGYwMDAiLCJpYXQiOjE2MDUzMjA5MzMsImV4cCI6MTYwNjUyMDkzM30.9Rb2kQn7-HK380q5K6QJ7V4321
 */
