const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, minlength: 5, maxlength: 100, required: true },
  url: { type: String, minlength: 30, maxlength: 120, required: true },
  category: { type: String, minlength:1 , maxlength: 40, required: true },
  createdAt: { type: Date, default: Date.now() },
  user_id: { type: mongoose.Schema.Types.ObjectID, required: true }
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;