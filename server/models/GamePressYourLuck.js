const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerPressLuckSchema = require("./PlayerPressLuck");

const gamePressYourLuckSchema = new Schema(
  {
    type: { type: String, default: "PressYourLuck" },
    genre: {
      type: Schema.Types.ObjectId,
      ref: "categorygenres"
    },
    players: [PlayerPressLuckSchema],
    rounds: { type: Number, default: 12 },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "category"
      }
    ],
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question"
      }
    ],
    timedout: { type: Boolean, default: false },
    gameover: { type: Boolean, default: false }
  },
  { timestamps: true, collection: "gamespressyourluck" }
);

//Create the model class
const GamePressYourLuck = mongoose.model(
  "gamepressyourluck",
  gamePressYourLuckSchema
);

//Export the model
module.exports = GamePressYourLuck;
