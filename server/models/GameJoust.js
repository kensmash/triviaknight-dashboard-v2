const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerJoustSchema = require("./PlayerJoust");

const gameJoustSchema = new Schema(
  {
    type: { type: String, default: "Joust" },
    createdby: { type: Schema.Types.ObjectId, ref: "user", required: true },
    players: [PlayerJoustSchema],
    rounds: { type: Number, default: 7 },
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
    replacedquestions: [
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
  { timestamps: true, collection: "gamesjoust" }
);

//Create the model class
const GameJoust = mongoose.model("gamejoust", gameJoustSchema);

//Export the model
module.exports = GameJoust;
