const API_URL =
"https://api.justdoks.com/api";


let selectedUserId =
  null;


// ======================================================
// DOM ELEMENTS
// ======================================================

const adminMessage =
  document.getElementById(
    "adminMessage"
  );


const searchUserInput =
  document.getElementById(
    "searchUser"
  );


const userResults =
  document.getElementById(
    "userResults"
  );


const selectedUserSection =
  document.getElementById(
    "selectedUserSection"
  );


const selectedUserName =
  document.getElementById(
    "selectedUserName"
  );


const selectedUserEmail =
  document.getElementById(
    "selectedUserEmail"
  );


const selectedUserRole =
  document.getElementById(
    "selectedUserRole"
  );


const selectedUserStatus =
  document.getElementById(
    "selectedUserStatus"
  );


const disableAccountButton =
  document.getElementById(
    "disableAccountButton"
  );


const enableAccountButton =
  document.getElementById(
    "enableAccountButton"
  );


const walletBalance =
  document.getElementById(
    "walletBalance"
  );


const amountInput =
  document.getElementById(
    "amount"
  );


const descriptionInput =
  document.getElementById(
    "description"
  );


const referenceInput =
  document.getElementById(
    "reference"
  );


const walletMessage =
  document.getElementById(
    "walletMessage"
  );


const transactionTable =
  document.getElementById(
    "transactionTable"
  );


const activityTable =
  document.getElementById(
    "activityTable"
  );


const loginHistoryTable =
  document.getElementById(
    "loginHistoryTable"
  );


const totalUsers =
  document.getElementById(
    "totalUsers"
  );


// ======================================================
// TOKEN
// ======================================================

function getToken() {

  return localStorage.getItem(
    "token"
  );

}


// ======================================================
// HEADERS
// ======================================================

