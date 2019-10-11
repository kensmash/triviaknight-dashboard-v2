const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuestionReportSchema = new Schema(
  {
    reportedby: { type: Schema.Types.ObjectId, ref: "user", required: true },
    question: { type: Schema.Types.ObjectId, ref: "question", required: true },
    message: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
      required: true
    },
    questionupdated: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
);

//Create the model class
const QuestionReport = mongoose.model("questionreport", QuestionReportSchema);

//Export the model
module.exports = QuestionReport;
