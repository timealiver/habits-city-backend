const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
router.get('/info', authMiddleware, userController.getInfo);
module.exports = router;
