const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, maxlength: 60, required: true},
  email: { type: String, unique: true, maxlength: 252, required: true},
  password: { type: String, required: true }
})

const user = mongoose.model("User", userSchema);

module.exports = user;