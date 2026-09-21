const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
  {
    // ======================================================
    // OWNER
    // ======================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    // ======================================================
    // ACCOUNT INFORMATION
    // ======================================================

    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    accountPin: {
      type: String,
      required: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    accountType: {
      type: String,
      required: true
    },

    accountCurrency: {
      type: String,
      required: true,
      default: "USD"
    },


    // ======================================================
    // BANKING PLAN / SUBSCRIPTION
    // ======================================================

    plan: {
      type: String,
      enum: ["free", "clean"],
      default: "free"
    },

    planPrice: {
      type: Number,
      default: 0
    },

    planStatus: {
      type: String,
      enum: ["demo", "paid", "expired"],
      default: "demo"
    },

    subscriptionStartedAt: {
      type: Date,
      default: null
    },

    subscriptionExpiresAt: {
      type: Date,
      default: null
    },


    // ======================================================
    // TRANSACTION SETTINGS
    // ======================================================

    transactionProcessingTime: {
      type: String,
      required: true,
      default: "0"
    },


    // ======================================================
    // WITHDRAWAL SETTINGS
    // ======================================================

    withdrawalEnabled: {
      type: Boolean,
      default: true
    },

    withdrawalErrorMessage: {
      type: String,
      default: "Withdrawal is currently unavailable."
    },


    // ======================================================
    // CUSTOMER-FACING ACCOUNT ERROR
    // ======================================================

    errorMessage: {
      type: String,
      default: ""
    },


    // ======================================================
    // PROFILE
    // ======================================================

    profilePicture: {
      type: String,
      default: ""
    },


    // ======================================================
    // BALANCE
    // ======================================================

    balance: {
      type: Number,
      default: 0
    },


    // ======================================================
    // TRANSACTIONS
    // ======================================================

    transactions: {
      type: Array,
      default: []
    }
  },

  {
    timestamps: true
  }
);


module.exports = mongoose.model(
  "BankAccount",
  bankAccountSchema
);