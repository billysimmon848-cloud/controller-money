const express = require("express");
const crypto = require("crypto");
const Shipment = require("../models/shipment");

const router = express.Router();


/* =========================
   TRACKING NUMBER
========================= */

function generateTrackingNumber() {
  return "MCL-" +
    crypto.randomBytes(6).toString("hex").toUpperCase();
}


/* =========================
   AUTOMATIC SHIPMENT JOURNEY
========================= */

function updateShipmentJourney(shipment) {

  /* ERROR IS CONTROLLED BY CONTROLLER */

  if (shipment.currentStatus === "Error") {
    return shipment;
  }


  if (!shipment.shipmentDate || !shipment.estimatedDelivery) {
    return shipment;
  }


  const startDate =
    new Date(shipment.shipmentDate).getTime();

  const endDate =
    new Date(shipment.estimatedDelivery).getTime();

  const now = Date.now();


  if (
    isNaN(startDate) ||
    isNaN(endDate) ||
    endDate <= startDate
  ) {
    return shipment;
  }


  const totalDuration =
    endDate - startDate;

  const elapsed =
    now - startDate;


  /* =========================
     JOURNEY STAGES
  ========================= */

  let status;
  let stageTime;


  if (elapsed <= 0) {

    status = "Processing";
    stageTime = startDate;

  } else if (now >= endDate) {

    status = "Delivered";
    stageTime = endDate;

  } else {

    const progress =
      elapsed / totalDuration;


    if (progress < 0.25) {

      status = "Processing";
      stageTime = startDate;

    } else if (progress < 0.50) {

      status = "Package Received";
      stageTime =
        startDate + totalDuration * 0.25;

    } else if (progress < 0.75) {

      status = "In Transit";
      stageTime =
        startDate + totalDuration * 0.50;

    } else {

      status = "Arrived";
      stageTime =
        startDate + totalDuration * 0.75;

    }

  }


  /* =========================
     UPDATE CURRENT STATUS
  ========================= */

  shipment.currentStatus = status;


  /* =========================
     CREATE TRACKING EVENTS
  ========================= */

  const stages = [
    {
      status: "Processing",
      location: shipment.origin,
      description:
        "Shipment has been created and is being prepared for dispatch.",
      time: startDate
    },

    {
      status: "Package Received",
      location: shipment.origin,
      description:
        "Package has been received and is ready for transportation.",
      time:
        startDate + totalDuration * 0.25
    },

    {
      status: "In Transit",
      location: shipment.origin,
      description:
        "Package is currently in transit to its destination.",
      time:
        startDate + totalDuration * 0.50
    },

    {
      status: "Arrived",
      location: shipment.destination,
      description:
        "Package has arrived at the destination area and is being prepared for final delivery.",
      time:
        startDate + totalDuration * 0.75
    },

    {
      status: "Delivered",
      location: shipment.destination,
      description:
        "Package has been successfully delivered.",
      time: endDate
    }
  ];


  /* =========================
     ADD ONLY REACHED EVENTS
  ========================= */

  stages.forEach(stage => {

    if (now < stage.time) {
      return;
    }


    const alreadyExists =
      shipment.trackingEvents.some(
        event =>
          event.status === stage.status
      );


    if (alreadyExists) {
      return;
    }


    shipment.trackingEvents.push({

      status: stage.status,

      location:
        stage.location || "Location unavailable",

      description:
        stage.description,

      timestamp:
        new Date(stage.time)

    });

  });


  /* =========================
     SORT EVENTS
  ========================= */

  shipment.trackingEvents.sort(
    (a, b) =>
      new Date(a.timestamp) -
      new Date(b.timestamp)
  );


  return shipment;
}


/* =========================
   CREATE SHIPMENT
========================= */

