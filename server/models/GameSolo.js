const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerSoloSchema = require("./PlayerSolo");

const gameSoloSchema = new Schema(
  {
    type: { type: String, default: "Solo" },
    players: [PlayerSoloSchema],
    rounds: { type: Number, default: 6 }
  },
  { timestamps: true, collection: "gamessolo" }
);

//Create the model class
const GameSolo = mongoose.model("gamesolo", gameSoloSchema);

//Export the model
module.exports = GameSolo;
