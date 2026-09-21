// =====================================================
// MYCARGOLANE BANKING
// =====================================================

const BANKING_API_URL = "http://localhost:5000/api";


// =====================================================
// STATE
// =====================================================

let bankingAccounts = [];

let selectedAccountId = null;

let selectedAccountNumberValue = null;

let selectedBankingPlan = "free";


// =====================================================
// DOM ELEMENTS
// =====================================================

// Main
const bankingForm =
  document.getElementById("bankingForm");

const createdAccounts =
  document.getElementById("createdAccounts");

const createAccountView =
  document.getElementById("createAccountView");

const selectedAccountView =
  document.getElementById("selectedAccountView");

const newAccountBtn =
  document.getElementById("newAccountBtn");

const bankingMessage =
  document.getElementById("bankingMessage");


// =====================================================
// SELECTED ACCOUNT HEADER
// =====================================================

const selectedAccountName =
  document.getElementById("selectedAccountName");

const selectedAccountNumber =
  document.getElementById("selectedAccountNumber");

const selectedAccountPlan =
  document.getElementById("selectedAccountPlan");

const planActionArea =
  document.getElementById("planActionArea");


// =====================================================
// CREATE ACCOUNT FORM
// =====================================================

const fullName =
  document.getElementById("fullName");

const email =
  document.getElementById("email");

const accountType =
  document.getElementById("accountType");

const accountCurrency =
  document.getElementById("accountCurrency");

const transactionProcessingTime =
  document.getElementById(
    "transactionProcessingTime"
  );

const accountPin =
  document.getElementById("accountPin");

const resetBankingForm =
  document.getElementById("resetBankingForm");

const createBankAccount =
  document.getElementById("createBankAccount");


// =====================================================
// PLAN MODAL
// =====================================================

const planModalOverlay =
  document.getElementById("planModalOverlay");

const freePlanBtn =
  document.getElementById("freePlanBtn");

const cleanPlanBtn =
  document.getElementById("cleanPlanBtn");

const planModalMessage =
  document.getElementById("planModalMessage");

const planCancelBtn =
  document.getElementById("planCancelBtn");

const planContinueBtn =
  document.getElementById("planContinueBtn");


// =====================================================
// ACCOUNT SETTINGS
// =====================================================

const accountSettingsBtn =
  document.getElementById(
    "accountSettingsBtn"
  );

const transactionsBtn =
  document.getElementById(
    "transactionsBtn"
  );

const settingsContent =
  document.getElementById("settingsContent");

const transactionsContent =
  document.getElementById(
    "transactionsContent"
  );

const accountSettingsForm =
  document.getElementById(
    "accountSettingsForm"
  );

const settingsFullName =
  document.getElementById(
    "settingsFullName"
  );

const settingsEmail =
  document.getElementById(
    "settingsEmail"
  );

const settingsAccountType =
  document.getElementById(
    "settingsAccountType"
  );

const settingsAccountCurrency =
  document.getElementById(
    "settingsAccountCurrency"
  );

const settingsTransactionProcessingTime =
  document.getElementById(
    "settingsTransactionProcessingTime"
  );

const settingsAccountPin =
  document.getElementById(
    "settingsAccountPin"
  );

const settingsWithdrawalEnabled =
  document.getElementById(
    "settingsWithdrawalEnabled"
  );

const settingsWithdrawalErrorMessage =
  document.getElementById(
    "settingsWithdrawalErrorMessage"
  );


// =====================================================
// CUSTOMER ACCOUNT MESSAGE
// =====================================================

const settingsErrorMessage =
  document.getElementById(
    "settingsErrorMessage"
  );


const saveAccountSettings =
  document.getElementById(
    "saveAccountSettings"
  );


// =====================================================
// TRANSACTIONS
// =====================================================

const transactionForm =
  document.getElementById(
    "transactionForm"
  );

const transactionType =
  document.getElementById(
    "transactionType"
  );

const transactionAmount =
  document.getElementById(
    "transactionAmount"
  );

const transactionNarration =
  document.getElementById(
    "transactionNarration"
  );

const transactionDate =
  document.getElementById(
    "transactionDate"
  );

const addTransactionBtn =
  document.getElementById(
    "addTransactionBtn"
  );

