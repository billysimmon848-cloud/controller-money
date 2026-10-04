const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const BoardingPass = require("../models/boardingPass");
const Activity = require("../models/activity");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");

const auth = require("../middleware/auth");


/* =========================================================
   CONSTANTS
========================================================= */

const BOARDING_PASS_PRICE = 5;

const BOARDING_STATUSES = [
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
];


/* =========================================================
   TRACKING NUMBER
========================================================= */

async function generateTrackingNumber() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let trackingNumber;
  let exists = true;

  while (exists) {

    let randomPart = "";

    for (let i = 0; i < 8; i++) {

      randomPart +=
        characters[
          Math.floor(
            Math.random() * characters.length
          )
        ];

    }

    trackingNumber = `FLT-${randomPart}`;

    exists = await BoardingPass.exists({
      trackingNumber
    });

  }

  return trackingNumber;
}


/* =========================================================
   CALCULATE ESTIMATED ARRIVAL
========================================================= */

function calculateEstimatedArrival(
  date,
  time,
  duration
) {

  try {

    const dateString =
      String(date || "").trim();

    const timeString =
      String(time || "").trim();

    const durationString =
      String(duration || "").trim();


    if (
      !dateString ||
      !timeString ||
      !durationString
    ) {

      return null;

    }


    /* =====================================================
       DATE
       Expected HTML date format:

       YYYY-MM-DD
    ===================================================== */

    let year;
    let month;
    let day;


    if (dateString.includes("-")) {

      const parts =
        dateString.split("-");

      if (parts.length !== 3) {
        return null;
      }

      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);

    } else if (dateString.includes("/")) {

      /*
        Support:

        DD/MM/YYYY
      */

      const parts =
        dateString.split("/");

      if (parts.length !== 3) {
        return null;
      }

      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);

    } else {

      return null;

    }


    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {

      return null;

    }


    if (
      year < 2000 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {

      return null;

    }


    /* =====================================================
       TIME

       Supports:

       HH:MM
       HH:MM:SS
       H:MM AM
       H:MM PM
    ===================================================== */

    let hour;
    let minute;


    const normalizedTime =
      timeString
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();


    const ampmMatch =
      normalizedTime.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/
      );


    if (ampmMatch) {

      hour = Number(ampmMatch[1]);
      minute = Number(ampmMatch[2]);

      const period =
        ampmMatch[4];

      if (
        hour < 1 ||
        hour > 12 ||
        minute < 0 ||
        minute > 59
      ) {

        return null;

      }


      if (period === "AM") {

        if (hour === 12) {
          hour = 0;
        }

      } else {

        if (hour !== 12) {
          hour += 12;
        }

      }

    } else {

      const timeParts =
        normalizedTime.split(":");

      if (timeParts.length < 2) {
        return null;
      }

      hour = Number(timeParts[0]);
      minute = Number(timeParts[1]);

      if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute)
      ) {

        return null;

      }

      if (
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {

        return null;

      }

    }


    /* =====================================================
       CREATE DEPARTURE DATE
    ===================================================== */

    const departure =
      new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        0,
        0
      );


    if (Number.isNaN(departure.getTime())) {
      return null;
    }


    /*
      JavaScript automatically normalizes invalid dates.

      Example:
      February 31 -> March

      Make sure the original date actually exists.
    */

    if (
      departure.getFullYear() !== year ||
      departure.getMonth() !== month - 1 ||
      departure.getDate() !== day ||
      departure.getHours() !== hour ||
      departure.getMinutes() !== minute
    ) {

      return null;

    }


    /* =====================================================
       DURATION
    ===================================================== */

    let durationMinutes = 0;


    /*
      Examples supported:

      2 hours
      2 hour
      2 hrs
      2 hr
      2h

      30 minutes
      30 mins
      30 min
      30m

      2 hours 30 minutes
      2h 30m
    */

    const hoursMatch =
      durationString.match(
        /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)/i
      );


    const minutesMatch =
      durationString.match(
        /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|m)/i
      );


    if (hoursMatch) {

      durationMinutes +=
        Number(hoursMatch[1]) * 60;

    }


    if (minutesMatch) {

      durationMinutes +=
        Number(minutesMatch[1]);

    }


    /*
      Support HH:MM duration.

      Example:

      02:30
      = 2 hours 30 minutes
    */

    if (
      !hoursMatch &&
      !minutesMatch &&
      /^\d{1,3}:\d{2}$/.test(durationString)
    ) {

      const durationParts =
        durationString.split(":");

      const durationHours =
        Number(durationParts[0]);

      const durationMins =
        Number(durationParts[1]);


      if (
        Number.isInteger(durationHours) &&
        Number.isInteger(durationMins) &&
        durationHours >= 0 &&
        durationMins >= 0 &&
        durationMins < 60
      ) {

        durationMinutes =
          durationHours * 60 +
          durationMins;

      }

    }


    /*
      If duration is a plain number,
      treat it as hours.

      Example:

      "2" = 2 hours
      "3.5" = 3 hours 30 minutes
    */

    if (
      !hoursMatch &&
      !minutesMatch &&
      !/^\d{1,3}:\d{2}$/.test(durationString)
    ) {

      const numericDuration =
        Number(durationString);


      if (
        Number.isFinite(numericDuration) &&
        numericDuration > 0
      ) {

        durationMinutes =
          numericDuration * 60;

      }

    }


    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes <= 0
    ) {

      return null;

    }


    /* =====================================================
       ESTIMATED ARRIVAL
    ===================================================== */

    const estimatedArrival =
      new Date(
        departure.getTime() +
        durationMinutes * 60 * 1000
      );


    if (
      Number.isNaN(
        estimatedArrival.getTime()
      )
    ) {

      return null;

    }


    return estimatedArrival;

  } catch (error) {

    return null;

  }

}


