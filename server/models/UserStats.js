const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserStatsSchema = new Schema(
  {
    jousts: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    ties: { type: Number, default: 0 },
    joustquestionsanswered: { type: Number, default: 0 },
    joustcorrectanswers: { type: Number, default: 0 },
    joustincorrectanswers: { type: Number, default: 0 }
  },
  { _id: false }
);

module.exports = UserStatsSchema;
