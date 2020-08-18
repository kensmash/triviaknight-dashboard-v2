const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoundTableRoundResultsSchema = require("./RoundTableRoundResults");

const PlayerRoundTableSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user", required: true },
    host: { type: Boolean, default: false },
    joined: { type: Boolean, default: false },
    declined: { type: Boolean, default: false },
    leftgame: { type: Boolean, default: false },
    hasselectedcategories: { type: Boolean, default: false },
    extrapointsadvantage: { type: Number, default: 0 },
    hasskippedhosting: { type: Boolean, default: false },
    hassavedcategory: { type: Boolean, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: "category" }],
    answermode: { type: String, trim: true },
    answered: { type: Boolean, default: false },
    answer: { type: String, trim: true },
    correct: { type: Boolean, default: false },
    answerrecorded: { type: Boolean, default: false },
    guessfeedbackreceived: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    tied: { type: Boolean, default: false },
    winner: { type: Boolean, default: false },
    resultsseen: { type: Boolean, default: false },
    roundresults: [RoundTableRoundResultsSchema],
  },
  { _id: false }
);

module.exports = PlayerRoundTableSchema;
