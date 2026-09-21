const mongoose = require("mongoose");

const depositAddressSchema = new mongoose.Schema({

  address: {
    type: String,
    required: true,
    unique: true
  },

  network: {
    type: String,
    default: "BNB Smart Chain"
  },

  active: {
    type: Boolean,
    default: true
  },

  inUse: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "DepositAddress",
  depositAddressSchema
);