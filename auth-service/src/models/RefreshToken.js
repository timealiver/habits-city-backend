const { Schema, model } = require('mongoose');
const RefreshToken = new Schema({
  userId: { type: String, required: true, unique: true },
  token: { type: String, unique: true, required: true },
  createdAt: { type: Date, unique: true, required: true },
  expiresAt: { type: Date, unique: true, required: true },
});
module.exports = model('RefreshToken', RefreshToken);
