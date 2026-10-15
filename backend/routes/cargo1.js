
const express = require("express");
const mongoose = require("mongoose");

const Cargo1Shipment =
  require("../models/cargo1Shipment");

const Wallet =
  require("../models/wallet");

const Transaction =
  require("../models/transaction");

const Activity =
  require("../models/activity");

const auth =
  require("../middleware/auth");

const router = express.Router();

// ======================================================
// CARGO 1 CONSTANTS
// ======================================================

const CLEAN_SHIPPING_PRICE = 50;
const MAX_RECIPIENT_IMAGE_LENGTH = 1500000;

const ALLOWED_STATUSES = [
  "Processing",
  "Package Received",
  "In Transit",
  "Arrived",
  "Delivered",
  "Error"
];

// ======================================================
// HELPERS
// ======================================================

async function getWalletBalance(userId) {
  const wallet = await Wallet.findOne({
    user: userId
  });

  return wallet ? Number(wallet.balance) : 0;
}

async function createActivity({
  userId,
  activity,
  amount = null,
  description = "",
  reference = null,
  metadata = {},
  session = null
}) {
  const data = {
    user: userId,
    activity,
    service: "Cargo 1",
    amount,
    description,
    reference,
    metadata
  };

  if (session) {
    const records = await Activity.create(
      [data],
      { session }
    );

    return records[0];
  }

  return Activity.create(data);
}

function normalizeTrackingEvents(events) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .map(event => {
      if (!event || typeof event !== "object") {
        return null;
      }

      const status = String(event.status || "").trim();
      const location = String(event.location || "").trim();
      const description = String(event.description || "").trim();

      const timestamp = new Date(event.timestamp);

      if (
        !status ||
        !location ||
        !event.timestamp ||
        Number.isNaN(timestamp.getTime())
      ) {
        return null;
      }

      return {
        status,
        location,
        description,
        timestamp
      };
    })
    .filter(Boolean);
}

function validRecipientImage(image) {
  if (image === undefined || image === null || image === "") {
    return true;
  }

  if (typeof image !== "string") {
    return false;
  }

  if (image.length > MAX_RECIPIENT_IMAGE_LENGTH) {
    return false;
  }

  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(image);
}

