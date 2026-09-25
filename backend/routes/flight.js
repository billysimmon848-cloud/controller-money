const express = require("express");
const mongoose = require("mongoose");

const Flight = require("../models/flight");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const Activity = require("../models/activity");

const auth = require("../middleware/auth");


const router = express.Router();


/* =========================================================
   SETTINGS
========================================================= */

const CLEAN_FLIGHT_PRICE = 5;

const TRACKING_GRACE_PERIOD_HOURS = 48;


/* =========================================================
   FLIGHT STATUSES
========================================================= */

const FLIGHT_STATUSES = [

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
   WALLET BALANCE
========================================================= */

async function getWalletBalance(
  userId
) {

  const wallet =
    await Wallet.findOne({

      user:
        userId

    });


  if (!wallet) {

    return 0;

  }


  return wallet.balance;

}


/* =========================================================
   ACTIVITY HELPER
========================================================= */

async function createActivity({

  userId,

  activity,

  amount = 0,

  description = "",

  reference = "",

  metadata = {},

  session = null

}) {

  const data = {

    user:
      userId,

    activity,

    service:
      "Flight",

    amount,

    description,

    reference,

    metadata

  };


  if (session) {

    await Activity.create(

      [data],

      {
        session
      }

    );

    return;

  }


  await Activity.create(
    data
  );

}


/* =========================================================
   CALCULATE ESTIMATED ARRIVAL
========================================================= */

function calculateEstimatedArrival(
  travelDate,
  departureTime,
  flightDuration
) {

  if (
    !travelDate ||
    !departureTime ||
    flightDuration === undefined ||
    flightDuration === null ||
    flightDuration === ""
  ) {

    return null;

  }


  const duration =
    Number(
      flightDuration
    );


  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {

    return null;

  }


  const timeParts =
    String(
      departureTime
    ).split(":");


  if (
    timeParts.length < 2
  ) {

    return null;

  }


  const hours =
    Number(
      timeParts[0]
    );


  const minutes =
    Number(
      timeParts[1]
    );


  if (

    !Number.isInteger(hours) ||

    !Number.isInteger(minutes) ||

    hours < 0 ||

    hours > 23 ||

    minutes < 0 ||

    minutes > 59

  ) {

    return null;

  }


  const date =
    new Date(
      travelDate
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  date.setHours(
    hours,
    minutes,
    0,
    0
  );


  date.setTime(

    date.getTime() +

    (
      duration *
      60 *
      60 *
      1000
    )

  );


  return date;

}


/* =========================================================
   CALCULATE TRACKING EXPIRATION
========================================================= */

function calculateTrackingExpiresAt(
  estimatedArrival
) {

  if (
    !estimatedArrival
  ) {

    return null;

  }


  const arrival =
    new Date(
      estimatedArrival
    );


  if (
    Number.isNaN(
      arrival.getTime()
    )
  ) {

    return null;

  }


  return new Date(

    arrival.getTime() +

    (
      TRACKING_GRACE_PERIOD_HOURS *
      60 *
      60 *
      1000
    )

  );

}


/* =========================================================
   GET VALID FLIGHT DURATION
========================================================= */

function getValidFlightDuration(
  flight
) {

  const existingDuration =
    Number(
      flight.flightDuration
    );


  if (
    Number.isFinite(existingDuration) &&
    existingDuration >= 0.5
  ) {

    return existingDuration;

  }


  if (

    flight.travelDate &&

    flight.departureTime &&

    flight.estimatedArrival

  ) {

    const departure =
      new Date(
        flight.travelDate
      );


    if (
      !Number.isNaN(
        departure.getTime()
      )
    ) {

      const timeParts =
        String(
          flight.departureTime
        ).split(":");


      if (
        timeParts.length >= 2
      ) {

        const hours =
          Number(
            timeParts[0]
          );


        const minutes =
          Number(
            timeParts[1]
          );


        if (

          Number.isInteger(hours) &&

          Number.isInteger(minutes)

        ) {

          departure.setHours(
            hours,
            minutes,
            0,
            0
          );


          const arrival =
            new Date(
              flight.estimatedArrival
            );


          if (
            !Number.isNaN(
              arrival.getTime()
            )
          ) {

            const duration =
              (
                arrival.getTime() -
                departure.getTime()
              ) /
              (
                60 *
                60 *
                1000
              );


            if (
              Number.isFinite(duration) &&
              duration >= 0.5
            ) {

              return duration;

            }

          }

        }

      }

    }

  }


  return 1;

}


/* =========================================================
   REPAIR OLD FLIGHT DATES
========================================================= */

async function repairFlightDates(
  flight,
  session = null
) {

  let flightDuration =
    getValidFlightDuration(
      flight
    );


  let estimatedArrival =
    flight.estimatedArrival || null;


  let trackingExpiresAt =
    flight.trackingExpiresAt || null;


  /* =====================================================
     REPAIR FLIGHT DURATION
  ===================================================== */

  const currentDuration =
    Number(
      flight.flightDuration
    );


  const durationNeedsRepair =

    !Number.isFinite(
      currentDuration
    ) ||

    currentDuration < 0.5;


  if (
    durationNeedsRepair
  ) {

    flightDuration =
      getValidFlightDuration(
        flight
      );

  }


  /* =====================================================
     REPAIR ESTIMATED ARRIVAL
  ===================================================== */

  if (
    !estimatedArrival
  ) {

    estimatedArrival =
      calculateEstimatedArrival(

        flight.travelDate,

        flight.departureTime,

        flightDuration

      );

  }


  if (
    !estimatedArrival
  ) {

    const fallbackDate =
      new Date();


    estimatedArrival =
      new Date(

        fallbackDate.getTime() +

        (
          flightDuration *
          60 *
          60 *
          1000
        )

      );

  }


  /* =====================================================
     REPAIR TRACKING EXPIRATION
  ===================================================== */

  if (
    !trackingExpiresAt
  ) {

    trackingExpiresAt =
      calculateTrackingExpiresAt(
        estimatedArrival
      );

  }


  if (
    !trackingExpiresAt
  ) {

    trackingExpiresAt =
      new Date(

        Date.now() +

        (
          TRACKING_GRACE_PERIOD_HOURS *
          60 *
          60 *
          1000
        )

      );

  }


  /* =====================================================
     BUILD REPAIR DATA
  ===================================================== */

  const updateData = {

    flightDuration,

    estimatedArrival,

    trackingExpiresAt

  };


  /* =====================================================
     DIRECT UPDATE
========================================================= */

  if (session) {

    await Flight.updateOne(

      {
        _id:
          flight._id
      },

      {
        $set:
          updateData
      },

      {
        session
      }

    );

  } else {

    await Flight.updateOne(

      {
        _id:
          flight._id
      },

      {
        $set:
          updateData
      }

    );

  }


  /* =====================================================
     KEEP OBJECT IN SYNC
========================================================= */

  flight.flightDuration =
    flightDuration;


  flight.estimatedArrival =
    estimatedArrival;


  flight.trackingExpiresAt =
    trackingExpiresAt;


  return flight;

}


/* =========================================================
   CHECK IF FLIGHT TIME HAS EXPIRED
========================================================= */

function flightTimeHasExpired(
  flight
) {

  if (
    !flight.estimatedArrival
  ) {

    return false;

  }


  const arrival =
    new Date(
      flight.estimatedArrival
    );


  if (
    Number.isNaN(
      arrival.getTime()
    )
  ) {

    return false;

  }


  return (
    new Date() >=
    arrival
  );

}


/* =========================================================
   CHECK IF TRACKING HAS EXPIRED
========================================================= */

function trackingHasExpired(
  flight
) {

  if (
    !flight.trackingExpiresAt
  ) {

    return false;

  }


  const expiration =
    new Date(
      flight.trackingExpiresAt
    );


  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {

    return false;

  }


  return (
    new Date() >=
    expiration
  );

}


/* =========================================================
   TRACKING NUMBER
========================================================= */

async function generateTrackingNumber() {

  let trackingNumber;

  let exists =
    true;


  while (exists) {

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let randomPart =
      "";


    for (
      let i = 0;
      i < 8;
      i++
    ) {

      randomPart +=
        characters[
          Math.floor(
            Math.random() *
            characters.length
          )
        ];

    }


    trackingNumber =
      `FLT-${randomPart}`;


    exists =
      await Flight.exists({

        trackingNumber

      });

  }


  return trackingNumber;

}


/* =========================================================
   CREATE FLIGHT
   POST /api/flights
========================================================= */

router.post(
  "/",
  auth,
  async (
    req,
    res
  ) => {

    const session =
      await mongoose.startSession();


    try {

      const {

        passengerName,

        flightNumber,

        sequenceNumber,

        departureAirport,

        destinationAirport,

        terminal,

        airline,

        travelDate,

        departureTime,

        flightDuration,

        flightClass,

        group,

        seat,

        bookingReference,

        security,

        securityTime,

        boardingAt,

        lowerBoarding,

        bagDrop,

        flightType,

        currentStatus,

        errorMessage

      } = req.body;


      if (

        !passengerName ||

        !departureAirport ||

        !destinationAirport ||

        !travelDate ||

        !departureTime ||

        !flightClass ||

        flightDuration ===
        undefined ||

        flightDuration ===
        null ||

        flightDuration ===
        ""

      ) {

        return res.status(400).json({

          message:
            "Please complete all required flight fields."

        });

      }


      const duration =
        Number(
          flightDuration
        );


      if (

        !Number.isFinite(
          duration
        ) ||

        duration <= 0

      ) {

        return res.status(400).json({

          message:
            "Please enter a valid flight duration."

        });

      }


      const estimatedArrival =
        calculateEstimatedArrival(

          travelDate,

          departureTime,

          duration

        );


      if (
        !estimatedArrival
      ) {

        return res.status(400).json({

          message:
            "Unable to calculate the estimated arrival time."

        });

      }


      const trackingExpiresAt =
        calculateTrackingExpiresAt(
          estimatedArrival
        );


      if (
        !trackingExpiresAt
      ) {

        return res.status(400).json({

          message:
            "Unable to calculate the tracking expiration time."

        });

      }


      const selectedFlightType =

        flightType ===
          "clean"

          ? "clean"

          : "test";


      const status =

        FLIGHT_STATUSES.includes(
          currentStatus
        )

          ? currentStatus

          : "Processing";


      const trackingNumber =
        await generateTrackingNumber();


      session.startTransaction();


      if (
        selectedFlightType ===
        "test"
      ) {

        const flight =
          new Flight({

            user:
              req.userId,

            trackingNumber,

            trackingExpiresAt,

            passengerName,

            flightNumber:
              flightNumber || "",

            sequenceNumber:
              sequenceNumber || "",

            departureAirport,

            destinationAirport,

            terminal:
              terminal || "",

            airline:
              airline || "",

            travelDate,

            departureTime,

            flightDuration:
              duration,

            estimatedArrival,

            flightClass,

            group:
              group || "",

            seat:
              seat || "",

            bookingReference:
              bookingReference || "",

            security:
              security || "",

            securityTime:
              securityTime || "",

            boardingAt:
              boardingAt || "",

            lowerBoarding:
              lowerBoarding || "",

            bagDrop:
              bagDrop || "",

            currentStatus:
              status,

            errorMessage:
              errorMessage || "",

            flightType:
              "test",

            paymentStatus:
              "unpaid",

            paymentAmount:
              0,

            watermarkEnabled:
              true

          });


        await flight.save({

          session

        });


        await createActivity({

          userId:
            req.userId,

          activity:
            "Document Created",

          amount:
            0,

          description:
            `Flight document created - ${trackingNumber}`,

          reference:
            trackingNumber,

          metadata: {

            flightType:
              "test",

            flightDuration:
              duration,

            estimatedArrival,

            trackingExpiresAt

          },

          session

        });


        await session.commitTransaction();


        const walletBalance =
          await getWalletBalance(
            req.userId
          );


        return res.status(201).json({

          message:
            "Test flight created successfully.",

          flight,

          walletBalance

        });

      }


      const wallet =
        await Wallet.findOne({

          user:
            req.userId

        }).session(
          session
        );


      if (!wallet) {

        await session.abortTransaction();


        return res.status(400).json({

          message:
            "Wallet not found."

        });

      }


      if (
        Number(wallet.balance) <
        CLEAN_FLIGHT_PRICE
      ) {

        await session.abortTransaction();


        return res.status(400).json({

          message:
            `Insufficient wallet balance. Clean Flight costs $${CLEAN_FLIGHT_PRICE}.`,

          walletBalance:
            wallet.balance

        });

      }


      wallet.balance =
        Number(wallet.balance) -
        CLEAN_FLIGHT_PRICE;


      await wallet.save({

        session

      });


      const flight =
        new Flight({

          user:
            req.userId,

          trackingNumber,

          trackingExpiresAt,

          passengerName,

          flightNumber:
            flightNumber || "",

          sequenceNumber:
            sequenceNumber || "",

          departureAirport,

          destinationAirport,

          terminal:
            terminal || "",

          airline:
            airline || "",

          travelDate,

          departureTime,

          flightDuration:
            duration,

          estimatedArrival,

          flightClass,

          group:
            group || "",

          seat:
            seat || "",

          bookingReference:
            bookingReference || "",

          security:
            security || "",

          securityTime:
            securityTime || "",

          boardingAt:
            boardingAt || "",

          lowerBoarding:
            lowerBoarding || "",

          bagDrop:
            bagDrop || "",

          currentStatus:
            status,

          errorMessage:
            errorMessage || "",

          flightType:
            "clean",

          paymentStatus:
            "paid",

          paymentAmount:
            CLEAN_FLIGHT_PRICE,

          paidAt:
            new Date(),

          watermarkEnabled:
            false

        });


      await flight.save({

        session

      });


      await Transaction.create(

        [

          {

            user:
              req.userId,

            type:
              "charge",

            amount:
              -CLEAN_FLIGHT_PRICE,

            description:
              `Clean Flight - ${trackingNumber}`,

            source:
              "flight",

            reference:
              trackingNumber

          }

        ],

        {
          session
        }

      );


      await createActivity({

        userId:
          req.userId,

        activity:
          "Document Created",

        amount:
          -CLEAN_FLIGHT_PRICE,

        description:
          `Clean flight document created - ${trackingNumber}`,

        reference:
          trackingNumber,

        metadata: {

          flightType:
            "clean",

          paymentAmount:
            CLEAN_FLIGHT_PRICE,

          flightDuration:
            duration,

          estimatedArrival,

          trackingExpiresAt

        },

        session

      });


      await session.commitTransaction();


      return res.status(201).json({

        message:
          "Clean flight created successfully.",

        flight,

        walletBalance:
          wallet.balance

      });

    } catch (error) {

      if (
        session.inTransaction()
      ) {

        await session.abortTransaction();

      }


      console.error(
        "CREATE FLIGHT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to create flight.",

        error:
          error.message

      });

    } finally {

      session.endSession();

    }

  }
);


/* =========================================================
   GET MY FLIGHTS
   GET /api/flights/mine
========================================================= */

router.get(
  "/mine",
  auth,
  async (
    req,
    res
  ) => {

    try {

      const flights =
        await Flight.find({

          user:
            req.userId

        }).sort({

          createdAt:
            -1

        });


      for (
        const flight of flights
      ) {

        await repairFlightDates(
          flight
        );

      }


      return res.json({

        flights

      });

    } catch (error) {

      console.error(
        "GET FLIGHTS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to load flights.",

        error:
          error.message

      });

    }

  }
);


