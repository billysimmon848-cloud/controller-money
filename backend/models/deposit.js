const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  depositAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DepositAddress",
    required: true
  },

  amountBNB: {
    type: Number,
    default: 0
  },

  amountUSD: {
    type: Number,
    default: 0
  },

  transactionHash: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "pending"
  },

  expiresAt: {
    type: Date,
    required: true
  },

  creditedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Deposit", depositSchema);