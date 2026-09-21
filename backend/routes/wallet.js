const express = require("express");
const mongoose = require("mongoose");

const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const User = require("../models/user");

const auth = require("../middleware/auth");

const router = express.Router();


// ======================================================
// CLEAN AMOUNT
// ======================================================

function cleanAmount(amount) {

  const value =
    Number(amount);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    throw new Error(
      "Amount must be greater than zero."
    );

  }

  return value;

};


// ======================================================
// GET OR CREATE WALLET
// ======================================================
//
// Every authenticated user should have exactly one wallet.
//
// ======================================================

async function getOrCreateWallet(
  userId,
  session = null
) {

  let query =
    Wallet.findOne({
      user: userId
    });


  if (session) {

    query =
      query.session(session);

  }


  let wallet =
    await query;


  // ====================================================
  // WALLET ALREADY EXISTS
  // ====================================================

  if (wallet) {

    return wallet;

  }


  // ====================================================
  // CREATE NEW WALLET
  // ====================================================

  const wallets =
    await Wallet.create(
      [
        {
          user: userId,
          balance: 0
        }
      ],
      session
        ? { session }
        : undefined
    );


  return wallets[0];

}


// ======================================================
// CREDIT WALLET
// ======================================================
//
// TRUSTED BACKEND FUNCTION.
//
// Used by:
//
// - Admin credit
// - Verified BNB deposits
// - Refunds
//
// This is NOT exposed as a public user endpoint.
//
// ======================================================

async function creditWallet({

  userId,

  amount,

  type = "deposit",

  source = "wallet_deposit",

  description = "",

  reference = "",

  createdBy = null

}) {

  const value =
    cleanAmount(amount);


  const session =
    await mongoose.startSession();


  try {

    let result;


    await session.withTransaction(
      async () => {


        // ==============================================
        // GET OR CREATE WALLET
        // ==============================================

        const wallet =
          await getOrCreateWallet(
            userId,
            session
          );


        // ==============================================
        // CREDIT BALANCE
        // ==============================================

        wallet.balance +=
          value;


        await wallet.save({
          session
        });


        // ==============================================
        // CREATE LEDGER ENTRY
        // ==============================================

        const transaction =
          await Transaction.create(
            [
              {
                user:
                  userId,

                type,

                amount:
                  value,

                description,

                source,

                reference,

                createdBy
              }
            ],
            {
              session
            }
          );


        result = {

          wallet,

          transaction:
            transaction[0]

        };

      }
    );


    return {

      success: true,

      balance:
        Number(
          result.wallet.balance
        ),

      wallet:
        result.wallet,

      transaction:
        result.transaction

    };

  } finally {

    await session.endSession();

  }

}


// ======================================================
// DEBIT WALLET
// ======================================================
//
// TRUSTED BACKEND FUNCTION.
//
// Used later by:
//
// - Cargo
// - Banking
// - Flight
// - Graphics
//
// ======================================================

async function debitWallet({

  userId,

  amount,

  type = "charge",

  source = "other",

  description = "",

  reference = "",

  createdBy = null

}) {

  const value =
    cleanAmount(amount);


  const session =
    await mongoose.startSession();


  try {

    let result;


    await session.withTransaction(
      async () => {


        // ==============================================
        // GET WALLET
        // ==============================================

        const wallet =
          await Wallet.findOne({
            user:
              userId
          })
          .session(session);


        // ==============================================
        // WALLET DOES NOT EXIST
        // ==============================================

        if (!wallet) {

          throw new Error(
            "Wallet not found."
          );

        }


        // ==============================================
        // CHECK BALANCE
        // ==============================================

        if (
          Number(wallet.balance) <
          value
        ) {

          throw new Error(
            "Insufficient wallet balance."
          );

        }


        // ==============================================
        // DEDUCT BALANCE
        // ==============================================

        wallet.balance -=
          value;


        await wallet.save({
          session
        });


        // ==============================================
        // CREATE LEDGER ENTRY
        // ==============================================

        const transaction =
          await Transaction.create(
            [
              {
                user:
                  userId,

                type,

                amount:
                  -value,

                description,

                source,

                reference,

                createdBy
              }
            ],
            {
              session
            }
          );


        result = {

          wallet,

          transaction:
            transaction[0]

        };

      }
    );


    return {

      success: true,

      balance:
        Number(
          result.wallet.balance
        ),

      wallet:
        result.wallet,

      transaction:
        result.transaction

    };

  } finally {

    await session.endSession();

  }

}


// ======================================================
// USER TO USER WALLET TRANSFER
// ======================================================
//
// POST /api/wallet/transfer
//
// The user sends money to another registered user
// using the recipient's signup email.
//
// This is an INTERNAL MongoDB wallet transfer.
// No blockchain transaction is created.
//
// ======================================================

