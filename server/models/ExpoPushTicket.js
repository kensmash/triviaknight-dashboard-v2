const mongoose = require("mongoose");
const { Schema } = mongoose;
const ExpoPushDataDetailsSchema = require("./ExpoPushDataDetails");

const expoPushTicketSchema = new Schema(
  {
    type: { type: String },
    status: { type: String, required: true },
    id: { type: String },
    message: { type: String },
    details: { type: ExpoPushDataDetailsSchema },
    receiptFetched: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

//Create the model class
const ExpoPushTicket = mongoose.model("expopushticket", expoPushTicketSchema);

//Export the model
module.exports = ExpoPushTicket;
