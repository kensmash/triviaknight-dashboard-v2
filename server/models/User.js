const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const UserPreferencesSchema = require("./UserPreferences");
const PlayerQuestHighScoresSchema = require("./PlayerQuestHighScores");

//Define the model
const userSchema = new Schema(
  {
    email: { type: String, unique: true, lowercase: true },
    password: String,
    resetcode: Number,
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    avatar: String,
    avatarBackgroundColor: String,
    isAdmin: { type: Boolean, default: false },
    lastActiveAt: Date,
    overEighteen: { type: Boolean, default: false },
    hasCompletedSignUpFlow: { type: Boolean, default: false },
    hasSeenPushNotificationOptions: { type: Boolean, default: false },
    roles: { type: [String] },
    banned: { type: Boolean, default: false },
    rank: { type: String, default: "Page" },
    access: { type: String, default: "Free" },
    recentquestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
    friends: [{ type: Schema.Types.ObjectId, ref: "user" }],
    blockedusers: [{ type: Schema.Types.ObjectId, ref: "user" }],
    categories: [{ type: Schema.Types.ObjectId, ref: "category" }],
    expoPushTokens: [{ type: String }],
    questhighscores: [PlayerQuestHighScoresSchema],
    streak: { type: Number, default: 0 },
    gems: { type: Number, default: 20 },
    hasSeenAnnouncements: { type: Boolean, default: false },
    preferences: UserPreferencesSchema,
  },
  { timestamps: true }
);

//virtual fields not persisted to DB
//example from http://thecodebarbarian.com/mongoose-virtual-populate
userSchema.virtual("sologames", {
  ref: "gamesolo", // The model to use
  localField: "_id", // Find games where `localField`
  foreignField: "players.player", // contains `foreignField`
});

userSchema.virtual("questgames", {
  ref: "gamequest", // The model to use
  localField: "_id", // Find games where `localField`
  foreignField: "players.player", // contains `foreignField`
});

userSchema.virtual("joustgames", {
  ref: "gamejoust", // The model to use
  localField: "_id", // Find games where `localField`
  foreignField: "players.player", // contains `foreignField`
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

//On Save hook, encrypt password
userSchema.pre("save", function (next) {
  const user = this;
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

//compare passwords on login
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
};

//Create the model class
const User = mongoose.model("user", userSchema);

//Export the model
module.exports = User;
