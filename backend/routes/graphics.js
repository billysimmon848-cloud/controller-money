
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");

const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const Graphics = require("../models/graphics");
const auth = require("../middleware/auth");

const router = express.Router();

const CLEAN_GRAPHICS_PRICE = 3;


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({

  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024
  },

  fileFilter: (req, file, callback) => {

    if (file.mimetype !== "image/png") {

      return callback(
        new Error("Only PNG images are allowed.")
      );

    }

    callback(null, true);

  }

});


// ======================================================
// HANDLE GRAPHICS UPLOAD ERRORS
// ======================================================

const handleGraphicsUpload = (req, res, next) => {

  upload.fields([
    { name: "cleanPNG", maxCount: 1 },
    { name: "freePNG", maxCount: 1 }
  ])(req, res, (error) => {

    if (error) {

      return res.status(400).json({

        success: false,

        message: error instanceof multer.MulterError
          ? "PNG upload failed. Each image must be 15MB or smaller."
          : error.message || "Invalid PNG upload."

      });

    }

    next();

  });

};


// ======================================================
// GRIDFS
// ======================================================

function getGraphicsBucket() {

  return new GridFSBucket(
    mongoose.connection.db,
    {
      bucketName: "graphicsImages"
    }
  );

}


// ======================================================
// UPLOAD IMAGE TO GRIDFS
// ======================================================

function uploadImage(file, userId, graphicsId, kind) {

  return new Promise((resolve, reject) => {

    const bucket = getGraphicsBucket();

    const stream = bucket.openUploadStream(
      `${graphicsId}-${kind}.png`,
      {
        contentType: "image/png",

        metadata: {
          userId: userId.toString(),
          graphicsId: graphicsId.toString(),
          kind
        }
      }
    );

    stream.on("error", reject);

    stream.on("finish", () => {
      resolve(stream.id);
    });

    stream.end(file.buffer);

  });

}


// ======================================================
// DELETE GRIDFS IMAGE
// ======================================================

async function deleteImage(fileId) {

  if (!fileId) return;

  try {

    await getGraphicsBucket().delete(fileId);

  } catch (error) {

    console.error(
      "GRAPHICS IMAGE DELETE ERROR:",
      error.message
    );

  }

}


// ======================================================
// PAY FOR CLEAN GRAPHICS
// EXISTING ENDPOINT - PRESERVED
// ======================================================

