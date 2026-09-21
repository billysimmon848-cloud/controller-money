const express = require("express");

const User = require("../models/user");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const LoginHistory = require("../models/loginHistory");
const Activity = require("../models/activity");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const walletRoutes = require("./wallet");

const router = express.Router();


router.use(auth);
router.use(admin);


// ======================================================
// ADMIN TEST
// ======================================================

router.get(
  "/test",
  (req, res) => {

    res.json({

      success:
        true,

      message:
        "Admin access confirmed"

    });

  }
);


// ======================================================
// TOTAL USERS
// ======================================================

router.get(
  "/users/count",
  async (req, res) => {

    try {

      const totalUsers =
        await User.countDocuments({

          role:
            "user"

        });


      return res.json({

        success:
          true,

        totalUsers

      });


    } catch (error) {

      console.error(
        "ADMIN USER COUNT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to get total users."

      });

    }

  }
);


// ======================================================
// SEARCH USERS
// ======================================================

router.get(
  "/users",
  async (req, res) => {

    try {

      const search =
        (req.query.search || "")
          .trim();


      let query = {};


      if (search) {

        query = {

          $or: [

            {
              email: {
                $regex: search,
                $options: "i"
              }
            },

            {
              name: {
                $regex: search,
                $options: "i"
              }
            }

          ]

        };

      }


      const users =
        await User.find(query)

          .select(
            "-password -resetPasswordToken -resetPasswordExpires"
          )

          .sort({
            createdAt:
              -1
          })

          .limit(50);


      return res.json({

        success:
          true,

        users

      });


    } catch (error) {

      console.error(
        "ADMIN SEARCH USERS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to search users."

      });

    }

  }
);


// ======================================================
// DISABLE USER
// ======================================================

router.post(
  "/users/:userId/disable",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      // ==================================================
      // PREVENT SELF-DISABLE
      // ==================================================

      if (
        user._id.toString() ===
        req.userId.toString()
      ) {

        return res.status(400).json({

          message:
            "You cannot disable your own account."

        });

      }


      if (user.isDisabled) {

        return res.status(400).json({

          message:
            "This account is already disabled."

        });

      }


      user.isDisabled =
        true;


      await user.save();


      // ==================================================
      // ACTIVITY
      // ==================================================

      await Activity.create({

        user:
          user._id,

        activity:
          "Account Disabled",

        service:
          "Account",

        amount:
          null,

        description:
          "Account disabled by administrator",

        reference:
          null,

        metadata: {

          performedBy:
            req.userId

        }

      });


      return res.json({

        success:
          true,

        message:
          "Account disabled successfully.",

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          isDisabled:
            user.isDisabled

        }

      });


    } catch (error) {

      console.error(
        "ADMIN DISABLE ACCOUNT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to disable account."

      });

    }

  }
);


// ======================================================
// ENABLE USER
// ======================================================

router.post(
  "/users/:userId/enable",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      if (!user.isDisabled) {

        return res.status(400).json({

          message:
            "This account is already active."

        });

      }


      user.isDisabled =
        false;


      await user.save();


      // ==================================================
      // ACTIVITY
      // ==================================================

      await Activity.create({

        user:
          user._id,

        activity:
          "Account Enabled",

        service:
          "Account",

        amount:
          null,

        description:
          "Account enabled by administrator",

        reference:
          null,

        metadata: {

          performedBy:
            req.userId

        }

      });


      return res.json({

        success:
          true,

        message:
          "Account enabled successfully.",

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          isDisabled:
            user.isDisabled

        }

      });


    } catch (error) {

      console.error(
        "ADMIN ENABLE ACCOUNT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to enable account."

      });

    }

  }
);


// ======================================================
// GET USER WALLET
// ======================================================

router.get(
  "/users/:userId/wallet",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        ).select(
          "-password -resetPasswordToken -resetPasswordExpires"
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      let wallet =
        await Wallet.findOne({

          user:
            user._id

        });


      if (!wallet) {

        wallet =
          await Wallet.create({

            user:
              user._id,

            balance:
              0

          });

      }


      return res.json({

        success:
          true,

        user,

        wallet

      });


    } catch (error) {

      console.error(
        "ADMIN GET WALLET ERROR:",
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
// GET USER TRANSACTIONS
// ======================================================

router.get(
  "/users/:userId/transactions",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      const transactions =
        await Transaction.find({

          user:
            user._id

        })

          .sort({
            createdAt:
              -1
          })

          .limit(100);


      return res.json({

        success:
          true,

        transactions

      });


    } catch (error) {

      console.error(
        "ADMIN TRANSACTIONS ERROR:",
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
// GET USER ACTIVITY
// ======================================================

router.get(
  "/users/:userId/activity",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      const activities =
        await Activity.find({

          user:
            user._id

        })

          .sort({
            createdAt:
              -1
          })

          .limit(100);


      return res.json({

        success:
          true,

        activities

      });


    } catch (error) {

      console.error(
        "ADMIN ACTIVITY ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to load activity."

      });

    }

  }
);


// ======================================================
// GET LOGIN HISTORY
// ======================================================

router.get(
  "/users/:userId/login-history",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      const loginHistory =
        await LoginHistory.find({

          user:
            user._id

        })

          .sort({
            loginAt:
              -1
          })

          .limit(100);


      return res.json({

        success:
          true,

        loginHistory

      });


    } catch (error) {

      console.error(
        "ADMIN LOGIN HISTORY ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Unable to load login history."

      });

    }

  }
);


