const Router = require('express');
const router = new Router();
const { check } = require('express-validator');

const controller = require('../controllers/authController.js');
const oAuthController = require('../controllers/oauthController.js');
const tokenController = require('../controllers/tokenController.js');
router.post(
  '/registration',
  [
    check('username', 'USERNAME_EMPTY').notEmpty(),
    check('username', 'USERNAME_SHORT').isLength({ min: 4 }),
    check('username', 'USERNAME_INVALID').matches(/^[a-zA-Z0-9_]+$/),
    check('password', 'PASSWORD_SHORT').isLength({
      min: 6,
    }),
    check('password', 'PASSWORD_NUM').matches(/[0-9]/),
    check('password', 'PASSWORD_CAPITAL').matches(/[A-Z]/),
  ],
  controller.registration,
);
router.post('/login', controller.login);
router.get('/google', oAuthController.googleAuth);
router.get('/yandex', oAuthController.yandexAuth);
router.get('/updateToken', tokenController.updateToken);

module.exports = router;