router.post(
  "/clean-download",
  auth,
  async (req, res) => {

    try {

      const wallet = await Wallet.findOneAndUpdate(
        {
          user: req.userId,
          balance: {
            $gte: CLEAN_GRAPHICS_PRICE
          }
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

      } catch (transactionError) {

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

    } catch (error) {

      console.error(
        "GRAPHICS PAYMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Graphics payment could not be completed."
      });

    }

  }
);


// ======================================================
// SAVE NEW GRAPHICS DOCUMENT
// POST /api/graphics/save
// ======================================================

router.post(
  "/save",
  auth,
  handleGraphicsUpload,
  async (req, res) => {

    let cleanImageId = null;
    let freeImageId = null;

    let walletCharged = false;
    let graphicsCreated = false;

    let graphicsId;

    try {

      const {
        name,
        background,
        status
      } = req.body;


      // VALIDATE DOCUMENT DETAILS

      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof background !== "string" ||
        !background.trim() ||
        !["Free", "Clean"].includes(status)
      ) {

        return res.status(400).json({
          success: false,
          message: "Invalid graphics document details."
        });

      }


      // GET UPLOADED FILES

      const cleanFile = req.files?.cleanPNG?.[0];

      const freeFile = req.files?.freePNG?.[0];


      if (!cleanFile || (status === "Free" && !freeFile)) {

        return res.status(400).json({
          success: false,
          message: "Required PNG image is missing."
        });

      }


      // CREATE DOCUMENT ID

      graphicsId = new mongoose.Types.ObjectId();


      // UPLOAD CLEAN IMAGE

      cleanImageId = await uploadImage(
        cleanFile,
        req.userId,
        graphicsId,
        "clean"
      );


      // UPLOAD WATERMARKED IMAGE FOR FREE DOCUMENTS

      if (status === "Free") {

        freeImageId = await uploadImage(
          freeFile,
          req.userId,
          graphicsId,
          "free"
        );

      }


      // ==================================================
      // CHARGE WALLET FOR CLEAN DOCUMENTS
      // ==================================================

      let wallet = null;

      if (status === "Clean") {

        wallet = await Wallet.findOneAndUpdate(
          {
            user: req.userId,
            balance: {
              $gte: CLEAN_GRAPHICS_PRICE
            }
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


          await deleteImage(cleanImageId);

          cleanImageId = null;


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

        walletCharged = true;

      }


      // ==================================================
      // SAVE DOCUMENT DETAILS
      // ==================================================

      const graphics = await Graphics.create({

        _id: graphicsId,

        user: req.userId,

        name: name.trim(),

        background: background.trim(),

        status,

        cleanImageId,

        freeImageId

      });

      graphicsCreated = true;


      // ==================================================
      // RECORD PAYMENT FOR CLEAN DOCUMENTS
      // ==================================================

      let transaction = null;

      if (status === "Clean") {

        transaction = await Transaction.create({

          user: req.userId,

          type: "charge",

          amount: -CLEAN_GRAPHICS_PRICE,

          description: "Graphics Clean Document",

          source: "graphics",

          reference: graphics._id.toString()

        });

      }


      // ==================================================
      // SUCCESS RESPONSE
      // ==================================================

      return res.status(201).json({

        success: true,

        message: "Graphics document saved successfully.",

        balance: wallet ? wallet.balance : undefined,

        transactionId: transaction
          ? transaction._id
          : undefined,

        document: {

          id: graphics._id,

          name: graphics.name,

          background: graphics.background,

          status: graphics.status,

          createdAt: graphics.createdAt,

          imageUrl: `/api/graphics/image/${
            status === "Clean"
              ? graphics.cleanImageId
              : graphics.freeImageId
          }`

        }

      });

    } catch (error) {

      console.error(
        "SAVE GRAPHICS ERROR:",
        error
      );


      // REMOVE DOCUMENT IF IT WAS CREATED

      if (graphicsCreated && graphicsId) {

        try {

          await Graphics.deleteOne({
            _id: graphicsId,
            user: req.userId
          });

        } catch (deleteError) {

          console.error(
            "GRAPHICS DOCUMENT CLEANUP ERROR:",
            deleteError
          );

        }

      }


      // REFUND IF WALLET WAS CHARGED

      if (walletCharged) {

        try {

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

        } catch (refundError) {

          console.error(
            "GRAPHICS PAYMENT REFUND ERROR:",
            refundError
          );

        }

      }


      // DELETE UPLOADED IMAGES

      await deleteImage(cleanImageId);

      await deleteImage(freeImageId);


      return res.status(500).json({
        success: false,
        message: "Unable to save graphics document."
      });

    }

  }
);


// ======================================================
// GET USER GRAPHICS DOCUMENTS
// GET /api/graphics/my-documents
// ======================================================

router.get(
  "/my-documents",
  auth,
  async (req, res) => {

    try {

      const documents = await Graphics.find({
        user: req.userId
      })
        .sort({ createdAt: -1 })
        .lean();


      const result = documents.map((doc) => {

        const imageId =
          doc.status === "Clean"
            ? doc.cleanImageId
            : doc.freeImageId;


        return {

          id: doc._id,

          name: doc.name,

          background: doc.background,

          status: doc.status,

          createdAt: doc.createdAt,

          imageUrl: imageId
            ? `/api/graphics/image/${imageId}`
            : null

        };

      });


      return res.json({

        success: true,

        documents: result

      });

    } catch (error) {

      console.error(
        "GET GRAPHICS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve graphics documents."
      });

    }

  }
);


// ======================================================
// GET GRAPHICS PNG IMAGE
// GET /api/graphics/image/:fileId
// ======================================================

router.get(
  "/image/:fileId",
  auth,
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.fileId
        )
      ) {

        return res.status(400).json({
          success: false,
          message: "Invalid image ID."
        });

      }


      const fileId = new mongoose.Types.ObjectId(
        req.params.fileId
      );


      // ONLY ALLOW IMAGES BELONGING TO THIS USER

      const graphics = await Graphics.findOne({

        user: req.userId,

        $or: [
          {
            status: "Clean",
            cleanImageId: fileId
          },
          {
            status: "Free",
            freeImageId: fileId
          }
        ]

      });


      if (!graphics) {

        return res.status(404).json({
          success: false,
          message: "Graphics image not found."
        });

      }


      res.set("Content-Type", "image/png");

      res.set("Cache-Control", "private, no-store");


      const stream =
        getGraphicsBucket().openDownloadStream(fileId);


      stream.on("error", (error) => {

        console.error(
          "GRAPHICS IMAGE STREAM ERROR:",
          error
        );

        if (!res.headersSent) {

          res.status(404).json({
            success: false,
            message: "Graphics image not found."
          });

        } else {

          res.destroy(error);

        }

      });


      stream.pipe(res);

    } catch (error) {

      console.error(
        "GET GRAPHICS IMAGE ERROR:",
        error
      );

      if (!res.headersSent) {

        return res.status(500).json({
          success: false,
          message: "Unable to load graphics image."
        });

      }

    }

  }
);


