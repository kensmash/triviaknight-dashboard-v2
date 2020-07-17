const bcrypt = require("bcrypt");
const User = require("../../models/User");
const { userSessionIdPrefix } = require("../../constants");
//const { sendPasswordCodeEmail } = require("./helper-sendgrid");
const { sendPasswordCodeEmail } = require("./helper-nodemailer");

//logout redis stuff
//https://github.com/benawad/fullstack-graphql-airbnb-clone/blob/22_rn_session_save/packages/server/src/utils/removeAllUsersSessions.ts
const removeAllUsersSessions = async (userId, redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  );
  const promises = [];
  for (let i = 0; i < sessionIds.length; i += 1) {
    promises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`));
  }
  await Promise.all(promises);
};

const trySignup = async (
  name,
  email,
  password,
  access,
  request,
  redisclient,
  expoPushToken
) => {
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      //throw new Error("Email already used");
      return {
        error: {
          field: "email",
          msg: "That email address is already in use.",
        },
      };
    }
  } catch (error) {
    console.error(error);
    return;
  }

  try {
    const existingName = await User.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });
    if (existingName) {
      return {
        error: {
          field: "name",
          msg: "Sorry, that name is already in use.",
        },
      };
    }
  } catch (error) {
    console.error(error);
    return;
  }

  try {
    const newUser = await new User({
      name,
      email,
      password,
      access,
      avatar: "castle",
      roles: ["player"],
      expoPushTokens: expoPushToken ? [expoPushToken] : [],
      preferences: {
        acceptsgamepushnotifications: expoPushToken ? true : false,
        acceptsweeklypushnotifications: expoPushToken ? true : false,
      },
    });
    await newUser.save();
    const user = await User.findOne({ email });
    request.session.user = {
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
    };

    if (request.sessionID) {
      await redisclient.lpush(
        `${userSessionIdPrefix}${user.id}`,
        request.sessionID
      );
    }

    return {
      user,
      sessionID: request.sessionID,
    };
  } catch (error) {
    console.error(error);
  }
};

const tryLogin = async (
  email,
  password,
  access,
  request,
  redisclient,
  expoPushToken
) => {
  let user;

  try {
    user = await User.findOne({ email });

    if (!user) {
      //throw new Error("No user with that email");
      return {
        error: {
          field: "email",
          msg: "No user found with that email.",
        },
      };
    }
  } catch (error) {
    return console.error(error);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // throw new Error("Incorrect password");
    return {
      error: {
        field: "password",
        msg: "Incorrect password.",
      },
    };
  }

  request.session.user = {
    id: user.id,
    name: user.name,
    isAdmin: user.isAdmin,
  };

  if (request.sessionID) {
    await redisclient.lpush(
      `${userSessionIdPrefix}${user.id}`,
      request.sessionID
    );
  }

  if (access === "paid") {
    await User.findOneAndUpdate({ email }, { $set: { access } });
  }

  if (expoPushToken) {
    await User.findOneAndUpdate(
      { email },
      { $addToSet: { expoPushTokens: expoPushToken } }
    );
  }

  return {
    payload: {
      user,
      sessionID: request.sessionID,
    },
  };
};

const createForgotPasswordCode = async (email) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      //generate 6 digit code
      const resetcode = Math.floor(100000 + Math.random() * 900000);
      console.log(resetcode);
      const editedUser = await User.findOneAndUpdate(
        { email },
        { $set: { resetcode } }
      );
      await sendPasswordCodeEmail(email, existingUser.name, resetcode);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

const resetPasswordCode = async (email, code) => {
  try {
    const user = await User.findOne({ email });
    if (user.resetcode === code) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
};

const updatePassword = async (email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } }
    );
    return true;
  } catch (error) {
    console.error(error);
  }
};

const updateEmail = async (userId, email) => {
  try {
    const editedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { email } }
    );
    return editedUser;
  } catch (error) {
    console.error(error);
  }
};

const updateName = async (userId, name, request) => {
  try {
    const existingName = await User.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i"), $options: "i" },
    });
    if (existingName) {
      return {
        error: {
          field: "name",
          msg: "Sorry, that name is already in use.",
        },
      };
    }
  } catch (error) {
    console.error(error);
    return;
  }

  try {
    const editedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { name } },
      { new: true }
    );

    request.session.user = {
      ...request.session.user,
      name,
    };

    return { user: editedUser };
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = {
  removeAllUsersSessions,
  trySignup,
  tryLogin,
  createForgotPasswordCode,
  resetPasswordCode,
  updatePassword,
  updateEmail,
  updateName,
};