/* =========================================================
   TRACKING EXPIRY
========================================================= */

function calculateTrackingExpiry(
  estimatedArrival
) {

  if (
    !estimatedArrival ||
    Number.isNaN(
      estimatedArrival.getTime()
    )
  ) {

    return null;

  }


  /*
    Tracking remains available for
    24 hours after estimated arrival.
  */

  return new Date(
    estimatedArrival.getTime() +
    24 * 60 * 60 * 1000
  );

}


/* =========================================================
   ACTIVITY
========================================================= */

async function createActivity(
  userId,
  activity,
  service,
  amount,
  description,
  reference,
  metadata,
  session = null
) {

  const activityData = {

    user: userId,

    activity,

    service,

    amount,

    description,

    reference,

    metadata

  };


  if (session) {

    await Activity.create(
      [activityData],
      { session }
    );

  } else {

    await Activity.create(
      activityData
    );

  }

}


/* =========================================================
   WALLET
========================================================= */

async function getWallet(
  userId,
  session = null
) {

  if (session) {

    return Wallet.findOne({
      user: userId
    }).session(session);

  }

  return Wallet.findOne({
    user: userId
  });

}


/* =========================================================
   CREATE BOARDING PASS
========================================================= */

router.post(
  "/",
  auth,
  async (req, res) => {

    try {

      const userId =
        req.userId;


      const {

        name,

        class: boardingClass,

        boardingPassType,

        from,

        to,

        date,

        time,

        duration,

        currency,

        price,

        taxes,

        total,

        gate,

        seat,

        sequence

      } = req.body;


      /* ===================================================
         CLASS
      =================================================== */

      const selectedClass =
        boardingClass ||
        boardingPassType;


      /* ===================================================
         REQUIRED FIELDS
      =================================================== */

      if (
        !name ||
        !selectedClass ||
        !from ||
        !to ||
        !date ||
        !time ||
        !duration ||
        !currency ||
        !gate ||
        !seat ||
        !sequence
      ) {

        return res.status(400).json({

          message:
            "Please complete all required fields."

        });

      }


      /* ===================================================
         AMOUNTS
      =================================================== */

      const numericPrice =
        Number(price);

      const numericTaxes =
        Number(taxes);

      const numericTotal =
        Number(total);


      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid price."

        });

      }


      if (
        !Number.isFinite(numericTaxes) ||
        numericTaxes < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid taxes."

        });

      }


      if (
        !Number.isFinite(numericTotal) ||
        numericTotal < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid total."

        });

      }


      /* ===================================================
         ESTIMATED ARRIVAL
      =================================================== */

      const estimatedArrival =
        calculateEstimatedArrival(
          date,
          time,
          duration
        );


      if (!estimatedArrival) {

        return res.status(400).json({

          message:
            "Unable to calculate estimated arrival from the date, time and duration."

        });

      }


      /* ===================================================
         TRACKING EXPIRY
      =================================================== */

      const expiresAt =
        calculateTrackingExpiry(
          estimatedArrival
        );


      if (!expiresAt) {

        return res.status(400).json({

          message:
            "Unable to calculate tracking expiry."

        });

      }


      /* ===================================================
         TRACKING NUMBER
      =================================================== */

      const trackingNumber =
        await generateTrackingNumber();


      /* ===================================================
         MONGODB TRANSACTION
      =================================================== */

      const session =
        await mongoose.startSession();


      try {

        session.startTransaction();


        /* =================================================
           CREATE BOARDING PASS
        ================================================= */

        const boardingPass =
          new BoardingPass({

            user: userId,

            trackingNumber,

            name:

              String(name).trim(),

            class:

              String(selectedClass).trim(),

            from:

              String(from).trim(),

            to:

              String(to).trim(),

            date:

              String(date).trim(),

            time:

              String(time).trim(),

            duration:

              String(duration).trim(),

            estimatedArrival,

            expiresAt,

            currency:

              String(currency).trim(),

            price:

              numericPrice,

            taxes:

              numericTaxes,

            total:

              numericTotal,

            gate:

              String(gate).trim(),

            seat:

              String(seat).trim(),

            sequence:

              String(sequence).trim(),

            currentStatus:
              "Processing",

            paymentStatus:
              "unpaid",

            paymentAmount:
              0,

            paidAt:
              null,

            boardingPassType:
              "test",

            watermarkEnabled:
              true

          });


        await boardingPass.save({
          session
        });


        /* =================================================
           ACTIVITY
        ================================================= */

        await createActivity(

          userId,

          "Document Created",

          "Boarding Pass",

          0,

          `Boarding Pass created - ${trackingNumber}`,

          trackingNumber,

          {
            trackingNumber,
            boardingPassType: "test",
            currentStatus: "Processing"
          },

          session

        );


        await session.commitTransaction();


        /* =================================================
           RESPONSE
        ================================================= */

        return res.status(201).json({

          message:
            "Boarding pass created successfully.",

          trackingNumber,

          boardingPass

        });


      } catch (transactionError) {

        await session.abortTransaction();

        throw transactionError;

      } finally {

        session.endSession();

      }


    } catch (error) {

      console.error(
        "CREATE BOARDING PASS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to create boarding pass."

      });

    }

  }
);


