const GameHosted = require("../../models/GameHosted");

const createHostedGame = async (
  playerid,
  pointsgoal,
  categoriestype,
  categoriesperplayer,
  previousquestions,
  categories
) => {
  try {
    const newgame = new GameHosted({
      createdby: playerid,
      pointsgoal,
      categoriestype,
      categoriesperplayer: categoriesperplayer ? categoriesperplayer : 0,
      players: [],
      categories: categories ? categories : [],
      selectedquestions: previousquestions,
    });
    const hostedGame = await newgame.save();
    const newHostedGame = await GameHosted.findOne({
      _id: hostedGame._id,
    }).populate("createdby");
    return newHostedGame;
  } catch (error) {
    console.error(error);
  }
};

const removePlayer = async (gameid, playerid) => {
  try {
    const updatedGame = await GameHosted.findOneAndUpdate(
      { _id: gameid, "players.player": playerid },
      { $pull: { players: { player: playerid } } },
      { new: true }
    ).populate("players.player");
    return updatedGame;
  } catch (error) {
    console.error(error);
  }
};

const hostedResultsSeen = async (gameid, playerid) => {
  try {
    const updatedGame = await GameHosted.findOneAndUpdate(
      { _id: gameid, "players.player": playerid },
      { $set: { "players.$.resultsseen": true } },
      { new: true }
    );
    return updatedGame;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createHostedGame,
  removePlayer,
  hostedResultsSeen,
};
