const mongoose = require("mongoose");


/* =========================================================
   FLIGHT MODEL
========================================================= */


const flightSchema =
  new mongoose.Schema(


    {

      /* =====================================================
         OWNER
      ===================================================== */

      user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

      },


      /* =====================================================
         TRACKING
      ===================================================== */

      trackingNumber: {

        type: String,

        required: true,

        unique: true,

        index: true

      },


      /* =====================================================
         TRACKING EXPIRATION
         
         Tracking remains available for 48 hours
         after the estimated arrival time.
      ===================================================== */

      trackingExpiresAt: {

        type: Date,

        required: true,

        index: true

      },


      /* =====================================================
         PASSENGER
      ===================================================== */

      passengerName: {

        type: String,

        required: true,

        trim: true

      },


      /* =====================================================
         FLIGHT INFORMATION
      ===================================================== */

      flightNumber: {

        type: String,

        required: true,

        trim: true

      },


      sequenceNumber: {

        type: String,

        required: true,

        trim: true

      },


      departureAirport: {

        type: String,

        required: true,

        trim: true,

        maxlength: 24

      },


      destinationAirport: {

        type: String,

        required: true,

        trim: true,

        maxlength: 39

      },


      terminal: {

        type: String,

        required: true,

        trim: true

      },


      airline: {

        type: String,

        required: true,

        trim: true

      },


      /* =====================================================
         BOARDING INFORMATION
      ===================================================== */

      travelDate: {

        type: Date,

        required: true

      },


      departureTime: {

        type: String,

        required: true,

        trim: true

      },


      /* =====================================================
         FLIGHT DURATION
         
         Number of hours the flight is expected
         to take from departure to arrival.
      ===================================================== */

      flightDuration: {

        type: Number,

        required: true,

        min: 0.5

      },


      /* =====================================================
         ESTIMATED ARRIVAL
         
         Automatically calculated from:
         travelDate + departureTime + flightDuration
      ===================================================== */

      estimatedArrival: {

        type: Date,

        required: true

      },


      flightClass: {

        type: String,

        enum: [

          "Economy",

          "First Class"

        ],

        required: true

      },


      group: {

        type: String,

        required: true,

        trim: true

      },


      seat: {

        type: String,

        required: true,

        trim: true

      },


      bookingReference: {

        type: String,

        required: true,

        trim: true

      },


      /* =====================================================
         BOARDING TIMES
      ===================================================== */

      security: {

        type: String,

        default: ""

      },


      securityTime: {

        type: String,

        default: ""

      },


      boardingAt: {

        type: String,

        default: ""

      },


      lowerBoarding: {

        type: String,

        default: ""

      },


      bagDrop: {

        type: String,

        default: ""

      },


      /* =====================================================
         STATUS
      ===================================================== */

      currentStatus: {

        type: String,

        enum: [

          "Processing",

          "Confirmed",

          "Checked In",

          "Boarding",

          "Departed",

          "In Transit",

          "Arrived",

          "Completed",

          "Delayed",

          "Cancelled",

          "Refunded"

        ],

        default: "Processing"

      },


      errorMessage: {

        type: String,

        default: ""

      },


      /* =====================================================
         PAYMENT
      ===================================================== */

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

        type: Date,

        default: null

      },


      /* =====================================================
         FLIGHT TYPE

         test = free/demo document
         clean = paid document
      ===================================================== */

      flightType: {

        type: String,

        enum: [

          "test",

          "clean"

        ],

        default: "test"

      },


      /* =====================================================
         WATERMARK
      ===================================================== */

      watermarkEnabled: {

        type: Boolean,

        default: true

      }

    },


    {

      timestamps: true

    }

  );


/* =========================================================
   MODEL
========================================================= */


module.exports =
  mongoose.models.Flight ||

  mongoose.model(
    "Flight",
    flightSchema
  );