const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserPreferencesSchema = new Schema(
  {
    showonleaderboards: { type: Boolean, default: true },
    allowrandomchallenges: { type: Boolean, default: true },
    acceptsgamepushnotifications: { type: Boolean, default: true },
    acceptsweeklypushnotifications: { type: Boolean, default: true },
    playsounds: { type: Boolean, default: true },
    playpartysounds: { type: Boolean, default: true },
    allowvibrations: { type: Boolean, default: true },
    allowpartyvibrations: { type: Boolean, default: true },
  },
  { _id: false }
);

module.exports = UserPreferencesSchema;
