const mongoose = require("mongoose");
const { Schema } = mongoose;

const RoundResultsSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: "question", required: true },
    difficulty: String,
    category: { type: Schema.Types.ObjectId, ref: "category", required: true },
    answer: String,
    correct: Boolean,
    points: Number
  },
  { _id: false }
);

module.exports = RoundResultsSchema;
