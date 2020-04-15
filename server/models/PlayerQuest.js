const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoundResultsSchema = require("./RoundResults");
const PlayerRewardsSchema = require("./PlayerRewards");

const PlayerQuestSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user", required: true },
    timedout: { type: Boolean, default: false },
    resultsseen: { type: Boolean, default: false },
    roundresults: [RoundResultsSchema],
    score: { type: Number, default: 0 },
    rewards: PlayerRewardsSchema,
  },
  { _id: false }
);

module.exports = PlayerQuestSchema;
