
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const ChatConversation = require("../models/chatConversation");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();


// ======================================================
// HELPERS
// ======================================================

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}


function validConversationId(id) {
  return mongoose.isValidObjectId(id);
}


function validText(text) {
  return (
    typeof text === "string" &&
    text.trim().length > 0 &&
    text.trim().length <= 5000
  );
}


function getSupportName(website) {
  const site = String(website || "").toLowerCase();

  if (site.includes("zenitcu")) {
    return "ZenitCU Support";
  }

  if (site.includes("zenditcargo")) {
    return "ZenditCargo Support";
  }

  if (site.includes("travellnest")) {
    return "Travellnest Support";
  }

  return "Customer Support";
}


async function getPublicConversation(req) {
  const token = req.get("x-chat-token");

  if (!token || token.length > 200) {
    return null;
  }

  const conversation = await ChatConversation.findById(
    req.params.conversationId
  ).select("+publicTokenHash");

  if (!conversation) {
    return null;
  }

  const suppliedHash = hashToken(token);

  const savedHash = conversation.publicTokenHash;

  if (
    !savedHash ||
    suppliedHash.length !== savedHash.length ||
    !crypto.timingSafeEqual(
      Buffer.from(suppliedHash, "hex"),
      Buffer.from(savedHash, "hex")
    )
  ) {
    return null;
  }

  return conversation;
}


// ======================================================
// START CUSTOMER CONVERSATION
// POST /api/chat/public/conversations
// ======================================================

router.post(
  "/public/conversations",
  async (req, res) => {
    try {
      const {
        ownerId,
        website,
        customerName,
        customerEmail,
        message
      } = req.body;

      if (
        !ownerId ||
        !mongoose.isValidObjectId(ownerId)
      ) {
        return res.status(400).json({
          message: "A valid website owner is required"
        });
      }

      if (
        typeof website !== "string" ||
        !website.trim() ||
        website.trim().length > 120
      ) {
        return res.status(400).json({
          message: "Website is required"
        });
      }

      if (!validText(message)) {
        return res.status(400).json({
          message: "A message of 1–5000 characters is required"
        });
      }

      if (
        customerName !== undefined &&
        (
          typeof customerName !== "string" ||
          customerName.trim().length > 100
        )
      ) {
        return res.status(400).json({
          message: "Customer name is too long or invalid"
        });
      }

      if (
        customerEmail !== undefined &&
        (
          typeof customerEmail !== "string" ||
          customerEmail.trim().length > 254
        )
      ) {
        return res.status(400).json({
          message: "Customer email is too long or invalid"
        });
      }

      const owner = await User.findById(ownerId)
        .select("_id isDisabled");

      if (!owner || owner.isDisabled) {
        return res.status(404).json({
          message: "Chat account is unavailable"
        });
      }

      const publicToken = crypto
        .randomBytes(32)
        .toString("hex");

      const conversation = await ChatConversation.create({
        owner: owner._id,

        website: website.trim(),

        customerName:
          customerName && customerName.trim()
            ? customerName.trim()
            : "Visitor",

        customerEmail:
          customerEmail
            ? customerEmail.trim().toLowerCase()
            : "",

        publicTokenHash: hashToken(publicToken),

        messages: [
          {
            senderType: "customer",
            senderName:
              customerName && customerName.trim()
                ? customerName.trim()
                : "Visitor",
            text: message.trim(),
            createdAt: new Date()
          }
        ],

        lastMessageAt: new Date()
      });

      return res.status(201).json({
        message: "Chat started successfully",

        conversationId: conversation._id,

        publicToken,

        conversation: {
          id: conversation._id,
          website: conversation.website,
          customerName: conversation.customerName,
          status: conversation.status,
          messages: conversation.messages
        }
      });
    } catch (error) {
      console.error("START CHAT ERROR:", error);

      return res.status(500).json({
        message: "Unable to start chat"
      });
    }
  }
);


// ======================================================
// GET CUSTOMER MESSAGES
// GET /api/chat/public/conversations/:conversationId/messages
// ======================================================

router.get(
  "/public/conversations/:conversationId/messages",
  async (req, res) => {
    try {
      if (!validConversationId(req.params.conversationId)) {
        return res.status(400).json({
          message: "Invalid conversation ID"
        });
      }

      const conversation = await getPublicConversation(req);

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }

      return res.json({
        conversationId: conversation._id,
        website: conversation.website,
        status: conversation.status,
        messages: conversation.messages
      });
    } catch (error) {
      console.error("GET CUSTOMER CHAT ERROR:", error);

      return res.status(500).json({
        message: "Unable to load messages"
      });
    }
  }
);


// ======================================================
// CUSTOMER SENDS MESSAGE
// POST /api/chat/public/conversations/:conversationId/messages
// ======================================================