const transactionAccountBalance =
  document.getElementById(
    "transactionAccountBalance"
  );

const transactionHistory =
  document.getElementById(
    "transactionHistory"
  );


// =====================================================
// DELETE
// =====================================================

const deleteAccountBtn =
  document.getElementById(
    "deleteAccountBtn"
  );

const deleteAccountModal =
  document.getElementById(
    "deleteAccountModal"
  );

const cancelDeleteAccountBtn =
  document.getElementById(
    "cancelDeleteAccountBtn"
  );

const confirmDeleteAccountBtn =
  document.getElementById(
    "confirmDeleteAccountBtn"
  );

const deleteAccountName =
  document.getElementById(
    "deleteAccountName"
  );

const deleteAccountNumber =
  document.getElementById(
    "deleteAccountNumber"
  );

const deleteAccountMessage =
  document.getElementById(
    "deleteAccountMessage"
  );


// =====================================================
// GET TOKEN
// =====================================================

function getToken() {

  return localStorage.getItem("token");

}


// =====================================================
// NORMALIZE ACCOUNT
// =====================================================

function normalizeAccount(account) {

  return {
    ...account,
    id:
      account._id ||
      account.id
  };

}


// =====================================================
// FIND ACCOUNT
// =====================================================

function findAccountById(id) {

  return bankingAccounts.find(
    account =>
      account.id === id
  );

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
  message,
  type = "info"
) {

  if (!bankingMessage) return;


  bankingMessage.textContent =
    message;


  bankingMessage.className =
    `banking-message ${type}`;


  bankingMessage.style.display =
    "block";


  setTimeout(() => {

    bankingMessage.style.display =
      "none";

  }, 4000);

}


// =====================================================
// SHOW CREATE VIEW
// =====================================================

function showCreateAccountView() {

  if (createAccountView) {

    createAccountView.style.display =
      "block";

  }


  if (selectedAccountView) {

    selectedAccountView.style.display =
      "none";

  }


  selectedAccountId = null;

  selectedAccountNumberValue = null;

}


// =====================================================
// SHOW SELECTED ACCOUNT VIEW
// =====================================================

function showSelectedAccountView() {

  if (createAccountView) {

    createAccountView.style.display =
      "none";

  }


  if (selectedAccountView) {

    selectedAccountView.style.display =
      "block";

  }

}


// =====================================================
// LOAD ACCOUNTS FROM MONGODB
// =====================================================

async function loadBankingAccounts() {

  const token = getToken();


  if (!token) {

    bankingAccounts = [];

    renderAccounts();

    showCreateAccountView();

    return;

  }


  try {

    const response =
      await fetch(
        `${BANKING_API_URL}/banking/accounts`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to load Banking accounts."
      );

    }


    bankingAccounts =
      Array.isArray(data.accounts)
        ? data.accounts.map(
            normalizeAccount
          )
        : [];


    renderAccounts();


    /*
      Do not automatically open
      the first profile.
    */

    if (!selectedAccountId) {

      showCreateAccountView();

    }


  } catch (error) {

    console.error(
      "Load Banking accounts error:",
      error
    );


    bankingAccounts = [];

    renderAccounts();

    showCreateAccountView();


    showMessage(
      error.message ||
      "Failed to load Banking accounts.",
      "error"
    );

  }

}


// =====================================================
// RENDER ACCOUNT CARDS
// =====================================================

function renderAccounts() {

  if (!createdAccounts) return;


  createdAccounts.innerHTML = "";


  if (
    bankingAccounts.length === 0
  ) {

    createdAccounts.innerHTML = `

      <div class="no-accounts">

        <p>
          No Banking profile created yet.
        </p>

        <small>
          Create your first Banking profile.
        </small>

      </div>

    `;

    return;

  }


  bankingAccounts.forEach(
    account => {

      const card =
        document.createElement("div");


      card.className =
        "account-card";


      if (
        account.id ===
        selectedAccountId
      ) {

        card.classList.add(
          "active"
        );

      }


      let planLabel =
        "FREE";


      if (
        account.plan === "clean" &&
        account.planStatus === "paid"
      ) {

        planLabel =
          "PAID";

      }


      if (
        account.planStatus ===
        "expired"
      ) {

        planLabel =
          "EXPIRED";

      }


      card.innerHTML = `

        <div class="account-card-content">

          <div class="account-card-name">

            ${escapeHtml(
              account.fullName ||
              "Bank Account"
            )}

          </div>


          <div class="account-card-number">

            ${escapeHtml(
              account.accountNumber ||
              ""
            )}

          </div>


          <div
            class="account-card-plan ${
              account.planStatus ||
              "demo"
            }"
          >

            ${planLabel}

          </div>

        </div>

      `;


      card.addEventListener(
        "click",
        () => {

          openAccount(
            account.id
          );

        }
      );


      createdAccounts.appendChild(
        card
      );

    }
  );

}


