const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExpoPushDataDetailsSchema = new Schema({ error: String }, { _id: false });

module.exports = ExpoPushDataDetailsSchema;
