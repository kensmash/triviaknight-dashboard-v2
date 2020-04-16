const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoundResultsSchema = require("./RoundResults");

const PlayerSoloSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user", required: true },
    score: { type: Number, default: 0 },
    resultsseen: { type: Boolean, default: false },
    roundresults: [RoundResultsSchema],
    timer: { type: Number, default: 30000 },
  },
  { _id: false }
);

module.exports = PlayerSoloSchema;
