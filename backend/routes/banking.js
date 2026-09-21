const express = require("express");
const mongoose = require("mongoose");

const BankAccount = require("../models/BankAccount");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const auth = require("../middleware/auth");

const router = express.Router();


// ======================================================
// BANKING PLAN SETTINGS
// ======================================================

const CLEAN_BANKING_PRICE = 15;
const CLEAN_BANKING_DURATION_DAYS = 30;


// ======================================================
// HELPER — NORMALIZE BOOLEAN
// ======================================================
//
// This prevents values such as:
// "false"
// "true"
// 0
// 1
//
// from being accidentally treated incorrectly.
//
// Everything is converted into a real Boolean.
//

function normalizeBoolean(value, defaultValue = true) {

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {

    const normalized =
      value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }

  }

  if (typeof value === "number") {

    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }

  }

  return defaultValue;
}


// ======================================================
// SUBSCRIPTION HELPERS
// ======================================================

function createSubscriptionDates() {

  const startedAt =
    new Date();

  const expiresAt =
    new Date(startedAt);

  expiresAt.setDate(
    expiresAt.getDate() +
    CLEAN_BANKING_DURATION_DAYS
  );

  return {
    startedAt,
    expiresAt
  };

}


async function refreshPlanStatus(account) {

  if (
    account.plan === "clean" &&
    account.subscriptionExpiresAt &&
    new Date(
      account.subscriptionExpiresAt
    ) <= new Date()
  ) {

    account.planStatus =
      "expired";

    await account.save();

  }

  return account;

}


// ======================================================
// ACCOUNT NUMBER GENERATOR
// ======================================================

async function generateAccountNumber() {

  let accountNumber;
  let exists = true;

  while (exists) {

    accountNumber =
      Math.floor(
        1000000000 +
        Math.random() * 9000000000
      ).toString();

    exists =
      await BankAccount.exists({
        accountNumber
      });

  }

  return accountNumber;

}


// ======================================================
// GET CONTROLLER USER'S BANKING ACCOUNTS
// ======================================================

router.get(
  "/accounts",
  auth,
  async (req, res) => {

    try {

      const accounts =
        await BankAccount.find({
          user: req.userId
        }).sort({
          createdAt: -1
        });


      for (const account of accounts) {

        await refreshPlanStatus(
          account
        );

      }


      return res.json({

        success: true,

        accounts

      });

    }
    catch (error) {

      console.error(
        "Get Banking accounts error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to load Banking accounts."

      });

    }

  }
);


// ======================================================
// CREATE BANKING ACCOUNT
// ======================================================