/* =========================================================
   DELETE BOARDING PASS
========================================================= */

router.delete(
  "/:trackingNumber",
  auth,
  async (req, res) => {

    try {

      const userId =
        req.userId;

      const trackingNumber =
        req.params.trackingNumber;


      const boardingPass =
        await BoardingPass.findOne({

          trackingNumber,

          user: userId

        });


      if (!boardingPass) {

        return res.status(404).json({

          message:
            "Boarding pass not found."

        });

      }


      await BoardingPass.deleteOne({

        _id:
          boardingPass._id

      });


      return res.json({

        message:
          "Boarding pass deleted successfully."

      });


    } catch (error) {

      console.error(
        "DELETE BOARDING PASS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to delete boarding pass."

      });

    }

  }
);


/* =========================================================
   GET MY BOARDING PASSES
========================================================= */

router.get(
  "/mine",
  auth,
  async (req, res) => {

    try {

      const userId =
        req.userId;


      const boardingPasses =
        await BoardingPass.find({

          user: userId

        })
        .sort({
          createdAt: -1
        });


      return res.json({

        boardingPasses

      });


    } catch (error) {

      console.error(
        "GET MY BOARDING PASSES ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to load boarding passes."

      });

    }

  }
);


/* =========================================================
   PUBLIC TRACKING
========================================================= */