function getHeaders() {

  return {

    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${getToken()}`

  };

}


// ======================================================
// ADMIN ACCESS
// ======================================================

async function checkAdminAccess() {

  try {

    const response =
      await fetch(
        `${API_URL}/admin/test`,
        {
          method:
            "GET",

          headers:
            getHeaders()
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Admin access denied."
      );

    }


    return true;


  } catch (error) {

    console.error(
      "ADMIN ACCESS ERROR:",
      error
    );


    showAdminMessage(
      error.message ||
      "Admin access denied.",
      "danger"
    );


    return false;

  }

}


// ======================================================
// LOAD TOTAL USERS
// ======================================================

async function loadTotalUsers() {

  try {

    const response =
      await fetch(
        `${API_URL}/admin/users/count`,
        {
          method:
            "GET",

          headers:
            getHeaders()
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load total users."
      );

    }


    if (totalUsers) {

      totalUsers.textContent =
        Number(
          data.totalUsers || 0
        );

    }


  } catch (error) {

    console.error(
      "LOAD TOTAL USERS ERROR:",
      error
    );


    if (totalUsers) {

      totalUsers.textContent =
        "—";

    }

  }

}


// ======================================================
// SEARCH USERS
// ======================================================

async function searchUsers() {

  try {

    const search =
      searchUserInput.value.trim();


    if (!search) {

      showAdminMessage(
        "Enter a name or email to search.",
        "warning"
      );

      return;

    }


    userResults.innerHTML =
      "<p>Searching...</p>";


    const response =
      await fetch(

        `${API_URL}/admin/users?search=${encodeURIComponent(search)}`,

        {
          method:
            "GET",

          headers:
            getHeaders()

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to search users."
      );

    }


    displayUsers(
      data.users || []
    );


  } catch (error) {

    console.error(
      "SEARCH USERS ERROR:",
      error
    );


    userResults.innerHTML = "";


    showAdminMessage(
      error.message ||
      "Unable to search users.",
      "danger"
    );

  }

}


// ======================================================
// DISPLAY USERS
// ======================================================

function displayUsers(
  users
) {

  if (!users.length) {

    userResults.innerHTML = `

      <div class="alert alert-info">

        No users found.

      </div>

    `;

    return;

  }


  let html = "";


  users.forEach(
    function (user) {

      const status =
        user.isDisabled
          ? "Disabled"
          : "Active";


      const statusClass =
        user.isDisabled
          ? "text-danger"
          : "text-success";


      html += `

        <div class="border rounded p-3 mb-3">

          <div class="row align-items-center">

            <div class="col-md-8">

              <strong>
                ${escapeHTML(user.name)}
              </strong>

              <br>

              <span>
                ${escapeHTML(user.email)}
              </span>

              <br>

              <small>

                Role:
                ${escapeHTML(user.role)}

                &nbsp; | &nbsp;

                Status:

                <span class="${statusClass}">
                  ${status}
                </span>

              </small>

            </div>


            <div class="col-md-4 text-md-end mt-3 mt-md-0">

              <button
                type="button"
                class="btn btn-primary"
                onclick="selectUser('${user._id}')"
              >
                Select User
              </button>

            </div>

          </div>

        </div>

      `;

    }
  );


  userResults.innerHTML =
    html;

}


// ======================================================
// SELECT USER
// ======================================================

async function selectUser(
  userId
) {

  selectedUserId =
    userId;


  selectedUserSection.style.display =
    "block";


  selectedUserName.textContent =
    "Loading...";


  selectedUserEmail.textContent =
    "Loading...";


  selectedUserRole.textContent =
    "Loading...";


  selectedUserStatus.textContent =
    "Loading...";


  await loadUserWallet();

  await loadUserTransactions();

  await loadUserActivity();

  await loadLoginHistory();

}


// ======================================================
// LOAD USER WALLET
// ======================================================

async function loadUserWallet() {

  try {

    const response =
      await fetch(

        `${API_URL}/admin/users/${selectedUserId}/wallet`,

        {
          method:
            "GET",

          headers:
            getHeaders()

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load wallet."
      );

    }


    const user =
      data.user;


    const wallet =
      data.wallet;


    selectedUserName.textContent =
      user.name || "-";


    selectedUserEmail.textContent =
      user.email || "-";


    selectedUserRole.textContent =
      user.role || "-";


    updateAccountStatus(
      Boolean(
        user.isDisabled
      )
    );


    walletBalance.textContent =
      Number(
        wallet.balance || 0
      ).toFixed(2);


  } catch (error) {

    console.error(
      "LOAD USER WALLET ERROR:",
      error
    );


    showWalletMessage(
      error.message ||
      "Unable to load wallet.",
      "danger"
    );

  }

}


// ======================================================
// UPDATE ACCOUNT STATUS
// ======================================================

function updateAccountStatus(
  isDisabled
) {

  if (selectedUserStatus) {

    selectedUserStatus.textContent =
      isDisabled
        ? "Disabled"
        : "Active";


    selectedUserStatus.className =
      isDisabled
        ? "text-danger"
        : "text-success";

  }


  if (disableAccountButton) {

    disableAccountButton.style.display =
      isDisabled
        ? "none"
        : "inline-block";

  }


  if (enableAccountButton) {

    enableAccountButton.style.display =
      isDisabled
        ? "inline-block"
        : "none";

  }

}


// ======================================================
// DISABLE ACCOUNT
// ======================================================

async function disableAccount() {

  if (!selectedUserId) {

    return;

  }


  const confirmed =
    window.confirm(
      "Disable this user's account?"
    );


  if (!confirmed) {

    return;

  }


  try {

    showWalletMessage(
      "Disabling account...",
      "info"
    );


    const response =
      await fetch(

        `${API_URL}/admin/users/${selectedUserId}/disable`,

        {
          method:
            "POST",

          headers:
            getHeaders()

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to disable account."
      );

    }


    updateAccountStatus(
      true
    );


    showWalletMessage(
      data.message ||
      "Account disabled successfully.",
      "success"
    );


    await loadUserActivity();


  } catch (error) {

    console.error(
      "DISABLE ACCOUNT ERROR:",
      error
    );


    showWalletMessage(
      error.message ||
      "Unable to disable account.",
      "danger"
    );

  }

}


// ======================================================
// ENABLE ACCOUNT
// ======================================================

async function enableAccount() {

  if (!selectedUserId) {

    return;

  }


  const confirmed =
    window.confirm(
      "Enable this user's account?"
    );


  if (!confirmed) {

    return;

  }


  try {

    showWalletMessage(
      "Enabling account...",
      "info"
    );


    const response =
      await fetch(

        `${API_URL}/admin/users/${selectedUserId}/enable`,

        {
          method:
            "POST",

          headers:
            getHeaders()

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to enable account."
      );

    }


    updateAccountStatus(
      false
    );


    showWalletMessage(
      data.message ||
      "Account enabled successfully.",
      "success"
    );


    await loadUserActivity();


  } catch (error) {

    console.error(
      "ENABLE ACCOUNT ERROR:",
      error
    );


    showWalletMessage(
      error.message ||
      "Unable to enable account.",
      "danger"
    );

  }

}


// ======================================================
// LOAD TRANSACTIONS
// ======================================================

async function loadUserTransactions() {

  try {

    const response =
      await fetch(

        `${API_URL}/admin/users/${selectedUserId}/transactions`,

        {
          method:
            "GET",

          headers:
            getHeaders()

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load transactions."
      );

    }


    displayTransactions(
      data.transactions || []
    );


  } catch (error) {

    console.error(
      "LOAD TRANSACTIONS ERROR:",
      error
    );


    transactionTable.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="text-center text-danger"
        >
          ${escapeHTML(error.message)}
        </td>

      </tr>

    `;

  }

}