// ======================================================
// CREDIT WALLET
// ======================================================

router.post(
  "/users/:userId/credit",
  async (req, res) => {

    try {

      const {
        amount,
        description,
        reference
      } = req.body;


      const cleanAmount =
        Number(amount);


      if (
        !Number.isFinite(cleanAmount) ||
        cleanAmount <= 0
      ) {

        return res.status(400).json({

          message:
            "Enter a valid amount."

        });

      }


      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      const result =
        await walletRoutes.creditWallet({

          userId:
            user._id,

          amount:
            cleanAmount,

          description:
            description ||
            "Admin wallet credit",

          reference:
            reference ||
            "",

          source:
            "admin",

          createdBy:
            req.userId

        });


      await Activity.create({

        user:
          user._id,

        activity:
          "Wallet Credited",

        service:
          "Wallet",

        amount:
          cleanAmount,

        description:
          description ||
          "Admin wallet credit",

        reference:
          reference ||
          null,

        metadata: {

          performedBy:
            req.userId

        }

      });


      return res.json({

        success:
          true,

        message:
          "Wallet credited successfully.",

        wallet:
          result

      });


    } catch (error) {

      console.error(
        "ADMIN CREDIT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          error.message ||
          "Unable to credit wallet."

      });

    }

  }
);


// ======================================================
// DEBIT WALLET
// ======================================================

router.post(
  "/users/:userId/debit",
  async (req, res) => {

    try {

      const {
        amount,
        description,
        reference
      } = req.body;


      const cleanAmount =
        Number(amount);


      if (
        !Number.isFinite(cleanAmount) ||
        cleanAmount <= 0
      ) {

        return res.status(400).json({

          message:
            "Enter a valid amount."

        });

      }


      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      const result =
        await walletRoutes.debitWallet({

          userId:
            user._id,

          amount:
            cleanAmount,

          description:
            description ||
            "Admin wallet debit",

          reference:
            reference ||
            "",

          source:
            "admin",

          createdBy:
            req.userId

        });


      await Activity.create({

        user:
          user._id,

        activity:
          "Wallet Debited",

        service:
          "Wallet",

        amount:
          -cleanAmount,

        description:
          description ||
          "Admin wallet debit",

        reference:
          reference ||
          null,

        metadata: {

          performedBy:
            req.userId

        }

      });


      return res.json({

        success:
          true,

        message:
          "Wallet debited successfully.",

        wallet:
          result

      });


    } catch (error) {

      console.error(
        "ADMIN DEBIT ERROR:",
        error
      );


      return res.status(500).json({

        message:
          error.message ||
          "Unable to debit wallet."

      });

    }

  }
);


// ======================================================
// REFUND WALLET
// ======================================================

router.post(
  "/users/:userId/refund",
  async (req, res) => {

    try {

      const {
        amount,
        description,
        reference
      } = req.body;


      const cleanAmount =
        Number(amount);


      if (
        !Number.isFinite(cleanAmount) ||
        cleanAmount <= 0
      ) {

        return res.status(400).json({

          message:
            "Enter a valid amount."

        });

      }


      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      const result =
        await walletRoutes.creditWallet({

          userId:
            user._id,

          amount:
            cleanAmount,

          description:
            description ||
            "Admin wallet refund",

          reference:
            reference ||
            "",

          source:
            "admin",

          createdBy:
            req.userId,

          type:
            "refund"

        });


      await Activity.create({

        user:
          user._id,

        activity:
          "Wallet Refunded",

        service:
          "Wallet",

        amount:
          cleanAmount,

        description:
          description ||
          "Admin wallet refund",

        reference:
          reference ||
          null,

        metadata: {

          performedBy:
            req.userId

        }

      });


      return res.json({

        success:
          true,

        message:
          "Wallet refunded successfully.",

        wallet:
          result

      });


    } catch (error) {

      console.error(
        "ADMIN REFUND ERROR:",
        error
      );


      return res.status(500).json({

        message:
          error.message ||
          "Unable to refund wallet."

      });

    }

  }
);


module.exports =
  router;