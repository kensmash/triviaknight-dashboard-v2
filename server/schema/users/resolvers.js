const User = require("../../models/User");
const GameSolo = require("../../models/GameSolo");
const GameJoust = require("../../models/GameJoust");
const GameSiege = require("../../models/GameSiege");
const GameQuest = require("../../models/GameQuest");
const GameRoundTable = require("../../models/GameRoundTable");
const { withFilter } = require("graphql-subscriptions");
//stats helpers
const {
  questionsAnswered,
  questionStats,
  joustRecordStats,
  siegeRecordStats,
} = require("../_helpers/helper-stats");
const {
  joustLeaderThisWeekStats,
  joustLeaderAllTimeStats,
  siegeLeaderThisWeekStats,
  siegeLeaderAllTimeStats,
} = require("../_helpers/helper-leaders");
const { requiresAuth } = require("../_helpers/helper-permissions");
const {
  trySignup,
  tryLogin,
  removeAllUsersSessions,
  createForgotPasswordCode,
  resetPasswordCode,
  updatePassword,
  updateEmail,
  updateName,
} = require("../_helpers/helper-auth");
//subscription
const USERGAMES_UPDATE = "USERGAMES_UPDATE";

const resolvers = {
  Query: {
    userwidget: requiresAuth.createResolver(async (parent, args) => {
      //what https://stackoverflow.com/questions/17554943/querying-with-mongoose-and-dates
      var newusertime = new Date();
      newusertime.setDate(newusertime.getDate() - 30);
      try {
        const widget = await Promise.all([
          User.estimatedDocumentCount(),
          User.countDocuments({
            createdAt: {
              $gte: newusertime,
            },
          }),
        ]);

        const totalusers = widget[0];
        const newusers = widget[1];

        return {
          totalusers,
          newusers,
        };
      } catch (error) {
        console.error(error);
      }
    }),

    currentUser: (parent, args, { user }) => {
      if (user) {
        return User.findOne({ _id: user.id })
          .populate({
            path: "categories",
            populate: { path: "type" },
          })
          .populate({
            path: "friends",
            populate: {
              path: "categories",
              populate: {
                path: "type",
              },
            },
          });
      }

      return null;
    },

    questionsanswered: requiresAuth.createResolver((parent, args, { user }) => {
      return questionsAnswered(user.id);
    }),

    playerprofile: requiresAuth.createResolver(async (parent, { id }) => {
      const player = await User.findOne({ _id: id }).populate({
        path: "categories",
        populate: { path: "type" },
      });
      const questions = await questionStats(id);
      const jouststats = await joustRecordStats(id);
      const siegestats = await siegeRecordStats(id);
      const profileresponse = {
        id: player._id,
        name: player.name,
        rank: player.rank,
        avatar: player.avatar,
        avatarBackgroundColor: player.avatarBackgroundColor,
        createdAt: player.createdAt,
        favoritecategories: player.categories,
        questionsanswered: questions.questionsanswered,
        correct: questions.correctanswers,
        incorrect: questions.incorrectanswers,
        percentcorrect: questions.percentcorrect,
        joustwins: jouststats.wins,
        joustlosses: jouststats.losses,
        joustties: jouststats.ties,
        winpercent: jouststats.winpercent,
        tiespercent: jouststats.tiespercent,
        siegewins: siegestats.wins,
        siegelosses: siegestats.losses,
        siegeties: siegestats.ties,
        siegewinpercent: siegestats.winpercent,
        siegetiespercent: siegestats.tiespercent,
      };
      return profileresponse;
    }),

    gameOpponent: requiresAuth.createResolver((parent, { id }, { user }) => {
      return User.findOne({ _id: id })
        .populate("blockedusers")
        .populate({
          path: "categories",
          populate: { path: "type" },
        });
    }),

    randomOpponent: requiresAuth.createResolver(
      async (parent, { args }, { user }) => {
        const daUser = await User.findOne({ _id: user.id });
        //try to get only active users from last month and a half
        var fortyFiveDaysAgo = new Date();
        fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

        let randomOpponent = await User.aggregate([
          {
            $match: {
              _id: {
                $ne: daUser._id,
                $nin: daUser.blockedusers,
                $nin: daUser.friends,
              },
              roles: { $nin: ["reviewer"] },
              access: { $eq: "paid" },
              blockedusers: { $nin: [daUser._id] },
              lastActiveAt: {
                $gte: fortyFiveDaysAgo,
              },
            },
          },
          { $sample: { size: 1 } },
        ]);

        if (!randomOpponent.length) {
          randomOpponent = await User.aggregate([
            {
              $match: {
                _id: {
                  $ne: daUser._id,
                  $nin: daUser.blockedusers,
                },
                roles: { $nin: ["reviewer"] },
                access: { $eq: "paid" },
                blockedusers: { $nin: [daUser._id] },
                updatedAt: {
                  $gte: fortyFiveDaysAgo,
                },
              },
            },
            { $sample: { size: 1 } },
          ]);
        }

        if (!randomOpponent.length) {
          randomOpponent = await User.aggregate([
            {
              $match: {
                _id: {
                  $ne: daUser._id,
                  $nin: daUser.blockedusers,
                },
                roles: { $nin: ["reviewer"] },
                access: { $eq: "paid" },
                blockedusers: { $nin: [daUser._id] },
              },
            },
            { $sample: { size: 1 } },
          ]);
        }

        return randomOpponent[0];
      }
    ),

    joustleaderssevendays: requiresAuth.createResolver(
      async (parent, { args }) => {
        return joustLeaderThisWeekStats();
      }
    ),

    siegeleaderssevendays: requiresAuth.createResolver(
      async (parent, { args }) => {
        return siegeLeaderThisWeekStats();
      }
    ),

    joustleaders: requiresAuth.createResolver(async (parent, { args }) => {
      return joustLeaderAllTimeStats();
    }),

    siegeleaders: requiresAuth.createResolver(async (parent, { args }) => {
      return siegeLeaderAllTimeStats();
    }),

    allusers: requiresAuth.createResolver((parent, { args }) => {
      return User.find({}).populate("categories");
    }),

    challengeusers: requiresAuth.createResolver(
      (parent, { args }, { user }) => {
        return User.find({
          _id: { $ne: user.id },
          roles: { $in: ["joustdefault"] },
        });
      }
    ),

    userspage: requiresAuth.createResolver(
      async (parent, { offset, limit, name }) => {
        const queryBuilder = (name) => {
          const query = {};
          if (name) {
            //query.$text = { $search: name };
          }
          return query;
        };
        try {
          const users = await Promise.all([
            User.find(queryBuilder(offset, limit, name))
              .skip(offset)
              .limit(limit)
              .populate("categories")
              .populate("sologames")
              .populate("joustgames")
              .sort({ updatedAt: -1 }),
            User.countDocuments(queryBuilder(offset, limit, name)),
          ]);

          const userResults = users[0];
          const userCount = users[1];

          return {
            pages: Math.ceil(userCount / limit),
            totalrecords: userCount,
            users: userResults,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    username: requiresAuth.createResolver(
      async (parent, { name, access, limit, updatedAt }, { user }) => {
        const queryBuilder = (user, name, access, updatedAt) => {
          const query = {
            _id: { $ne: user.id },
            $text: { $search: name },
            roles: { $nin: ["reviewer"] },
            blockedusers: { $nin: [user.id] },
          };
          if (access !== "any") {
            query.access = { $eq: access };
          }
          if (updatedAt) {
            query.updatedAt = { $lt: new Date(Number(updatedAt)) };
          }
          return query;
        };
        try {
          let hasMore = false;
          let paginatedusers = await User.find(
            queryBuilder(user, name, access, updatedAt)
          )
            .sort({ updatedAt: -1 })
            .limit(limit + 1);

          if (paginatedusers.length === limit + 1) {
            //if there are more items than the limit, trim the last item from the array and set hasMore to true
            paginatedusers.pop();
            hasMore = true;
          }
          return { items: paginatedusers, hasMore };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    userGames: requiresAuth.createResolver(async (parent, args, { user }) => {
      try {
        const currentsologames = await GameSolo.find({
          "players.player": user.id,
          gameover: { $eq: false },
        })
          .populate("players.player")
          .populate("categories")
          .populate("questions")
          .sort({ updatedAt: -1 });

        const joustgames = await GameJoust.find({
          "players.player": user.id,
          timedout: { $eq: false },
        })
          .populate("createdby")
          .populate("players.player")
          .populate("players.questions")
          .populate("players.replacedquestions")
          .populate("category")
          .sort({ updatedAt: -1 })
          .limit(12);

        const siegegames = await GameSiege.find({
          "players.player": user.id,
          timedout: { $eq: false },
        })
          .populate("createdby")
          .populate("players.player")
          .populate("players.questions")
          .populate("players.replacedquestions")
          .populate("category")
          .sort({ updatedAt: -1 })
          .limit(12);

        const recentquestgames = await GameQuest.find({
          "players.player": user.id,
        })
          .populate("players.player")
          .populate({
            path: "categories",
            populate: { path: "type" },
          })
          .populate("questions")
          .sort({ updatedAt: -1 })
          .limit(10);

        const roundtablegames = await GameRoundTable.find({
          "players.player": user.id,
        })
          .populate("createdby")
          .populate("players.player")
          .populate("players.categories")
          .populate({
            path: "categories",
            populate: { path: "type" },
          })
          .populate({
            path: "currentcategory",
            populate: { path: "type" },
          })
          .populate("savedcategory")
          .populate("currentquestion")
          .populate("selectedcategories")
          .populate("selectedquestions")
          .populate("gameroundresults.host")
          .populate("gameroundresults.players.player")
          .sort({ updatedAt: -1 })
          .limit(12);

        return {
          currentsologames,
          joustgames,
          siegegames,
          recentquestgames,
          roundtablegames,
        };
      } catch (error) {
        console.error(error);
      }
    }),

    currentsologames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const currentsologames = await GameSolo.find({
            "players.player": user.id,
            gameover: { $eq: false },
          })
            .populate("players.player")
            .populate("categories")
            .populate("questions")
            .sort({ updatedAt: -1 });

          return currentsologames;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    joustgames: requiresAuth.createResolver(async (parent, args, { user }) => {
      try {
        const joustgames = await GameJoust.find({
          "players.player": user.id,
          timedout: { $eq: false },
        })
          .populate("createdby")
          .populate("players.player")
          .populate("players.questions")
          .populate("players.replacedquestions")
          .populate("category")
          .sort({ updatedAt: -1 })
          .limit(12);

        return joustgames;
      } catch (error) {
        console.error(error);
      }
    }),

    recentquestgames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const recentquestgames = await GameQuest.find({
            "players.player": user.id,
          })
            .populate("players.player")
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate("questions")
            .sort({ updatedAt: -1 })
            .limit(10);

          return recentquestgames;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Mutation: {
    signup: (parent, { userinput }, context) => {
      const request = context.req;
      const redisclient = context.redisclient;
      return trySignup(
        userinput.name,
        userinput.email,
        userinput.password,
        userinput.access,
        request,
        redisclient,
        userinput.expoPushToken
      );
    },

    login: async (
      parent,
      { email, password, access, expoPushToken },
      context
    ) => {
      const request = context.req;
      const redisclient = context.redisclient;
      return tryLogin(
        email,
        password,
        access,
        request,
        redisclient,
        expoPushToken
      );
    },

    logout: async (parent, args, context) => {
      const { user } = context.req.session;
      if (user) {
        removeAllUsersSessions(user.id, context.redisclient);
        context.req.session.destroy((err) => {
          if (err) {
            console.log(err);
          }
        });
        return { success: true };
      }
      return { success: false };
    },

    avatar: requiresAuth.createResolver(
      async (parent, { avatar }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { avatar, hasCompletedSignUpFlow: true } },
            { new: true }
          );
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    pushnotificationoptionseen: requiresAuth.createResolver(
      async (parent, { acceptsnotifications }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              $set: {
                hasSeenPushNotificationOptions: true,
                "preferences.acceptsgamepushnotifications": acceptsnotifications,
                "preferences.acceptsweeklypushnotifications": acceptsnotifications,
              },
            },
            { new: true }
          );
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    updateavatarandcolor: requiresAuth.createResolver(
      async (parent, { avatar, color }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              $set: {
                avatar,
                avatarBackgroundColor: color,
              },
            },
            { new: true }
          );
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    completesignupflow: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              $set: {
                hasCompletedSignUpFlow: true,
              },
            },
            { new: true }
          );
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    addusercategory: requiresAuth.createResolver(
      async (parent, { catid }, { user }) => {
        const categoryid = catid;
        try {
          const editedUser = User.findOneAndUpdate(
            { _id: user.id },
            { $push: { categories: categoryid } },
            { new: true }
          ).populate("categories");

          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    changegems: requiresAuth.createResolver(
      async (parent, { add, amount }, { user }) => {
        let gems = amount;
        if (!add) {
          gems = -amount;
        }

        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $inc: { gems } },
            { new: true }
          );

          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    addexpopushtoken: requiresAuth.createResolver(
      async (parent, { token }, { user }) => {
        try {
          const editedUser = User.findOneAndUpdate(
            { _id: user.id },
            { $addToSet: { expoPushTokens: token } },
            { new: true }
          );

          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    replaceexpopushtoken: requiresAuth.createResolver(
      async (parent, { newtoken, previoustoken }, { user }) => {
        try {
          const editedUser = User.findOneAndUpdate(
            { _id: user.id, expoPushTokens: previoustoken },
            { $set: { "expoPushTokens.$": newtoken } },
            { new: true }
          );

          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    removeusercategory: requiresAuth.createResolver(
      async (parent, { catid }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $pull: { categories: catid } },
            { new: true }
          ).populate("categories");
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    adduserfriend: requiresAuth.createResolver(
      async (parent, { playerid }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $addToSet: { friends: playerid } },
            { new: true }
          ).populate("categories");
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    adduserfriends: requiresAuth.createResolver(
      async (parent, { playerids }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $addToSet: { friends: playerids } },
            { new: true }
          ).populate("categories");
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    removeuserfriend: requiresAuth.createResolver(
      (parent, { playerid }, { user }) => {
        return removeUserFriend(user.id, playerid);
      }
    ),

    blockuser: requiresAuth.createResolver(
      async (parent, { playerid }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $pull: { friends: playerid } },
            { new: true }
          )
            .populate("friends")
            .populate("categories");
          return editedUser;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    sendforgotpasswordemail: (parent, { email }) => {
      return createForgotPasswordCode(email);
    },

    resetpasswordcode: (parent, { email, code }) => {
      return resetPasswordCode(email, code);
    },

    updatepassword: (parent, { email, password }) => {
      return updatePassword(email, password);
    },

    updateusername: requiresAuth.createResolver((parent, { name }, context) => {
      const { user } = context.req.session;
      const request = context.req;
      return updateName(user.id, name, request);
    }),

    changeemail: requiresAuth.createResolver((parent, { email }, { user }) => {
      return updateEmail(user.id, email);
    }),

    updatesignupflow: requiresAuth.createResolver(
      async (parent, { args }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { hasCompletedSignUpFlow: true } },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    updateannouncementsseen: requiresAuth.createResolver(
      async (parent, { args }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { hasSeenAnnouncements: true } },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    updaterank: requiresAuth.createResolver(
      async (parent, { rank }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { rank }, $inc: { gems: 15 } },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    updateleaderboardpreference: requiresAuth.createResolver(
      async (parent, { preference }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { "preferences.showonleaderboards": preference } },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    updatesoundpreference: requiresAuth.createResolver(
      async (parent, { preference }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { "preferences.playsounds": preference } },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    updatevibrationpreference: requiresAuth.createResolver(
      async (parent, { preference }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { "preferences.allowvibrations": preference } },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    updategamepushpreference: requiresAuth.createResolver(
      async (parent, { preference }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              $set: { "preferences.acceptsgamepushnotifications": preference },
            },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),

    updateweeklypushpreference: requiresAuth.createResolver(
      async (parent, { preference }, { user }) => {
        try {
          const editedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              $set: {
                "preferences.acceptsweeklypushnotifications": preference,
              },
            },
            { new: true }
          );
          return editedUser;
        } catch (err) {
          return err;
        }
      }
    ),
  },

  Subscription: {
    usergamesupdate: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(USERGAMES_UPDATE),
        (payload, variables) => {
          return payload.usergamesupdate.playerid === variables.playerid;
        }
      ),
    },
  },
};

module.exports = {
  resolvers,
};