// ======================================================
// DISPLAY TRANSACTIONS
// ======================================================

function displayTransactions(
  transactions
) {

  if (!transactions.length) {

    transactionTable.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="text-center"
        >
          No transactions found.
        </td>

      </tr>

    `;

    return;

  }


  let html = "";


  transactions.forEach(
    function (transaction) {

      const amount =
        Number(
          transaction.amount || 0
        );


      const amountText =
        amount >= 0
          ? `+$${amount.toFixed(2)}`
          : `-$${Math.abs(amount).toFixed(2)}`;


      html += `

        <tr>

          <td>
            ${formatDate(transaction.createdAt)}
          </td>

          <td>
            ${escapeHTML(transaction.type || "-")}
          </td>

          <td>
            ${escapeHTML(transaction.source || "-")}
          </td>

          <td>
            ${amountText}
          </td>

          <td>
            ${escapeHTML(transaction.description || "-")}
          </td>

          <td>
            ${escapeHTML(transaction.reference || "-")}
          </td>

        </tr>

      `;

    }
  );


  transactionTable.innerHTML =
    html;

}


// ======================================================
// LOAD ACTIVITY
// ======================================================

async function loadUserActivity() {

  try {

    const response =
      await fetch(

        `${API_URL}/admin/users/${selectedUserId}/activity`,

        {
          method:
            "GET",

          headers:
            getHeaders()

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load activity."
      );

    }


    displayActivity(
      data.activities || []
    );


  } catch (error) {

    console.error(
      "LOAD ACTIVITY ERROR:",
      error
    );


    activityTable.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="text-center text-danger"
        >
          ${escapeHTML(error.message)}
        </td>

      </tr>

    `;

  }

}


// ======================================================
// DISPLAY ACTIVITY
// ======================================================

