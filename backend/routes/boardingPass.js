/* =========================================================
   BOARDING PASS ROUTES
========================================================= */

const express =
  require('express');


const mongoose =
  require('mongoose');


const router =
  express.Router();


/* =========================================================
   MODELS
========================================================= */

const BoardingPass =
  require('../models/boardingPass');


const Activity =
  require('../models/activity');


const Wallet =
  require('../models/wallet');


const Transaction =
  require('../models/transaction');


/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

const auth =
  require('../middleware/auth');


/* =========================================================
   CONSTANTS
========================================================= */

const BOARDING_PASS_STATUSES = [

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

];


const CLEAN_BOARDING_PASS_PRICE =
  5;


/* =========================================================
   TRACKING NUMBER
========================================================= */

async function generateTrackingNumber() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let trackingNumber;

  let exists = true;


  while (exists) {

    let randomPart = "";


    for (
      let i = 0;
      i < 8;
      i++
    ) {

      randomPart +=
        chars[
          Math.floor(
            Math.random() *
            chars.length
          )
        ];

    }


    trackingNumber =
      `FLT-${randomPart}`;


    exists =
      await BoardingPass.exists({

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

  const dateString =
    String(date).trim();


  const timeString =
    String(time).trim();


  const durationString =
    String(duration).trim();


  /* =======================================================
     DATE
  ======================================================= */

  const dateParts =
    dateString.split('-');


  /* =======================================================
     TIME
  ======================================================= */

  const timeParts =
    timeString.split(':');


  if (

    dateParts.length !== 3 ||

    timeParts.length < 2

  ) {

    return null;

  }


  const year =
    Number(
      dateParts[0]
    );


  const month =
    Number(
      dateParts[1]
    );


  const day =
    Number(
      dateParts[2]
    );


  const hour =
    Number(
      timeParts[0]
    );


  const minute =
    Number(
      timeParts[1]
    );


  if (

    !Number.isInteger(
      year
    ) ||

    !Number.isInteger(
      month
    ) ||

    !Number.isInteger(
      day
    ) ||

    !Number.isInteger(
      hour
    ) ||

    !Number.isInteger(
      minute
    )

  ) {

    return null;

  }


  /* =======================================================
     VALIDATE DATE AND TIME
  ======================================================= */

  if (

    month < 1 ||

    month > 12 ||

    day < 1 ||

    day > 31 ||

    hour < 0 ||

    hour > 23 ||

    minute < 0 ||

    minute > 59

  ) {

    return null;

  }


  /* =======================================================
     DEPARTURE DATE
  ======================================================= */

  const departureDate =
    new Date(

      year,

      month - 1,

      day,

      hour,

      minute,

      0,

      0

    );


  if (
    Number.isNaN(
      departureDate.getTime()
    )
  ) {

    return null;

  }


  /* =======================================================
     MAKE SURE JAVASCRIPT DID NOT NORMALIZE AN INVALID DATE
  ======================================================= */

  if (

    departureDate.getFullYear() !==
    year ||

    departureDate.getMonth() !==
    month - 1 ||

    departureDate.getDate() !==
    day ||

    departureDate.getHours() !==
    hour ||

    departureDate.getMinutes() !==
    minute

  ) {

    return null;

  }


  /* =======================================================
     FLIGHT DURATION
  ======================================================= */

  let durationMinutes =
    0;


  const hoursMatch =
    durationString.match(
      /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i
    );


  const minutesMatch =
    durationString.match(
      /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)/i
    );


  if (hoursMatch) {

    durationMinutes +=
      Number(
        hoursMatch[1]
      ) * 60;

  }


  if (minutesMatch) {

    durationMinutes +=
      Number(
        minutesMatch[1]
      );

  }


  /* =======================================================
     SUPPORT 4:30 FORMAT
  ======================================================= */

  if (

    durationMinutes === 0 &&

    /^\d{1,3}:\d{1,2}$/.test(
      durationString
    )

  ) {

    const parts =
      durationString.split(':');


    const durationHours =
      Number(
        parts[0]
      );


    const durationMinutesPart =
      Number(
        parts[1]
      );


    if (

      !Number.isInteger(
        durationHours
      ) ||

      !Number.isInteger(
        durationMinutesPart
      ) ||

      durationMinutesPart < 0 ||

      durationMinutesPart > 59

    ) {

      return null;

    }


    durationMinutes =
      durationHours * 60 +
      durationMinutesPart;

  }


  /* =======================================================
     VALIDATE DURATION
  ======================================================= */

  if (

    !Number.isFinite(
      durationMinutes
    ) ||

    durationMinutes <= 0

  ) {

    return null;

  }


  /* =======================================================
     ESTIMATED ARRIVAL
  ======================================================= */

  return new Date(

    departureDate.getTime() +

    durationMinutes *
    60 *
    1000

  );

}


/* =========================================================
   CALCULATE TRACKING EXPIRY
========================================================= */

function calculateTrackingExpiry(
  estimatedArrival
) {

  return new Date(

    estimatedArrival.getTime() +

    24 *
    60 *
    60 *
    1000

  );

}


/* =========================================================
   CREATE ACTIVITY
========================================================= */

async function createActivity(
  {
    user,
    activity,
    amount,
    description,
    reference,
    metadata,
    session
  }
) {

  return Activity.create(
    [
      {

        user,

        activity,

        service:
          'Boarding Pass',

        amount:
          amount || 0,

        description,

        reference,

        metadata

      }
    ],
    {
      session
    }
  );

}


/* =========================================================
   GET USER WALLET
========================================================= */

async function getWallet(
  userId,
  session
) {

  return Wallet.findOne({

    user:
      userId

  }).session(
    session
  );

}


/* =========================================================
   CREATE BOARDING PASS
========================================================= */

/*
   POST /api/boardingPass
*/

router.post(
  '/',
  auth,
  async function (req, res) {

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

      gate,

      seat,

      sequence,

      taxes,

      total

    } =
      req.body;


    /* =====================================================
       CLASS
    ===================================================== */

    const selectedClass =
      String(
        boardingClass ||
        boardingPassType ||
        ""
      ).trim();


    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    const requiredFields = [

      {
        name:
          'name',

        value:
          name
      },

      {
        name:
          'class',

        value:
          selectedClass
      },

      {
        name:
          'from',

        value:
          from
      },

      {
        name:
          'to',

        value:
          to
      },

      {
        name:
          'date',

        value:
          date
      },

      {
        name:
          'time',

        value:
          time
      },

      {
        name:
          'duration',

        value:
          duration
      },

      {
        name:
          'currency',

        value:
          currency
      },

      {
        name:
          'gate',

        value:
          gate
      },

      {
        name:
          'seat',

        value:
          seat
      },

      {
        name:
          'sequence',

        value:
          sequence
      }

    ];


    const missingField =
      requiredFields.find(
        field =>

          field.value ===
          undefined ||

          field.value ===
          null ||

          String(
            field.value
          ).trim() === ''

      );


    if (missingField) {

      return res.status(
        400
      ).json({

        message:
          `${missingField.name} is required.`

      });

    }


    /* =====================================================
       NUMERIC VALIDATION
    ===================================================== */

    const numericValues = [

      {
        name:
          'price',

        value:
          price
      },

      {
        name:
          'taxes',

        value:
          taxes
      },

      {
        name:
          'total',

        value:
          total
      }

    ];


    const invalidNumber =
      numericValues.find(
        item => {

          const number =
            Number(
              item.value
            );


          return (

            !Number.isFinite(
              number
            ) ||

            number < 0

          );

        }
      );


    if (invalidNumber) {

      return res.status(
        400
      ).json({

        message:
          `${invalidNumber.name} must be a valid positive number.`

      });

    }


    /* =====================================================
       CALCULATE ESTIMATED ARRIVAL
    ===================================================== */

    const estimatedArrival =
      calculateEstimatedArrival(

        date,

        time,

        duration

      );


    if (!estimatedArrival) {

      return res.status(
        400
      ).json({

        message:
          'Unable to calculate estimated arrival from the date, time and duration.'

      });

    }


    /* =====================================================
       CALCULATE TRACKING EXPIRY
    ===================================================== */

    const expiresAt =
      calculateTrackingExpiry(
        estimatedArrival
      );


    /* =====================================================
       GENERATE TRACKING
    ===================================================== */

    try {

      const trackingNumber =
        await generateTrackingNumber();


      /* ===================================================
         MONGODB TRANSACTION
      =================================================== */

      const session =
        await mongoose.startSession();


      try {

        session.startTransaction();


        /* ================================================
           CREATE BOARDING PASS
        ================================================= */

        const boardingPass =
          new BoardingPass({

            user:
              req.userId,

            trackingNumber,

            name:
              String(
                name
              ).trim(),

            class:
              selectedClass,

            from:
              String(
                from
              ).trim(),

            to:
              String(
                to
              ).trim(),

            date:
              String(
                date
              ).trim(),

            time:
              String(
                time
              ).trim(),

            duration:
              String(
                duration
              ).trim(),

            estimatedArrival,

            expiresAt,

            currency:
              String(
                currency
              ).trim(),

            price:
              Number(
                price
              ),

            gate:
              String(
                gate
              ).trim(),

            seat:
              String(
                seat
              ).trim(),

            sequence:
              String(
                sequence
              ).trim(),

            taxes:
              Number(
                taxes
              ),

            total:
              Number(
                total
              ),

            currentStatus:
              'Processing',

            paymentStatus:
              'unpaid',

            paymentAmount:
              0,

            paidAt:
              null,

            boardingPassType:
              'test',

            watermarkEnabled:
              true

          });


        await boardingPass.save({
          session
        });


        /* ================================================
           ACTIVITY
        ================================================= */

        await createActivity({

          user:
            req.userId,

          activity:
            'Document Created',

          amount:
            0,

          description:
            `Boarding Pass created: ${trackingNumber}`,

          reference:
            trackingNumber,

          metadata: {

            trackingNumber,

            boardingPassType:
              'test',

            class:
              selectedClass,

            paymentStatus:
              'unpaid',

            watermarkEnabled:
              true,

            price:
              Number(
                price
              ),

            taxes:
              Number(
                taxes
              ),

            total:
              Number(
                total
              ),

            estimatedArrival,

            expiresAt

          },

          session

        });


        await session.commitTransaction();


        return res.status(
          201
        ).json({

          message:
            'Boarding pass created successfully.',

          boardingPass

        });

      }

      catch (error) {

        await session.abortTransaction();

        throw error;

      }

      finally {

        await session.endSession();

      }

    }

    catch (error) {

      console.error(
        'CREATE BOARDING PASS ERROR:',
        error
      );


      return res.status(
        500
      ).json({

        message:
          'Unable to create boarding pass.'

      });

    }

  }
);


