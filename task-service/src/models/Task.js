const { Schema, model } = require('mongoose');

const Task = new Schema({
  userId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  frequency: { type: Number, required: true },
  schedule: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
  },
  dailyExclusions: [{ type: Number, min: 0, max: 6 }],
  weeklyGoal: {
    type: Number,
    required: function () {
      return this.schedule === 'weekly';
    },
  },
  reminderTime: { type: Date, required: true },
  completionHistory: [
    {
      date: { type: Date, required: true },
      count: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
module.exports = model('Task', Task);
