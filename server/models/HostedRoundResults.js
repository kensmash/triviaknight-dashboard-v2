const mongoose = require("mongoose");
const { Schema } = mongoose;

const HostedRoundResultsSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: "question", required: true },
    difficulty: { type: String, default: "Normal" },
    category: { type: Schema.Types.ObjectId, ref: "category", required: true },
    answer: String,
    correct: Boolean,
    points: Number,
    answertype: String
  },
  { _id: false }
);

module.exports = HostedRoundResultsSchema;
