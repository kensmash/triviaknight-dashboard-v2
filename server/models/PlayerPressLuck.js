const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoundResultsSchema = require("./RoundResults");

const PlayerPressLuckSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user", required: true },
    timedout: { type: Boolean, default: false },
    resultsseen: { type: Boolean, default: false },
    roundresults: [RoundResultsSchema],
    score: { type: Number, default: 0 }
  },
  { _id: false }
);

module.exports = PlayerPressLuckSchema;
