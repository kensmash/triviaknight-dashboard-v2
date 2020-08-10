const mongoose = require("mongoose");
const { Schema } = mongoose;
const GameRoundTablePlayerResultsSchema = require("./GameRoundTablePlayerResults");

const RoundTableGameRoundResultsSchema = new Schema(
  {
    question: { type: String },
    category: { type: String },
    host: { type: Schema.Types.ObjectId, ref: "user", required: true },
    players: [GameRoundTablePlayerResultsSchema],
  },
  { _id: false }
);

module.exports = RoundTableGameRoundResultsSchema;
