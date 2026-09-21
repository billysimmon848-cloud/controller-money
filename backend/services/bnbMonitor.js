const {
  JsonRpcProvider,
  formatEther
} = require("ethers");


const BnbDepositAddress =
  require("../models/bnbDepositAddress");


const BnbDeposit =
  require("../models/bnbDeposit");


const Transaction =
  require("../models/transaction");


const sweepDeposit =
  require("./bnbSweep");


const {
  creditWallet
} =
  require("../routes/wallet");


const getBnbUsdPrice =
  require("./bnbPrice");


const provider =
  new JsonRpcProvider(
    process.env.BNB_RPC_URL
  );


const REQUIRED_CONFIRMATIONS =
  3;


const CONFIRMATION_INTERVAL =
  3000;


const PRICE_CACHE_TIME =
  30000;


let depositAddresses = [];


let cachedBnbPrice = null;


let cachedBnbPriceTime = 0;


let processingDepositIds =
  new Set();


// ======================================================
// LOAD DEPOSIT ADDRESSES
// ======================================================

async function loadDepositAddresses() {

  try {

    depositAddresses =
      await BnbDepositAddress.find({
        active: true
      });

  } catch (error) {

    console.error(
      "BNB ADDRESS LOAD ERROR:",
      error
    );

  }
}


// ======================================================
// ADDRESS MAP
// ======================================================

function createAddressMap() {

  const addressMap =
    new Map();

  depositAddresses.forEach(
    function (depositAddress) {

      addressMap.set(
        depositAddress.address.toLowerCase(),
        depositAddress
      );

    }
  );

  return addressMap;
}


// ======================================================
// GET BNB PRICE
// ======================================================

async function getCachedBnbUsdPrice() {

  const now =
    Date.now();


  if (
    cachedBnbPrice &&
    now - cachedBnbPriceTime <
      PRICE_CACHE_TIME
  ) {

    return cachedBnbPrice;

  }


  const price =
    await getBnbUsdPrice();


  cachedBnbPrice =
    price;


  cachedBnbPriceTime =
    now;


  console.log(
    "BNB/USD PRICE UPDATED:",
    price
  );


  return price;
}


// ======================================================
// CHECK BLOCK
// ======================================================

async function checkBlock(
  blockNumber
) {

  try {

    const block =
      await provider.getBlock(
        blockNumber,
        true
      );


    if (!block) {
      return;
    }


    const addressMap =
      createAddressMap();


    if (
      addressMap.size === 0
    ) {
      return;
    }


    for (
      const transaction
      of block.prefetchedTransactions
    ) {

      if (!transaction.to) {
        continue;
      }


      const receivingAddress =
        transaction.to.toLowerCase();


      const depositAddress =
        addressMap.get(
          receivingAddress
        );


      if (!depositAddress) {
        continue;
      }


      const amountBnb =
        Number(
          formatEther(
            transaction.value
          )
        );


      if (
        amountBnb <= 0
      ) {
        continue;
      }


      const existingDeposit =
        await BnbDeposit.findOne({
          transactionHash:
            transaction.hash
        });


      if (existingDeposit) {
        continue;
      }


      try {

        await BnbDeposit.create({

          user:
            depositAddress.user,

          address:
            depositAddress.address,

          transactionHash:
            transaction.hash,

          amountBnb:
            amountBnb,

          blockNumber:
            blockNumber,

          confirmations:
            1,

          status:
            "pending"

        });

      } catch (error) {

        if (
          error.code === 11000
        ) {
          continue;
        }

        throw error;
      }


      console.log("");

      console.log(
        "========================================"
      );

      console.log(
        "BNB DEPOSIT DETECTED"
      );

      console.log(
        "========================================"
      );

      console.log(
        "User:",
        depositAddress.user.toString()
      );

      console.log(
        "Address:",
        depositAddress.address
      );

      console.log(
        "Amount:",
        amountBnb,
        "BNB"
      );

      console.log(
        "Transaction:",
        transaction.hash
      );

      console.log(
        "Status: pending"
      );

      console.log(
        "========================================"
      );

    }

  } catch (error) {

    console.error(
      "BNB BLOCK ERROR:",
      error
    );

  }
}


// ======================================================
// PROCESS CONFIRMED DEPOSIT
// ======================================================