/* =========================================================
   DELETE BOARDING PASS
========================================================= */

/*
   DELETE /api/boardingPass/:trackingNumber
*/

router.delete(
  '/:trackingNumber',
  auth,
  async function (req, res) {

    try {

      const boardingPass =
        await BoardingPass.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        });


      if (!boardingPass) {

        return res.status(
          404
        ).json({

          message:
            'Boarding pass not found.'

        });

      }


      await BoardingPass.deleteOne({

        _id:
          boardingPass._id

      });


      return res.json({

        message:
          'Boarding pass deleted successfully.'

      });

    }

    catch (error) {

      console.error(
        'DELETE BOARDING PASS ERROR:',
        error
      );


      return res.status(
        500
      ).json({

        message:
          'Unable to delete boarding pass.'

      });

    }

  }
);


/* =========================================================
   GET MY BOARDING PASS
========================================================= */

/*
   GET /api/boardingPass/mine
*/

router.get(
  '/mine',
  auth,
  async function (req, res) {

    try {

      const boardingPasses =
        await BoardingPass.find({

          user:
            req.userId

        })
          .sort({

            createdAt:
              -1

          });


      return res.json({

        boardingPasses

      });

    }

    catch (error) {

      console.error(
        'GET BOARDING PASSES ERROR:',
        error
      );


      return res.status(
        500
      ).json({

        message:
          'Unable to load boarding passes.'

      });

    }

  }
);


