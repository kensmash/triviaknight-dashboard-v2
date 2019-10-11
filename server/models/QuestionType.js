const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionTypeSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 4, trim: true }
  },
  { timestamps: true }
);

//Create the model class
const QuestionType = mongoose.model("questiontype", questionTypeSchema);

//Export the model
module.exports = QuestionType;
