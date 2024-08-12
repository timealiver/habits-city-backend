const RefreshToken = require('../models/RefreshToken');
const { secret } = require('../config/config');
const jwt = require('jsonwebtoken');
module.exports.createTokens = async function (userId, res) {
  const AccessToken = jwt.sign({ userId }, secret, { expiresIn: '48h' });
  const RefrToken = jwt.sign({ userId }, secret, { expiresIn: '30d' });
  await RefreshToken.deleteMany({
    userId: userId,
  });
  const refToken = new RefreshToken({
    userId: userId,
    token: RefrToken,
    createdAt: new Date(Date.now()),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await refToken.save();
  res.cookie('refresh_token', RefrToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return AccessToken;
};
