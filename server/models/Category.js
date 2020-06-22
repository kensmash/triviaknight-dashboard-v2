const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 60,
      trim: true,
    },
    imageurl: String,
    description: String,
    iconname: { type: String, trim: true },
    type: { type: Schema.Types.ObjectId, ref: "categorytype", required: true },
    genres: [{ type: Schema.Types.ObjectId, ref: "categorygenres" }],
    partycategory: { type: Boolean, default: false },
    joustexclusive: { type: Boolean, default: false },
    questactive: { type: Boolean, default: false },
    questdescription: { type: String, trim: true },
    nextquestactive: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    showasnew: { type: Boolean, default: false },
    newpushsent: { type: Boolean, default: false },
    showasupdated: { type: Boolean, default: false },
    updatedpushsent: { type: Boolean, default: false },
    showaspopular: { type: Boolean, default: false },
    publishedAt: Date,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

//virtual field not persisted to DB
//https://stackoverflow.com/questions/41647919/how-do-i-query-a-virtual-field-using-mongoose
categorySchema.virtual("questions", {
  ref: "question", // The model to use
  localField: "_id", // Find questions where `localField`
  foreignField: "category", // contains `foreignField`
});

categorySchema.virtual("followers", {
  ref: "user", // The model to use
  localField: "_id", // Find questions where `localField`
  foreignField: "categories", // contains `foreignField`
});

//Create the model class
const Category = mongoose.model("category", categorySchema);

//Export the model
module.exports = Category;
