const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    
    Avatar:String,
    Name:String,
    Point:Number,

    Active:Boolean,
    RegisterDate:Date,
})

module.exports = mongoose.model("player", userSchema);

