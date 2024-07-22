const User = require('../models/User.js');
const RefreshToken = require('../models/RefreshToken.js');
const Role = require('../models/Role.js');
const jwt = require('jsonwebtoken');
const {
  secret,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_TOKEN_URL,
} = require('../config/config.js');
const qs = require('querystring');
const axios = require('axios');

const generateJwtToken = (id, expiresIn) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
};
class oauthController {
  async googleAuth(req, res) {
    try {
      const code = req.query.code;
      if (!code) {
        return res.status(400).json({
          message: 'Не был получен код от Google. Повторите попытку входа.',
        });
      }
      const values = {
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'authorization_code',
      };
      const googleTokens = await axios.post(
        GOOGLE_TOKEN_URL,
        qs.stringify(values),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log(googleTokens.data.access_token);
      const google_user = await axios.get(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: {
            Authorization: `Bearer ${googleTokens.data.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { id: googleId, email, verified_email } = google_user.data;
      console.log(googleId, email, verified_email);
      var user = await User.findOne({ googleId });
      const userRole = await Role.findOne({ value: 'USER' });
      if (!user && verified_email === true) {
        user = new User({
          roles: [userRole.value],
          isOauth: true,
          email,
          googleId,
        });
        user.save();
      }
      await RefreshToken.deleteMany({
        userId: user._id,
      });
      const AccessToken = generateJwtToken(user._id, '48h');
      const RefrToken = generateJwtToken(user._id, '30d');

      const refToken = new RefreshToken({
        userId: user._id,
        token: RefrToken,
        createdAt: new Date(Date.now()),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await refToken.save();
      res.cookie('refresh_token', RefrToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        message: 'Пользователь успешно авторизован/зарегистрирован',
        AccessToken: AccessToken,
        RefreshToken: RefrToken,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: 'Ошибка при валидации Google-пользователя.' });
    }
  }
  async yandexAuth(req, res) {
    console.log(req);
    res.status(200).json({ message: 'Все не ок но типо ок' });
    try {
    } catch (error) {
      return res.status(400).json({ message: 'Произошла ошибка' });
    }
  }
}

module.exports = new oauthController();