// ======================================================
// UPGRADE FREE DOCUMENT TO CLEAN
// POST /api/graphics/:id/remove-watermark
// ======================================================

router.post(
  "/:id/remove-watermark",
  auth,
  async (req, res) => {

    let walletCharged = false;
    let documentUpdated = false;

    let originalFreeImageId = null;

    let graphics;


    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          success: false,
          message: "Invalid graphics document ID."
        });

      }


      graphics = await Graphics.findOne({

        _id: req.params.id,

        user: req.userId,

        status: "Free"

      });


      if (!graphics) {

        return res.status(404).json({
          success: false,
          message: "Free graphics document not found."
        });

      }


      originalFreeImageId = graphics.freeImageId;


      // DEDUCT WALLET BALANCE

      const wallet = await Wallet.findOneAndUpdate(
        {
          user: req.userId,
          balance: {
            $gte: CLEAN_GRAPHICS_PRICE
          }
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

      walletCharged = true;


      // UPDATE DOCUMENT STATUS

      graphics.status = "Clean";

      graphics.freeImageId = null;

      await graphics.save();

      documentUpdated = true;


      // RECORD TRANSACTION

      const transaction = await Transaction.create({

        user: req.userId,

        type: "charge",

        amount: -CLEAN_GRAPHICS_PRICE,

        description: "Graphics Watermark Removal",

        source: "graphics",

        reference: graphics._id.toString()

      });


      // DELETE OLD WATERMARKED IMAGE

      await deleteImage(originalFreeImageId);


      return res.json({

        success: true,

        paid: true,

        message: "Watermark removed successfully.",

        balance: wallet.balance,

        transactionId: transaction._id,

        document: {

          id: graphics._id,

          name: graphics.name,

          background: graphics.background,

          status: graphics.status,

          imageUrl:
            `/api/graphics/image/${graphics.cleanImageId}`

        }

      });

    } catch (error) {

      console.error(
        "GRAPHICS WATERMARK UPGRADE ERROR:",
        error
      );


      // RESTORE DOCUMENT IF OPERATION FAILED

      if (documentUpdated && graphics) {

        try {

          graphics.status = "Free";

          graphics.freeImageId = originalFreeImageId;

          await graphics.save();

        } catch (restoreError) {

          console.error(
            "GRAPHICS RESTORE ERROR:",
            restoreError
          );

        }

      }


      // REFUND IF WALLET WAS CHARGED

      if (walletCharged) {

        try {

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

        } catch (refundError) {

          console.error(
            "GRAPHICS REFUND ERROR:",
            refundError
          );

        }

      }


      return res.status(500).json({
        success: false,
        message: "Unable to upgrade graphics document."
      });

    }

  }
);

// ======================================================
// DELETE GRAPHICS DOCUMENT
// DELETE /api/graphics/:id
// ======================================================

router.delete(
  "/:id",
  auth,
  async (req, res) => {

    try {

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid graphics document ID."
        });
      }

      const graphics = await Graphics.findOneAndDelete({
        _id: req.params.id,
        user: req.userId
      });

      if (!graphics) {
        return res.status(404).json({
          success: false,
          message: "Graphics document not found."
        });
      }

      // Delete both possible image files.
      await deleteImage(graphics.cleanImageId);
      await deleteImage(graphics.freeImageId);

      return res.json({
        success: true,
        message: "Graphics document deleted successfully."
      });

    } catch (error) {

      console.error("DELETE GRAPHICS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete graphics document."
      });

    }

  }
);

module.exports = router;