router.post(
  "/accounts",
  auth,
  async (req, res) => {

    try {

      const {

        accountPin,
        fullName,
        email,
        accountType,
        accountCurrency,
        transactionProcessingTime,
        withdrawalEnabled,
        withdrawalErrorMessage,
        plan

      } = req.body;


      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !accountPin ||
        !fullName ||
        !email ||
        !accountType ||
        !accountCurrency
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Please fill all required fields."

        });

      }


      if (
        !/^\d{4}$/.test(
          accountPin
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Account PIN must be exactly 4 digits."

        });

      }


      const selectedPlan =
        plan || "free";


      if (
        selectedPlan !== "free" &&
        selectedPlan !== "clean"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid Banking plan."

        });

      }


      // ==================================================
      // NORMALIZE WITHDRAWAL SETTINGS
      // ==================================================

      const normalizedWithdrawalEnabled =
        normalizeBoolean(
          withdrawalEnabled,
          true
        );


      const normalizedWithdrawalErrorMessage =
        typeof withdrawalErrorMessage === "string"
          ? withdrawalErrorMessage.trim()
          : "Withdrawal is currently unavailable.";


      // ==================================================
      // GENERATE ACCOUNT NUMBER
      // ==================================================

      const accountNumber =
        await generateAccountNumber();


      // ==================================================
      // DEFAULT FREE PLAN
      // ==================================================

      let planPrice = 0;

      let planStatus =
        "demo";

      let subscriptionStartedAt =
        null;

      let subscriptionExpiresAt =
        null;


      let wallet = null;

      let walletTransaction =
        null;


      // ==================================================
      // CLEAN PLAN
      // ======================================================

      if (
        selectedPlan === "clean"
      ) {

        wallet =
          await Wallet.findOne({
            user: req.userId
          });


        if (!wallet) {

          return res.status(400).json({

            success: false,

            message:
              "Wallet not found."

          });

        }


        if (
          wallet.balance <
          CLEAN_BANKING_PRICE
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Insufficient wallet balance. $${CLEAN_BANKING_PRICE} is required for Clean Banking.`

          });

        }


        // ----------------------------------------------
        // DEDUCT WALLET
        // ----------------------------------------------

        wallet.balance -=
          CLEAN_BANKING_PRICE;

        await wallet.save();


        // ----------------------------------------------
        // CREATE WALLET TRANSACTION
        // ----------------------------------------------

        walletTransaction =
          await Transaction.create({

            user:
              req.userId,

            type:
              "charge",

            amount:
              CLEAN_BANKING_PRICE,

            description:
              "Clean Banking Subscription",

            source:
              "banking"

          });


        // ----------------------------------------------
        // SUBSCRIPTION DATES
        // ----------------------------------------------

        const subscriptionDates =
          createSubscriptionDates();


        planPrice =
          CLEAN_BANKING_PRICE;


        planStatus =
          "paid";


        subscriptionStartedAt =
          subscriptionDates.startedAt;


        subscriptionExpiresAt =
          subscriptionDates.expiresAt;

      }


      // ==================================================
      // CREATE BANKING ACCOUNT
      // ==================================================

      try {

        const account =
          await BankAccount.create({

            user:
              req.userId,

            accountNumber,

            accountPin,

            fullName,

            email,

            accountType,

            accountCurrency,

            transactionProcessingTime:
              transactionProcessingTime ||
              "0",

            withdrawalEnabled:
              normalizedWithdrawalEnabled,

            withdrawalErrorMessage:
              normalizedWithdrawalErrorMessage,

            errorMessage:
              "",

            plan:
              selectedPlan,

            planPrice,

            planStatus,

            subscriptionStartedAt,

            subscriptionExpiresAt,

            balance:
              0,

            transactions:
              []

          });


        return res.status(201).json({

          success: true,

          message:
            selectedPlan === "clean"
              ? "Clean Banking account created successfully."
              : "Free Banking account created successfully.",

          account

        });

      }
      catch (accountError) {

        // ==================================================
        // ROLLBACK CLEAN PLAN PAYMENT
        // ==================================================

        if (wallet) {

          wallet.balance +=
            CLEAN_BANKING_PRICE;

          await wallet.save();

        }


        if (walletTransaction) {

          await Transaction.findByIdAndDelete(
            walletTransaction._id
          );

        }


        throw accountError;

      }


    }
    catch (error) {

      console.error(
        "Create Banking account error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to create Banking account."

      });

    }

  }
);


// ======================================================
// CHANGE BANKING PLAN
// ======================================================

router.post(
  "/accounts/:id/plan",
  auth,
  async (req, res) => {

    try {

      const {
        plan
      } = req.body;


      if (
        plan !== "free" &&
        plan !== "clean"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid Banking plan."

        });

      }


      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid account ID."

        });

      }


      const account =
        await BankAccount.findOne({

          _id:
            req.params.id,

          user:
            req.userId

        });


      if (!account) {

        return res.status(404).json({

          success: false,

          message:
            "Banking account not found."

        });

      }


      await refreshPlanStatus(
        account
      );


      // ==================================================
      // SWITCH TO FREE
      // ==================================================

      if (
        plan === "free"
      ) {

        account.plan =
          "free";

        account.planPrice =
          0;

        account.planStatus =
          "demo";

        account.subscriptionStartedAt =
          null;

        account.subscriptionExpiresAt =
          null;


        await account.save();


        return res.json({

          success: true,

          message:
            "Banking account switched to Free plan.",

          account

        });

      }


      // ==================================================
      // CLEAN ALREADY ACTIVE
      // ==================================================

      if (

        account.plan === "clean" &&

        account.planStatus === "paid" &&

        account.subscriptionExpiresAt &&

        new Date(
          account.subscriptionExpiresAt
        ) > new Date()

      ) {

        return res.json({

          success: true,

          message:
            "Clean Banking subscription is already active.",

          account

        });

      }


      // ==================================================
      // FIND WALLET
      // ==================================================

      const wallet =
        await Wallet.findOne({

          user:
            req.userId

        });


      if (!wallet) {

        return res.status(400).json({

          success: false,

          message:
            "Wallet not found."

        });

      }


      if (
        wallet.balance <
        CLEAN_BANKING_PRICE
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Insufficient wallet balance. $${CLEAN_BANKING_PRICE} is required.`

        });

      }


      // ==================================================
      // DEDUCT $15
      // ==================================================

      wallet.balance -=
        CLEAN_BANKING_PRICE;

      await wallet.save();


      let walletTransaction;


      try {

        const description =

          account.plan === "clean" &&
          account.planStatus === "expired"

            ? "Clean Banking Subscription Renewal"

            : "Clean Banking Subscription";


        walletTransaction =
          await Transaction.create({

            user:
              req.userId,

            type:
              "charge",

            amount:
              CLEAN_BANKING_PRICE,

            description,

            source:
              "banking"

          });


        const subscriptionDates =
          createSubscriptionDates();


        account.plan =
          "clean";

        account.planPrice =
          CLEAN_BANKING_PRICE;

        account.planStatus =
          "paid";

        account.subscriptionStartedAt =
          subscriptionDates.startedAt;

        account.subscriptionExpiresAt =
          subscriptionDates.expiresAt;


        await account.save();


        return res.json({

          success: true,

          message:
            "Clean Banking subscription activated successfully.",

          account

        });

      }
      catch (accountError) {

        wallet.balance +=
          CLEAN_BANKING_PRICE;

        await wallet.save();


        if (walletTransaction) {

          await Transaction.findByIdAndDelete(
            walletTransaction._id
          );

        }


        throw accountError;

      }


    }
    catch (error) {

      console.error(
        "Banking plan error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to update Banking plan."

      });

    }

  }
);


