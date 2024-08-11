const { Schema, model } = require('mongoose');

const User = new Schema({
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  roles: [{ type: String, ref: 'Role' }],
  isOauth: { type: Boolean },
  googleId: { type: String, unique: true, sparse: true },
  yandexId: { type: String, unique: true, sparse: true },
});
module.exports = model('User', User);