// =====================================================
// OPEN ACCOUNT
// =====================================================

function openAccount(
  accountId
) {

  const account =
    findAccountById(
      accountId
    );


  if (!account) {

    showMessage(
      "Banking account could not be found.",
      "error"
    );

    return;

  }


  selectedAccountId =
    account.id;


  selectedAccountNumberValue =
    account.accountNumber;


  selectedBankingPlan =
    account.plan ||
    "free";


  showSelectedAccountView();


  renderAccounts();


  populateSelectedAccount(
    account
  );

}


// =====================================================
// POPULATE SELECTED ACCOUNT
// =====================================================

function populateSelectedAccount(
  account
) {

  if (selectedAccountName) {

    selectedAccountName.textContent =
      account.fullName ||
      "Account Name";

  }


  if (selectedAccountNumber) {

    selectedAccountNumber.textContent =
      account.accountNumber ||
      "Account Number";

  }


  updatePlanDisplay(
    account
  );


  populateSettings(
    account
  );


  renderTransactions(
    account
  );


  showSettingsTab();

}


// =====================================================
// PLAN DISPLAY
// =====================================================

function updatePlanDisplay(
  account
) {

  if (selectedAccountPlan) {

    let planText =
      "FREE";

    let planClass =
      "free";


    if (
      account.plan === "clean" &&
      account.planStatus === "paid"
    ) {

      planText =
        "PAID";

      planClass =
        "paid";

    }


    if (
      account.planStatus ===
      "expired"
    ) {

      planText =
        "EXPIRED";

      planClass =
        "expired";

    }


    selectedAccountPlan.textContent =
      planText;


    selectedAccountPlan.className =
      `selected-account-plan ${planClass}`;

  }


  if (!planActionArea) return;


  planActionArea.innerHTML =
    "";


  // ---------------------------------------------------
  // FREE
  // ---------------------------------------------------

  if (
    account.plan === "free" ||
    account.planStatus === "demo"
  ) {

    planActionArea.innerHTML = `

      <button
        type="button"
        class="plan-action-btn"
        id="subscribePlanBtn"
      >
        Subscribe — $15
      </button>

    `;


    const subscribePlanBtn =
      document.getElementById(
        "subscribePlanBtn"
      );


    if (subscribePlanBtn) {

      subscribePlanBtn.addEventListener(
        "click",
        openSubscriptionModal
      );

    }


    return;

  }


  // ---------------------------------------------------
  // EXPIRED
  // ---------------------------------------------------

  if (
    account.planStatus ===
    "expired"
  ) {

    planActionArea.innerHTML = `

      <button
        type="button"
        class="plan-action-btn"
        id="renewPlanBtn"
      >
        Renew — $15
      </button>

    `;


    const renewPlanBtn =
      document.getElementById(
        "renewPlanBtn"
      );


    if (renewPlanBtn) {

      renewPlanBtn.addEventListener(
        "click",
        openSubscriptionModal
      );

    }


    return;

  }


  // ---------------------------------------------------
  // PAID
  // ---------------------------------------------------

  if (
    account.plan === "clean" &&
    account.planStatus === "paid"
  ) {

    if (
      account.subscriptionExpiresAt
    ) {

      const expiryDate =
        new Date(
          account.subscriptionExpiresAt
        );


      planActionArea.innerHTML = `

        <div class="subscription-active">

          Active until
          ${expiryDate.toLocaleDateString()}

        </div>

      `;

    }

  }

}


// =====================================================
// OPEN CREATE PLAN MODAL
// =====================================================

