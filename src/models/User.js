// MONGOOSE to access mongoDB:
const mongoose = require("mongoose");
const PointSchema = require("./utils/PointSchema");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  passOriginal: { type: String, required: true },
  location: {
    type: PointSchema,
    index: "2dsphere",
  },
  facebookId: String,
  created_at: { type: Date, required: true },
  deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model("User", UserSchema);
