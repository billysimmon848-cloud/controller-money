require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const trackingRoutes = require("./routes/tracking");
const shipmentRoutes = require("./routes/shipment");
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const bankingRoutes = require("./routes/banking");
const adminRoutes = require("./routes/admin");
const flightRoutes = require("./routes/flight");
const bnbRoutes = require("./routes/bnb");

const startBnbMonitor =
  require("./services/bnbMonitor");

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(
  express.json({
    limit: "10mb"
  })
);


// ======================================================
// TEST SERVER
// ======================================================

app.get(
  "/test",
  (req, res) => {

    res.json({

      serverVersion:
        "SERVER-V2",

      message:
        "This is the current JustDoks backend"

    });

  }
);


// ======================================================
// ROUTES
// ======================================================

app.use(
  "/api/tracking",
  trackingRoutes
);

app.use(
  "/api/shipments",
  shipmentRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/wallet",
  walletRoutes
);

app.use(
  "/api/banking",
  bankingRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/flights",
  flightRoutes
);

app.use(
  "/api/bnb",
  bnbRoutes
);


// ======================================================
// HOME
// ======================================================

app.get(
  "/",
  (req, res) => {

    res.json({

      message:
        "JustDoks backend is running"

    });

  }
);


// ======================================================
// PORT
// ======================================================

const PORT =
  process.env.PORT || 5000;


// ======================================================
// DATABASE CONNECTION
// ======================================================

mongoose
  .connect(
    process.env.MONGO_URI
  )

  .then(() => {

     (
      "MongoDB connected"
    );


    // ==================================================
    // START SERVER ONLY AFTER MONGODB CONNECTS
    // ==================================================

    app.listen(
      PORT,
      () => {

         (
          `Server running on port ${PORT}`
        );


        // ==============================================
        // START BNB BLOCKCHAIN MONITOR
        // ==============================================

        startBnbMonitor();

      }
    );

  })

  .catch(error => {

    console.error(
      "\n========================================"
    );

    console.error(
      "MongoDB connection failed"
    );

    console.error(
      "========================================"
    );

    console.error(
      "NAME:",
      error.name
    );

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "REASON:",
      error.reason ||
      "No additional reason provided"
    );

    console.error(
      "CODE:",
      error.code ||
      "No code"
    );

    console.error(
      "========================================\n"
    );

  });