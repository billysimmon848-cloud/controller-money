const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    loginAt: {
      type: Date,
      default: Date.now,
      required: true
    },

    ipAddress: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);


// ======================================================
// INDEX
// ======================================================

loginHistorySchema.index({
  user: 1,
  loginAt: -1
});


module.exports =
  mongoose.model(
    "LoginHistory",
    loginHistorySchema
  );