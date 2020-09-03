const mongoose = require("mongoose");
const { Schema } = mongoose; //assign Schema from the mongoose object to the Schema variable

const announcementSchema = new Schema({
  headline: { type: String, required: true, minlength: 1, trim: true },
  text: { type: String, required: true, minlength: 1, trim: true },
  imageurl: { type: String },
});

module.exports = announcementSchema;
