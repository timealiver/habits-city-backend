const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { createTokens } = require('../utils/createTokens.js');
const ApiResponse = require('../interfaces/response.js');

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      const locale = req.headers['x-locale-language'];
      if (!errors.isEmpty()) {
        const errorsObject = errors.array();
        return res
          .status(400)
          .json(ApiResponse.createError(locale, errorsObject[0].msg, null));
      }

      const { username, password } = req.body;
      const candidate = await User.findOne({
        $or: [{ username }],
      });
      if (candidate) {
        if (candidate.username === username) {
          return res
            .status(400)
            .json(ApiResponse.createError(locale, 'SAME_USERNAME', null));
        }
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: 'USER' });
      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
        isOauth: false,
      });
      await user.save();
      console.log(user);
      const AccessToken = await createTokens(user._id, res);
      return res.status(201).json(
        ApiResponse.createSuccess(locale, 'USER_CREATED', {
          AccessToken: AccessToken,
        }),
      );
    } catch (e) {
      const locale = req.headers['x-locale-language'];
      console.log(e);
      res.status(400).json(
        ApiResponse.createError(locale, 'UNKNOWN_ERROR', {
          error: e.toString(),
        }),
      );
    }
  }
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const locale = req.headers['x-locale-language'];
      if (username != null) {
        const user = await User.findOne({ username });
        if (!user) {
          return res
            .status(400)
            .json(ApiResponse.createError(locale, 'USER_NOT_FOUND', null));
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
          return res
            .status(400)
            .json(ApiResponse.createError(locale, 'INCORRECT_PASSWORD', null));
        }
        const AccessToken = await createTokens(user._id, res);
        return res.status(200).json(
          ApiResponse.createSuccess(locale, 'LOGGED_IN', {
            AccessToken: AccessToken,
          }),
        );
      } else {
        return res
          .status(400)
          .json(ApiResponse.createError(locale, 'USERNAME_EMPTY', null));
      }
    } catch (error) {
      const locale = req.headers['x-locale-language'];
      res.status(400).json(
        ApiResponse.createError(locale, 'UNKNOWN_ERROR', {
          error: error.toString(),
        }),
      );
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
 *               $ref: '#/components/schemas/ApiResponse'
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
 *               $ref: '#/components/schemas/ApiResponse'
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
 *               $ref: '#/components/schemas/ApiResponse'
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
