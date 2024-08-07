const jwt = require('jsonwebtoken');
const { secret } = require('../config/config');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');

const generateJwtToken = (id, expiresIn) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
};
class tokenController {
  async updateToken(req, res) {
    try {
      let token = req.headers.authorization;
      if (!token) {
        return res
          .status(400)
          .json({ message: 'RefreshToken отсутствует в запросе' });
      }
      token = token.split(' ')[1];
      const payload = jwt.verify(token, secret);
      const isExist = await User.findById(payload.id);
      if (!isExist) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }
      const isRefresh = await RefreshToken.findOne({ token });
      if (!isRefresh) {
        return res
          .status(400)
          .json({ message: 'Токен не найден в базе данных' });
      }
      await RefreshToken.deleteMany({ userId: payload.id });
      const AccessToken = generateJwtToken(payload.id, '48h');
      const RefrToken = generateJwtToken(payload.id, '30d');

      const refToken = new RefreshToken({
        userId: payload.id,
        token: RefrToken,
        createdAt: new Date(Date.now()),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await refToken.save();
      res.cookie('refresh_token', RefrToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        message: 'Токен успешно обновлен',
        AccessToken: AccessToken,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Токен истёк' });
      } else {
        return res.status(400).json({ message: error.toString() });
      }
    }
  }
}

module.exports = new tokenController();
