const mongoose = require("mongoose");
const { Schema } = mongoose; //assign Schema from the mongoose object to the Schema variable

const announcementSchema = new Schema(
  {
    headline: { type: String, required: true, minlength: 1, trim: true },
    text: { type: String, required: true, minlength: 1, trim: true },
    imageurl: { type: String },
    published: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "announcements" }
);

//Create the model class
const Announcement = mongoose.model("announcement", announcementSchema);

//Export the model
module.exports = Announcement;
