//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//stats helpers
const {
  gameStats,
  categoryStats,
  categoryRankings,
  userSingleCategoryStat,
  joustGameStats,
  siegeGameStats,
  pressLuckGameStats,
  pressLuckLastWeekWinners,
  pressLuckAllTimeWinners,
  questGameStats,
  questLastWeekWinners,
  questAllTimeWinners,
} = require("../_helpers/helper-stats");

const resolvers = {
  Query: {
    gamestats: requiresAuth.createResolver((parent, { args }, { user }) => {
      return gameStats(user.id);
    }),

    categorystats: requiresAuth.createResolver((parent, { args }, { user }) => {
      return categoryStats(user.id);
    }),

    categoryrankings: requiresAuth.createResolver((parent, { catid }) => {
      return categoryRankings(catid);
    }),

    singlecategorystat: requiresAuth.createResolver(
      (parent, { catid }, { user }) => {
        return userSingleCategoryStat(user.id, catid);
      }
    ),

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
    }),

    questgamestats: requiresAuth.createResolver((parent, { args }) => {
      return questGameStats();
    }),

    questlastweekwinners: requiresAuth.createResolver((parent, { args }) => {
      return questLastWeekWinners();
    }),

    questalltimewinners: requiresAuth.createResolver((parent, { args }) => {
      return questAllTimeWinners();
    }),
  },
};

module.exports = {
  resolvers,
};