function displayActivity(
  activities
) {

  if (!activities.length) {

    activityTable.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="text-center"
        >
          No activity found.
        </td>

      </tr>

    `;

    return;

  }


  let html = "";


  activities.forEach(
    function (activity) {

      const amount =
        Number(
          activity.amount || 0
        );


      let amountText =
        "-";


      if (activity.amount !== null &&
          activity.amount !== undefined) {

        amountText =
          amount >= 0
            ? `+$${amount.toFixed(2)}`
            : `-$${Math.abs(amount).toFixed(2)}`;

      }


      html += `

        <tr>

          <td>
            ${formatDate(activity.createdAt)}
          </td>

          <td>
            ${escapeHTML(activity.activity || "-")}
          </td>

          <td>
            ${escapeHTML(activity.service || "-")}
          </td>

          <td>
            ${amountText}
          </td>

          <td>
            ${escapeHTML(activity.description || "-")}
          </td>

          <td>
            ${escapeHTML(activity.reference || "-")}
          </td>

        </tr>

      `;

    }
  );


  activityTable.innerHTML =
    html;

}


// ======================================================
// LOAD LOGIN HISTORY
// ======================================================

async function loadLoginHistory() {

  try {

    const response =
      await fetch(

        `${API_URL}/admin/users/${selectedUserId}/login-history`,

        {
          method:
            "GET",

          headers:
            getHeaders()

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load login history."
      );

    }


    displayLoginHistory(
      data.loginHistory || []
    );


  } catch (error) {

    console.error(
      "LOAD LOGIN HISTORY ERROR:",
      error
    );


    loginHistoryTable.innerHTML = `

      <tr>

        <td
          colspan="2"
          class="text-center text-danger"
        >
          ${escapeHTML(error.message)}
        </td>

      </tr>

    `;

  }

}


// ======================================================
// DISPLAY LOGIN HISTORY
// ======================================================

function displayLoginHistory(
  history
) {

  if (!history.length) {

    loginHistoryTable.innerHTML = `

      <tr>

        <td
          colspan="2"
          class="text-center"
        >
          No login history found.
        </td>

      </tr>

    `;

    return;

  }


  let html = "";


  history.forEach(
    function (login) {

      html += `

        <tr>

          <td>
            ${formatDate(login.loginAt)}
          </td>

          <td>
            ${escapeHTML(login.ipAddress || "-")}
          </td>

        </tr>

      `;

    }
  );


  loginHistoryTable.innerHTML =
    html;

}


// ======================================================
// CREDIT WALLET
// ======================================================

async function creditWallet() {

  await performWalletAction(
    "credit"
  );

}


// ======================================================
// DEBIT WALLET
// ======================================================

async function debitWallet() {

  await performWalletAction(
    "debit"
  );

}


// ======================================================
// REFUND WALLET
// ======================================================

async function refundWallet() {

  await performWalletAction(
    "refund"
  );

}


// ======================================================
// PERFORM WALLET ACTION
// ======================================================

async function performWalletAction(
  action
) {

  if (!selectedUserId) {

    showWalletMessage(
      "Select a user first.",
      "warning"
    );

    return;

  }


  const amount =
    Number(
      amountInput.value
    );


  const description =
    descriptionInput.value.trim();


  const reference =
    referenceInput.value.trim();


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showWalletMessage(
      "Enter a valid amount.",
      "warning"
    );

    return;

  }


  const confirmed =
    window.confirm(
      `Are you sure you want to ${action} $${amount.toFixed(2)}?`
    );


  if (!confirmed) {

    return;

  }


  try {

    showWalletMessage(
      "Processing...",
      "info"
    );


    const response =
      await fetch(

        `${API_URL}/admin/users/${selectedUserId}/${action}`,

        {

          method:
            "POST",

          headers:
            getHeaders(),

          body:
            JSON.stringify({

              amount,

              description,

              reference

            })

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Wallet action failed."
      );

    }


    showWalletMessage(
      data.message ||
      "Wallet updated successfully.",
      "success"
    );


    amountInput.value =
      "";


    descriptionInput.value =
      "";


    referenceInput.value =
      "";


    await loadUserWallet();

    await loadUserTransactions();

    await loadUserActivity();


  } catch (error) {

    console.error(
      "WALLET ACTION ERROR:",
      error
    );


    showWalletMessage(
      error.message ||
      "Wallet action failed.",
      "danger"
    );

  }

}


// ======================================================
// ADMIN MESSAGE
// ======================================================

function showAdminMessage(
  message,
  type
) {

  adminMessage.innerHTML = `

    <div class="alert alert-${type}">

      ${escapeHTML(message)}

    </div>

  `;

}


// ======================================================
// WALLET MESSAGE
// ======================================================

function showWalletMessage(
  message,
  type
) {

  walletMessage.innerHTML = `

    <div class="alert alert-${type}">

      ${escapeHTML(message)}

    </div>

  `;

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(
  date
) {

  if (!date) {

    return "-";

  }


  const formatted =
    new Date(date);


  if (
    Number.isNaN(
      formatted.getTime()
    )
  ) {

    return "-";

  }


  return formatted.toLocaleString();

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

  localStorage.removeItem(
    "token"
  );


  localStorage.removeItem(
    "username"
  );


  window.location.href =
    "login.html";

}


// ======================================================
// INITIALIZE ADMIN DASHBOARD
// ======================================================

async function initializeAdminDashboard() {

  const access =
    await checkAdminAccess();


  if (!access) {

    return;

  }


  await loadTotalUsers();

}


// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

window.searchUsers =
  searchUsers;

window.selectUser =
  selectUser;

window.creditWallet =
  creditWallet;

window.debitWallet =
  debitWallet;

window.refundWallet =
  refundWallet;

window.disableAccount =
  disableAccount;

window.enableAccount =
  enableAccount;

window.logout =
  logout;


// ======================================================
// START
// ======================================================

initializeAdminDashboard();