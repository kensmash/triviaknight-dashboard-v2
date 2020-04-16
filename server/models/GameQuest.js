const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerQuestSchema = require("./PlayerQuest");

const gameQuestSchema = new Schema(
  {
    type: { type: String, default: "Quest" },
    topictype: { type: String },
    topic: { type: String },
    players: [PlayerQuestSchema],
    rounds: { type: Number, default: 10 },
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
  { timestamps: true, collection: "gamesquest" }
);

//Create the model class
const GameQuest = mongoose.model("gamequest", gameQuestSchema);

//Export the model
module.exports = GameQuest;
