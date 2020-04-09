const User = require("../../models/User");
const GameJoust = require("../../models/GameJoust");
const GameSolo = require("../../models/GameSolo");
const GamePressYourLuck = require("../../models/GamePressYourLuck");
const ExpoPushTicket = require("../../models/ExpoPushTicket");
const { Expo } = require("expo-server-sdk");
//auth helpers
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

    gameOpponent: requiresAuth.createResolver((parent, { id }, { user }) => {
      return User.findOne({ _id: id })
        .populate("categories")
        .populate("blockedusers")
        .populate({
          path: "joustgames",
          populate: { path: "players.player" },
        })
        .populate({
          path: "siegegames",
          populate: { path: "players.player" },
        });
    }),

    randomOpponent: requiresAuth.createResolver(
      async (parent, { args }, { user }) => {
        const daUser = await User.findOne({ _id: user.id });
        //try to get only active users from last month and a half
        var fortyFiveDaysAgo = new Date();
        fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

        let recentUsers = await User.countDocuments({
          _id: { $ne: user.id, $nin: daUser.blockedusers },
          roles: { $nin: ["reviewer"] },
          access: { $eq: "paid" },
          blockedusers: { $nin: [user.id] },
          updatedAt: {
            $gte: fortyFiveDaysAgo,
          },
        });

        const randomNumber = Math.floor(Math.random() * recentUsers);

        const selectedUser = await User.find({
          _id: { $ne: user.id },
          roles: { $nin: ["reviewer"] },
          blockedusers: { $nin: [user.id] },
          updatedAt: {
            $gte: fortyFiveDaysAgo,
          },
        })
          .skip(randomNumber)
          .limit(1);

        return selectedUser[0];
      }
    ),

    joustleaders: requiresAuth.createResolver(async (parent, { args }) => {
      const joustplayers = await User.find({
        roles: { $nin: ["reviewer"] },
      }).populate({
        path: "joustgames",
        populate: { path: "players.player" },
      });

      const playersArray = joustplayers.map((player) => ({
        player: {
          id: player.id,
          name: player.name,
          rank: player.rank,
          avatar: player.avatar,
        },
        finishedgames: player.joustgames.filter(
          (game) => game.gameover && !game.declined
        ),
      }));

      const sortedArray = playersArray
        .sort((a, b) => b.finishedgames.length - a.finishedgames.length)
        .slice(0, 15);

      const results = sortedArray.map((player) => ({
        joustid: player.player.id,
        name: player.player.name,
        rank: player.player.rank,
        avatar: player.player.avatar,
        gamesplayed: player.finishedgames.length,
        wins: player.finishedgames.filter((game) =>
          game.players.some(
            (foo) => foo.player._id == player.player.id && foo.winner
          )
        ).length,
      }));

      return results;
    }),

    joustleaderssevendays: requiresAuth.createResolver(
      async (parent, { args }) => {
        const joustplayers = await User.find({
          roles: { $nin: ["reviewer"] },
        }).populate({
          path: "joustgames",
          populate: { path: "players.player" },
        });

        //let sevenDaysAgo = new Date();
        //sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        let thisWeek = new Date();
        const currentDay = thisWeek.getDay();

        thisWeek.setDate(
          thisWeek.getDate() - currentDay + (currentDay == 0 ? -6 : 1)
        );
        const playersArray = joustplayers.map((player) => ({
          player: {
            id: player.id,
            name: player.name,
            rank: player.rank,
            avatar: player.avatar,
          },
          finishedgames: player.joustgames.filter(
            (game) =>
              game.gameover && !game.declined && game.updatedAt > thisWeek
          ),
        }));

        const sortedArray = playersArray
          .sort((a, b) => b.finishedgames.length - a.finishedgames.length)
          .slice(0, 15);

        const results = sortedArray.map((player) => ({
          joustsevendayid: player.player.id,
          name: player.player.name,
          rank: player.player.rank,
          avatar: player.player.avatar,
          gamesplayed: player.finishedgames.length,
          wins: player.finishedgames.filter((game) =>
            game.players.some(
              (foo) => foo.player._id == player.player.id && foo.winner
            )
          ).length,
        }));

        return results;
      }
    ),

    siegeleaders: requiresAuth.createResolver(async (parent, { args }) => {
      const siegeplayers = await User.find({
        roles: { $nin: ["reviewer"] },
      }).populate({
        path: "siegegames",
        populate: { path: "players.player" },
      });

      const playersArray = siegeplayers.map((player) => ({
        player: {
          id: player.id,
          name: player.name,
          rank: player.rank,
          avatar: player.avatar,
        },
        finishedgames: player.siegegames.filter(
          (game) => game.gameover && !game.declined
        ),
      }));

      const sortedArray = playersArray
        .sort((a, b) => b.finishedgames.length - a.finishedgames.length)
        .slice(0, 15);

      const results = sortedArray.map((player) => ({
        siegeid: player.player.id,
        name: player.player.name,
        rank: player.player.rank,
        avatar: player.player.avatar,
        gamesplayed: player.finishedgames.length,
        wins: player.finishedgames.filter((game) =>
          game.players.some(
            (foo) => foo.player._id == player.player.id && foo.winner
          )
        ).length,
      }));

      return results;
    }),

    pressluckleaderssevendays: requiresAuth.createResolver(
      async (parent, { args }) => {
        const pressluckplayers = await User.find({
          roles: { $nin: ["reviewer"] },
        }).populate({
          path: "pressluckgames",
          populate: { path: "players.player" },
        });

        let thisWeek = new Date();
        const currentDay = thisWeek.getDay();
        thisWeek.setDate(
          thisWeek.getDate() - currentDay + (currentDay == 0 ? -6 : 1)
        );
        const playersArray = pressluckplayers.map((player) => ({
          player: {
            id: player.id,
            name: player.name,
            rank: player.rank,
            avatar: player.avatar,
          },
          finishedgames: player.pressluckgames.filter(
            (game) => game.gameover && game.updatedAt > thisWeek
          ),
        }));

        const sortedArray = playersArray
          .sort((a, b) => b.finishedgames.length - a.finishedgames.length)
          .slice(0, 15);

        const results = sortedArray.map((player) => ({
          id: player.player.id,
          name: player.player.name,
          rank: player.player.rank,
          avatar: player.player.avatar,
          gamesplayed: player.finishedgames.length,
        }));

        return results;
      }
    ),

    siegeleaderssevendays: requiresAuth.createResolver(
      async (parent, { args }) => {
        const siegeplayers = await User.find({
          roles: { $nin: ["reviewer"] },
        }).populate({
          path: "siegegames",
          populate: { path: "players.player" },
        });

        //let sevenDaysAgo = new Date();
        //sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        let thisWeek = new Date();
        const currentDay = thisWeek.getDay();
        thisWeek.setDate(
          thisWeek.getDate() - currentDay + (currentDay == 0 ? -6 : 1)
        );
        const playersArray = siegeplayers.map((player) => ({
          player: {
            id: player.id,
            name: player.name,
            rank: player.rank,
            avatar: player.avatar,
          },
          finishedgames: player.siegegames.filter(
            (game) =>
              game.gameover && !game.declined && game.updatedAt > thisWeek
          ),
        }));

        const sortedArray = playersArray
          .sort((a, b) => b.finishedgames.length - a.finishedgames.length)
          .slice(0, 15);

        const results = sortedArray.map((player) => ({
          siegesevendayid: player.player.id,
          name: player.player.name,
          rank: player.player.rank,
          avatar: player.player.avatar,
          gamesplayed: player.finishedgames.length,
          wins: player.finishedgames.filter((game) =>
            game.players.some(
              (foo) => foo.player._id == player.player.id && foo.winner
            )
          ).length,
        }));

        return results;
      }
    ),

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
              .populate("siegegames")
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
      async (parent, { name, cursor }, { user }) => {
        try {
          const paginatedusers = await User.find({
            _id: { $ne: user.id },
            $text: { $search: name },
            roles: { $nin: ["reviewer"] },
            blockedusers: { $nin: [user.id] },
          });

          //TODO: make user cursor pagination work here
          return { items: paginatedusers, hasMore: false };
        } catch (error) {
          console.error(error);
        }
      }
    ),

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

    currentjoustgames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const currentjoustgames = await GameJoust.find({
            "players.player": user.id,
            gameover: { $eq: false },
          })
            .populate("createdby")
            .populate("players.player")
            .populate("category")
            .populate("questions")
            .sort({ updatedAt: -1 });

          return currentjoustgames;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    completedjoustgames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const completedjoustgames = await GameJoust.find({
            "players.player": user.id,
            gameover: { $eq: true },
          })
            .populate("players.player")
            .populate("category")
            .sort({ updatedAt: -1 })
            .limit(12);

          return completedjoustgames;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    recentpressluckgames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const recentpressluckgames = await GamePressYourLuck.find({
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

          return recentpressluckgames;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    allusergames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const player = await User.findOne({ _id: user.id })
            .populate({
              path: "pressluckgames",
              populate: { path: "players.player" },
            })
            .populate({
              path: "joustgames",
              populate: [
                { path: "createdby" },
                { path: "players.player" },
                { path: "category" },
              ],
            })
            .sort({ updatedAt: -1 })
            .populate({
              path: "siegegames",
              populate: [{ path: "createdby" }, { path: "players.player" }],
            })
            .sort({ updatedAt: -1 });

          return {
            pressluckgames: player.pressluckgames,
            joustgames: player.joustgames,
            siegegames: player.siegegames,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    alluserpartygames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        const player = await User.findOne({ _id: user.id })
          .populate("hostedgameshost")
          .populate("hostedgamesplayer");

        return {
          hostedgameshost: player.hostedgameshost,
          hostedgamesplayer: player.hostedgamesplayer,
        };
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
        request,
        redisclient,
        userinput.expoPushToken
      );
    },

    login: async (parent, { email, password, expoPushToken }, context) => {
      const request = context.req;
      const redisclient = context.redisclient;
      return tryLogin(email, password, request, redisclient, expoPushToken);
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

    changerank: requiresAuth.createResolver(
      async (parent, { args }, { user, expo }) => {
        const player = await User.findOne({ _id: user.id })
          .populate("sologames")
          .populate({
            path: "joustgames",
            populate: { path: "players.player" },
          })
          .populate({
            path: "siegegames",
            populate: { path: "players.player" },
          });

        const sologames = player.sologames;
        const joustgames = player.joustgames;
        const siegegames = player.siegegames;

        //calculate questions player has answered
        const soloquestionsanswered = sologames.length * 6;
        const joustquestionsanswered = joustgames
          .map((game) => {
            return game.players.find((player) => player.player._id == user.id)
              .roundresults.length;
          })
          .reduce((a, b) => a + b, 0);
        const siegequestionsanswered = siegegames
          .map((game) => {
            return game.players.find((player) => player.player._id == user.id)
              .roundresults.length;
          })
          .reduce((a, b) => a + b, 0);

        const totalquestionsanswered =
          soloquestionsanswered +
          joustquestionsanswered +
          siegequestionsanswered;

        let newRank;
        let rankChanged = false;

        if (totalquestionsanswered >= 100) {
          if (player.rank === "Page") {
            newRank = "Squire";
            rankChanged = true;
          }
        }

        if (totalquestionsanswered >= 500) {
          if (player.rank === "Squire") {
            newRank = "Knight";
            rankChanged = true;
          }
        }

        if (totalquestionsanswered >= 1000) {
          if (player.rank === "Knight") {
            newRank = "Wizard";
            rankChanged = true;
          }
        }

        if (totalquestionsanswered >= 5000) {
          if (player.rank === "Wizard") {
            newRank = "Dragon";
            rankChanged = true;
          }
        }

        if (rankChanged) {
          try {
            const editedUser = await User.findOneAndUpdate(
              { _id: player._id },
              { $set: { rank: newRank } },
              { new: true }
            );

            //push notifications
            let messages = [];
            const pushTokens = editedUser.expoPushTokens;
            for (let pushToken of pushTokens) {
              // Check that all your push tokens appear to be valid Expo push tokens
              if (!Expo.isExpoPushToken(pushToken)) {
                console.error(
                  `Push token ${pushToken} is not a valid Expo push token`
                );
                continue;
              }
              messages.push({
                to: pushToken,
                sound: "default",
                body: `New rank! You have been upgraded to the rank of ${newRank}.`,
                data: {
                  title: "New Rank",
                  text: `You have been upgraded to the rank of ${newRank}!`,
                },
              });
            }
            //send push notifications in chunks
            let chunks = expo.chunkPushNotifications(messages);
            //receive tickets in response
            let tickets = [];
            (async () => {
              for (let chunk of chunks) {
                try {
                  let ticketChunk = await expo.sendPushNotificationsAsync(
                    chunk
                  );
                  tickets.push(...ticketChunk);
                } catch (error) {
                  console.error(error);
                }
                //add types
                const ticketsWithTypes = tickets.map((ticket) => ({
                  type: "New User Rank",
                  ...ticket,
                }));
                //save tickets to database for later retrieval
                for (let ticket of ticketsWithTypes) {
                  try {
                    const newticket = new ExpoPushTicket(ticket);
                    await newticket.save();
                  } catch (error) {
                    console.error(error);
                  }
                }
              }
            })();

            return true;
          } catch (err) {
            return err;
          }
        } else {
          return false;
        }
      }
    ),
  },
};

module.exports = {
  resolvers,
};
