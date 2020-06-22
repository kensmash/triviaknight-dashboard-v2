const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoryGenreSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, trim: true },
    playable: { type: Boolean, default: false },
    questactive: { type: Boolean, default: false },
    questdescription: { type: String, trim: true },
    nextquestactive: { type: Boolean, default: false },
    categorytypes: [
      { type: Schema.Types.ObjectId, ref: "categorytype", required: true },
    ],
  },
  { timestamps: true }
);

categoryGenreSchema.virtual("categories", {
  ref: "category", // The model to use
  localField: "_id", // Find questions where `localField`
  foreignField: "genres", // contains `foreignField`
});

//Create the model class
const CategoryGenres = mongoose.model("categorygenres", categoryGenreSchema);

//Export the model
module.exports = CategoryGenres;
