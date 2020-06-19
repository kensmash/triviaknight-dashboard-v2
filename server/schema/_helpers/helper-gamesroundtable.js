const GameRoundTable = require("../../models/GameRoundTable");

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
  removePlayer,
  roundTableResultsSeen,
};
