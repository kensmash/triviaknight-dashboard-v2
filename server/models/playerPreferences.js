const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlayerPreferencesSchema = new Schema(
  {
    allowrandomchallenges: { type: Boolean, default: true },
    showinleaderboards: { type: Boolean, default: true }
  },
  { _id: false }
);

module.exports = PlayerPreferencesSchema;