async function processConfirmedDeposit(
  deposit
) {

  const depositId =
    deposit._id.toString();


  if (
    processingDepositIds.has(
      depositId
    )
  ) {

    return;

  }


  processingDepositIds.add(
    depositId
  );


  try {

    // ==================================================
    // CLAIM DEPOSIT
    // ==================================================

    const processingDeposit =
      await BnbDeposit.findOneAndUpdate(

        {
          _id:
            deposit._id,

          status:
            "confirmed"
        },

        {
          $set: {
            status:
              "processing"
          }
        },

        {
          new: true
        }

      );


    if (!processingDeposit) {

      return;

    }


    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "PROCESSING CONFIRMED BNB DEPOSIT"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Transaction:",
      processingDeposit.transactionHash
    );

    console.log(
      "Amount:",
      processingDeposit.amountBnb,
      "BNB"
    );


    // ==================================================
    // CHECK FOR EXISTING WALLET TRANSACTION
    // ==================================================
    //
    // This protects against duplicate wallet credits
    // if the server ever crashes after crediting the
    // wallet but before marking the BNB deposit credited.
    //
    // ==================================================

    const existingWalletTransaction =
      await Transaction.findOne({
        user:
          processingDeposit.user,

        reference:
          processingDeposit.transactionHash,

        source:
          "bnb",

        type:
          "deposit"
      });


    if (
      existingWalletTransaction
    ) {

      console.log(
        "Existing BNB wallet transaction found."
      );


      await BnbDeposit.findOneAndUpdate(

        {
          _id:
            processingDeposit._id,

          status:
            "processing"
        },

        {
          $set: {

            usdAmount:
              existingWalletTransaction.amount,

            creditedAt:
              processingDeposit.creditedAt ||
              new Date(),

            walletTransactionId:
              existingWalletTransaction._id,

            status:
              "credited"

          }
        }

      );


      console.log(
        "Deposit marked as already credited."
      );


      return;

    }


    // ==================================================
    // GET BNB PRICE
    // ==================================================

    const exchangeRate =
      await getCachedBnbUsdPrice();


    const usdAmount =
      Number(
        (
          processingDeposit.amountBnb *
          exchangeRate
        ).toFixed(2)
      );


    if (
      usdAmount <= 0
    ) {

      throw new Error(
        "Calculated USD amount is invalid"
      );

    }


    console.log(
      "BNB/USD rate:",
      exchangeRate
    );


    console.log(
      "USD credit:",
      usdAmount
    );


    // ==================================================
    // CREDIT WALLET
    // ==================================================

    const walletResult =
      await creditWallet({

        userId:
          processingDeposit.user,

        amount:
          usdAmount,

        type:
          "deposit",

        source:
          "bnb",

        description:
          `BNB deposit ${processingDeposit.amountBnb} BNB converted at $${exchangeRate} per BNB`,

        reference:
          processingDeposit.transactionHash

      });


    if (
      !walletResult.success
    ) {

      throw new Error(
        "Wallet credit failed"
      );

    }


    // ==================================================
    // MARK AS CREDITED
    // ==================================================

    const creditedDeposit =
      await BnbDeposit.findOneAndUpdate(

        {
          _id:
            processingDeposit._id,

          status:
            "processing"
        },

        {
          $set: {

            usdAmount:
              usdAmount,

            exchangeRate:
              exchangeRate,

            creditedAt:
              new Date(),

            walletTransactionId:
              walletResult.transaction._id,

            status:
              "credited"

          }
        },

        {
          new: true
        }

      );


    if (!creditedDeposit) {

      console.error(
        "Deposit was credited but status update failed:",
        processingDeposit.transactionHash
      );

      return;

    }


    console.log(
      "Wallet credited:",
      usdAmount,
      "USD"
    );


    console.log(
      "New wallet balance:",
      walletResult.balance,
      "USD"
    );


    console.log(
      "BNB wallet credit completed."
    );


    // ==================================================
    // IMMEDIATE SWEEP
    // ==================================================

    console.log(
      "Starting immediate BNB sweep..."
    );


    const sweepResult =
      await sweepDeposit(
        creditedDeposit
      );


    if (
      sweepResult.success
    ) {

      await BnbDeposit.findOneAndUpdate(

        {
          _id:
            creditedDeposit._id
        },

        {
          $set: {

            sweepTransactionHash:
              sweepResult.transactionHash,

            sweepFeeBnb:
              sweepResult.feeBnb,

            sweptAt:
              new Date()

          }
        }

      );


      console.log("");

      console.log(
        "========================================"
      );

      console.log(
        "BNB DEPOSIT FULLY PROCESSED"
      );

      console.log(
        "========================================"
      );

      console.log(
        "Deposit:",
        processingDeposit.transactionHash
      );

      console.log(
        "BNB:",
        processingDeposit.amountBnb
      );

      console.log(
        "Rate:",
        exchangeRate
      );

      console.log(
        "USD credited:",
        usdAmount
      );

      console.log(
        "Sweep:",
        sweepResult.transactionHash
      );

      console.log(
        "Sweep fee:",
        sweepResult.feeBnb,
        "BNB"
      );

      console.log(
        "========================================"
      );

    } else {

      console.error(
        "BNB SWEEP FAILED:"
      );

      console.error(
        sweepResult.error
      );

      console.log(
        "Wallet was already credited."
      );

    }

  } catch (error) {

    console.error("");

    console.error(
      "========================================"
    );

    console.error(
      "BNB DEPOSIT PROCESSING FAILED"
    );

    console.error(
      "========================================"
    );

    console.error(
      "Transaction:",
      deposit.transactionHash
    );

    console.error(
      "ERROR:",
      error.message
    );

    console.error(
      "========================================"
    );


    // ==================================================
    // RETURN TO CONFIRMED
    // ==================================================
    //
    // This allows a later retry without leaving the
    // deposit permanently stuck in "processing".
    //
    // ==================================================

    await BnbDeposit.findOneAndUpdate(

      {
        _id:
          deposit._id,

        status:
          "processing"
      },

      {
        $set: {
          status:
            "confirmed"
        }
      }

    );

  } finally {

    processingDepositIds.delete(
      depositId
    );

  }
}


