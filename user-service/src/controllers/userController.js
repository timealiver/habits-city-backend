const User = require('../models/User.js');
class userController {
  async getInfo(req, res) {
    try {
      const user = await User.findById('66b898984336bf34f30bddd5');

      return res.status(200).json({
        username: user.username,
        email: user.email,
        isOnline: true,
        avatar: 'https://avatars.githubusercontent.com/u/739984?v=4',
        inFriends: true,
      });
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  }
}
module.exports = new userController();