router.get(
  "/track/:trackingNumber",
  async (req, res) => {

    try {

      const trackingNumber =
        String(
          req.params.trackingNumber || ""
        ).trim();


      if (!trackingNumber) {

        return res.status(400).json({

          message:
            "Tracking number is required."

        });

      }


      /*
        First find the document by tracking number.

        We do not put expiresAt directly into the
        MongoDB query because older Boarding Pass
        records may not have an expiresAt value.
      */

      const boardingPass =
        await BoardingPass.findOne({

          trackingNumber

        })
        .select("-user");


      if (!boardingPass) {

        return res.status(404).json({

          message:
            "Boarding pass not found."

        });

      }


      /* =================================================
         EXPIRY CHECK
      ================================================= */

      let expiryDate =
        boardingPass.expiresAt;


      /*
        For older documents that have estimatedArrival
        but no expiresAt, calculate the expiry from the
        existing estimatedArrival.
      */

      if (
        !expiryDate &&
        boardingPass.estimatedArrival
      ) {

        expiryDate =
          calculateTrackingExpiry(
            new Date(
              boardingPass.estimatedArrival
            )
          );

      }


      /*
        If we still cannot determine an expiry,
        do not expose the tracking record.
      */

      if (
        !expiryDate ||
        Number.isNaN(
          new Date(expiryDate).getTime()
        )
      ) {

        return res.status(404).json({

          message:
            "Boarding pass tracking has expired."

        });

      }


      /* =================================================
         CHECK EXPIRY
      ================================================= */

      if (
        new Date(expiryDate).getTime() <=
        Date.now()
      ) {

        return res.status(404).json({

          message:
            "Boarding pass tracking has expired."

        });

      }


      /* =================================================
         RESPONSE
      ================================================= */

      return res.json({

        boardingPass

      });


    } catch (error) {

      console.error(
        "TRACK BOARDING PASS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to track boarding pass."

      });

    }

  }
);


/* =========================================================
   UPDATE BOARDING PASS STATUS
========================================================= */

router.patch(
  "/:trackingNumber/status",
  auth,
  async (req, res) => {

    try {

      const userId =
        req.userId;

      const trackingNumber =
        req.params.trackingNumber;

      const {
        status
      } = req.body;


      /* ===================================================
         VALIDATE STATUS
      =================================================== */

      if (
        !BOARDING_STATUSES.includes(status)
      ) {

        return res.status(400).json({

          message:
            "Invalid boarding pass status."

        });

      }


      /* ===================================================
         FIND EXISTING BOARDING PASS
      =================================================== */

      const existingBoardingPass =
        await BoardingPass.findOne({

          trackingNumber,

          user: userId

        });


      if (!existingBoardingPass) {

        return res.status(404).json({

          message:
            "Boarding pass not found."

        });

      }


      const previousStatus =
        existingBoardingPass.currentStatus;


      /* ===================================================
         UPDATE ONLY STATUS
      =================================================== */

      const updatedBoardingPass =
        await BoardingPass.findOneAndUpdate(

          {
            trackingNumber,
            user: userId
          },

          {
            $set: {
              currentStatus: status
            }

          },

          {
            new: true,

            /*
              Important:
              This prevents older Boarding Pass
              documents from failing because of other
              required fields that may not exist on
              older records.
            */

            runValidators: false
          }

        );


      if (!updatedBoardingPass) {

        return res.status(404).json({

          message:
            "Boarding pass not found."

        });

      }


      /* ===================================================
         ACTIVITY
      =================================================== */

      await createActivity(

        userId,

        "Status Updated",

        "Boarding Pass",

        0,

        `Boarding Pass status changed from ${previousStatus} to ${status}`,

        trackingNumber,

        {
          trackingNumber,
          previousStatus,
          currentStatus: status
        }

      );


      /* ===================================================
         RESPONSE
      =================================================== */

      return res.json({

        message:
          "Boarding pass status updated.",

        boardingPass:
          updatedBoardingPass

      });


    } catch (error) {

      console.error(
        "UPDATE BOARDING PASS STATUS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to update boarding pass status."

      });

    }

  }
);


