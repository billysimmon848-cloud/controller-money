const mongoose = require("mongoose");


// ======================================================
// TRANSACTION SCHEMA
// ======================================================

const transactionSchema = new mongoose.Schema(
  {

    // ==================================================
    // USER
    // ==================================================

    user: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true

    },


    // ==================================================
    // TRANSACTION TYPE
    // ==================================================

    type: {

      type: String,

      enum: [

        "deposit",

        "charge",

        "refund",

        "admin_credit",

        "admin_debit",

        "transfer"

      ],

      required: true,

      index: true

    },


    // ==================================================
    // AMOUNT
    // ==================================================
    //
    // Positive amount = money added
    //
    // Negative amount = money removed
    //
    // Example:
    //
    // deposit      +20
    // charge        -5
    // refund        +5
    // admin_credit +50
    // admin_debit  -10
    // transfer     +20 / -20
    //
    // ==================================================

    amount: {

      type: Number,

      required: true,

      validate: {

        validator: function (value) {

          return (
            Number.isFinite(value) &&
            value !== 0
          );

        },

        message:
          "Transaction amount must be a valid non-zero number."

      }

    },


    // ==================================================
    // DESCRIPTION
    // ==================================================

    description: {

      type: String,

      default: "",

      trim: true

    },


    // ==================================================
    // SOURCE
    // ==================================================
    //
    // Identifies what caused the transaction.
    //
    // ==================================================

    source: {

      type: String,

      enum: [

        "wallet_deposit",

        "cargo",

        "banking",

        "flight",

        "graphics",

        "admin",

        "bnb",

        "transfer",

        "other"

      ],

      default: "other"

    },


    // ==================================================
    // REFERENCE
    // ==================================================
    //
    // Can contain a shipment ID, banking account ID,
    // payment ID, document ID, transfer ID, etc.
    //
    // ==================================================

    reference: {

      type: String,

      default: "",

      trim: true,

      index: true

    },


    // ==================================================
    // CREATED BY
    // ==================================================
    //
    // Useful for admin actions.
    //
    // For example:
    //
    // Admin A credits User B $50.
    //
    // `createdBy` stores Admin A's user ID.
    //
    // ==================================================

    createdBy: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null

    }

  },

  {

    timestamps: true

  }
);


// ======================================================
// INDEX
// ======================================================

transactionSchema.index({
  user: 1,
  createdAt: -1
});


// ======================================================
// MODEL
// ======================================================

module.exports =
  mongoose.models.Transaction ||
  mongoose.model(
    "Transaction",
    transactionSchema
  );