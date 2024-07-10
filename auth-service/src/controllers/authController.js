const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcryptjs');
const { validationResult, check } = require('express-validator');
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
        } else if (candidate.phone === phone && phone != null) {
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
    } catch (e) {}
  }
  async getUsers(req, res) {
    try {
      res.json('res work');
    } catch (e) {}
  }
}

module.exports = new authController();
