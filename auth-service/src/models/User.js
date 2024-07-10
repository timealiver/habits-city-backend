const { Schema, model } = require('mongoose');

const User = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: false, unique: true, sparse: true },
  roles: [{ type: String, ref: 'Role' }],
});
module.exports = model('User', User);
