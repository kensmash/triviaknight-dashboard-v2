const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExpoPushReceiptIdsSchema = new Schema({ status: String }, { _id: false });

module.exports = ExpoPushReceiptIdsSchema;
