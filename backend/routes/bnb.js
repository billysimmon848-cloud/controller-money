const express = require("express");

const {
  HDNodeWallet
} = require("ethers");

const BnbDepositAddress =
  require("../models/bnbDepositAddress");

const auth =
  require("../middleware/auth");

const router =
  express.Router();


// ======================================================
// MASTER MNEMONIC
// ======================================================

const MASTER_MNEMONIC =
  process.env.BNB_MASTER_MNEMONIC;


// ======================================================
// CHECK MASTER MNEMONIC
// ======================================================

if (!MASTER_MNEMONIC) {

  console.warn(
    "WARNING: BNB_MASTER_MNEMONIC is not set."
  );

}


// ======================================================
// CREATE BNB ADDRESS
// ======================================================
//
// Index 0 is reserved for the REAL TREASURY.
//
// Customer addresses start at index 1.
//
// Treasury:
// m/44'/60'/0'/0/0
//
// Customers:
// m/44'/60'/0'/0/1
// m/44'/60'/0'/0/2
// m/44'/60'/0'/0/3
//
// ======================================================

function createBnbAddress(
  derivationIndex
) {

  if (!MASTER_MNEMONIC) {

    throw new Error(
      "BNB master mnemonic is not configured."
    );

  }


  const path =
    `m/44'/60'/0'/0/${derivationIndex}`;


  const wallet =
    HDNodeWallet.fromPhrase(
      MASTER_MNEMONIC,
      undefined,
      path
    );


  return wallet.address;

}


// ======================================================
// GET OR CREATE BNB DEPOSIT ADDRESS
// ======================================================
//
// GET /api/bnb/address
//
// ======================================================

router.get(
  "/address",
  auth,
  async (req, res) => {

    try {

      // ================================================
      // CHECK EXISTING ADDRESS
      // ================================================

      let depositAddress =
        await BnbDepositAddress.findOne({
          user: req.userId
        });


      // ================================================
      // ADDRESS ALREADY EXISTS
      // ================================================

      if (depositAddress) {

        return res.json({

          success: true,

          address:
            depositAddress.address,

          active:
            depositAddress.active

        });

      }


      // ================================================
      // FIND LAST CUSTOMER ADDRESS
      // ================================================

      const latestAddress =
        await BnbDepositAddress
          .findOne({
            derivationIndex: {
              $gte: 1
            }
          })
          .sort({
            derivationIndex: -1
          });


      // ================================================
      // FIRST CUSTOMER STARTS AT INDEX 1
      // ================================================

      let derivationIndex =
        1;


      if (latestAddress) {

        derivationIndex =
          latestAddress.derivationIndex + 1;

      }


      // ================================================
      // GENERATE ADDRESS
      // ================================================

      const address =
        createBnbAddress(
          derivationIndex
        );


      // ================================================
      // SAVE ADDRESS
      // ================================================

      depositAddress =
        await BnbDepositAddress.create({

          user:
            req.userId,

          address,

          derivationIndex,

          active: true

        });


      // ================================================
      // RETURN PUBLIC ADDRESS
      // ================================================

      return res.json({

        success: true,

        address:
          depositAddress.address,

        active:
          depositAddress.active

      });


    } catch (error) {

      console.error(
        "GET BNB ADDRESS ERROR:",
        error
      );


      // ================================================
      // DUPLICATE USER RACE CONDITION
      // ================================================

      if (
        error.code === 11000
      ) {

        try {

          const existingAddress =
            await BnbDepositAddress.findOne({
              user: req.userId
            });


          if (existingAddress) {

            return res.json({

              success: true,

              address:
                existingAddress.address,

              active:
                existingAddress.active

            });

          }

        } catch (retryError) {

          console.error(
            "BNB ADDRESS RETRY ERROR:",
            retryError
          );

        }

      }


      return res.status(500).json({

        message:
          "Unable to create BNB deposit address."

      });

    }

  }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports =
  router;