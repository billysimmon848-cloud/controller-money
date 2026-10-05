const express = require("express");
const mongoose = require("mongoose");

const Shipment =
  require("../models/shipment");

const Wallet =
  require("../models/wallet");

const Transaction =
  require("../models/transaction");

const Activity =
  require("../models/activity");

const auth =
  require("../middleware/auth");


const router =
  express.Router();


// ======================================================
// CONSTANTS
// ======================================================

const CLEAN_SHIPPING_PRICE = 5;


// ======================================================
// HELPER — GET WALLET BALANCE
// ======================================================

async function getWalletBalance(
  userId
) {

  const wallet =
    await Wallet.findOne({
      user: userId
    });


  if (!wallet) {

    return 0;

  }


  return Number(
    wallet.balance
  );

}


// ======================================================
// HELPER — NORMALIZE TRACKING EVENTS
// ======================================================

function normalizeTrackingEvents(
  events
) {

  if (
    !Array.isArray(events)
  ) {

    return [];

  }


  return events
    .map(
      function (event) {

        if (
          !event ||
          typeof event !== "object"
        ) {

          return null;

        }


        const status =
          String(
            event.status || ""
          ).trim();


        const location =
          String(
            event.location || ""
          ).trim();


        const description =
          String(
            event.description || ""
          ).trim();


        const timestamp =
          event.timestamp;


        if (
          !status ||
          !location ||
          !timestamp
        ) {

          return null;

        }


        const parsedDate =
          new Date(
            timestamp
          );


        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {

          return null;

        }


        return {

          status,

          location,

          description,

          timestamp:
            parsedDate

        };

      }
    )
    .filter(
      function (event) {

        return event !== null;

      }
    );

}


// ======================================================
// HELPER — CREATE ACTIVITY
// ======================================================

async function createActivity({

  userId,

  activity,

  amount = null,

  description = "",

  reference = null,

  metadata = {},

  session = null

}) {

  const activityData = {

    user:
      userId,

    activity,

    service:
      "Cargo",

    amount,

    description,

    reference,

    metadata

  };


  if (session) {

    const created =

      await Activity.create(

        [
          activityData
        ],

        {
          session
        }

      );


    return created[0];

  }


  return await Activity.create(
    activityData
  );

}


// ======================================================
// CREATE SHIPMENT
// ======================================================

