const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoundResultsSchema = require("./RoundResults");

const PlayerSiegeSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user", required: true },
    joined: { type: Boolean, default: false },
    turn: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    tied: { type: Boolean, default: false },
    winner: { type: Boolean, default: false },
    timedout: { type: Boolean, default: false },
    resultsseen: { type: Boolean, default: false },
    roundresults: [RoundResultsSchema],
    timer: { type: Number, default: 30000 },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
    replacedquestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
  },
  { _id: false }
);

module.exports = PlayerSiegeSchema;
