const mongoose = require("mongoose");


/* ======================================================
   TRACKING EVENT SCHEMA
====================================================== */

const trackingEventSchema = new mongoose.Schema({

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


/* ======================================================
   SHIPMENT SCHEMA
====================================================== */

const shipmentSchema = new mongoose.Schema(

  {

    /* ==================================================
       USER
    ================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    /* ==================================================
       TRACKING
    ================================================== */

    trackingNumber: {
      type: String,
      required: true,
      unique: true
    },


    /* ==================================================
       SENDER
    ================================================== */

    sender: {
      type: String,
      required: true
    },

    senderEmail: {
      type: String,
      default: ""
    },


    /* ==================================================
       RECIPIENT
    ================================================== */

    recipient: {
      type: String,
      required: true
    },

    recipientEmail: {
      type: String,
      default: ""
    },

    recipientAddress: {
      type: String,
      default: ""
    },


    /* ==================================================
       SHIPPING
    ================================================== */

    origin: {
      type: String,
      required: true
    },

    destination: {
      type: String,
      default: ""
    },


    /*
       TEST
       = Free / Mockup / Demonstration

       CLEAN
       = Paid / Genuine tracking
    */

    shippingType: {
      type: String,

      enum: [
        "test",
        "clean"
      ],

      default: "test"
    },


    /* ==================================================
       PACKAGE
    ================================================== */

    packageContent: {
      type: String,
      default: ""
    },

    packageWeight: {
      type: String,
      default: ""
    },


    /* ==================================================
       DATES
    ================================================== */

    shipmentDate: {
      type: Date,
      default: Date.now
    },

    estimatedDelivery: {
      type: Date
    },


    /*
       These fields are accepted by the
       Controller but are not required
       to be dates in the database.
    */

    shipmentTime: {
      type: String,
      default: ""
    },

    estimatedDeliveryTime: {
      type: String,
      default: ""
    },


    /* ==================================================
       INVOICE
    ================================================== */

    invoiceNumber: {
      type: String,
      default: ""
    },


    /* ==================================================
       STATUS
    ================================================== */

    /*
       IMPORTANT:

       currentStatus is the SINGLE
       authoritative shipment status.

       We do NOT use a separate
       "status" field.
    */

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


    /* ==================================================
       CONTROLLER ERROR
    ================================================== */

    errorMessage: {
      type: String,
      default: ""
    },


    /* ==================================================
       PAYMENT
    ================================================== */

    paymentStatus: {

      type: String,

      enum: [
        "unpaid",
        "paid"
      ],

      default: "unpaid"

    },


    paymentAmount: {
      type: Number,
      default: 0
    },


    paidAt: {
      type: Date
    },


    /* ==================================================
       WATERMARK
    ================================================== */

    watermarkEnabled: {
      type: Boolean,
      default: true
    },


    /* ==================================================
       TRACKING EVENTS
    ================================================== */

    trackingEvents: {

      type: [
        trackingEventSchema
      ],

      default: []

    }

  },


  {
    timestamps: true
  }

);


/* ======================================================
   EXPORT SHIPMENT MODEL
====================================================== */

/*
   Reuse existing model if Mongoose
   has already compiled it.

   This prevents:

   OverwriteModelError:
   Cannot overwrite `Shipment` model once compiled.
*/

const Shipment =

  mongoose.models.Shipment ||

  mongoose.model(
    "Shipment",
    shipmentSchema
  );


module.exports =
  Shipment;