/* =========================================================
   GET PUBLIC FLIGHT TRACKING
   GET /api/flights/track/:trackingNumber
========================================================= */

router.get(
  "/track/:trackingNumber",
  async (
    req,
    res
  ) => {

    try {

      const flight =
        await Flight.findOne({

          trackingNumber:
            req.params.trackingNumber

        }).select(
          "-user"
        );


      if (!flight) {

        return res.status(404).json({

          message:
            "Flight not found."

        });

      }


      await repairFlightDates(
        flight
      );


      if (
        trackingHasExpired(
          flight
        )
      ) {

        return res.status(404).json({

          message:
            "This tracking number is no longer active."

        });

      }


      return res.json({

        flight

      });

    } catch (error) {

      console.error(
        "TRACK FLIGHT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to track flight.",

        error:
          error.message

      });

    }

  }
);


/* =========================================================
   UPDATE FLIGHT
   PATCH /api/flights/:trackingNumber
========================================================= */

router.patch(
  "/:trackingNumber",
  auth,
  async (
    req,
    res
  ) => {

    try {

      const flight =
        await Flight.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        });


      if (!flight) {

        return res.status(404).json({

          message:
            "Flight not found."

        });

      }


      await repairFlightDates(
        flight
      );


      if (
        req.body.currentStatus !==
        undefined
      ) {

        if (
          !FLIGHT_STATUSES.includes(
            req.body.currentStatus
          )
        ) {

          return res.status(400).json({

            message:
              "Invalid flight status."

          });

        }


        if (
          flightTimeHasExpired(
            flight
          )
        ) {

          return res.status(400).json({

            message:
              "The flight arrival time has passed. The flight status can no longer be changed.",

            estimatedArrival:
              flight.estimatedArrival

          });

        }

      }


      const allowedFields = [

        "passengerName",

        "flightNumber",

        "sequenceNumber",

        "departureAirport",

        "destinationAirport",

        "terminal",

        "airline",

        "travelDate",

        "departureTime",

        "flightDuration",

        "flightClass",

        "group",

        "seat",

        "bookingReference",

        "security",

        "securityTime",

        "boardingAt",

        "lowerBoarding",

        "bagDrop",

        "currentStatus",

        "errorMessage",

        "watermarkEnabled",

        "flightType"

      ];


      allowedFields.forEach(
        field => {

          if (
            req.body[field] !==
            undefined
          ) {

            flight[field] =
              req.body[field];

          }

        }
      );


      if (

        req.body.travelDate !==
        undefined ||

        req.body.departureTime !==
        undefined ||

        req.body.flightDuration !==
        undefined

      ) {

        const duration =
          Number(
            flight.flightDuration
          );


        if (

          !Number.isFinite(
            duration
          ) ||

          duration <= 0

        ) {

          return res.status(400).json({

            message:
              "Please enter a valid flight duration."

          });

        }


        const newEstimatedArrival =
          calculateEstimatedArrival(

            flight.travelDate,

            flight.departureTime,

            duration

          );


        if (
          !newEstimatedArrival
        ) {

          return res.status(400).json({

            message:
              "Unable to calculate the estimated arrival time."

          });

        }


        const newTrackingExpiresAt =
          calculateTrackingExpiresAt(
            newEstimatedArrival
          );


        if (
          !newTrackingExpiresAt
        ) {

          return res.status(400).json({

            message:
              "Unable to calculate the tracking expiration time."

          });

        }


        flight.estimatedArrival =
          newEstimatedArrival;


        flight.trackingExpiresAt =
          newTrackingExpiresAt;

      }


      if (
        !FLIGHT_STATUSES.includes(
          flight.currentStatus
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid flight status."

        });

      }


      await flight.save();


      await createActivity({

        userId:
          req.userId,

        activity:
          "Flight Updated",

        amount:
          0,

        description:
          `Flight updated - ${flight.trackingNumber}`,

        reference:
          flight.trackingNumber,

        metadata: {

          watermarkEnabled:
            flight.watermarkEnabled,

          flightType:
            flight.flightType,

          flightDuration:
            flight.flightDuration,

          estimatedArrival:
            flight.estimatedArrival,

          trackingExpiresAt:
            flight.trackingExpiresAt

        }

      });


      const walletBalance =
        await getWalletBalance(
          req.userId
        );


      return res.json({

        message:
          "Flight updated successfully.",

        flight,

        walletBalance

      });

    } catch (error) {

      console.error(
        "UPDATE FLIGHT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to update flight.",

        error:
          error.message

      });

    }

  }
);


