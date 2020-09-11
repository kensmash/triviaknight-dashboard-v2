const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerSiegeSchema = require("./PlayerSiege");

const gameSiegeSchema = new Schema(
  {
    type: { type: String, default: "Siege" },
    createdby: { type: Schema.Types.ObjectId, ref: "user", required: true },
    players: [PlayerSiegeSchema],
    rounds: { type: Number, default: 20 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
    accepted: { type: Boolean, default: false },
    declined: { type: Boolean, default: false },
    timedoutwarningsent: { type: Boolean, default: false },
    timedout: { type: Boolean, default: false },
    gameover: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "gamessiege" }
);

//Create the model class
const GameSiege = mongoose.model("gamesiege", gameSiegeSchema);

//Export the model
module.exports = GameSiege;
