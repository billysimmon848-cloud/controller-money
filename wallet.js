const API_URL =
"http://localhost:5000/api";


// ======================================================
// TOKEN
// ======================================================

const token =
localStorage.getItem("token");


// ======================================================
// DOM ELEMENTS
// ======================================================

const walletBalance =
document.getElementById("walletBalance");

const walletMessage =
document.getElementById("walletMessage");

const bnbAddress =
document.getElementById("bnbAddress");

const copyBnbButton =
document.getElementById("copyBnbButton");

const bnbMessage =
document.getElementById("bnbMessage");

const logoutButton =
document.getElementById("logoutButton");

const recipientEmail =
document.getElementById("recipientEmail");

const transferAmount =
document.getElementById("transferAmount");

const sendMoneyButton =
document.getElementById("sendMoneyButton");

const transferMessage =
document.getElementById("transferMessage");


// ======================================================
// CHECK LOGIN
// ======================================================

if (!token) {

  window.location.href =
  "login.html";

}


// ======================================================
// LOAD WALLET
// ======================================================

async function loadWallet() {

  try {

    const response =
      await fetch(
        `${API_URL}/wallet`,
        {
          method: "GET",

          headers: {
            "Authorization":
              "Bearer " + token
          }
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      walletMessage.textContent =
        data.message ||
        "Unable to load wallet.";

      return;

    }


    walletBalance.textContent =
      "$" +
      Number(
        data.balance || 0
      ).toFixed(2);


  } catch (error) {

    console.error(
      "WALLET ERROR:",
      error
    );


    walletMessage.textContent =
      "Unable to connect to wallet.";

  }

}


// ======================================================
// LOAD BNB ADDRESS
// ======================================================

async function loadBnbAddress() {

  try {

    const response =
      await fetch(
        `${API_URL}/bnb/address`,
        {
          method: "GET",

          headers: {
            "Authorization":
              "Bearer " + token
          }
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      bnbMessage.textContent =
        data.message ||
        "Unable to load BNB address.";

      return;

    }


    bnbAddress.value =
      data.address || "";


  } catch (error) {

    console.error(
      "BNB ADDRESS ERROR:",
      error
    );


    bnbMessage.textContent =
      "Unable to load BNB address.";

  }

}


// ======================================================
// COPY BNB ADDRESS
// ======================================================

copyBnbButton.onclick =
async function () {

  try {

    await navigator.clipboard.writeText(
      bnbAddress.value
    );


    bnbMessage.textContent =
      "BNB address copied.";


  } catch (error) {

    console.error(
      "COPY BNB ADDRESS ERROR:",
      error
    );


    bnbMessage.textContent =
      "Unable to copy BNB address.";

  }

};


// ======================================================
// SEND MONEY
// ======================================================

sendMoneyButton.onclick =
async function () {

  const email =
    recipientEmail.value.trim();


  const amount =
    Number(
      transferAmount.value
    );


  transferMessage.textContent =
    "";


  if (!email) {

    transferMessage.textContent =
      "Please enter the recipient's email.";

    return;

  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    transferMessage.textContent =
      "Please enter a valid amount.";

    return;

  }


  sendMoneyButton.disabled =
    true;


  try {

    const response =
      await fetch(
        `${API_URL}/wallet/transfer`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " + token
          },

          body:
            JSON.stringify({
              recipientEmail:
                email,

              amount:
                amount
            })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      transferMessage.textContent =
        data.message ||
        "Unable to send money.";

      return;

    }


    transferMessage.textContent =
      data.message ||
      "Money sent successfully.";


    recipientEmail.value =
      "";


    transferAmount.value =
      "";


    await loadWallet();


  } catch (error) {

    console.error(
      "TRANSFER ERROR:",
      error
    );


    transferMessage.textContent =
      "Unable to connect to wallet.";

  } finally {

    sendMoneyButton.disabled =
      false;

  }

};


// ======================================================
// LOGOUT
// ======================================================

logoutButton.onclick =
function () {

  localStorage.removeItem(
    "token"
  );


  localStorage.removeItem(
    "userName"
  );


  localStorage.removeItem(
    "userRole"
  );


  window.location.href =
    "login.html";

};


// ======================================================
// INITIAL LOAD
// ======================================================

loadWallet();

loadBnbAddress();
