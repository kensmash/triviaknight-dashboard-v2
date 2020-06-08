const GameRoundTable = require("../../models/GameRoundTable");

const createRoundTableGame = async (
  playerid,
  pointsgoal,
  categoriestype,
  categoriesperplayer,
  previousquestions,
  categories
) => {
  try {
    const newgame = new GameRoundTable({
      createdby: playerid,
      pointsgoal,
      categoriestype,
      categoriesperplayer: categoriesperplayer ? categoriesperplayer : 0,
      players: [],
      categories: categories ? categories : [],
      selectedquestions: previousquestions,
    });
    const hostedGame = await newgame.save();
    const newHostedGame = await GameRoundTable.findOne({
      _id: hostedGame._id,
    }).populate("createdby");
    return newHostedGame;
  } catch (error) {
    console.error(error);
  }
};

const removePlayer = async (gameid, playerid) => {
  try {
    const updatedGame = await GameRoundTable.findOneAndUpdate(
      { _id: gameid, "players.player": playerid },
      { $pull: { players: { player: playerid } } },
      { new: true }
    ).populate("players.player");
    return updatedGame;
  } catch (error) {
    console.error(error);
  }
};

const roundTableResultsSeen = async (gameid, playerid) => {
  try {
    const updatedGame = await GameRoundTable.findOneAndUpdate(
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
  createRoundTableGame,
  removePlayer,
  roundTableResultsSeen,
};