function openCreatePlanModal() {

  const token =
    getToken();


  if (!token) {

    showMessage(
      "Please login before creating a Banking profile.",
      "error"
    );

    return;

  }


  selectedBankingPlan =
    "free";


  if (planModalMessage) {

    planModalMessage.textContent =
      "Choose Free or Clean before creating the Banking profile.";

  }


  if (planModalOverlay) {

    planModalOverlay.style.display =
      "flex";


    planModalOverlay.setAttribute(
      "aria-hidden",
      "false"
    );

  }

}


// =====================================================
// OPEN SUBSCRIPTION MODAL
// =====================================================

function openSubscriptionModal() {

  selectedBankingPlan =
    "clean";


  if (planModalMessage) {

    planModalMessage.textContent =
      "Banking Clean costs $15 and provides a 30-day clean subscription.";

  }


  if (planModalOverlay) {

    planModalOverlay.style.display =
      "flex";


    planModalOverlay.setAttribute(
      "aria-hidden",
      "false"
    );

  }

}


// =====================================================
// CLOSE PLAN MODAL
// =====================================================

function closePlanModal() {

  if (!planModalOverlay) return;


  planModalOverlay.style.display =
    "none";


  planModalOverlay.setAttribute(
    "aria-hidden",
    "true"
  );

}


// =====================================================
// FREE PLAN BUTTON
// =====================================================

if (freePlanBtn) {

  freePlanBtn.addEventListener(
    "click",
    () => {

      selectedBankingPlan =
        "free";


      if (planModalMessage) {

        planModalMessage.textContent =
          "FREE Banking is a demo profile. It costs $0.";

      }

    }
  );

}


// =====================================================
// CLEAN PLAN BUTTON
// =====================================================

if (cleanPlanBtn) {

  cleanPlanBtn.addEventListener(
    "click",
    () => {

      selectedBankingPlan =
        "clean";


      if (planModalMessage) {

        planModalMessage.textContent =
          "CLEAN Banking costs $15 and gives this profile a 30-day clean subscription.";

      }

    }
  );

}


// =====================================================
// PLAN CANCEL
// =====================================================

if (planCancelBtn) {

  planCancelBtn.addEventListener(
    "click",
    closePlanModal
  );

}


// =====================================================
// CREATE BUTTON
// =====================================================

if (createBankAccount) {

  createBankAccount.addEventListener(
    "click",
    function (event) {

      event.preventDefault();


      const token =
        getToken();


      if (!token) {

        showMessage(
          "Please login before creating a Banking profile.",
          "error"
        );

        return;

      }


      if (
        bankingForm &&
        !bankingForm.checkValidity()
      ) {

        bankingForm.reportValidity();

        return;

      }


      if (
        !/^\d{4}$/.test(
          accountPin.value.trim()
        )
      ) {

        showMessage(
          "Account PIN must be exactly 4 digits.",
          "error"
        );

        return;

      }


      openCreatePlanModal();

    }
  );

}


// =====================================================
// PLAN CONTINUE
// =====================================================

if (planContinueBtn) {

  planContinueBtn.addEventListener(
    "click",
    async function () {

      /*
        No selected account =
        create new account.

        Selected account =
        subscribe/renew.
      */

      if (selectedAccountId) {

        await changePlan();

      }
      else {

        await createBankAccountFromPlan();

      }

    }
  );

}


// =====================================================
// CREATE BANK ACCOUNT
// =====================================================

