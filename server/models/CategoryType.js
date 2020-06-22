const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoryTypeSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 4, trim: true },
    iconname: { type: String, trim: true },
    iconset: { type: String, trim: true },
    hasgenres: { type: Boolean, required: true, default: true },
    playable: { type: Boolean, default: false },
    questactive: { type: Boolean, default: false },
    questdescription: { type: String, trim: true },
    nextquestactive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categoryTypeSchema.virtual("categories", {
  ref: "category", // The model to use
  localField: "_id", // Find questions where `localField`
  foreignField: "type", // contains `foreignField`
});

//Create the model class
const CategoryType = mongoose.model("categorytype", categoryTypeSchema);

//Export the model
module.exports = CategoryType;