// ======================================================
// UPDATE PENDING DEPOSITS
// ======================================================

async function updatePendingDeposits() {

  try {

    const currentBlockNumber =
      await provider.getBlockNumber();


    const pendingDeposits =
      await BnbDeposit.find({
        status:
          "pending"
      });


    for (
      const deposit
      of pendingDeposits
    ) {

      const confirmations =
        currentBlockNumber -
        deposit.blockNumber +
        1;


      await BnbDeposit.findOneAndUpdate(

        {
          _id:
            deposit._id,

          status:
            "pending"
        },

        {
          $set: {
            confirmations:
              confirmations
          }
        }

      );


      if (
        confirmations <
        REQUIRED_CONFIRMATIONS
      ) {

        continue;

      }


      const confirmedDeposit =
        await BnbDeposit.findOneAndUpdate(

          {
            _id:
              deposit._id,

            status:
              "pending"
          },

          {
            $set: {

              confirmations:
                confirmations,

              status:
                "confirmed"

            }
          },

          {
            new: true
          }

        );


      if (!confirmedDeposit) {
        continue;
      }


      await processConfirmedDeposit(
        confirmedDeposit
      );

    }


    // ==================================================
    // RETRY CONFIRMED DEPOSITS
    // ==================================================
    //
    // Only retry deposits that have been updated recently.
    //
    // This prevents old historical deposits from being
    // automatically processed when the server starts.
    //
    // ==================================================

    const retrySince =
      new Date(
        Date.now() -
        15000
      );


    const confirmedDeposits =
      await BnbDeposit.find({

        status:
          "confirmed",

        updatedAt: {
          $gte:
            retrySince
        }

      });


    for (
      const deposit
      of confirmedDeposits
    ) {

      await processConfirmedDeposit(
        deposit
      );

    }

  } catch (error) {

    console.error(
      "BNB CONFIRMATION ERROR:",
      error
    );

  }
}


// ======================================================
// START BNB MONITOR
// ======================================================

async function startBnbMonitor() {

  console.log(
    "BNB MONITOR STARTING..."
  );


  const network =
    await provider.getNetwork();


  console.log(
    "BNB NETWORK:",
    network.chainId.toString()
  );


  await loadDepositAddresses();


  console.log(
    "BNB DEPOSIT ADDRESSES:",
    depositAddresses.length
  );


  provider.on(
    "block",
    async function (
      blockNumber
    ) {

      await checkBlock(
        blockNumber
      );

    }
  );


  setInterval(
    async function () {

      await loadDepositAddresses();

    },
    30000
  );


  setInterval(
    async function () {

      await updatePendingDeposits();

    },
    CONFIRMATION_INTERVAL
  );


  console.log(
    "BNB MONITOR IS RUNNING."
  );

}


module.exports =
  startBnbMonitor;