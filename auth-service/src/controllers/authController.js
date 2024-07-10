const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { secret } = require('../config/config.js');
const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: '48h' });
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: 'Ошибка при регистрации', errors });
      }
      const { username, password, phone } = req.body;

      console.log(username, password, phone);
      const candidate = await User.findOne({
        $or: [{ username }, { phone }],
      });
      if (candidate) {
        let message = '';
        if (candidate.username === username) {
          message += 'Пользователь с таким именем уже существует';
        } else if (candidate.phone === phone) {
          message += 'Пользователь с таким номером телефона уже существует';
          console.log(candidate);
        }
        return res.status(400).json({ message: message });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: 'USER' });
      const user = new User({
        username,
        password: hashPassword,
        phone: phone,
        roles: [userRole.value],
      });
      await user.save();
      return res
        .status(200)
        .json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (e) {
      console.log(e);
      res.status(400).json(e);
    }
  }
  async login(req, res) {
    try {
      const { username, password, phone } = req.body;
      if (username != null) {
        const user = await User.findOne({ username });
        if (!user) {
          return res
            .status(400)
            .json({ message: `Пользователь ${username} не найден` });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: 'Введен неверный пароль' });
        }
        const token = generateAccessToken(user._id);
        return res.json({ token });
      } else if (phone != null) {
        return res.status(200).json({
          message:
            'Вероятно, это запрос для регистрации через SMS. Реализация будет позже!',
        });
      } else {
        return res
          .status(200)
          .json({ message: 'Не введен ни логин, ни номер' });
      }
    } catch (e) {}
  }
  async getUsers(req, res) {
    try {
      res.json('res work');
    } catch (e) {}
  }
}

module.exports = new authController();