/* =========================================================
   UPDATE FLIGHT STATUS
   PATCH /api/flights/:trackingNumber/status
========================================================= */

router.patch(
  "/:trackingNumber/status",
  auth,
  async (
    req,
    res
  ) => {

    try {

      const {

        currentStatus,

        errorMessage

      } = req.body;


      if (!currentStatus) {

        return res.status(400).json({

          message:
            "Flight status is required."

        });

      }


      if (
        !FLIGHT_STATUSES.includes(
          currentStatus
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid flight status."

        });

      }


      const flight =
        await Flight.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        });


      if (!flight) {

        return res.status(404).json({

          message:
            "Flight not found."

        });

      }


      await repairFlightDates(
        flight
      );


      if (
        flightTimeHasExpired(
          flight
        )
      ) {

        return res.status(400).json({

          message:
            "The flight arrival time has passed. The flight status can no longer be changed.",

          estimatedArrival:
            flight.estimatedArrival,

          currentStatus:
            flight.currentStatus

        });

      }


      let newErrorMessage =
        flight.errorMessage || "";


      if (
        errorMessage !==
        undefined
      ) {

        newErrorMessage =
          String(
            errorMessage
          ).trim();

      }


      if (

        currentStatus !==
        "Delayed" &&

        currentStatus !==
        "Cancelled" &&

        errorMessage ===
        undefined

      ) {

        newErrorMessage =
          "";

      }


      await Flight.updateOne(

        {

          _id:
            flight._id,

          user:
            req.userId

        },

        {

          $set: {

            currentStatus,

            errorMessage:
              newErrorMessage

          }

        }

      );


      flight.currentStatus =
        currentStatus;

      flight.errorMessage =
        newErrorMessage;


      await createActivity({

        userId:
          req.userId,

        activity:
          "Flight Status Updated",

        amount:
          0,

        description:
          `Flight status changed to ${currentStatus} - ${flight.trackingNumber}`,

        reference:
          flight.trackingNumber,

        metadata: {

          status:
            currentStatus,

          errorMessage:
            flight.errorMessage || ""

        }

      });


      const walletBalance =
        await getWalletBalance(
          req.userId
        );


      return res.json({

        message:
          "Flight status updated successfully.",

        flight,

        walletBalance

      });

    } catch (error) {

      console.error(
        "UPDATE FLIGHT STATUS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to update flight status.",

        error:
          error.message

      });

    }

  }
);


