
const mongoose = require("mongoose");

// =====================================================
// CHAT MESSAGE SCHEMA
// =====================================================

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

// =====================================================
// CHAT CONVERSATION SCHEMA
// =====================================================

const chatConversationSchema = new mongoose.Schema(
  {
    // JustDoks user who owns the Banking profile.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Specific Banking profile this conversation belongs to.
    bankingAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
      index: true
    },

    // Website where the conversation originated.
    website: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    // Customer information.
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

    // Hash of the customer's private chat access token.
    // The original token is never stored in this field.
    publicTokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false
    },

    // Conversation status.
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true
    },

    // Messages belonging to this conversation.
    messages: {
      type: [chatMessageSchema],
      default: []
    },

    // Time of the most recent message.
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

// =====================================================
// DATABASE INDEXES
// =====================================================

// Quickly retrieve an owner's conversations by recent activity.
chatConversationSchema.index({
  owner: 1,
  lastMessageAt: -1
});

// Quickly retrieve conversations for a specific Banking profile.
chatConversationSchema.index({
  bankingAccount: 1,
  lastMessageAt: -1
});

// =====================================================
// EXPORT MODEL
// =====================================================

module.exports = mongoose.model(
  "ChatConversation",
  chatConversationSchema
);