/* =========================================================
   UPGRADE BOARDING PASS
========================================================= */

router.patch(
  "/:trackingNumber/upgrade",
  auth,
  async (req, res) => {

    const session =
      await mongoose.startSession();


    try {

      const userId =
        req.userId;

      const trackingNumber =
        req.params.trackingNumber;


      session.startTransaction();


      /* ===================================================
         FIND BOARDING PASS
      =================================================== */

      const boardingPass =
        await BoardingPass.findOne({

          trackingNumber,

          user: userId

        }).session(session);


      if (!boardingPass) {

        await session.abortTransaction();

        return res.status(404).json({

          message:
            "Boarding pass not found."

        });

      }


      /* ===================================================
         ALREADY CLEAN
      =================================================== */

      if (
        boardingPass.boardingPassType ===
        "clean"
      ) {

        const wallet =
          await getWallet(
            userId,
            session
          );


        await session.commitTransaction();


        return res.json({

          message:
            "Boarding pass is already clean.",

          boardingPass,

          walletBalance:
            wallet
              ? Number(wallet.balance || 0)
              : 0

        });

      }


      /* ===================================================
         WALLET
      =================================================== */

      const wallet =
        await getWallet(
          userId,
          session
        );


      if (!wallet) {

        await session.abortTransaction();

        return res.status(400).json({

          message:
            "Wallet not found."

        });

      }


      const walletBalance =
        Number(
          wallet.balance || 0
        );


      /* ===================================================
         BALANCE CHECK
      =================================================== */

      if (
        walletBalance <
        BOARDING_PASS_PRICE
      ) {

        await session.abortTransaction();

        return res.status(400).json({

          message:
            "Insufficient wallet balance."

        });

      }


      /* ===================================================
         DEDUCT WALLET
      =================================================== */

      wallet.balance =
        walletBalance -
        BOARDING_PASS_PRICE;


      await wallet.save({
        session
      });


      /* ===================================================
         UPDATE BOARDING PASS
      =================================================== */

      boardingPass.paymentStatus =
        "paid";

      boardingPass.paymentAmount =
        BOARDING_PASS_PRICE;

      boardingPass.paidAt =
        new Date();

      boardingPass.boardingPassType =
        "clean";

      boardingPass.watermarkEnabled =
        false;


      await boardingPass.save({
        session
      });


      /* ===================================================
         TRANSACTION
      =================================================== */

      await Transaction.create(

        [

          {

            user: userId,

            type: "charge",

            amount:
              BOARDING_PASS_PRICE,

            source:
              "boardingPass",

            description:
              `Boarding Pass upgrade - ${trackingNumber}`,

            reference:
              trackingNumber

          }

        ],

        {
          session
        }

      );


      /* ===================================================
         ACTIVITY
      =================================================== */

      await createActivity(

        userId,

        "Document Upgraded",

        "Boarding Pass",

        -BOARDING_PASS_PRICE,

        `Boarding Pass upgraded - ${trackingNumber}`,

        trackingNumber,

        {
          trackingNumber,
          price: BOARDING_PASS_PRICE,
          boardingPassType: "clean"
        },

        session

      );


      /* ===================================================
         COMMIT
      =================================================== */

      await session.commitTransaction();


      /* ===================================================
         RESPONSE
      =================================================== */

      return res.json({

        message:
          "Boarding pass upgraded successfully.",

        boardingPass,

        walletBalance:
          Number(wallet.balance || 0)

      });


    } catch (error) {

      await session.abortTransaction();


      console.error(
        "UPGRADE BOARDING PASS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to upgrade boarding pass."

      });

    } finally {

      session.endSession();

    }

  }
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;