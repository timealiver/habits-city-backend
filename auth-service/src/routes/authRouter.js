const Router = require('express');
const router = new Router();
const { check } = require('express-validator');

const controller = require('../controllers/authController.js');
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
    check('phone', 'Номер указан неверно').isMobilePhone('ru-RU'),
  ],
  controller.registration,
);
router.post('/login', controller.login);
router.get('/users', controller.getUsers);

module.exports = router;
