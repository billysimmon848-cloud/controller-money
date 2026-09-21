const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");

async function chargeWallet(userId, amount, description) {
  const wallet = await Wallet.findOne({
    user: userId
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet.balance < amount) {
    return {
      success: false,
      message: "Insufficient wallet balance"
    };
  }

  wallet.balance -= amount;

  await wallet.save();

  await Transaction.create({
    user: userId,
    type: "charge",
    amount,
    description
  });

  return {
    success: true,
    balance: wallet.balance
  };
}

module.exports = chargeWallet;