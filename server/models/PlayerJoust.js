const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoundResultsSchema = require("./RoundResults");

const PlayerJoustSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user", required: true },
    joined: { type: Boolean, default: false },
    turn: { type: Boolean, default: false },
    tied: { type: Boolean, default: false },
    winner: { type: Boolean, default: false },
    timedout: { type: Boolean, default: false },
    resultsseen: { type: Boolean, default: false },
    roundresults: [RoundResultsSchema],
    gameboosts: [String],
  },
  { _id: false }
);

module.exports = PlayerJoustSchema;
