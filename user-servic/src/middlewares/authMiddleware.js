const jwt = require('jsonwebtoken');
const { secret } = require('../config/config');
const axios = require('axios');
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
      return res.status(401).json({ message: 'Токен не предоставлен' });

    const user = jwt.verify(token, secret);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      //call updateToken through cookie
      return res.status(401).json({ message: 'Токен истёк' });
    } else {
      return res.status(400).json({ message: error.toString() });
    }
  }
}

module.exports = authMiddleware;