/* =========================================================
   PUBLIC BOARDING PASS TRACKING
========================================================= */

/*
   GET /api/boardingPass/track/:trackingNumber

   Tracking remains publicly available until:

   estimatedArrival + 24 hours

   After that, the tracking number behaves as
   if it does not exist.
*/

router.get(
  '/track/:trackingNumber',
  async function (req, res) {

    try {

      const boardingPass =
        await BoardingPass.findOne({

          trackingNumber:
            req.params.trackingNumber,

          expiresAt: {

            $gt:
              new Date()

          }

        }).select(
          '-user'
        );


      if (!boardingPass) {

        return res.status(
          404
        ).json({

          message:
            'Boarding pass not found.'

        });

      }


      return res.json({

        boardingPass

      });

    }

    catch (error) {

      console.error(
        'BOARDING PASS TRACKING ERROR:',
        error
      );


      return res.status(
        500
      ).json({

        message:
          'Unable to track boarding pass.'

      });

    }

  }
);


/* =========================================================
   UPDATE BOARDING PASS STATUS
========================================================= */

/*
   PATCH /api/boardingPass/:trackingNumber/status
*/

router.patch(
  '/:trackingNumber/status',
  auth,
  async function (req, res) {

    const {
      status
    } =
      req.body;


    /* =====================================================
       VALIDATE STATUS
    ===================================================== */

    if (
      !BOARDING_PASS_STATUSES.includes(
        status
      )
    ) {

      return res.status(
        400
      ).json({

        message:
          'Invalid boarding pass status.'

      });

    }


    try {

      const boardingPass =
        await BoardingPass.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        });


      if (!boardingPass) {

        return res.status(
          404
        ).json({

          message:
            'Boarding pass not found.'

        });

      }


      const previousStatus =
        boardingPass.currentStatus;


      boardingPass.currentStatus =
        status;


      await boardingPass.save();


      /* ===================================================
         ACTIVITY
      ================================================= */

      await Activity.create({

        user:
          req.userId,

        activity:
          'Status Updated',

        service:
          'Boarding Pass',

        amount:
          0,

        description:
          `Boarding Pass ${boardingPass.trackingNumber} status changed from ${previousStatus} to ${status}.`,

        reference:
          boardingPass.trackingNumber,

        metadata: {

          trackingNumber:
            boardingPass.trackingNumber,

          previousStatus,

          currentStatus:
            status

        }

      });


      return res.json({

        message:
          'Boarding pass status updated.',

        boardingPass

      });

    }

    catch (error) {

      console.error(
        'UPDATE BOARDING PASS STATUS ERROR:',
        error
      );


      return res.status(
        500
      ).json({

        message:
          'Unable to update boarding pass status.'

      });

    }

  }
);


