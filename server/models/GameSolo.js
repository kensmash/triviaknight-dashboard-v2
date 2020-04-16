const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerSoloSchema = require("./PlayerSolo");

const gameSoloSchema = new Schema(
  {
    type: { type: String, default: "Solo" },
    players: [PlayerSoloSchema],
    rounds: { type: Number, default: 7 },
    categoriestype: { type: String },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "category",
      },
    ],
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
    replacedquestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
    timedout: { type: Boolean, default: false },
    gameover: { type: Boolean, default: false },
  },

  { timestamps: true, collection: "gamessolo" }
);

//Create the model class
const GameSolo = mongoose.model("gamesolo", gameSoloSchema);

//Export the model
module.exports = GameSolo;
