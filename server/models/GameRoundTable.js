const mongoose = require("mongoose");
const { Schema } = mongoose;
const RoundTableGameRoundResultsSchema = require("./RoundTableGameRoundResults");
const PlayerRoundTableSchema = require("./PlayerRoundTable");

const gameRoundTableSchema = new Schema(
  {
    type: { type: String, required: true, default: "RoundTable" },
    title: { type: String },
    createdby: { type: Schema.Types.ObjectId, ref: "user", required: true },
    categoriestype: { type: String, default: "player" },
    categoriestypename: { type: String, default: "Players’ Categories" },
    categoriestypeid: { type: Schema.Types.ObjectId },
    difficulty: { type: String, default: "Normal" },
    players: [PlayerRoundTableSchema],
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "category",
      },
    ],
    pointsgoal: { type: Number, default: 30 },
    categoriesperplayer: { type: Number, default: 3 },
    currentround: { type: Number, default: 1 },
    tiebreakerround: { type: Number, default: 0 },
    currentcategory: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
    savedcategory: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
    currentquestion: {
      type: Schema.Types.ObjectId,
      ref: "question",
    },
    gameroundresults: [RoundTableGameRoundResultsSchema],
    showquestiontoplayers: {
      type: Boolean,
      default: false,
    },
    showanswertoplayers: {
      type: Boolean,
      default: false,
    },
    differentquestionfetchedcount: { type: Number, default: 0 },
    selectedcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "category",
      },
    ],
    selectedquestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
    started: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false },
    expired: { type: Boolean, default: false },
    tied: { type: Boolean, default: false },
    gameover: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "gamesroundtable" }
);

//Create the model class
const GameRoundTable = mongoose.model("gameroundtable", gameRoundTableSchema);

//Export the model
module.exports = GameRoundTable;
