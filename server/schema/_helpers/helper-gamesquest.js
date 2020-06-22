const mongoose = require("mongoose");
const User = require("../../models/User");
const GameQuest = require("../../models/GameQuest");
const CategoryType = require("../../models/CategoryType");
const CategoryGenre = require("../../models/CategoryGenre");
const Category = require("../../models/Category");

const currentQuestTopic = async () => {
  try {
    let results = {};
    //look in categories
    const catTopic = await Category.findOne({
      questactive: { $eq: true },
    });
    if (catTopic) {
      results = {
        id: catTopic._id,
        type: "Category",
        topic: catTopic.name,
        description: catTopic.questdescription,
      };
    }
    //also in category types
    const catTypeTopic = await CategoryType.findOne({
      questactive: { $eq: true },
    });
    if (catTypeTopic) {
      results = {
        id: catTypeTopic._id,
        type: "Category Type",
        topic: catTypeTopic.name,
        description: "",
      };
    }
    //and in genres
    const catGenreTopic = await CategoryGenre.findOne({
      questactive: { $eq: true },
    });
    if (catGenreTopic) {
      results = {
        id: catGenreTopic._id,
        type: "Genre",
        topic: catGenreTopic.name,
        description: "",
      };
    }

    return results;
  } catch (error) {
    console.error(error);
  }
};

const nextQuestTopic = async () => {
  try {
    let results = {};
    //look in categories
    const catTopic = await Category.findOne({
      nextquestactive: { $eq: true },
    });
    if (catTopic) {
      results = {
        id: catTopic._id,
        type: "Category",
        topic: catTopic.name,
      };
    }
    //also in category types
    const catTypeTopic = await CategoryType.findOne({
      nextquestactive: { $eq: true },
    });
    if (catTypeTopic) {
      results = {
        id: catTypeTopic._id,
        type: "Category Type",
        topic: catTypeTopic.name,
      };
    }
    //and in genres
    const catGenreTopic = await CategoryGenre.findOne({
      nextquestactive: { $eq: true },
    });
    if (catGenreTopic) {
      results = {
        id: catGenreTopic._id,
        type: "Genre",
        topic: catGenreTopic.name,
      };
    }

    return results;
  } catch (error) {
    console.error(error);
  }
};

const saveQuestHighScore = async (topic) => {
  //first, get all games from previous week with current topic
  try {
    var lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 8);
    const lastWeeksGames = await GameQuest.find({
      topic,
      updatedAt: {
        $gte: lastWeek,
      },
    }).populate("players.player");

    if (lastWeeksGames.length) {
      //loop through games and get high score
      const gamePlayers = lastWeeksGames.map((game) => game.players[0]);
      const winningScores = gamePlayers.map((player) => player.score);
      //check which score was highest
      const highScore = Math.max(...winningScores);
      //only set a winner if there was a player with a score greater than 0
      if (highScore > 0) {
        //check if more than one player score matches winning score
        let winningPlayers = gamePlayers.filter(
          (player) => player.score === highScore
        );

        //if more than one player has highest score, set multiple players as winners
        if (winningPlayers.length > 1) {
          await User.updateMany(
            {
              _id: {
                $in: winningPlayers.map((player) =>
                  mongoose.Types.ObjectId(player.player._id)
                ),
              },
            },
            {
              $addToSet: {
                questhighscores: {
                  topic,
                  score: winningPlayers[0].score,
                  date: Date.Now,
                },
              },
            }
          );
        } else if (winningPlayers.length === 1) {
          //only one player has highest score, that player is the winner
          await User.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(winningPlayers[0].player._id) },
            {
              $addToSet: {
                questhighscores: {
                  topic,
                  score: winningPlayers[0].score,
                  date: Date.Now,
                },
              },
            }
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  currentQuestTopic,
  nextQuestTopic,
  saveQuestHighScore,
};