router.post(
  "/transfer",
  auth,
  async (req, res) => {

    const session =
      await mongoose.startSession();


    try {

      // ==================================================
      // SENDER
      // ==================================================

      const senderId =
        req.userId;


      // ==================================================
      // RECIPIENT EMAIL
      // ==================================================

      const recipientEmail =
        String(
          req.body.recipientEmail || ""
        )
        .trim()
        .toLowerCase();


      // ==================================================
      // AMOUNT
      // ==================================================

      const amount =
        cleanAmount(
          req.body.amount
        );


      // ==================================================
      // CHECK EMAIL
      // ==================================================

      if (!recipientEmail) {

        return res.status(400).json({

          message:
            "Recipient email is required."

        });

      }


      // ==================================================
      // FIND RECIPIENT
      // ==================================================

      const recipient =
        await User.findOne({
          email:
            recipientEmail
        });


      if (!recipient) {

        return res.status(404).json({

          message:
            "Recipient account not found."

        });

      }


      // ==================================================
      // PREVENT SELF TRANSFER
      // ==================================================

      if (
        recipient._id.toString() ===
        senderId.toString()
      ) {

        return res.status(400).json({

          message:
            "You cannot send money to yourself."

        });

      }


      // ==================================================
      // START MONGODB TRANSACTION
      // ==================================================

      await session.startTransaction();


      // ==================================================
      // GET SENDER WALLET
      // ==================================================

      const senderWallet =
        await Wallet.findOne({
          user:
            senderId
        })
        .session(session);


      if (!senderWallet) {

        throw new Error(
          "Sender wallet not found."
        );

      }


      // ==================================================
      // CHECK SENDER BALANCE
      // ==================================================

      if (
        Number(senderWallet.balance) <
        amount
      ) {

        throw new Error(
          "Insufficient wallet balance."
        );

      }


      // ==================================================
      // GET OR CREATE RECIPIENT WALLET
      // ==================================================

      const recipientWallet =
        await getOrCreateWallet(
          recipient._id,
          session
        );


      // ==================================================
      // CREATE TRANSFER REFERENCE
      // ==================================================

      const reference =
        "TRANSFER-" +
        new mongoose.Types.ObjectId()
          .toString()
          .toUpperCase();


      // ==================================================
      // DEDUCT SENDER
      // ==================================================

      senderWallet.balance -=
        amount;


      await senderWallet.save({
        session
      });


      // ==================================================
      // CREDIT RECIPIENT
      // ==================================================

      recipientWallet.balance +=
        amount;


      await recipientWallet.save({
        session
      });


      // ==================================================
      // SENDER TRANSACTION
      // ==================================================

      await Transaction.create(
        [
          {
            user:
              senderId,

            type:
              "transfer",

            amount:
              -amount,

            description:
              `Transfer to ${recipient.email}`,

            source:
              "transfer",

            reference,

            createdBy:
              senderId
          }
        ],
        {
          session
        }
      );


      // ==================================================
      // RECIPIENT TRANSACTION
      // ==================================================

      await Transaction.create(
        [
          {
            user:
              recipient._id,

            type:
              "transfer",

            amount:
              amount,

            description:
              `Transfer from ${recipientEmail}`,

            source:
              "transfer",

            reference,

            createdBy:
              senderId
          }
        ],
        {
          session
        }
      );


      // ==================================================
      // COMPLETE TRANSFER
      // ==================================================

      await session.commitTransaction();


      // ==================================================
      // SUCCESS RESPONSE
      // ==================================================

      return res.json({

        success:
          true,

        message:
          "Money sent successfully.",

        amount:
          amount

      });


    } catch (error) {

      // ==================================================
      // CANCEL TRANSACTION
      // ==================================================

      if (
        session.inTransaction()
      ) {

        await session.abortTransaction();

      }


      console.error(
        "WALLET TRANSFER ERROR:",
        error
      );


      return res.status(400).json({

        message:
          error.message ||
          "Unable to complete transfer."

      });


    } finally {

      await session.endSession();

    }

  }
);


// ======================================================
// GET CURRENT USER WALLET
// ======================================================
//
// GET /api/wallet
//
// If the user does not have a wallet yet,
// automatically create one with $0.00.
//
// ======================================================

router.get(
  "/",
  auth,
  async (req, res) => {

    try {

      const wallet =
        await getOrCreateWallet(
          req.userId
        );


      return res.json({

        success:
          true,

        balance:
          Number(
            wallet.balance
          ),

        wallet

      });


    } catch (error) {

      console.error(
        "GET WALLET ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to load wallet."

      });

    }

  }
);


// ======================================================
// GET CURRENT USER TRANSACTIONS
// ======================================================
//
// GET /api/wallet/transactions
//
// This endpoint remains available internally,
// but we are NOT displaying transaction history
// on the user wallet webpage.
//
// ======================================================

router.get(
  "/transactions",
  auth,
  async (req, res) => {

    try {

      const transactions =
        await Transaction.find({
          user:
            req.userId
        })
        .sort({
          createdAt:
            -1
        });


      return res.json({

        success:
          true,

        transactions

      });


    } catch (error) {

      console.error(
        "GET WALLET TRANSACTIONS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to load transactions."

      });

    }

  }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports =
  router;


// ======================================================
// EXPORT TRUSTED WALLET FUNCTIONS
// ======================================================

module.exports.creditWallet =
  creditWallet;


module.exports.debitWallet =
  debitWallet;


module.exports.getOrCreateWallet =
  getOrCreateWallet;
