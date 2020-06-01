const mongoose = require("mongoose");
const { Schema } = mongoose;
const AnswerSchema = require("./Answer");
const QuestionReport = require("./QuestionReport");

const QuestionSchema = new Schema(
  {
    question: { type: String, required: true, minlength: 8, trim: true },
    answers: { type: [AnswerSchema], required: true },
    category: { type: Schema.Types.ObjectId, ref: "category", required: true },
    type: {
      type: String,
      required: true,
      default: "Multiple Choice",
    },
    difficulty: {
      type: String,
      required: true,
      default: "Normal",
    },
    media: {
      type: String,
      required: true,
      default: "none", //could do audio, video, image
    },
    imageurl: String,
    videourl: String,
    audiourl: String,
    published: { type: Boolean, default: false },
    guessable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuestionSchema.pre("remove", function (next) {
  QuestionReport.remove({ question: { $eq: this._id } }).then(() => next());
});

//Create the model class
const Question = mongoose.model("question", QuestionSchema);

//Export the model
module.exports = Question;