/* =========================================================
   UPGRADE FLIGHT
   PATCH /api/flights/:trackingNumber/upgrade
========================================================= */

router.patch(
  "/:trackingNumber/upgrade",
  auth,
  async (
    req,
    res
  ) => {

    const session =
      await mongoose.startSession();


    try {

      session.startTransaction();


      /* =====================================================
         FIND FLIGHT
      ===================================================== */

      const flight =
        await Flight.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        }).session(
          session
        );


      if (!flight) {

        await session.abortTransaction();


        return res.status(404).json({

          message:
            "Flight not found."

        });

      }


      /* =====================================================
         REPAIR OLD FLIGHT DATA
      ===================================================== */

      /*
         IMPORTANT:
         Use the SAME transaction session here.
         This prevents the repair update from
         conflicting with the transaction.
      */

      await repairFlightDates(
        flight,
        session
      );


      /* =====================================================
         ALREADY CLEAN
      ===================================================== */

      if (

        flight.paymentStatus ===
        "paid" &&

        flight.watermarkEnabled ===
        false

      ) {

        await session.commitTransaction();


        const walletBalance =
          await getWalletBalance(
            req.userId
          );


        return res.json({

          message:
            "Flight is already clean.",

          flight,

          walletBalance

        });

      }


      /* =====================================================
         WALLET
      ===================================================== */

      const wallet =
        await Wallet.findOne({

          user:
            req.userId

        }).session(
          session
        );


      if (!wallet) {

        await session.abortTransaction();


        return res.status(400).json({

          message:
            "Wallet not found."

        });

      }


      /* =====================================================
         CHECK BALANCE
      ===================================================== */

      if (
        Number(wallet.balance) <
        CLEAN_FLIGHT_PRICE
      ) {

        await session.abortTransaction();


        return res.status(400).json({

          message:
            `Insufficient wallet balance. Clean Flight costs $${CLEAN_FLIGHT_PRICE}.`,

          walletBalance:
            wallet.balance

        });

      }


      /* =====================================================
         DEDUCT WALLET
      ===================================================== */

      wallet.balance =
        Number(wallet.balance) -
        CLEAN_FLIGHT_PRICE;


      await wallet.save({

        session

      });


      /* =====================================================
         UPGRADE FLIGHT
      ===================================================== */

      const paidAt =
        new Date();


      await Flight.updateOne(

        {

          _id:
            flight._id,

          user:
            req.userId

        },

        {

          $set: {

            flightType:
              "clean",

            paymentStatus:
              "paid",

            paymentAmount:
              CLEAN_FLIGHT_PRICE,

            paidAt,

            watermarkEnabled:
              false

          }

        },

        {

          session

        }

      );


      /* =====================================================
         UPDATE CURRENT OBJECT
      ===================================================== */

      flight.flightType =
        "clean";

      flight.paymentStatus =
        "paid";

      flight.paymentAmount =
        CLEAN_FLIGHT_PRICE;

      flight.paidAt =
        paidAt;

      flight.watermarkEnabled =
        false;


      /* =====================================================
         TRANSACTION
      ===================================================== */

      await Transaction.create(

        [

          {

            user:
              req.userId,

            type:
              "charge",

            amount:
              -CLEAN_FLIGHT_PRICE,

            description:
              `Clean Flight Upgrade - ${flight.trackingNumber}`,

            source:
              "flight",

            reference:
              flight.trackingNumber

          }

        ],

        {
          session
        }

      );


      /* =====================================================
         ACTIVITY
      ===================================================== */

      await createActivity({

        userId:
          req.userId,

        activity:
          "Document Upgraded",

        amount:
          -CLEAN_FLIGHT_PRICE,

        description:
          `Flight document upgraded to clean - ${flight.trackingNumber}`,

        reference:
          flight.trackingNumber,

        metadata: {

          flightType:
            "clean",

          paymentAmount:
            CLEAN_FLIGHT_PRICE

        },

        session

      });


      /* =====================================================
         COMMIT
      ===================================================== */

      await session.commitTransaction();


      return res.json({

        message:
          "Flight upgraded successfully.",

        flight,

        walletBalance:
          wallet.balance

      });

    } catch (error) {

      if (
        session.inTransaction()
      ) {

        await session.abortTransaction();

      }


      console.error(
        "UPGRADE FLIGHT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to upgrade flight.",

        error:
          error.message

      });

    } finally {

      session.endSession();

    }

  }
);


