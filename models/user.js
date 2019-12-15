var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    email: {type: String, unique: true, required: true},
    profilePic: {type: String, default: "https://www.sackettwaconia.com/wp-content/uploads/default-profile.png"},
    firstName: String,
    lastName: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);