router.post("/", async (req, res) => {

  try {

    const {
      sender,
      senderEmail,
      recipient,
      recipientEmail,
      recipientAddress,
      origin,
      destination,
      packageContent,
      packageWeight,
      shipmentDate,
      estimatedDelivery,
      invoiceNumber,
      currentStatus,
      errorMessage
    } = req.body;


    /* =========================
       GENERATE UNIQUE TRACKING
    ========================= */

    let trackingNumber;
    let exists = true;


    while (exists) {

      trackingNumber =
        generateTrackingNumber();

      exists =
        await Shipment.exists({
          trackingNumber
        });

    }


    /* =========================
       INITIAL STATUS
    ========================= */

    const startingStatus =
      currentStatus === "Error"
        ? "Error"
        : "Processing";


    /* =========================
       CREATE SHIPMENT
    ========================= */

    const shipment =
      await Shipment.create({

        trackingNumber,

        sender,
        senderEmail,

        recipient,
        recipientEmail,
        recipientAddress,

        origin,
        destination,

        packageContent,
        packageWeight,

        shipmentDate,
        estimatedDelivery,

        invoiceNumber,

        currentStatus:
          startingStatus,

        errorMessage:
          startingStatus === "Error"
            ? errorMessage || ""
            : "",

        trackingEvents: []

      });


    /* =========================
       CREATE INITIAL JOURNEY
    ========================= */

    if (startingStatus !== "Error") {

      updateShipmentJourney(shipment);

      await shipment.save();

    }


    res.status(201).json(shipment);


  } catch (error) {

    console.error(
      "CREATE SHIPMENT ERROR:",
      error
    );


    res.status(500).json({
      message:
        "Could not create shipment"
    });

  }

});


/* =========================
   UPDATE SHIPMENT
   CONTROLLER WEBSITE
========================= */

router.patch(
  "/:trackingNumber",
  async (req, res) => {

    try {

      const trackingNumber =
        req.params.trackingNumber
          .trim()
          .toUpperCase();


      const shipment =
        await Shipment.findOne({
          trackingNumber
        });


      if (!shipment) {

        return res.status(404).json({
          message:
            "Tracking number not found"
        });

      }


      /* =========================
         UPDATE CONTROLLER FIELDS
      ========================= */

      Object.keys(req.body).forEach(key => {

        shipment[key] =
          req.body[key];

      });


      /* =========================
         ERROR HANDLING
      ========================= */

      if (
        shipment.currentStatus ===
        "Error"
      ) {

        shipment.errorMessage =
          req.body.errorMessage ||
          shipment.errorMessage ||
          "";

      } else {

        /*
          If controller removes Error,
          remove the old error message.
        */

        shipment.errorMessage = "";

      }


      /* =========================
         RESUME AUTOMATION
      ========================= */

      if (
        shipment.currentStatus !==
        "Error"
      ) {

        updateShipmentJourney(
          shipment
        );

      }


      await shipment.save();


      res.json(shipment);


    } catch (error) {

      console.error(
        "UPDATE SHIPMENT ERROR:",
        error
      );


      res.status(500).json({
        message:
          "Could not update shipment"
      });

    }

  }
);


/* =========================
   GET TRACKING
========================= */

router.get(
  "/:trackingNumber",
  async (req, res) => {

    try {

      const trackingNumber =
        req.params.trackingNumber
          .trim()
          .toUpperCase();


      const shipment =
        await Shipment.findOne({
          trackingNumber
        });


      if (!shipment) {

        return res.status(404).json({
          message:
            "Tracking number not found"
        });

      }


      /* =========================
         AUTOMATIC JOURNEY
      ========================= */

      if (
        shipment.currentStatus !==
        "Error"
      ) {

        updateShipmentJourney(
          shipment
        );

        await shipment.save();

      }


      res.json(shipment);


    } catch (error) {

      console.error(
        "TRACKING ERROR:",
        error
      );


      res.status(500).json({
        message:
          "Server error"
      });

    }

  }
);


module.exports = router;