async function createBankAccountFromPlan() {

  const token =
    getToken();


  if (!token) {

    closePlanModal();


    showMessage(
      "Please login before creating a Banking profile.",
      "error"
    );

    return;

  }


  const payload = {

    fullName:
      fullName.value.trim(),

    email:
      email.value.trim(),

    accountType:
      accountType.value,

    accountCurrency:
      accountCurrency.value,

    transactionProcessingTime:
      transactionProcessingTime.value,

    accountPin:
      accountPin.value.trim(),

    plan:
      selectedBankingPlan,

    withdrawalEnabled:
      true,

    withdrawalErrorMessage:
      "Withdrawal is currently unavailable."

  };


  try {

    createBankAccount.disabled =
      true;


    planContinueBtn.disabled =
      true;


    const response =
      await fetch(
        `${BANKING_API_URL}/banking/accounts`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to create Banking account."
      );

    }


    closePlanModal();


    if (bankingForm) {

      bankingForm.reset();

    }


    await loadBankingAccounts();


    if (data.account) {

      const newAccount =
        normalizeAccount(
          data.account
        );


      const index =
        bankingAccounts.findIndex(
          account =>
            account.id ===
            newAccount.id
        );


      if (index === -1) {

        bankingAccounts.unshift(
          newAccount
        );

      }


      renderAccounts();


      openAccount(
        newAccount.id
      );

    }


    showMessage(
      "Banking profile created successfully.",
      "success"
    );


  } catch (error) {

    console.error(
      "Create Banking account error:",
      error
    );


    closePlanModal();


    showMessage(
      error.message ||
      "Failed to create Banking profile.",
      "error"
    );


  } finally {

    createBankAccount.disabled =
      false;


    planContinueBtn.disabled =
      false;

  }

}


// =====================================================
// SUBSCRIBE / RENEW
// =====================================================

async function changePlan() {

  const token =
    getToken();


  if (!token) {

    closePlanModal();


    showMessage(
      "Please login first.",
      "error"
    );

    return;

  }


  if (!selectedAccountId) {

    closePlanModal();

    return;

  }


  try {

    planContinueBtn.disabled =
      true;


    const response =
      await fetch(
        `${BANKING_API_URL}/banking/accounts/${selectedAccountId}/plan`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify({
              plan: "clean"
            })

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to update Banking plan."
      );

    }


    closePlanModal();


    await loadBankingAccounts();


    if (data.account) {

      const updatedAccount =
        normalizeAccount(
          data.account
        );


      const index =
        bankingAccounts.findIndex(
          account =>
            account.id ===
            updatedAccount.id
        );


      if (index !== -1) {

        bankingAccounts[index] =
          updatedAccount;

      }


      renderAccounts();


      openAccount(
        updatedAccount.id
      );

    }


    showMessage(
      "Banking subscription updated successfully.",
      "success"
    );


  } catch (error) {

    console.error(
      "Banking plan error:",
      error
    );


    closePlanModal();


    showMessage(
      error.message ||
      "Failed to update Banking plan.",
      "error"
    );


  } finally {

    planContinueBtn.disabled =
      false;

  }

}


// =====================================================
// SETTINGS
// =====================================================

function populateSettings(
  account
) {

  if (settingsFullName) {

    settingsFullName.value =
      account.fullName ||
      "";

  }


  if (settingsEmail) {

    settingsEmail.value =
      account.email ||
      "";

  }


  if (settingsAccountType) {

    settingsAccountType.value =
      account.accountType ||
      "";

  }


  if (settingsAccountCurrency) {

    settingsAccountCurrency.value =
      account.accountCurrency ||
      "USD";

  }


  if (
    settingsTransactionProcessingTime
  ) {

    settingsTransactionProcessingTime.value =
      account.transactionProcessingTime ||
      "0";

  }


  if (settingsAccountPin) {

    settingsAccountPin.value =
      account.accountPin ||
      "";

  }


  if (settingsWithdrawalEnabled) {

    settingsWithdrawalEnabled.value =
      account.withdrawalEnabled === false
        ? "false"
        : "true";

  }


  if (
    settingsWithdrawalErrorMessage
  ) {

    settingsWithdrawalErrorMessage.value =
      account.withdrawalErrorMessage ||
      "Withdrawal is currently unavailable.";

  }


  // ===================================================
  // CUSTOMER ACCOUNT MESSAGE
  // ===================================================

  if (settingsErrorMessage) {

    settingsErrorMessage.value =
      account.errorMessage ||
      "";

  }

}


// =====================================================
// SAVE SETTINGS FORM
// =====================================================

if (accountSettingsForm) {

  accountSettingsForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      await saveSettings();

    }
  );

}


// =====================================================
// SAVE SETTINGS BUTTON
// =====================================================

if (saveAccountSettings) {

  saveAccountSettings.addEventListener(
    "click",
    function (event) {

      /*
        The form submit event handles
        the actual save.

        This listener intentionally does
        not call saveSettings() again.
      */

      if (
        accountSettingsForm &&
        event.target.type === "submit"
      ) {

        return;

      }

    }
  );

}


