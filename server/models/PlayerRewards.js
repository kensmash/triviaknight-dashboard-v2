const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlayerRewardsSchema = new Schema(
  {
    differentquestion: { type: Number, default: 0 },
    secondguess: { type: Number, default: 0 },
    addtotimer: { type: Number, default: 0 },
    removewronganswer: { type: Number, default: 0 },
    addpoints: { type: Number, default: 0 },
    changehardtoeasy: { type: Number, default: 0 },
  },
  { _id: false }
);

module.exports = PlayerRewardsSchema;
