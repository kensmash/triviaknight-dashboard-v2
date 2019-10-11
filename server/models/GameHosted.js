const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerHostedSchema = require("./PlayerHosted");

const gameHostedSchema = new Schema(
  {
    type: { type: String, required: true, default: "Hosted" },
    createdby: { type: Schema.Types.ObjectId, ref: "user", required: true },
    categoriestype: { type: String, default: "player" },
    difficulty: { type: String, default: "Normal" },
    players: [PlayerHostedSchema],
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "category"
      }
    ],
    pointsgoal: { type: Number, default: 30 },
    categoriesperplayer: { type: Number, default: 3 },
    currentround: { type: Number, default: 1 },
    tiebreakerround: { type: Number, default: 0 },
    currentcategory: {
      type: Schema.Types.ObjectId,
      ref: "category"
    },
    currentquestion: {
      type: Schema.Types.ObjectId,
      ref: "question"
    },
    hasquestion: { type: Boolean, default: false },
    showquestiontoplayers: {
      type: Boolean,
      default: false
    },
    showanswertoplayers: {
      type: Boolean,
      default: false
    },
    differentquestionfetchedcount: { type: Number, default: 0 },
    selectedcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "category"
      }
    ],
    selectedquestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question"
      }
    ],
    started: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false },
    expired: { type: Boolean, default: false },
    tied: { type: Boolean, default: false },
    gameover: { type: Boolean, default: false }
  },
  { timestamps: true, collection: "gameshosted" }
);

//Create the model class
const GameHosted = mongoose.model("gamehosted", gameHostedSchema);

//Export the model
module.exports = GameHosted;
