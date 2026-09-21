const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =========================
    // USER NAME
    // =========================
    name: {
      type: String,
      required: true,
      trim: true
    },

    // =========================
    // EMAIL
    // =========================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // =========================
    // PASSWORD
    // =========================
    password: {
      type: String,
      required: true
    },

    // =========================
    // USER ROLE
    // =========================
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true
    },

    // =========================
    // ACCOUNT STATUS
    // =========================
    isDisabled: {
      type: Boolean,
      default: false
    },

    lastLoginAt: {
      type: Date,
      default: null
    },

    lastLoginIp: {
      type: String,
      default: null
    },

    // =========================
    // PASSWORD RESET TOKEN
    // =========================
    resetPasswordToken: {
      type: String,
      default: null
    },

    // =========================
    // PASSWORD RESET EXPIRATION
    // =========================
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);