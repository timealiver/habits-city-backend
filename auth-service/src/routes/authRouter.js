const Router = require('express');
const router = new Router();
const { check } = require('express-validator');

const controller = require('../controllers/authController.js');
const oAuthController = require('../controllers/oauthController.js');
const tokenController = require('../controllers/tokenController.js');
router.post(
  '/registration',
  [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль не может быть короче 6 символов').isLength({
      min: 6,
    }),
    check('password', 'Пароль должен содержать хотя бы одну цифру').matches(
      /[0-9]/,
    ),
    check(
      'password',
      'Пароль должен содержать хотя бы одну заглавную букву',
    ).matches(/[A-Z]/),
    check('phone')
      .optional()
      .isMobilePhone('ru-RU')
      .withMessage('Номер указан неверно'),
  ],
  controller.registration,
);
router.post('/login', controller.login);
router.post('/sms_auth', controller.smsAuth);
router.get('/google', oAuthController.googleAuth);
router.get('/yandex', oAuthController.yandexAuth);
router.get('/updateToken', tokenController.updateToken);

module.exports = router;
