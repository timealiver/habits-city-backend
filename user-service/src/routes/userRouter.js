const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController.js');
router.get('/info');
module.exports = router;
