const mongoose = require('mongoose');


const boardingPassSchema =
  new mongoose.Schema(

    {

      /* =====================================================
         USER
      ===================================================== */

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
         PASSENGER
      ===================================================== */

      name: {
        type: String,
        required: true,
        trim: true
      },


      /* =====================================================
         CLASS
      ===================================================== */

      class: {
        type: String,
        required: true,
        trim: true
      },


      /* =====================================================
         ROUTE
      ===================================================== */

      from: {
        type: String,
        required: true,
        trim: true
      },


      to: {
        type: String,
        required: true,
        trim: true
      },


      /* =====================================================
         DATE / TIME
      ===================================================== */

      date: {
        type: String,
        required: true,
        trim: true
      },


      time: {
        type: String,
        required: true,
        trim: true
      },


      duration: {
        type: String,
        required: true,
        trim: true
      },


      /* =====================================================
         CURRENCY
      ===================================================== */

      currency: {
        type: String,
        required: true,
        trim: true
      },


      /* =====================================================
         PRICE
      ===================================================== */

      price: {
        type: Number,
        required: true,
        min: 0
      },


      taxes: {
        type: Number,
        required: true,
        min: 0
      },


      total: {
        type: Number,
        required: true,
        min: 0
      },


      /* =====================================================
         BOARDING DETAILS
      ===================================================== */

      gate: {
        type: String,
        required: true,
        trim: true
      },


      seat: {
        type: String,
        required: true,
        trim: true
      },


      sequence: {
        type: String,
        required: true,
        trim: true
      },


      /* =====================================================
         STATUS
      ===================================================== */

      currentStatus: {
        type: String,

        enum: [

          'Processing',

          'Confirmed',

          'Checked In',

          'Boarding',

          'Departed',

          'In Transit',

          'Arrived',

          'Completed',

          'Delayed',

          'Cancelled',

          'Refunded'

        ],

        default: 'Processing'
      },


      /* =====================================================
         PAYMENT
      ===================================================== */

      paymentStatus: {
        type: String,

        enum: [
          'unpaid',
          'paid'
        ],

        default: 'unpaid'
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
         DOCUMENT TYPE
      ===================================================== */

      boardingPassType: {
        type: String,

        enum: [
          'test',
          'clean'
        ],

        default: 'test'
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


module.exports =
  mongoose.models.boardingPass ||
  mongoose.model(
    'boardingPass',
    boardingPassSchema
  );