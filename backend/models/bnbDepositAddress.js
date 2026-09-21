const mongoose = require("mongoose");

const bnbDepositAddressSchema =
  new mongoose.Schema(
    {

      // =========================
      // USER
      // =========================
      //
      // Each user gets one
      // permanent BNB address.
      //
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        unique: true
      },


      // =========================
      // BNB DEPOSIT ADDRESS
      // =========================
      //
      // This is the public address
      // the user will send BNB to.
      //
      address: {
        type: String,

        required: true,

        unique: true,

        trim: true
      },


      // =========================
      // DERIVATION INDEX
      // =========================
      //
      // Used later by the HD wallet
      // system.
      //
      // Example:
      //
      // User 1 = 0
      // User 2 = 1
      // User 3 = 2
      //
      derivationIndex: {
        type: Number,

        required: true,

        unique: true,

        min: 0
      },


      // =========================
      // ACTIVE
      // =========================
      //
      // Normally this remains true.
      //
      // We keep this field so the
      // address can be disabled later
      // without deleting the record.
      //
      active: {
        type: Boolean,

        default: true
      }

    },

    {
      timestamps: true
    }
  );


// ======================================================
// EXPORT MODEL
// ======================================================

module.exports =
  mongoose.models.BnbDepositAddress ||
  mongoose.model(
    "BnbDepositAddress",
    bnbDepositAddressSchema
  );