router.post(
  "/public/conversations/:conversationId/messages",
  async (req, res) => {
    try {
      if (!validConversationId(req.params.conversationId)) {
        return res.status(400).json({
          message: "Invalid conversation ID"
        });
      }

      const { text, customerName } = req.body;

      if (!validText(text)) {
        return res.status(400).json({
          message: "A message of 1–5000 characters is required"
        });
      }

      const conversation = await getPublicConversation(req);

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }

      if (conversation.status === "closed") {
        return res.status(403).json({
          message: "This conversation is closed"
        });
      }

      const senderName =
        customerName &&
        typeof customerName === "string" &&
        customerName.trim()
          ? customerName.trim().slice(0, 100)
          : conversation.customerName;

      conversation.messages.push({
        senderType: "customer",
        senderName,
        text: text.trim(),
        createdAt: new Date()
      });

      conversation.lastMessageAt = new Date();

      await conversation.save();

      return res.status(201).json({
        message: "Message sent",
        chatMessage:
          conversation.messages[
            conversation.messages.length - 1
          ]
      });
    } catch (error) {
      console.error("CUSTOMER SEND MESSAGE ERROR:", error);

      return res.status(500).json({
        message: "Unable to send message"
      });
    }
  }
);


// ======================================================
// CONTROLLER INBOX
// GET /api/chat/inbox
// ======================================================

router.get(
  "/inbox",
  auth,
  async (req, res) => {
    try {
      const conversations = await ChatConversation.find({
        owner: req.userId
      })
        .select(
          "website customerName customerEmail status lastMessageAt createdAt messages"
        )
        .sort({
          lastMessageAt: -1
        })
        .limit(100)
        .lean();

      const inbox = conversations.map(conversation => {
        const messages = conversation.messages || [];

        return {
          id: conversation._id,
          website: conversation.website,
          customerName: conversation.customerName,
          customerEmail: conversation.customerEmail,
          status: conversation.status,
          createdAt: conversation.createdAt,
          lastMessageAt: conversation.lastMessageAt,
          lastMessage:
            messages.length
              ? messages[messages.length - 1]
              : null
        };
      });

      return res.json({
        conversations: inbox
      });
    } catch (error) {
      console.error("CHAT INBOX ERROR:", error);

      return res.status(500).json({
        message: "Unable to load chat inbox"
      });
    }
  }
);


// ======================================================
// CONTROLLER READS CONVERSATION
// GET /api/chat/:conversationId/messages
// ======================================================

router.get(
  "/:conversationId/messages",
  auth,
  async (req, res) => {
    try {
      if (!validConversationId(req.params.conversationId)) {
        return res.status(400).json({
          message: "Invalid conversation ID"
        });
      }

      const conversation = await ChatConversation.findOne({
        _id: req.params.conversationId,
        owner: req.userId
      }).select("-publicTokenHash");

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }

      return res.json({
        conversation: {
          id: conversation._id,
          website: conversation.website,
          customerName: conversation.customerName,
          customerEmail: conversation.customerEmail,
          status: conversation.status,
          messages: conversation.messages
        }
      });
    } catch (error) {
      console.error("CONTROLLER GET CHAT ERROR:", error);

      return res.status(500).json({
        message: "Unable to load conversation"
      });
    }
  }
);


// ======================================================
// CONTROLLER REPLIES
// POST /api/chat/:conversationId/messages
// ======================================================

router.post(
  "/:conversationId/messages",
  auth,
  async (req, res) => {
    try {
      if (!validConversationId(req.params.conversationId)) {
        return res.status(400).json({
          message: "Invalid conversation ID"
        });
      }

      const { text } = req.body;

      if (!validText(text)) {
        return res.status(400).json({
          message: "A message of 1–5000 characters is required"
        });
      }

      const conversation = await ChatConversation.findOne({
        _id: req.params.conversationId,
        owner: req.userId
      });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }

      if (conversation.status === "closed") {
        return res.status(403).json({
          message: "This conversation is closed"
        });
      }

      conversation.messages.push({
        senderType: "support",
        senderName: getSupportName(conversation.website),
        text: text.trim(),
        createdAt: new Date()
      });

      conversation.lastMessageAt = new Date();

      await conversation.save();

      return res.status(201).json({
        message: "Reply sent",
        chatMessage:
          conversation.messages[
            conversation.messages.length - 1
          ]
      });
    } catch (error) {
      console.error("CONTROLLER REPLY ERROR:", error);

      return res.status(500).json({
        message: "Unable to send reply"
      });
    }
  }
);


// ======================================================
// OPEN OR CLOSE CONVERSATION
// PATCH /api/chat/:conversationId/status
// ======================================================

router.patch(
  "/:conversationId/status",
  auth,
  async (req, res) => {
    try {
      if (!validConversationId(req.params.conversationId)) {
        return res.status(400).json({
          message: "Invalid conversation ID"
        });
      }

      const { status } = req.body;

      if (!["open", "closed"].includes(status)) {
        return res.status(400).json({
          message: "Status must be open or closed"
        });
      }

      const conversation = await ChatConversation.findOneAndUpdate(
        {
          _id: req.params.conversationId,
          owner: req.userId
        },
        {
          $set: { status }
        },
        {
          new: true
        }
      ).select("-publicTokenHash");

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found"
        });
      }

      return res.json({
        message: "Conversation status updated",
        status: conversation.status
      });
    } catch (error) {
      console.error("UPDATE CHAT STATUS ERROR:", error);

      return res.status(500).json({
        message: "Unable to update conversation status"
      });
    }
  }
);


module.exports = router;
