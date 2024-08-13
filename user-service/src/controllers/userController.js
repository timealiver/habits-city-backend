const User = require('../models/User.js');
class userController {
  async getInfo(req, res) {
    try {
      console.log(req.user);
      const user = await User.findById(req.user.userId);
      console.log(user);
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
