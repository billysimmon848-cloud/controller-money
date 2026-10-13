
const mongoose = require("mongoose");

// ======================================================
// TRACKING EVENT
// ======================================================

const cargo1TrackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

// ======================================================
// CARGO 1 SHIPMENT MODEL
// ======================================================

const cargo1ShipmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    trackingNumber: {
      type: String,
      required: true,
      unique: true
    },

    invoiceNumber: {
      type: String,
      default: ""
    },

    shipmentDate: {
      type: Date,
      default: Date.now
    },

    shipmentTime: {
      type: String,
      default: ""
    },

    estimatedDelivery: {
      type: Date
    },

    estimatedDeliveryTime: {
      type: String,
      default: ""
    },

    // Sender information
    sender: {
      type: String,
      required: true
    },

    senderEmail: {
      type: String,
      default: ""
    },

    origin: {
      type: String,
      required: true
    },

    // Recipient information
    recipientFirstName: {
      type: String,
      required: true,
      trim: true
    },

    recipientLastName: {
      type: String,
      required: true,
      trim: true
    },

    recipient: {
      type: String,
      required: true
    },

    recipientEmail: {
      type: String,
      default: ""
    },

    recipientPhone: {
      type: String,
      required: true,
      trim: true
    },

    recipientAddress: {
      type: String,
      required: true
    },

    recipientCity: {
      type: String,
      required: true
    },

    recipientPostalCode: {
      type: String,
      required: true
    },

    recipientCountry: {
      type: String,
      required: true
    },

    recipientImage: {
      type: String,
      default: ""
    },

    // Package information
    packageContent: {
      type: String,
      required: true
    },

    packageWeight: {
      type: String,
      default: ""
    },

    // Shipment status
    currentStatus: {
      type: String,
      enum: [
        "Processing",
        "Package Received",
        "In Transit",
        "Arrived",
        "Delivered",
        "Error"
      ],
      default: "Processing"
    },

    errorMessage: {
      type: String,
      default: ""
    },

    trackingEvents: {
      type: [cargo1TrackingEventSchema],
      default: []
    },

    // Payment and watermark
    shippingType: {
      type: String,
      enum: ["test", "clean"],
      default: "test"
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid"
    },

    paymentAmount: {
      type: Number,
      default: 0
    },

    paidAt: {
      type: Date
    },

    watermarkEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "cargo1shipments"
  }
);

module.exports =
  mongoose.models.Cargo1Shipment ||
  mongoose.model("Cargo1Shipment", cargo1ShipmentSchema);
