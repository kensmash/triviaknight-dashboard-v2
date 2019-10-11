const mongoose = require("mongoose");
const { Schema } = mongoose;

const SupportRequestSchema = new Schema(
  {
    from: { type: String },
    text: { type: String },
    subject: { type: String },
    replysent: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

//Create the model class
const SupportRequest = mongoose.model("supportrequest", SupportRequestSchema);

//Export the model
module.exports = SupportRequest;
