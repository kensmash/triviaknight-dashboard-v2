const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlayerPressLuckHighScoresSchema = new Schema(
  {
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

module.exports = PlayerPressLuckHighScoresSchema;