router.post(
  "/",
  auth,
  async (req, res) => {

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

        recipient,

        recipientEmail,

        recipientAddress,

        packageContent,

        packageWeight,

        currentStatus,

        status,

        errorMessage,

        shippingType,

        trackingEvents

      } = req.body;


      // ==================================================
      // BASIC VALIDATION
      // ==================================================

      if (

        !sender ||

        !recipient ||

        !origin ||

        !recipientAddress ||

        !packageContent

      ) {

        return res.status(400).json({

          message:
            "Please complete all required shipping fields."

        });

      }


      // ==================================================
      // SHIPPING TYPE
      // ==================================================

      const type =

        shippingType === "clean"

          ? "clean"

          : "test";


      // ==================================================
      // STATUS
      // ==================================================

      const finalStatus =

        currentStatus ||

        status ||

        "Processing";


      // ==================================================
      // HISTORY
      // ==================================================

      const normalizedTrackingEvents =
        normalizeTrackingEvents(
          trackingEvents
        );


      // ==================================================
      // GENERATE TRACKING NUMBER
      // ==================================================

      const trackingNumber =

        "MCL-" +

        new mongoose.Types.ObjectId()
          .toString()
          .toUpperCase();


      // ==================================================
      // START DATABASE TRANSACTION
      // ==================================================

      session =
        await mongoose.startSession();

      session.startTransaction();


      // ==================================================
      // TEST / FREE SHIPPING
      // ==================================================

      if (type === "test") {

        const shipmentArray =

          await Shipment.create(

            [
              {

                user:
                  req.userId,

                trackingNumber,

                invoiceNumber,

                shipmentDate,

                shipmentTime,

                estimatedDelivery,

                estimatedDeliveryTime,

                sender,

                senderEmail,

                origin,

                recipient,

                recipientEmail,

                recipientAddress,

                packageContent,

                packageWeight,

                shippingType:
                  "test",

                paymentStatus:
                  "unpaid",

                paymentAmount:
                  0,

                watermarkEnabled:
                  true,

                currentStatus:
                  finalStatus,

                errorMessage:
                  errorMessage ||
                  "",

                trackingEvents:
                  normalizedTrackingEvents

              }
            ],

            {
              session
            }

          );


        const shipment =
          shipmentArray[0];


        await createActivity({

          userId:
            req.userId,

          activity:
            "Document Created",

          amount:
            null,

          description:
            "Created test shipping document",

          reference:
            trackingNumber,

          metadata: {

            shipmentId:
              shipment._id,

            shippingType:
              "test",

            paymentStatus:
              "unpaid",

            paymentAmount:
              0

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
            "Test shipping created successfully.",

          shipment,

          walletBalance,

          balance:
            walletBalance

        });

      }


      // ==================================================
      // CLEAN / PAID SHIPPING
      // ==================================================

      const wallet =

        await Wallet.findOne({

          user:
            req.userId

        }).session(
          session
        );


      if (!wallet) {

        await session.abortTransaction();

        return res.status(404).json({

          message:
            "Wallet not found."

        });

      }


      // ==================================================
      // CHECK WALLET
      // ==================================================

      if (

        Number(wallet.balance) <

        CLEAN_SHIPPING_PRICE

      ) {

        await session.abortTransaction();

        return res.status(400).json({

          message:
            "Insufficient wallet balance.",

          balance:
            Number(wallet.balance),

          required:
            CLEAN_SHIPPING_PRICE

        });

      }


      // ==================================================
      // DEDUCT $5
      // ==================================================

      wallet.balance =

        Number(wallet.balance) -

        CLEAN_SHIPPING_PRICE;


      await wallet.save({

        session

      });


      // ==================================================
      // CREATE CLEAN SHIPMENT
      // ==================================================

      const shipmentArray =

        await Shipment.create(

          [
            {

              user:
                req.userId,

              trackingNumber,

              invoiceNumber,

              shipmentDate,

              shipmentTime,

              estimatedDelivery,

              estimatedDeliveryTime,

              sender,

              senderEmail,

              origin,

              recipient,

              recipientEmail,

              recipientAddress,

              packageContent,

              packageWeight,

              shippingType:
                "clean",

              paymentStatus:
                "paid",

              paymentAmount:
                CLEAN_SHIPPING_PRICE,

              paidAt:
                new Date(),

              watermarkEnabled:
                false,

              currentStatus:
                finalStatus,

              errorMessage:
                errorMessage ||
                "",

              trackingEvents:
                normalizedTrackingEvents

            }
          ],

          {
            session
          }

        );


      const shipment =
        shipmentArray[0];


      // ==================================================
      // CREATE FINANCIAL TRANSACTION
      // ==================================================

      const transactionArray =

        await Transaction.create(

          [
            {

              user:
                req.userId,

              type:
                "charge",

              amount:
                -CLEAN_SHIPPING_PRICE,

              description:
                `Clean Shipping - ${trackingNumber}`,

              source:
                "cargo",

              reference:
                trackingNumber

            }
          ],

          {
            session
          }

        );


      // ==================================================
      // CREATE ACTIVITY
      // ==================================================

      await createActivity({

        userId:
          req.userId,

        activity:
          "Document Created",

        amount:
          -CLEAN_SHIPPING_PRICE,

        description:
          "Created clean shipping document",

        reference:
          trackingNumber,

        metadata: {

          shipmentId:
            shipment._id,

          transactionId:
            transactionArray[0]._id,

          shippingType:
            "clean",

          paymentAmount:
            CLEAN_SHIPPING_PRICE,

          paymentStatus:
            "paid"

        },

        session

      });


      // ==================================================
      // COMMIT
      // ==================================================

      await session.commitTransaction();


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(201).json({

        message:
          "Shipping created successfully.",

        shipment,

        walletBalance:
          Number(wallet.balance),

        balance:
          Number(wallet.balance)

      });


    } catch (error) {

      if (session) {

        try {

          await session.abortTransaction();

        } catch (abortError) {

          console.error(
            "TRANSACTION ABORT ERROR:",
            abortError
          );

        }

      }


      console.error(
        "CREATE SHIPMENT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });


    } finally {

      if (session) {

        await session.endSession();

      }

    }

  }
);


