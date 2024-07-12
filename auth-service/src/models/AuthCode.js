const { Schema, model } = require('mongoose');
const AuthCode = new Schema({
  userId: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});
module.exports = model('AuthCode', AuthCode);