// =====================================================
// SAVE SETTINGS FUNCTION
// =====================================================

async function saveSettings() {

  const token =
    getToken();


  if (!token) {

    showMessage(
      "Please login first.",
      "error"
    );

    return;

  }


  if (!selectedAccountId) {

    showMessage(
      "Please select a Banking profile first.",
      "error"
    );

    return;

  }


  if (
    settingsAccountPin &&
    !/^\d{4}$/.test(
      settingsAccountPin.value.trim()
    )
  ) {

    showMessage(
      "Account PIN must be exactly 4 digits.",
      "error"
    );

    return;

  }


  // ===================================================
  // PAYLOAD
  // ===================================================

  const payload = {

    fullName:
      settingsFullName.value.trim(),

    email:
      settingsEmail.value.trim(),

    accountType:
      settingsAccountType.value,

    accountCurrency:
      settingsAccountCurrency.value,

    transactionProcessingTime:
      settingsTransactionProcessingTime.value,

    accountPin:
      settingsAccountPin.value.trim(),

    withdrawalEnabled:
      settingsWithdrawalEnabled.value ===
      "true",

    withdrawalErrorMessage:
      settingsWithdrawalErrorMessage.value.trim(),

    // -----------------------------------------------
    // CUSTOMER ACCOUNT MESSAGE
    // -----------------------------------------------

    errorMessage:
      settingsErrorMessage
        ? settingsErrorMessage.value.trim()
        : ""

  };


  try {

    saveAccountSettings.disabled =
      true;


    const response =
      await fetch(
        `${BANKING_API_URL}/banking/accounts/${selectedAccountId}`,
        {
          method: "PATCH",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to save account settings."
      );

    }


    // =================================================
    // UPDATE LOCAL ACCOUNT
    // =================================================

    if (data.account) {

      const updatedAccount =
        normalizeAccount(
          data.account
        );


      const index =
        bankingAccounts.findIndex(
          account =>
            account.id ===
            updatedAccount.id
        );


      if (index !== -1) {

        bankingAccounts[index] =
          updatedAccount;

      }


      renderAccounts();


      openAccount(
        updatedAccount.id
      );

    }


    showMessage(
      "Account settings saved successfully.",
      "success"
    );


  } catch (error) {

    console.error(
      "Save settings error:",
      error
    );


    showMessage(
      error.message ||
      "Failed to save account settings.",
      "error"
    );


  } finally {

    saveAccountSettings.disabled =
      false;

  }

}


// =====================================================
// SETTINGS TAB
// =====================================================

function showSettingsTab() {

  if (settingsContent) {

    settingsContent.style.display =
      "block";

  }


  if (transactionsContent) {

    transactionsContent.style.display =
      "none";

  }


  if (accountSettingsBtn) {

    accountSettingsBtn.classList.add(
      "active"
    );

  }


  if (transactionsBtn) {

    transactionsBtn.classList.remove(
      "active"
    );

  }

}


if (accountSettingsBtn) {

  accountSettingsBtn.addEventListener(
    "click",
    showSettingsTab
  );

}


// =====================================================
// TRANSACTIONS TAB
// =====================================================

function showTransactionsTab() {

  if (settingsContent) {

    settingsContent.style.display =
      "none";

  }


  if (transactionsContent) {

    transactionsContent.style.display =
      "block";

  }


  if (accountSettingsBtn) {

    accountSettingsBtn.classList.remove(
      "active"
    );

  }


  if (transactionsBtn) {

    transactionsBtn.classList.add(
      "active"
    );

  }

}


if (transactionsBtn) {

  transactionsBtn.addEventListener(
    "click",
    showTransactionsTab
  );

}


// =====================================================
// ADD TRANSACTION FORM
// =====================================================

if (transactionForm) {

  transactionForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      await addTransaction();

    }
  );

}


// =====================================================
// ADD TRANSACTION FUNCTION
// =====================================================