function getRecipientName(firstName, lastName) {
  return [firstName, lastName]
    .map(value => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
}

function getFullRecipientAddress(shipment) {
  return [
    shipment.recipientAddress,
    shipment.recipientCity,
    shipment.recipientPostalCode,
    shipment.recipientCountry
  ]
    .filter(Boolean)
    .join(", ");
}

async function abortSession(session) {
  if (session && session.inTransaction()) {
    await session.abortTransaction();
  }
}

// ======================================================
// CREATE SHIPMENT
// POST /api/cargo1
// ======================================================

router.post("/", auth, async (req, res) => {
  let session;

  try {
    const {
      invoiceNumber,
      shipmentDate,
      shipmentTime,
      estimatedDelivery,
      estimatedDeliveryTime,
      sender,
      senderEmail,
      origin,
      recipientFirstName,
      recipientLastName,
      recipient,
      recipientEmail,
      recipientPhone,
      recipientAddress,
      recipientCity,
      recipientPostalCode,
      recipientCountry,
      recipientImage,
      packageContent,
      packageWeight,
      currentStatus,
      status,
      errorMessage,
      shippingType,
      trackingEvents
    } = req.body;

    const firstName = String(recipientFirstName || "").trim();
    const lastName = String(recipientLastName || "").trim();

    const recipientName =
      getRecipientName(firstName, lastName) ||
      String(recipient || "").trim();

    const requiredFields = [
      sender,
      origin,
      firstName,
      lastName,
      recipientPhone,
      recipientAddress,
      recipientCity,
      recipientPostalCode,
      recipientCountry,
      packageContent
    ];

    if (requiredFields.some(value => !String(value || "").trim())) {
      return res.status(400).json({
        message: "Please complete all required shipping fields."
      });
    }

    if (!validRecipientImage(recipientImage)) {
      return res.status(400).json({
        message: "The recipient image is invalid or too large. Please crop the image and try again."
      });
    }

    const finalStatus = currentStatus || status || "Processing";

    if (!ALLOWED_STATUSES.includes(finalStatus)) {
      return res.status(400).json({
        message: "Invalid shipment status."
      });
    }

    const type = shippingType === "clean" ? "clean" : "test";

    const trackingNumber =
      "C1-" + new mongoose.Types.ObjectId().toString().toUpperCase();

    const shipmentData = {
      user: req.userId,
      trackingNumber,
      invoiceNumber: invoiceNumber || "",
      shipmentDate: shipmentDate || new Date(),
      shipmentTime: shipmentTime || "",
      estimatedDelivery: estimatedDelivery || undefined,
      estimatedDeliveryTime: estimatedDeliveryTime || "",
      sender: String(sender).trim(),
      senderEmail: senderEmail || "",
      origin: String(origin).trim(),

      recipientFirstName: firstName,
      recipientLastName: lastName,
      recipient: recipientName,
      recipientEmail: recipientEmail || "",
      recipientPhone: String(recipientPhone).trim(),
      recipientAddress: String(recipientAddress).trim(),
      recipientCity: String(recipientCity).trim(),
      recipientPostalCode: String(recipientPostalCode).trim(),
      recipientCountry: String(recipientCountry).trim(),
      recipientImage: recipientImage || "",

      packageContent: String(packageContent).trim(),
      packageWeight: packageWeight || "",

      currentStatus: finalStatus,
      errorMessage: errorMessage || "",
      trackingEvents: normalizeTrackingEvents(trackingEvents),

      shippingType: type,
      paymentStatus: type === "clean" ? "paid" : "unpaid",
      paymentAmount: type === "clean" ? CLEAN_SHIPPING_PRICE : 0,
      paidAt: type === "clean" ? new Date() : undefined,
      watermarkEnabled: type !== "clean"
    };

    session = await mongoose.startSession();
    session.startTransaction();

    let newBalance = null;
    let shipment;

    if (type === "clean") {
      const wallet = await Wallet.findOne({
        user: req.userId
      }).session(session);

      if (!wallet) {
        await abortSession(session);

        return res.status(404).json({
          message: "Wallet not found."
        });
      }

      if (Number(wallet.balance) < CLEAN_SHIPPING_PRICE) {
        await abortSession(session);

        return res.status(400).json({
          message: "Insufficient wallet balance.",
          balance: Number(wallet.balance),
          required: CLEAN_SHIPPING_PRICE
        });
      }

      wallet.balance =
        Number(wallet.balance) - CLEAN_SHIPPING_PRICE;

      await wallet.save({ session });

      newBalance = Number(wallet.balance);

      const created = await Cargo1Shipment.create(
        [shipmentData],
        { session }
      );

      shipment = created[0];

      const transactions = await Transaction.create(
        [{
          user: req.userId,
          type: "charge",
          amount: -CLEAN_SHIPPING_PRICE,
          description: `Cargo 1 Clean Shipping - ${trackingNumber}`,
          source: "cargo1",
          reference: trackingNumber
        }],
        { session }
      );

      await createActivity({
        userId: req.userId,
        activity: "Cargo 1 Document Created",
        amount: -CLEAN_SHIPPING_PRICE,
        description: "Created clean Cargo 1 shipping document",
        reference: trackingNumber,
        metadata: {
          shipmentId: shipment._id,
          transactionId: transactions[0]._id,
          shippingType: "clean",
          paymentAmount: CLEAN_SHIPPING_PRICE,
          paymentStatus: "paid"
        },
        session
      });
    } else {
      const created = await Cargo1Shipment.create(
        [shipmentData],
        { session }
      );

      shipment = created[0];

      await createActivity({
        userId: req.userId,
        activity: "Cargo 1 Document Created",
        description: "Created test Cargo 1 shipping document",
        reference: trackingNumber,
        metadata: {
          shipmentId: shipment._id,
          shippingType: "test",
          paymentStatus: "unpaid",
          paymentAmount: 0
        },
        session
      });
    }

    await session.commitTransaction();

    if (newBalance === null) {
      newBalance = await getWalletBalance(req.userId);
    }

    return res.status(201).json({
      message: type === "clean"
        ? "Cargo 1 clean shipping document created successfully."
        : "Cargo 1 test shipping document created successfully.",
      shipment,
      walletBalance: newBalance,
      balance: newBalance
    });
  } catch (error) {
    if (session) {
      try {
        await abortSession(session);
      } catch (_) {}
    }

    console.error("CARGO 1 CREATE ERROR:", error);

    return res.status(500).json({
      message: "Unable to create the Cargo 1 shipment."
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// ======================================================
// LIST MY SHIPMENTS
// GET /api/cargo1/mine
// ======================================================

router.get("/mine", auth, async (req, res) => {
  try {
    const shipments = await Cargo1Shipment.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    return res.json({ shipments });
  } catch (error) {
    console.error("CARGO 1 LIST ERROR:", error);

    return res.status(500).json({
      message: "Unable to load Cargo 1 shipments."
    });
  }
});

// ======================================================
// PUBLIC TRACKING
// GET /api/cargo1/track/:trackingNumber
// ======================================================

router.get("/track/:trackingNumber", async (req, res) => {
  try {
    const shipment = await Cargo1Shipment.findOne({
      trackingNumber: req.params.trackingNumber
    }).select("-user");

    if (!shipment) {
      return res.status(404).json({
        message: "Tracking number not found."
      });
    }

    return res.json({ shipment });
  } catch (error) {
    console.error("CARGO 1 TRACKING ERROR:", error);

    return res.status(500).json({
      message: "Unable to retrieve tracking information."
    });
  }
});

// ======================================================
// EDIT SHIPMENT
// PATCH /api/cargo1/:trackingNumber
// ======================================================

router.patch("/:trackingNumber", auth, async (req, res) => {
  try {
    const shipment = await Cargo1Shipment.findOne({
      trackingNumber: req.params.trackingNumber,
      user: req.userId
    });

    if (!shipment) {
      return res.status(404).json({
        message: "Cargo 1 shipment not found."
      });
    }

    const fields = [
      "invoiceNumber",
      "shipmentDate",
      "shipmentTime",
      "estimatedDelivery",
      "estimatedDeliveryTime",
      "sender",
      "senderEmail",
      "origin",
      "recipientFirstName",
      "recipientLastName",
      "recipientEmail",
      "recipientPhone",
      "recipientAddress",
      "recipientCity",
      "recipientPostalCode",
      "recipientCountry",
      "recipientImage",
      "packageContent",
      "packageWeight",
      "errorMessage"
    ];

    if (
      req.body.recipientImage !== undefined &&
      !validRecipientImage(req.body.recipientImage)
    ) {
      return res.status(400).json({
        message: "The recipient image is invalid or too large."
      });
    }

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        shipment[field] = req.body[field];
      }
    }

    if (
      req.body.recipient !== undefined &&
      req.body.recipientFirstName === undefined &&
      req.body.recipientLastName === undefined
    ) {
      shipment.recipient = req.body.recipient;
    } else if (
      req.body.recipientFirstName !== undefined ||
      req.body.recipientLastName !== undefined
    ) {
      shipment.recipient = getRecipientName(
        shipment.recipientFirstName,
        shipment.recipientLastName
      );
    }

    if (req.body.currentStatus !== undefined || req.body.status !== undefined) {
      const newStatus =
        req.body.currentStatus || req.body.status;

      if (!ALLOWED_STATUSES.includes(newStatus)) {
        return res.status(400).json({
          message: "Invalid shipment status."
        });
      }

      shipment.currentStatus = newStatus;
    }

    if (req.body.trackingEvents !== undefined) {
      shipment.trackingEvents =
        normalizeTrackingEvents(req.body.trackingEvents);
    }

    await shipment.save();

    await createActivity({
      userId: req.userId,
      activity: "Cargo 1 Shipment Updated",
      description: "Cargo 1 shipping document was updated",
      reference: shipment.trackingNumber,
      metadata: {
        shipmentId: shipment._id,
        shippingType: shipment.shippingType,
        currentStatus: shipment.currentStatus,
        trackingEvents: shipment.trackingEvents.length
      }
    });

    const walletBalance = await getWalletBalance(req.userId);

    return res.json({
      message: "Cargo 1 shipment updated successfully.",
      shipment,
      walletBalance,
      balance: walletBalance
    });
  } catch (error) {
    console.error("CARGO 1 UPDATE ERROR:", error);

    return res.status(500).json({
      message: "Unable to update the Cargo 1 shipment."
    });
  }
});

// ======================================================
// UPDATE SHIPMENT STATUS
// PATCH /api/cargo1/:trackingNumber/status
// ======================================================

router.patch("/:trackingNumber/status", auth, async (req, res) => {
  try {
    const shipment = await Cargo1Shipment.findOne({
      trackingNumber: req.params.trackingNumber,
      user: req.userId
    });

    if (!shipment) {
      return res.status(404).json({
        message: "Cargo 1 shipment not found."
      });
    }

    const newStatus =
      req.body.currentStatus ||
      req.body.status ||
      "Processing";

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        message: "Invalid shipment status."
      });
    }

    shipment.currentStatus = newStatus;

    if (req.body.errorMessage !== undefined) {
      shipment.errorMessage = req.body.errorMessage;
    } else {
      shipment.errorMessage = "";
    }

    await shipment.save();

    await createActivity({
      userId: req.userId,
      activity: "Cargo 1 Status Updated",
      description: `Cargo 1 status changed to ${newStatus}`,
      reference: shipment.trackingNumber,
      metadata: {
        shipmentId: shipment._id,
        status: newStatus,
        errorMessage: shipment.errorMessage
      }
    });

    return res.json({
      message: "Cargo 1 status updated successfully.",
      shipment
    });
  } catch (error) {
    console.error("CARGO 1 STATUS ERROR:", error);

    return res.status(500).json({
      message: "Unable to update the Cargo 1 status."
    });
  }
});

// ======================================================
// REMOVE WATERMARK / UPGRADE
// PATCH /api/cargo1/:trackingNumber/upgrade
// ======================================================

router.patch("/:trackingNumber/upgrade", auth, async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const trackingNumber = req.params.trackingNumber;

    const shipment = await Cargo1Shipment.findOne({
      trackingNumber,
      user: req.userId
    }).session(session);

    if (!shipment) {
      await abortSession(session);

      return res.status(404).json({
        message: "Cargo 1 shipment not found."
      });
    }

    if (
      shipment.paymentStatus === "paid" &&
      shipment.watermarkEnabled === false
    ) {
      await abortSession(session);

      const balance = await getWalletBalance(req.userId);

      return res.json({
        message: "This Cargo 1 shipment is already clean.",
        shipment,
        walletBalance: balance,
        balance
      });
    }

    const wallet = await Wallet.findOne({
      user: req.userId
    }).session(session);

    if (!wallet) {
      await abortSession(session);

      return res.status(404).json({
        message: "Wallet not found."
      });
    }

    if (Number(wallet.balance) < CLEAN_SHIPPING_PRICE) {
      await abortSession(session);

      return res.status(400).json({
        message: "Insufficient wallet balance.",
        balance: Number(wallet.balance),
        required: CLEAN_SHIPPING_PRICE
      });
    }

    wallet.balance =
      Number(wallet.balance) - CLEAN_SHIPPING_PRICE;

    await wallet.save({ session });

    shipment.paymentStatus = "paid";
    shipment.paymentAmount = CLEAN_SHIPPING_PRICE;
    shipment.watermarkEnabled = false;
    shipment.paidAt = new Date();
    shipment.shippingType = "clean";

    await shipment.save({ session });

    const transactions = await Transaction.create(
      [{
        user: req.userId,
        type: "charge",
        amount: -CLEAN_SHIPPING_PRICE,
        description: `Cargo 1 Remove Watermark - ${trackingNumber}`,
        source: "cargo1",
        reference: trackingNumber
      }],
      { session }
    );

    await createActivity({
      userId: req.userId,
      activity: "Cargo 1 Document Upgraded",
      amount: -CLEAN_SHIPPING_PRICE,
      description: "Removed Cargo 1 shipping document watermark",
      reference: trackingNumber,
      metadata: {
        shipmentId: shipment._id,
        transactionId: transactions[0]._id,
        upgrade: "watermark_removal",
        shippingType: "clean",
        paymentAmount: CLEAN_SHIPPING_PRICE
      },
      session
    });

    await session.commitTransaction();

    return res.json({
      message: "Cargo 1 watermark removed successfully.",
      shipment,
      walletBalance: Number(wallet.balance),
      balance: Number(wallet.balance)
    });
  } catch (error) {
    if (session) {
      try {
        await abortSession(session);
      } catch (_) {}
    }

    console.error("CARGO 1 UPGRADE ERROR:", error);

    return res.status(500).json({
      message: "Unable to upgrade the Cargo 1 shipment."
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// ======================================================
// DELETE SHIPMENT
// DELETE /api/cargo1/:trackingNumber
// ======================================================

router.delete("/:trackingNumber", auth, async (req, res) => {
  try {
    const shipment = await Cargo1Shipment.findOne({
      trackingNumber: req.params.trackingNumber,
      user: req.userId
    });

    if (!shipment) {
      return res.status(404).json({
        message: "Cargo 1 shipment not found."
      });
    }

    await Cargo1Shipment.deleteOne({
      _id: shipment._id,
      user: req.userId
    });

    await createActivity({
      userId: req.userId,
      activity: "Cargo 1 Shipment Deleted",
      description: "Cargo 1 shipping document was deleted",
      reference: shipment.trackingNumber,
      metadata: {
        shipmentId: shipment._id,
        shippingType: shipment.shippingType
      }
    });

    return res.json({
      message: "Cargo 1 shipment deleted successfully.",
      trackingNumber: shipment.trackingNumber
    });
  } catch (error) {
    console.error("CARGO 1 DELETE ERROR:", error);

    return res.status(500).json({
      message: "Unable to delete the Cargo 1 shipment."
    });
  }
});

module.exports = router;
