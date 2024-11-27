const RefreshToken = require('../models/RefreshToken');
const { secret } = require('../config/config');
const jwt = require('jsonwebtoken');
async function createTokens(userId, res) {
  const AccessToken = jwt.sign({ userId }, secret, { expiresIn: '2m' });
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
}
async function createAccessToken(userId) {
  const AccessToken = jwt.sign({ userId }, secret, { expiresIn: '30s' });
  return AccessToken;
}
module.exports = {
  createTokens,
  createAccessToken,
};