// ======================================================
// EDIT / UPDATE SHIPMENT
// ======================================================

router.patch(
  "/:trackingNumber",
  auth,
  async (req, res) => {

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

        recipient,

        recipientEmail,

        recipientAddress,

        packageContent,

        packageWeight,

        status,

        currentStatus,

        errorMessage,

        trackingEvents

      } = req.body;


      // ==================================================
      // FIND SHIPMENT
      // ==================================================

      const shipment =

        await Shipment.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        });


      if (!shipment) {

        return res.status(404).json({

          message:
            "Shipment not found."

        });

      }


      // ==================================================
      // UPDATE INVOICE
      // ==================================================

      if (
        invoiceNumber !==
        undefined
      ) {

        shipment.invoiceNumber =
          invoiceNumber;

      }


      // ==================================================
      // UPDATE SHIPMENT DATE
      // ==================================================

      if (
        shipmentDate !==
        undefined
      ) {

        shipment.shipmentDate =
          shipmentDate;

      }


      // ==================================================
      // UPDATE SHIPMENT TIME
      // ==================================================

      if (
        shipmentTime !==
        undefined
      ) {

        shipment.shipmentTime =
          shipmentTime;

      }


      // ==================================================
      // UPDATE ESTIMATED DELIVERY
      // ==================================================

      if (
        estimatedDelivery !==
        undefined
      ) {

        shipment.estimatedDelivery =
          estimatedDelivery;

      }


      // ==================================================
      // UPDATE ESTIMATED DELIVERY TIME
      // ==================================================

      if (
        estimatedDeliveryTime !==
        undefined
      ) {

        shipment.estimatedDeliveryTime =
          estimatedDeliveryTime;

      }


      // ==================================================
      // UPDATE SENDER
      // ==================================================

      if (
        sender !==
        undefined
      ) {

        shipment.sender =
          sender;

      }


      if (
        senderEmail !==
        undefined
      ) {

        shipment.senderEmail =
          senderEmail;

      }


      // ==================================================
      // UPDATE ORIGIN
      // ==================================================

      if (
        origin !==
        undefined
      ) {

        shipment.origin =
          origin;

      }


      // ==================================================
      // UPDATE RECIPIENT
      // ==================================================

      if (
        recipient !==
        undefined
      ) {

        shipment.recipient =
          recipient;

      }


      if (
        recipientEmail !==
        undefined
      ) {

        shipment.recipientEmail =
          recipientEmail;

      }


      // ==================================================
      // UPDATE ADDRESS
      // ==================================================

      if (
        recipientAddress !==
        undefined
      ) {

        shipment.recipientAddress =
          recipientAddress;

      }


      // ==================================================
      // UPDATE PACKAGE
      // ==================================================

      if (
        packageContent !==
        undefined
      ) {

        shipment.packageContent =
          packageContent;

      }


      if (
        packageWeight !==
        undefined
      ) {

        shipment.packageWeight =
          packageWeight;

      }


      // ==================================================
      // UPDATE STATUS
      // ==================================================

      if (
        currentStatus !==
        undefined
      ) {

        shipment.currentStatus =
          currentStatus;

      } else if (
        status !==
        undefined
      ) {

        shipment.currentStatus =
          status;

      }


      // ==================================================
      // UPDATE ERROR MESSAGE
      // ==================================================

      if (
        errorMessage !==
        undefined
      ) {

        shipment.errorMessage =
          errorMessage;

      }


      // ==================================================
      // UPDATE TRACKING HISTORY
      // ==================================================

      if (
        trackingEvents !==
        undefined
      ) {

        shipment.trackingEvents =
          normalizeTrackingEvents(
            trackingEvents
          );

      }


      // ==================================================
      // SAVE
      // ==================================================

      await shipment.save();


      // ==================================================
      // CREATE ACTIVITY
      // ==================================================

      await createActivity({

        userId:
          req.userId,

        activity:
          "Shipment Updated",

        amount:
          null,

        description:
          "Shipping document was updated",

        reference:
          shipment.trackingNumber,

        metadata: {

          shipmentId:
            shipment._id,

          shippingType:
            shipment.shippingType,

          currentStatus:
            shipment.currentStatus,

          trackingEvents:
            shipment.trackingEvents.length

        }

      });


      // ==================================================
      // WALLET
      // ==================================================

      const walletBalance =

        await getWalletBalance(
          req.userId
        );


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.json({

        message:
          "Shipment updated successfully.",

        shipment,

        walletBalance,

        balance:
          walletBalance

      });


    } catch (error) {

      console.error(
        "EDIT SHIPMENT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ======================================================
// REMOVE WATERMARK / UPGRADE
// ======================================================

router.patch(
  "/:trackingNumber/upgrade",
  auth,
  async (req, res) => {

    let session;


    try {

      const {
        trackingNumber
      } = req.params;


      session =
        await mongoose.startSession();

      session.startTransaction();


      // ==================================================
      // FIND SHIPMENT
      // ==================================================

      const shipment =

        await Shipment.findOne({

          trackingNumber,

          user:
            req.userId

        }).session(
          session
        );


      if (!shipment) {

        await session.abortTransaction();

        return res.status(404).json({

          message:
            "Shipment not found."

        });

      }


      // ==================================================
      // ALREADY CLEAN
      // ==================================================

      if (

        shipment.paymentStatus ===
          "paid" &&

        shipment.watermarkEnabled ===
          false

      ) {

        await session.abortTransaction();


        const walletBalance =

          await getWalletBalance(
            req.userId
          );


        return res.json({

          message:
            "This shipment is already clean.",

          shipment,

          walletBalance,

          balance:
            walletBalance

        });

      }


      // ==================================================
      // FIND WALLET
      // ==================================================

      const wallet =

        await Wallet.findOne({

          user:
            req.userId

        }).session(
          session
        );


      if (!wallet) {

        await session.abortTransaction();

        return res.status(404).json({

          message:
            "Wallet not found."

        });

      }


      // ==================================================
      // CHECK BALANCE
      // ==================================================

      if (

        Number(wallet.balance) <

        CLEAN_SHIPPING_PRICE

      ) {

        await session.abortTransaction();

        return res.status(400).json({

          message:
            "Insufficient wallet balance.",

          balance:
            Number(wallet.balance),

          required:
            CLEAN_SHIPPING_PRICE

        });

      }


      // ==================================================
      // DEDUCT $5
      // ==================================================

      wallet.balance =

        Number(wallet.balance) -

        CLEAN_SHIPPING_PRICE;


      await wallet.save({

        session

      });


      // ==================================================
      // UPGRADE
      // ==================================================

      shipment.paymentStatus =
        "paid";

      shipment.paymentAmount =
        CLEAN_SHIPPING_PRICE;

      shipment.watermarkEnabled =
        false;

      shipment.paidAt =
        new Date();

      shipment.shippingType =
        "clean";


      await shipment.save({

        session

      });


      // ==================================================
      // FINANCIAL TRANSACTION
      // ==================================================

      const transactionArray =

        await Transaction.create(

          [
            {

              user:
                req.userId,

              type:
                "charge",

              amount:
                -CLEAN_SHIPPING_PRICE,

              description:
                `Remove Watermark - ${trackingNumber}`,

              source:
                "cargo",

              reference:
                trackingNumber

            }
          ],

          {
            session
          }

        );


      // ==================================================
      // ACTIVITY
      // ==================================================

      await createActivity({

        userId:
          req.userId,

        activity:
          "Document Upgraded",

        amount:
          -CLEAN_SHIPPING_PRICE,

        description:
          "Removed shipping document watermark",

        reference:
          trackingNumber,

        metadata: {

          shipmentId:
            shipment._id,

          transactionId:
            transactionArray[0]._id,

          upgrade:
            "watermark_removal",

          shippingType:
            "clean",

          paymentAmount:
            CLEAN_SHIPPING_PRICE

        },

        session

      });


      // ==================================================
      // COMMIT
      // ==================================================

      await session.commitTransaction();


      return res.json({

        message:
          "Watermark removed successfully.",

        shipment,

        walletBalance:
          Number(wallet.balance),

        balance:
          Number(wallet.balance)

      });


    } catch (error) {

      if (session) {

        try {

          await session.abortTransaction();

        } catch (abortError) {

          console.error(
            "UPGRADE ABORT ERROR:",
            abortError
          );

        }

      }


      console.error(
        "REMOVE WATERMARK ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });


    } finally {

      if (session) {

        await session.endSession();

      }

    }

  }
);


// ======================================================
// GET MY SHIPMENTS
// ======================================================

router.get(
  "/mine",
  auth,
  async (req, res) => {

    try {

      const shipments =

        await Shipment.find({

          user:
            req.userId

        }).sort({

          createdAt:
            -1

        });


      return res.json({

        shipments

      });


    } catch (error) {

      console.error(
        "GET MY SHIPMENTS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error"

      });

    }

  }
);


// ======================================================
// UPDATE SHIPMENT STATUS
// ======================================================

router.patch(
  "/:trackingNumber/status",
  auth,
  async (req, res) => {

    try {

      const {

        status,

        currentStatus,

        errorMessage

      } = req.body;


      const shipment =

        await Shipment.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        });


      if (!shipment) {

        return res.status(404).json({

          message:
            "Shipment not found."

        });

      }


      shipment.currentStatus =

        currentStatus ||

        status ||

        "Processing";


      if (
        errorMessage !==
        undefined
      ) {

        shipment.errorMessage =
          errorMessage;

      } else {

        shipment.errorMessage =
          "";

      }


      await shipment.save();


      await createActivity({

        userId:
          req.userId,

        activity:
          "Shipment Status Updated",

        amount:
          null,

        description:
          `Shipment status changed to ${shipment.currentStatus}`,

        reference:
          shipment.trackingNumber,

        metadata: {

          shipmentId:
            shipment._id,

          status:
            shipment.currentStatus,

          shippingType:
            shipment.shippingType,

          errorMessage:
            shipment.errorMessage

        }

      });


      return res.json({

        message:
          "Shipment updated successfully.",

        shipment

      });


    } catch (error) {

      console.error(
        "UPDATE SHIPMENT STATUS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ======================================================
// PUBLIC TRACKING
// ======================================================

router.get(
  "/track/:trackingNumber",
  async (req, res) => {

    try {

      const shipment =

        await Shipment.findOne({

          trackingNumber:
            req.params.trackingNumber

        }).select(
          "-user"
        );


      if (!shipment) {

        return res.status(404).json({

          message:
            "Tracking number not found."

        });

      }


      return res.json({

        shipment

      });


    } catch (error) {

      console.error(
        "TRACKING ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error"

      });

    }

  }
);


// ======================================================
// DELETE SHIPMENT
// ======================================================

router.delete(
  "/:trackingNumber",
  auth,
  async (req, res) => {

    try {

      const shipment =

        await Shipment.findOne({

          trackingNumber:
            req.params.trackingNumber,

          user:
            req.userId

        });


      if (!shipment) {

        return res.status(404).json({

          message:
            "Shipment not found."

        });

      }


      await Shipment.deleteOne({

        _id:
          shipment._id

      });


      await createActivity({

        userId:
          req.userId,

        activity:
          "Shipment Deleted",

        amount:
          null,

        description:
          "Shipping document was deleted",

        reference:
          shipment.trackingNumber,

        metadata: {

          shipmentId:
            shipment._id,

          shippingType:
            shipment.shippingType

        }

      });


      return res.json({

        message:
          "Shipment deleted successfully.",

        trackingNumber:
          shipment.trackingNumber

      });


    } catch (error) {

      console.error(
        "DELETE SHIPMENT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error while deleting shipment.",

        error:
          error.message

      });

    }

  }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports =
  router;