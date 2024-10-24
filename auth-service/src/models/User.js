const { Schema, model } = require('mongoose');

const User = new Schema({
  username: { type: String, unique: true, sparse: true, required: true },
  password: { type: String },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  roles: [{ type: String, ref: 'Role' }],
  isOauth: { type: Boolean, default: false },
  googleId: { type: String, unique: true, sparse: true },
  yandexId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: null },
  balance: { type: Number, default: 50 },
  rating: { type: Number, default: 10 },
  habits: [{ type: Schema.Types.ObjectId, ref: 'Habit', default: null }],
  subscriptions: [{ type: Schema.Types.ObjectId, ref: 'User', default: null }],
  subscribers: [{ type: Schema.Types.ObjectId, ref: 'User', default: null }],
});
module.exports = model('User', User);
