const mongoose = require("mongoose");

const bnbDepositSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      address: {
        type: String,
        required: true,
        trim: true
      },

      transactionHash: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },

      amountBnb: {
        type: Number,
        required: true,
        min: 0
      },

      blockNumber: {
        type: Number,
        required: true
      },

      confirmations: {
        type: Number,
        default: 0
      },

      status: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "processing",
          "credited"
        ],
        default: "pending"
      },

      usdAmount: {
        type: Number,
        default: null
      },

      exchangeRate: {
        type: Number,
        default: null
      },

      creditedAt: {
        type: Date,
        default: null
      },

      walletTransactionId: {
        type:
          mongoose.Schema.Types.ObjectId,
        default: null
      },

      sweepTransactionHash: {
        type: String,
        default: null
      },

      sweepFeeBnb: {
        type: Number,
        default: null
      },

      sweptAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.models.BnbDeposit ||
  mongoose.model(
    "BnbDeposit",
    bnbDepositSchema
  );