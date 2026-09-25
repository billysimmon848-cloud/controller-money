const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const Wallet = require("../models/wallet");
const LoginHistory = require("../models/loginHistory");
const Activity = require("../models/activity");

const auth = require("../middleware/auth");

const router = express.Router();


// ======================================================
// AUTH TEST
// ======================================================

router.get("/test", (req, res) => {

  res.json({

    authVersion: "AUTH-V5",

    message:
      "This is the current auth.js file"

  });

});


// ======================================================
// SIGNUP
// ======================================================

router.post("/signup", async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;


    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({

        message:
          "Name, email and password are required"

      });

    }


    if (password.length < 6) {

      return res.status(400).json({

        message:
          "Password must be at least 6 characters long"

      });

    }


    const cleanEmail =
      email.toLowerCase().trim();


    const existingUser =
      await User.findOne({
        email: cleanEmail
      });


    if (existingUser) {

      return res.status(400).json({

        message:
          "Email is already registered"

      });

    }


    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    const user =
      await User.create({

        name:
          name.trim(),

        email:
          cleanEmail,

        password:
          hashedPassword,

        role:
          "user"

      });


    // ==================================================
    // CREATE WALLET
    // ==================================================

    await Wallet.create({

      user:
        user._id,

      balance:
        0

    });


    // ==================================================
    // ACCOUNT ACTIVITY
    // ==================================================

    await Activity.create({

      user:
        user._id,

      activity:
        "Account Created",

      service:
        "Account",

      amount:
        null,

      description:
        "Account created successfully",

      reference:
        null,

      metadata: {

        email:
          user.email,

        role:
          user.role

      }

    });


    // ==================================================
    // CREATE TOKEN
    // ==================================================

    const token =
      jwt.sign(

        {
          userId:
            user._id

        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "7d"
        }

      );


     (
      `ACCOUNT CREATED: ${user.email}`
    );


    return res.status(201).json({

      authVersion:
        "AUTH-V5",

      message:
        "Account created successfully",

      token,

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role

      }

    });


  } catch (error) {

    console.error(
      "SIGNUP ERROR:",
      error
    );


    return res.status(500).json({

      message:
        "Server error"

    });

  }

});


// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    if (
      !email ||
      !password
    ) {

      return res.status(400).json({

        message:
          "Email and password are required"

      });

    }


    const cleanEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({

        email:
          cleanEmail

      });


    if (!user) {

      return res.status(401).json({

        message:
          "Invalid email or password"

      });

    }


    // ==================================================
    // CHECK PASSWORD
    // ==================================================

    const passwordMatch =
      await bcrypt.compare(

        password,

        user.password

      );


    if (!passwordMatch) {

      return res.status(401).json({

        message:
          "Invalid email or password"

      });

    }


    // ==================================================
    // CHECK ACCOUNT STATUS
    // ==================================================

    if (user.isDisabled) {

      return res.status(403).json({

        message:
          "Your account has been disabled. Please contact support."

      });

    }


    // ==================================================
    // LOGIN INFORMATION
    // ==================================================

    const loginTime =
      new Date();


    user.lastLoginAt =
      loginTime;


    user.lastLoginIp =
      req.ip;


    await user.save();


    // ==================================================
    // LOGIN HISTORY
    // ==================================================

    const loginHistory =
      await LoginHistory.create({

        user:
          user._id,

        loginAt:
          loginTime,

        ipAddress:
          req.ip

      });


    // ==================================================
    // LOGIN ACTIVITY
    // ==================================================

    await Activity.create({

      user:
        user._id,

      activity:
        "Login",

      service:
        "Account",

      amount:
        null,

      description:
        "User logged in",

      reference:
        null,

      metadata: {

        ipAddress:
          req.ip,

        loginHistoryId:
          loginHistory._id

      }

    });


     (
      `USER LOGIN: ${user.email}`
    );


    // ==================================================
    // CREATE TOKEN
    // ==================================================

    const token =
      jwt.sign(

        {
          userId:
            user._id

        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "7d"

        }

      );


    return res.json({

      message:
        "Login successful",

      token,

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        lastLoginAt:
          user.lastLoginAt

      }

    });


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    return res.status(500).json({

      message:
        "Server error"

    });

  }

});


// ======================================================
// GET CURRENT USER
// ======================================================

router.get(
  "/me",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.userId
        ).select(
          "-password -resetPasswordToken -resetPasswordExpires"
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found"

        });

      }


      return res.json({

        user

      });


    } catch (error) {

      console.error(
        "GET ME ERROR:",
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
// FORGOT PASSWORD
// ======================================================

router.post(
  "/forgot-password",
  async (req, res) => {

    try {

      const {
        email
      } = req.body;


      if (!email) {

        return res.status(400).json({

          message:
            "Email is required"

        });

      }


      const cleanEmail =
        email.toLowerCase().trim();


      const user =
        await User.findOne({

          email:
            cleanEmail

        });


      if (!user) {

        return res.json({

          message:
            "If the account exists, a password reset link has been created."

        });

      }


      const resetToken =
        crypto.randomBytes(32).toString("hex");


      const hashedToken =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");


      user.resetPasswordToken =
        hashedToken;


      user.resetPasswordExpires =
        Date.now() +
        15 * 60 * 1000;


      await user.save();


      const resetLink =
        `http://localhost:3000/login.html?token=${resetToken}&email=${encodeURIComponent(user.email)}`;


       (
        "PASSWORD RESET LINK:",
        resetLink
      );


      return res.json({

        message:
          "If the account exists, a password reset link has been created.",

        devResetLink:
          resetLink

      });


    } catch (error) {

      console.error(
        "FORGOT PASSWORD ERROR:",
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
// RESET PASSWORD
// ======================================================

router.post(
  "/reset-password",
  async (req, res) => {

    try {

      const {
        token,
        email,
        password
      } = req.body;


      if (
        !token ||
        !email ||
        !password
      ) {

        return res.status(400).json({

          message:
            "Token, email and password are required"

        });

      }


      if (password.length < 6) {

        return res.status(400).json({

          message:
            "Password must be at least 6 characters long"

        });

      }


      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");


      const user =
        await User.findOne({

          email:
            email.toLowerCase().trim(),

          resetPasswordToken:
            hashedToken,

          resetPasswordExpires:
            {
              $gt: Date.now()
            }

        });


      if (!user) {

        return res.status(400).json({

          message:
            "Invalid or expired reset token"

        });

      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      user.password =
        hashedPassword;


      user.resetPasswordToken =
        null;


      user.resetPasswordExpires =
        null;


      await user.save();


      await Activity.create({

        user:
          user._id,

        activity:
          "Password Reset",

        service:
          "Account",

        amount:
          null,

        description:
          "Password was reset successfully",

        reference:
          null,

        metadata:
          {}

      });


      return res.json({

        message:
          "Password reset successfully"

      });


    } catch (error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Server error"

      });

    }

  }
);


module.exports =
  router;