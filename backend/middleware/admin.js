const User = require("../models/user");


// ======================================================
// ADMIN AUTHORIZATION MIDDLEWARE
// ======================================================
//
// This middleware assumes that `auth.js` has already
// verified the JWT and created:
//
// req.userId
//
// It then checks MongoDB for the user's CURRENT role.
//
// ======================================================

const admin = async (req, res, next) => {

  try {

    // ==================================================
    // MAKE SURE AUTHENTICATION RAN FIRST
    // ==================================================

    if (!req.userId) {

      return res.status(401).json({

        message:
          "Authentication required"

      });

    }


    // ==================================================
    // FIND CURRENT USER
    // ==================================================

    const user =
      await User.findById(
        req.userId
      ).select("_id role");


    // ==================================================
    // USER NOT FOUND
    // ==================================================

    if (!user) {

      return res.status(401).json({

        message:
          "User not found"

      });

    }


    // ==================================================
    // CHECK ADMIN ROLE
    // ==================================================

    if (user.role !== "admin") {

      return res.status(403).json({

        message:
          "Admin access required"

      });

    }


    // ==================================================
    // ADMIN VERIFIED
    // ==================================================

    req.userRole =
      user.role;


    next();

  } catch (error) {

    console.error(
      "ADMIN MIDDLEWARE ERROR:",
      error
    );


    return res.status(500).json({

      message:
        "Server error"

    });

  }

};


module.exports =
  admin;