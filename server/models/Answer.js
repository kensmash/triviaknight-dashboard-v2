const mongoose = require("mongoose");
const { Schema } = mongoose; //assign Schema from the mongoose object to the Schema variable

const answerSchema = new Schema(
  {
    answer: { type: String, required: true, minlength: 1, trim: true },
    correct: { type: Boolean, default: false }
  },
  { _id: false }
);

module.exports = answerSchema;
