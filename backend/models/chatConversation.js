
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ["customer", "support"],
      required: true
    },

    senderName: {
      type: String,
      default: ""
    },

    text: {
      type: String,
      required: true,
      maxlength: 5000
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true
  }
);

const chatConversationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    website: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    customerName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Visitor"
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: ""
    },

    publicTokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true
    },

    messages: {
      type: [chatMessageSchema],
      default: []
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

chatConversationSchema.index({
  owner: 1,
  lastMessageAt: -1
});

module.exports = mongoose.model(
  "ChatConversation",
  chatConversationSchema
);
