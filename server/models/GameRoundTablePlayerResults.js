const mongoose = require("mongoose");
const { Schema } = mongoose;

const GameRoundTablePlayerResultsSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user", required: true },
    answer: String,
    correct: Boolean,
    points: Number,
    score: Number,
    answertype: String,
  },
  { _id: false }
);

module.exports = GameRoundTablePlayerResultsSchema;