async function addTransaction() {

  const token =
    getToken();


  if (!token) {

    showMessage(
      "Please login first.",
      "error"
    );

    return;

  }


  if (!selectedAccountId) {

    showMessage(
      "Please select a Banking profile first.",
      "error"
    );

    return;

  }


  const amount =
    Number(
      transactionAmount.value
    );


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showMessage(
      "Enter a valid transaction amount.",
      "error"
    );

    return;

  }


  const payload = {

    type:
    transactionType.value === "credit"
      ? "Credit"
      : "Debit",

    amount:
      amount,

    description:
      transactionNarration.value.trim(),

    date:
      transactionDate.value

  };


  try {

    addTransactionBtn.disabled =
      true;


    const response =
      await fetch(
        `${BANKING_API_URL}/banking/accounts/${selectedAccountId}/transactions`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to add transaction."
      );

    }


    if (data.account) {

      const updatedAccount =
        normalizeAccount(
          data.account
        );


      const index =
        bankingAccounts.findIndex(
          account =>
            account.id ===
            updatedAccount.id
        );


      if (index !== -1) {

        bankingAccounts[index] =
          updatedAccount;

      }


      renderAccounts();


      openAccount(
        updatedAccount.id
      );


      showTransactionsTab();

    }


    if (transactionAmount) {

      transactionAmount.value =
        "";

    }


    if (transactionNarration) {

      transactionNarration.value =
        "";

    }


    showMessage(
      "Transaction added successfully.",
      "success"
    );


  } catch (error) {

    console.error(
      "Transaction error:",
      error
    );


    showMessage(
      error.message ||
      "Failed to add transaction.",
      "error"
    );


  } finally {

    addTransactionBtn.disabled =
      false;

  }

}


// =====================================================
// RENDER TRANSACTIONS
// =====================================================

function renderTransactions(
  account
) {

  if (transactionAccountBalance) {

    transactionAccountBalance.textContent =
      `$${Number(
        account.balance || 0
      ).toFixed(2)}`;

  }


  if (!transactionHistory) return;


  transactionHistory.innerHTML =
    "";


  const transactions =
    Array.isArray(
      account.transactions
    )
      ? account.transactions
      : [];


  if (
    transactions.length === 0
  ) {

    transactionHistory.innerHTML = `

      <div class="empty-transactions">

        No transactions yet.

      </div>

    `;

    return;

  }


  transactions.forEach(
    transaction => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "transaction-row";


      const type =
        String(
          transaction.type ||
          ""
        ).toLowerCase();


      const amount =
        Number(
          transaction.amount ||
          0
        );


      const isCredit =
        type === "credit";


      row.innerHTML = `

        <div class="transaction-main">

          <div
            class="transaction-type ${
              isCredit
                ? "credit"
                : "debit"
            }"
          >

            ${escapeHtml(
              transaction.type ||
              ""
            )}

          </div>


          <div
            class="transaction-description"
          >

            ${escapeHtml(
              transaction.description ||
              transaction.narration ||
              ""
            )}

          </div>

        </div>


        <div
          class="transaction-amount ${
            isCredit
              ? "credit"
              : "debit"
          }"
        >

          ${isCredit ? "+" : "-"}

          $${amount.toFixed(2)}

        </div>

      `;


      transactionHistory.appendChild(
        row
      );

    }
  );

}


// =====================================================
// DELETE MODAL
// =====================================================

function openDeleteAccountModal() {

  if (!selectedAccountId) {

    showMessage(
      "Please select a Banking profile first.",
      "error"
    );

    return;

  }


  const account =
    findAccountById(
      selectedAccountId
    );


  if (!account) {

    showMessage(
      "Banking profile could not be found.",
      "error"
    );

    return;

  }


  if (deleteAccountName) {

    deleteAccountName.textContent =
      account.fullName ||
      "Bank Account";

  }


  if (deleteAccountNumber) {

    deleteAccountNumber.textContent =
      account.accountNumber ||
      "Account Number";

  }


  if (deleteAccountMessage) {

    deleteAccountMessage.textContent =
      "";

  }


  if (deleteAccountModal) {

    deleteAccountModal.style.display =
      "flex";


    deleteAccountModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }

}


// =====================================================
// CLOSE DELETE MODAL
// =====================================================

