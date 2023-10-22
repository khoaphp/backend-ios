const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
    Email:  String,
    Token: String,
    Status:Boolean,
    RegisterDate:Date
})

module.exports = mongoose.model("tokens", tokenSchema);

