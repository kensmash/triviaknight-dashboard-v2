//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//stats helpers
const {
  gameStats,
  categoryStats,
  joustGameStats,
  siegeGameStats,
  pressLuckGameStats
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

    pressluckgamestats: requiresAuth.createResolver(
      (parent, { genre }, { user }) => {
        return pressLuckGameStats(genre);
      }
    )
  }
};

module.exports = {
  resolvers
};
