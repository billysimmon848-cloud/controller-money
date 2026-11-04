const mongoose = require("mongoose");

const graphicsSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  background: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Free", "Clean"],
    default: "Free",
    required: true
  },

  // GridFS image references

  cleanImageId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  freeImageId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }

}, {
  timestamps: true
});

module.exports =
  mongoose.models.Graphics ||
  mongoose.model("Graphics", graphicsSchema);