// ======================================================
// UPDATE BANKING ACCOUNT SETTINGS
// ======================================================

router.patch(
  "/accounts/:id",
  auth,
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid account ID."

        });

      }


      const account =
        await BankAccount.findOne({

          _id:
            req.params.id,

          user:
            req.userId

        });


      if (!account) {

        return res.status(404).json({

          success: false,

          message:
            "Banking account not found."

        });

      }


      const {

        fullName,
        email,
        accountType,
        accountCurrency,
        transactionProcessingTime,
        accountPin,
        withdrawalEnabled,
        withdrawalErrorMessage,
        errorMessage

      } = req.body;


      // ==================================================
      // BASIC SETTINGS
      // ==================================================

      if (
        fullName !== undefined
      ) {

        account.fullName =
          fullName;

      }


      if (
        email !== undefined
      ) {

        account.email =
          email;

      }


      if (
        accountType !== undefined
      ) {

        account.accountType =
          accountType;

      }


      if (
        accountCurrency !== undefined
      ) {

        account.accountCurrency =
          accountCurrency;

      }


      if (
        transactionProcessingTime !==
        undefined
      ) {

        account.transactionProcessingTime =
          transactionProcessingTime;

      }


      // ==================================================
      // ACCOUNT PIN
      // ==================================================

      if (
        accountPin !== undefined
      ) {

        if (
          !/^\d{4}$/.test(
            accountPin
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Account PIN must be exactly 4 digits."

          });

        }


        account.accountPin =
          accountPin;

      }


      // ==================================================
      // WITHDRAWAL ENABLE / DISABLE
      // ==================================================

      if (
        withdrawalEnabled !==
        undefined
      ) {

        account.withdrawalEnabled =
          normalizeBoolean(
            withdrawalEnabled,
            account.withdrawalEnabled
          );

      }


      // ==================================================
      // WITHDRAWAL ERROR MESSAGE
      // ==================================================

      if (
        withdrawalErrorMessage !==
        undefined
      ) {

        account.withdrawalErrorMessage =
          String(
            withdrawalErrorMessage
          ).trim();

      }


      // ==================================================
      // GENERAL CUSTOMER ACCOUNT MESSAGE
      // ==================================================

      if (
        errorMessage !==
        undefined
      ) {

        account.errorMessage =
          String(
            errorMessage
          ).trim();

      }


      await refreshPlanStatus(
        account
      );


      await account.save();


      return res.json({

        success: true,

        message:
          "Banking account updated successfully.",

        account

      });

    }
    catch (error) {

      console.error(
        "Update Banking account error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to update Banking account."

      });

    }

  }
);


// ======================================================
// DELETE BANKING ACCOUNT
// ======================================================

router.delete(
  "/accounts/:id",
  auth,
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid Banking account ID."

        });

      }


      const account =
        await BankAccount.findOne({

          _id:
            req.params.id,

          user:
            req.userId

        });


      if (!account) {

        return res.status(404).json({

          success: false,

          message:
            "Banking account not found."

        });

      }


      await BankAccount.deleteOne({

        _id:
          account._id

      });


      return res.json({

        success: true,

        message:
          "Banking profile deleted successfully."

      });

    }
    catch (error) {

      console.error(
        "Delete Banking account error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to delete Banking profile."

      });

    }

  }
);


// ======================================================
// CREDIT / DEBIT BANKING ACCOUNT
// ======================================================