/* =========================================================
   UPGRADE TO CLEAN
========================================================= */

/*
   PATCH /api/boardingPass/:trackingNumber/upgrade
*/

router.patch(
  '/:trackingNumber/upgrade',
  auth,
  async function (req, res) {

    const session =
      await mongoose.startSession();


    try {

      session.startTransaction();


      /* ===================================================
         FIND BOARDING PASS
      ================================================= */

      const boardingPass =
        await BoardingPass.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        }).session(
          session
        );


      if (!boardingPass) {

        await session.abortTransaction();


        return res.status(
          404
        ).json({

          message:
            'Boarding pass not found.'

        });

      }


      /* ===================================================
         ALREADY CLEAN
      ================================================= */

      if (

        boardingPass.paymentStatus ===
        'paid' &&

        boardingPass.boardingPassType ===
        'clean' &&

        boardingPass.watermarkEnabled ===
        false

      ) {

        const wallet =
          await getWallet(
            req.userId,
            session
          );


        await session.commitTransaction();


        return res.json({

          message:
            'Boarding pass is already clean.',

          boardingPass,

          walletBalance:
            wallet
              ? wallet.balance
              : 0

        });

      }


      /* ===================================================
         GET WALLET
      ================================================= */

      const wallet =
        await getWallet(
          req.userId,
          session
        );


      if (!wallet) {

        await session.abortTransaction();


        return res.status(
          404
        ).json({

          message:
            'Wallet not found.'

        });

      }


      /* ===================================================
         CHECK BALANCE
      ================================================= */

      if (

        Number(
          wallet.balance
        ) <

        CLEAN_BOARDING_PASS_PRICE

      ) {

        await session.abortTransaction();


        return res.status(
          400
        ).json({

          message:
            'Insufficient wallet balance.',

          walletBalance:
            wallet.balance,

          required:
            CLEAN_BOARDING_PASS_PRICE

        });

      }


      /* ===================================================
         DEDUCT WALLET
      ================================================= */

      wallet.balance =
        Number(
          wallet.balance
        ) -

        CLEAN_BOARDING_PASS_PRICE;


      await wallet.save({
        session
      });


      /* ===================================================
         UPDATE BOARDING PASS
      ================================================= */

      boardingPass.paymentStatus =
        'paid';


      boardingPass.paymentAmount =
        CLEAN_BOARDING_PASS_PRICE;


      boardingPass.paidAt =
        new Date();


      boardingPass.boardingPassType =
        'clean';


      boardingPass.watermarkEnabled =
        false;


      await boardingPass.save({
        session
      });


      /* ===================================================
         TRANSACTION LEDGER
      ================================================= */

      await Transaction.create(
        [
          {

            user:
              req.userId,

            amount:
              CLEAN_BOARDING_PASS_PRICE,

            type:
              'charge',

            source:
              'boardingPass',

            reference:
              boardingPass.trackingNumber,

            description:
              'Boarding Pass clean download'

          }
        ],
        {
          session
        }
      );


      /* ===================================================
         ACTIVITY
      ================================================= */

      await createActivity({

        user:
          req.userId,

        activity:
          'Document Upgraded',

        amount:
          -CLEAN_BOARDING_PASS_PRICE,

        description:
          `Boarding Pass ${boardingPass.trackingNumber} upgraded to clean.`,

        reference:
          boardingPass.trackingNumber,

        metadata: {

          trackingNumber:
            boardingPass.trackingNumber,

          boardingPassType:
            'clean',

          paymentStatus:
            'paid',

          paymentAmount:
            CLEAN_BOARDING_PASS_PRICE,

          watermarkEnabled:
            false

        },

        session

      });


      /* ===================================================
         COMMIT
      ================================================= */

      await session.commitTransaction();


      return res.json({

        message:
          'Boarding pass upgraded successfully.',

        boardingPass,

        walletBalance:
          wallet.balance

      });

    }

    catch (error) {

      try {

        await session.abortTransaction();

      }

      catch (abortError) {

        console.error(
          'TRANSACTION ABORT ERROR:',
          abortError
        );

      }


      console.error(
        'UPGRADE BOARDING PASS ERROR:',
        error
      );


      return res.status(
        500
      ).json({

        message:
          'Unable to upgrade boarding pass.'

      });

    }

    finally {

      await session.endSession();

    }

  }
);


/* =========================================================
   EXPORT
========================================================= */

module.exports =
  router;