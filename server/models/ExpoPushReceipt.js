const mongoose = require("mongoose");
const { Schema } = mongoose;
const ExpoPushReceiptIdsSchema = require("./ExpoPushReceiptIds");
const ExpoPushDataDetailsSchema = require("./ExpoPushDataDetails");

const expoPushReceiptSchema = new Schema(
  {
    id: { type: String },
    status: { type: String, required: true },
    message: { type: String },
    details: { type: ExpoPushDataDetailsSchema }
  },
  {
    timestamps: true
  }
);

//Create the model class
const ExpoPushReceipt = mongoose.model(
  "expopushreceipt",
  expoPushReceiptSchema
);

//Export the model
module.exports = ExpoPushReceipt;
