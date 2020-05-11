//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//stats helpers
const {
  gameStats,
  questionStats,
  categoryStats,
  categoryRankings,
  userSingleCategoryStat,
  joustGameStats,
  joustRecordStats,
  questGameStats,
  questLastWeekWinners,
  questAllTimeWinners,
} = require("../_helpers/helper-stats");

const resolvers = {
  Query: {
    gamestats: requiresAuth.createResolver((parent, { args }, { user }) => {
      return gameStats(user.id);
    }),

    questionstats: requiresAuth.createResolver((parent, { args }, { user }) => {
      return questionStats(user.id);
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

    joustrecordstats: requiresAuth.createResolver(
      (parent, { args }, { user }) => {
        return joustRecordStats(user.id);
      }
    ),

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
