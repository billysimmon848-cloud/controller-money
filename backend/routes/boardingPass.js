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
              )

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
   GET MY BOARDING PASSES
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
              'debit',

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
          error.message ||
          'Unable to upgrade boarding pass.',

        error:
          error.name ||
          'UnknownError'

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