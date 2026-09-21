const jwt = require("jsonwebtoken");

const User = require("../models/user");


const auth = async (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;


    // ==================================================
    // CHECK AUTHORIZATION HEADER
    // ==================================================

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({

        message:
          "Authentication required"

      });

    }


    // ==================================================
    // GET TOKEN
    // ==================================================

    const token =
      authHeader.split(" ")[1];


    // ==================================================
    // VERIFY TOKEN
    // ==================================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User.findById(
        decoded.userId
      ).select(
        "_id isDisabled"
      );


    if (!user) {

      return res.status(401).json({

        message:
          "Account not found"

      });

    }


    // ==================================================
    // CHECK ACCOUNT STATUS
    // ==================================================

    if (user.isDisabled) {

      return res.status(403).json({

        message:
          "Your account has been disabled."

      });

    }


    // ==================================================
    // SAVE USER ID
    // ==================================================

    req.userId =
      user._id;


    next();


  } catch (error) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );


    return res.status(401).json({

      message:
        "Invalid or expired token"

    });

  }

};


module.exports =
  auth;