router.post(
  "/accounts/:id/transactions",
  auth,
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid account ID."

        });

      }


      const {

        type,
        amount,
        description,
        date

      } = req.body;


      if (
        type !== "Credit" &&
        type !== "Debit"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Transaction type must be Credit or Debit."

        });

      }


      const numericAmount =
        Number(amount);


      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Transaction amount must be greater than zero."

        });

      }


      const account =
        await BankAccount.findOne({

          _id:
            req.params.id,

          user:
            req.userId

        });


      if (!account) {

        return res.status(404).json({

          success: false,

          message:
            "Banking account not found."

        });

      }


      await refreshPlanStatus(
        account
      );


      // ==================================================
      // CREDIT
      // ==================================================

      if (
        type === "Credit"
      ) {

        account.balance +=
          numericAmount;

      }


      // ==================================================
      // DEBIT
      // ==================================================

      if (
        type === "Debit"
      ) {

        if (
          account.balance <
          numericAmount
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Insufficient account balance."

          });

        }


        account.balance -=
          numericAmount;

      }


      // ==================================================
      // CREATE TRANSACTION
      // ==================================================

      const transaction = {

        type,

        amount:
          numericAmount,

        description:
          description || "",

        date:
          date
            ? new Date(date)
            : new Date(),

        balanceAfter:
          account.balance

      };


      account.transactions.unshift(
        transaction
      );


      await account.save();


      return res.json({

        success: true,

        message:
          `${type} transaction completed successfully.`,

        account

      });

    }
    catch (error) {

      console.error(
        "Banking transaction error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to process transaction."

      });

    }

  }
);


// ======================================================
// EXTERNAL BANKING — WITHDRAW
// ======================================================

router.post(
  "/accounts/:accountNumber/withdraw",
  async (req, res) => {

    try {

      const {
        amount
      } = req.body;


      const numericAmount =
        Number(amount);


      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Withdrawal amount must be greater than zero."

        });

      }


      const account =
        await BankAccount.findOne({

          accountNumber:
            req.params.accountNumber

        });


      if (!account) {

        return res.status(404).json({

          success: false,

          message:
            "Banking account not found."

        });

      }


      await refreshPlanStatus(
        account
      );


      // ==================================================
      // NORMALIZE EXISTING DATABASE VALUE
      // ==================================================

      account.withdrawalEnabled =
        normalizeBoolean(
          account.withdrawalEnabled,
          true
        );


      // ==================================================
      // WITHDRAWAL DISABLED
      // ==================================================

      if (
        account.withdrawalEnabled === false
      ) {

        return res.status(400).json({

          success: false,

          message:
            account.withdrawalErrorMessage ||
            "Withdrawal is currently unavailable."

        });

      }


      // ==================================================
      // BALANCE CHECK
      // ==================================================

      if (
        account.balance <
        numericAmount
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Insufficient account balance."

        });

      }


      // ==================================================
      // DEDUCT BALANCE
      // ==================================================

      account.balance -=
        numericAmount;


      account.transactions.unshift({

        type:
          "Debit",

        amount:
          numericAmount,

        description:
          "Withdrawal",

        date:
          new Date(),

        balanceAfter:
          account.balance

      });


      await account.save();


      return res.json({

        success: true,

        message:
          "Withdrawal successful.",

        account

      });

    }
    catch (error) {

      console.error(
        "Withdrawal error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to process withdrawal."

      });

    }

  }
);


// ======================================================
// EXTERNAL BANKING — GET ACCOUNT
// ======================================================

router.get(
  "/accounts/:accountNumber",
  async (req, res) => {

    try {

      const account =
        await BankAccount.findOne({

          accountNumber:
            req.params.accountNumber

        });


      if (!account) {

        return res.status(404).json({

          success: false,

          message:
            "Banking account not found."

        });

      }


      await refreshPlanStatus(
        account
      );


      // ==================================================
      // NORMALIZE WITHDRAWAL VALUE
      // ==================================================

      account.withdrawalEnabled =
        normalizeBoolean(
          account.withdrawalEnabled,
          true
        );


      await account.save();


      return res.json({

        success: true,

        account

      });

    }
    catch (error) {

      console.error(
        "Get Banking account error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to load Banking account."

      });

    }

  }
);


// ======================================================
// EXTERNAL BANKING — LOGIN
// ======================================================

router.post(
  "/login",
  async (req, res) => {

    try {

      const {

        accountNumber,
        accountPin

      } = req.body;


      if (
        !accountNumber ||
        !accountPin
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Account number and PIN are required."

        });

      }


      const account =
        await BankAccount.findOne({

          accountNumber

        });


      if (!account) {

        return res.status(401).json({

          success: false,

          message:
            "Invalid account number or PIN."

        });

      }


      if (
        account.accountPin !==
        accountPin
      ) {

        return res.status(401).json({

          success: false,

          message:
            "Invalid account number or PIN."

        });

      }


      await refreshPlanStatus(
        account
      );


      // ==================================================
      // NORMALIZE WITHDRAWAL VALUE
      // ==================================================

      account.withdrawalEnabled =
        normalizeBoolean(
          account.withdrawalEnabled,
          true
        );


      await account.save();


      return res.json({

        success: true,

        message:
          "Banking login successful.",

        account

      });

    }
    catch (error) {

      console.error(
        "Banking login error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Banking login failed."

      });

    }

  }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;