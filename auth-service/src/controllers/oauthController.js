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
      const AccessToken = await createTokens(user._id, res);
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
      const yandex_token = req.query.code;
      const user_info = await axios.get(
        'https://login.yandex.ru/info?format=json',
        {
          headers: {
            Authorization: `OAuth ${yandex_token}`,
          },
        },
      );
      const { id: yandexId, default_email } = user_info.data;
      console.log(user_info.data);
      var user = await User.findOne({ yandexId });
      const userRole = await Role.findOne({ value: 'USER' });
      if (!user) {
        var isEmail = await User.findOne({ email: default_email });
        if (isEmail) {
          return res.status(400).json({
            message: 'Пользователь с такой почтой уже зарегистрирован',
          });
        }
        user = new User({
          roles: [userRole.value],
          isOauth: true,
          email: default_email,
          yandexId,
        });
        user.save();
        const AccessToken = await createTokens(user._id, res);
        return res.status(200).json({
          message: 'Пользователь успешно зарегистрирован',
          AccessToken: AccessToken,
        });
      }
      const AccessToken = await createTokens(user._id, res);
      return res.status(200).json({
        message: 'Пользователь успешно авторизован',
        AccessToken: AccessToken,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.toString());
    }
  }
}

module.exports = new oauthController();
