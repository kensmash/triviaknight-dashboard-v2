//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//stats helpers
const {
  gameStats,
  categoryStats,
  joustGameStats,
  siegeGameStats,
  pressLuckGameStats,
  pressLuckLastWeekWinners,
  pressLuckAllTimeWinners
} = require("../_helpers/helper-stats");

const resolvers = {
  Query: {
    gamestats: requiresAuth.createResolver((parent, { args }, { user }) => {
      return gameStats(user.id);
    }),

    categorystats: requiresAuth.createResolver((parent, { args }, { user }) => {
      return categoryStats(user.id);
    }),

    joustgamestats: requiresAuth.createResolver(
      (parent, { args }, { user }) => {
        return joustGameStats(user.id);
      }
    ),

    siegegamestats: requiresAuth.createResolver(
      (parent, { args }, { user }) => {
        return siegeGameStats(user.id);
      }
    ),

    pressluckgamestats: requiresAuth.createResolver((parent, { args }) => {
      return pressLuckGameStats();
    }),

    presslucklastweekwinners: requiresAuth.createResolver(
      (parent, { args }) => {
        return pressLuckLastWeekWinners();
      }
    ),

    pressluckalltimewinners: requiresAuth.createResolver((parent, { args }) => {
      return pressLuckAllTimeWinners();
    })
  }
};

module.exports = {
  resolvers
};
