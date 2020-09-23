const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoryGroupSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, trim: true },
    iconname: { type: String, trim: true },
    displaytext: { type: String, required: true, minlength: 3, trim: true },
    headercolor: { type: String },
    active: { type: Boolean, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: "category" }],
  },
  { timestamps: true }
);

//Create the model class
const CategoryGroups = mongoose.model("categorygroups", categoryGroupSchema);

//Export the model
module.exports = CategoryGroups;
