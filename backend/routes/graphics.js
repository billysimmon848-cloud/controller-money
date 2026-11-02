
const express = require("express");

const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const auth = require("../middleware/auth");

const router = express.Router();

const CLEAN_GRAPHICS_PRICE = 3;


// ======================================================
// PAY FOR CLEAN GRAPHICS DOWNLOAD
// ======================================================

router.post(
  "/clean-download",
  auth,
  async (req, res) => {

    try {

      // ATOMIC WALLET DEDUCTION

      const wallet = await Wallet.findOneAndUpdate(
        {
          user: req.userId,
          balance: { $gte: CLEAN_GRAPHICS_PRICE }
        },
        {
          $inc: {
            balance: -CLEAN_GRAPHICS_PRICE
          }
        },
        {
          new: true
        }
      );

      if (!wallet) {

        const existingWallet = await Wallet.findOne({
          user: req.userId
        });

        if (!existingWallet) {

          return res.status(404).json({
            success: false,
            message: "Wallet not found."
          });
        }

        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance. $3 is required."
        });
      }


      // RECORD TRANSACTION

      try {

        const transaction = await Transaction.create({

          user: req.userId,

          type: "charge",

          amount: -CLEAN_GRAPHICS_PRICE,

          description: "Graphics Clean Download",

          source: "graphics"

        });

        return res.json({

          success: true,

          paid: true,

          message: "Payment successful. Your clean download is ready.",

          balance: wallet.balance,

          transactionId: transaction._id

        });

      }
      catch (transactionError) {

        // REFUND IF TRANSACTION RECORDING FAILS

        await Wallet.updateOne(
          {
            user: req.userId
          },
          {
            $inc: {
              balance: CLEAN_GRAPHICS_PRICE
            }
          }
        );

        throw transactionError;
      }

    }
    catch (error) {

      console.error(
        "Graphics payment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Graphics payment could not be completed."
      });
    }
  }
);


module.exports = router;
