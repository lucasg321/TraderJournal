//Schema Setup
var mongoose = require("mongoose");

var tradeSchema = new mongoose.Schema({
    username: String,
    image: String, //add default --> {type: String, default: "placeholderimg.jpg"}
    ticker: String,
    type: String, //long or short
    winOrLoss: String,
    avgOpen: Number,
    avgClose: Number,
    stop: Number,
    description: String,
    postDate: String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Trade", tradeSchema); //create model for trade from schema