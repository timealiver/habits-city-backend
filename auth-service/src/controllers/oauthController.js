const User = require('../models/User.js');
const Role = require('../models/Role.js');
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_TOKEN_URL,
} = require('../config/config.js');
const qs = require('querystring');
const { createTokens } = require('../utils/createTokens.js');
const axios = require('axios');
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
      const AccessToken = await createTokens(user_id, res);
      return res.status(200).json({
        message: 'Пользователь успешно авторизован/зарегистрирован',
        AccessToken: AccessToken,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: 'Ошибка при валидации Google-пользователя.' });
    }
  }
  async yandexAuth(req, res) {
    try {
      const yandex_token = req.query.access_token;
      const user_info = await axios.get(
        'https://login.yandex.ru/info?format=json',
        {
          headers: {
            Authorization: `OAuth ${yandex_token}`,
          },
        },
      );
      console.log(user_info.data);
      const { id: yandexId, email } = user_info.data;
      var user = await User.findOne({ yandexId });
      const userRole = await Role.findOne({ value: 'USER' });
      if (!user) {
        user = new User({
          roles: [userRole.value],
          isOauth: true,
          email,
          yandexId,
        });
        user.save();
      }
      const AccessToken = createTokens(user._id, res);
      return res.status(200).json({
        message: 'Пользователь успешно авторизован/зарегистрирован',
        AccessToken: AccessToken,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
}

module.exports = new oauthController();