function closeDeleteAccountModal() {

  if (!deleteAccountModal) return;


  deleteAccountModal.style.display =
    "none";


  deleteAccountModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


// =====================================================
// DELETE BUTTON
// =====================================================

if (deleteAccountBtn) {

  deleteAccountBtn.addEventListener(
    "click",
    function () {

      openDeleteAccountModal();

    }
  );

}


// =====================================================
// CANCEL DELETE
// =====================================================

if (cancelDeleteAccountBtn) {

  cancelDeleteAccountBtn.addEventListener(
    "click",
    function () {

      closeDeleteAccountModal();

    }
  );

}


// =====================================================
// CONFIRM DELETE
// =====================================================

if (confirmDeleteAccountBtn) {

  confirmDeleteAccountBtn.addEventListener(
    "click",
    async function () {

      await deleteSelectedBankingAccount();

    }
  );

}


// =====================================================
// DELETE BANKING ACCOUNT
// =====================================================

async function deleteSelectedBankingAccount() {

  const token =
    getToken();


  if (!token) {

    closeDeleteAccountModal();


    showMessage(
      "Please login first.",
      "error"
    );

    return;

  }


  if (!selectedAccountId) {

    closeDeleteAccountModal();


    showMessage(
      "No Banking profile selected.",
      "error"
    );

    return;

  }


  try {

    confirmDeleteAccountBtn.disabled =
      true;


    confirmDeleteAccountBtn.textContent =
      "Deleting...";


    const response =
      await fetch(
        `${BANKING_API_URL}/banking/accounts/${selectedAccountId}`,
        {
          method: "DELETE",

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    const data =
      await response.json();


    console.log(
      "Delete Banking response:",
      data
    );


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to delete Banking profile."
      );

    }


    bankingAccounts =
      bankingAccounts.filter(
        account =>
          account.id !==
          selectedAccountId
      );


    selectedAccountId =
      null;

    selectedAccountNumberValue =
      null;


    closeDeleteAccountModal();


    renderAccounts();


    showCreateAccountView();


    if (bankingForm) {

      bankingForm.reset();

    }


    showMessage(
      "Banking profile deleted successfully.",
      "success"
    );


  } catch (error) {

    console.error(
      "Delete Banking account error:",
      error
    );


    if (deleteAccountMessage) {

      deleteAccountMessage.textContent =
        error.message ||
        "Failed to delete Banking profile.";

    }


  } finally {

    if (confirmDeleteAccountBtn) {

      confirmDeleteAccountBtn.disabled =
        false;


      confirmDeleteAccountBtn.textContent =
        "Delete Account";

    }

  }

}


// =====================================================
// CREATE NEW ACCOUNT BUTTON
// =====================================================

if (newAccountBtn) {

  newAccountBtn.addEventListener(
    "click",
    function () {

      showCreateAccountView();


      if (bankingForm) {

        bankingForm.reset();

      }

    }
  );

}


// =====================================================
// CREATE NEW ACCOUNT — TOP BUTTON
// =====================================================

const createNewAccountTopBtn =
  document.getElementById(
    "createNewAccountTopBtn"
  );


if (createNewAccountTopBtn) {

  createNewAccountTopBtn.addEventListener(
    "click",
    function () {

      showCreateAccountView();


      if (bankingForm) {

        bankingForm.reset();

      }

    }
  );

}


// =====================================================
// RESET BUTTON
// =====================================================

if (resetBankingForm) {

  resetBankingForm.addEventListener(
    "click",
    function () {

      if (bankingForm) {

        bankingForm.reset();

      }

    }
  );

}


// =====================================================
// CLOSE PLAN MODAL OUTSIDE CLICK
// =====================================================

if (planModalOverlay) {

  planModalOverlay.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        planModalOverlay
      ) {

        closePlanModal();

      }

    }
  );

}


// =====================================================
// CLOSE DELETE MODAL OUTSIDE CLICK
// =====================================================

if (deleteAccountModal) {

  deleteAccountModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        deleteAccountModal
      ) {

        closeDeleteAccountModal();

      }

    }
  );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value == null
      ? ""
      : String(value);


  return div.innerHTML;

}


// =====================================================
// INITIALIZE BANKING
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    /*
      Always begin with the
      create account screen.
    */

    showCreateAccountView();


    /*
      Then load the real accounts
      from MongoDB.
    */

    await loadBankingAccounts();

  }
);