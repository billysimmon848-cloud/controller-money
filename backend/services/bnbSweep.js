const {
  HDNodeWallet,
  JsonRpcProvider,
  formatEther
} = require("ethers");

const BnbDepositAddress =
  require("../models/bnbDepositAddress");


const provider =
  new JsonRpcProvider(
    process.env.BNB_RPC_URL
  );


const MASTER_MNEMONIC =
  process.env.BNB_MASTER_MNEMONIC;


// ======================================================
// REAL TREASURY
// ======================================================
//
// Treasury:
// m/44'/60'/0'/0/0
//
// Customer addresses:
// m/44'/60'/0'/0/1
// m/44'/60'/0'/0/2
// etc.
//
// ======================================================

function getTreasuryWallet() {

  if (!MASTER_MNEMONIC) {

    throw new Error(
      "BNB master mnemonic is not configured."
    );

  }


  const treasuryPath =
    "m/44'/60'/0'/0/0";


  return HDNodeWallet
    .fromPhrase(
      MASTER_MNEMONIC,
      undefined,
      treasuryPath
    )
    .connect(provider);

}


// ======================================================
// GET CUSTOMER DEPOSIT WALLET
// ======================================================

function getDepositWallet(
  derivationIndex
) {

  if (!MASTER_MNEMONIC) {

    throw new Error(
      "BNB master mnemonic is not configured."
    );

  }


  const path =
    `m/44'/60'/0'/0/${derivationIndex}`;


  return HDNodeWallet
    .fromPhrase(
      MASTER_MNEMONIC,
      undefined,
      path
    )
    .connect(provider);

}


// ======================================================
// SWEEP DEPOSIT
// ======================================================

async function sweepDeposit(
  deposit
) {

  try {

    const depositAddress =
      await BnbDepositAddress.findOne({
        address:
          deposit.address
      });


    if (!depositAddress) {

      throw new Error(
        "Deposit address record not found."
      );

    }


    // ==================================================
    // SAFETY CHECK
    // ==================================================

    if (
      depositAddress.derivationIndex === 0
    ) {

      throw new Error(
        "Treasury address cannot be used as a customer deposit address."
      );

    }


    const depositWallet =
      getDepositWallet(
        depositAddress.derivationIndex
      );


    const treasuryWallet =
      getTreasuryWallet();


     ("");

     (
      "========================================"
    );

     (
      "BNB SWEEP STARTING"
    );

     (
      "========================================"
    );


     (
      "Deposit address:",
      depositWallet.address
    );


     (
      "Treasury address:",
      treasuryWallet.address
    );


    // ==================================================
    // SAFETY CHECK
    // ==================================================

    if (
      depositWallet.address.toLowerCase() ===
      treasuryWallet.address.toLowerCase()
    ) {

      throw new Error(
        "Deposit address and treasury address are the same."
      );

    }


    const balance =
      await provider.getBalance(
        depositWallet.address
      );


     (
      "Deposit balance:",
      formatEther(balance),
      "BNB"
    );


    if (
      balance <= 0n
    ) {

      throw new Error(
        "Deposit address has no BNB."
      );

    }


    // ==================================================
    // GAS
    // ==================================================

    const feeData =
      await provider.getFeeData();


    if (
      !feeData.gasPrice
    ) {

      throw new Error(
        "Unable to determine BNB gas price."
      );

    }


    const gasLimit =
      21000n;


    const estimatedGas =
      gasLimit *
      feeData.gasPrice;


     (
      "Estimated sweep fee:",
      formatEther(
        estimatedGas
      ),
      "BNB"
    );


    if (
      balance <=
      estimatedGas
    ) {

      throw new Error(
        "BNB balance is not enough to cover sweep gas."
      );

    }


    const amountToSend =
      balance -
      estimatedGas;


     (
      "Amount to treasury:",
      formatEther(
        amountToSend
      ),
      "BNB"
    );


    // ==================================================
    // SEND TO REAL TREASURY
    // ==================================================

    const transaction =
      await depositWallet.sendTransaction({

        to:
          treasuryWallet.address,

        value:
          amountToSend,

        gasLimit:
          gasLimit,

        gasPrice:
          feeData.gasPrice

      });


     (
      "Sweep transaction:",
      transaction.hash
    );


    const receipt =
      await transaction.wait();


    // ==================================================
    // ACTUAL FEE
    // ==================================================

    const actualGasUsed =
      receipt.gasUsed;


    const actualGasPrice =
      receipt.gasPrice ||
      feeData.gasPrice;


    const actualFee =
      actualGasUsed *
      actualGasPrice;


     (
      "Actual sweep fee:",
      formatEther(
        actualFee
      ),
      "BNB"
    );


     (
      "Sweep confirmed."
    );


     (
      "========================================"
    );


    return {

      success:
        true,

      transactionHash:
        transaction.hash,

      feeBnb:
        Number(
          formatEther(
            actualFee
          )
        ),

      amountSentBnb:
        Number(
          formatEther(
            amountToSend
          )
        ),

      treasuryAddress:
        treasuryWallet.address

    };


  } catch (error) {

    console.error(
      "BNB SWEEP ERROR:",
      error
    );


    return {

      success:
        false,

      error:
        error.message

    };

  }

}


module.exports =
  sweepDeposit;