/* =========================================================
   DELETE FLIGHT
   DELETE /api/flights/:trackingNumber
========================================================= */

router.delete(
  "/:trackingNumber",
  auth,
  async (
    req,
    res
  ) => {

    try {

      const trackingNumber =
        req.params.trackingNumber;


       (

        "DELETE FLIGHT REQUEST:",

        trackingNumber,

        "USER:",

        req.userId

      );


      const flight =
        await Flight.findOne({

          trackingNumber,

          user:
            req.userId

        });


      if (!flight) {

         (
          "DELETE FLIGHT: NOT FOUND"
        );


        return res.status(404).json({

          message:
            "Flight not found."

        });

      }


      await Flight.deleteOne({

        _id:
          flight._id,

        user:
          req.userId

      });


       (

        "DELETE FLIGHT: DELETED",

        trackingNumber

      );


      try {

        await createActivity({

          userId:
            req.userId,

          activity:
            "Flight Deleted",

          amount:
            0,

          description:
            `Flight deleted - ${trackingNumber}`,

          reference:
            trackingNumber,

          metadata: {

            flightType:
              flight.flightType,

            passengerName:
              flight.passengerName

          }

        });

      } catch (
        activityError
      ) {

        console.error(

          "DELETE FLIGHT ACTIVITY ERROR:",

          activityError

        );

      }


      const walletBalance =
        await getWalletBalance(
          req.userId
        );


      return res.json({

        message:
          "Flight deleted successfully.",

        trackingNumber,

        walletBalance

      });

    } catch (error) {

      console.error(
        "DELETE FLIGHT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to delete flight.",

        error:
          error.message

      });

    }

  }
);


/* =========================================================
   EXPORT
========================================================= */

module.exports =
  router;