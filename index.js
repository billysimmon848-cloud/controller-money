// ======================================================
// API
// ======================================================

const API_URL =
"https://api.justdoks.com/api";


// ======================================================
// NAVBAR
// ======================================================

const authNav =
  document.getElementById("authNav");


// ======================================================
// LOAD NAVBAR
// ======================================================

async function loadUserNavbar() {

  // Always get the CURRENT token
  const token =
    localStorage.getItem("token");


  // ====================================================
  // LOGGED OUT
  // ====================================================

  if (!token) {

    showLogin();

    return;

  }


  try {

    // ==================================================
    // GET CURRENT USER
    // ==================================================

    const userResponse =
      await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",

          headers: {
            "Authorization":
              "Bearer " + token
          }
        }
      );


    const userData =
      await userResponse.json();

    // ==================================================
    // INVALID TOKEN
    // ==================================================

    if (!userResponse.ok) {

      localStorage.removeItem("token");

      localStorage.removeItem("userName");

      showLogin();

      return;

    }


    // ==================================================
    // GET WALLET
    // ==================================================

    const walletResponse =
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


    const walletData =
      await walletResponse.json();


    // ==================================================
    // WALLET ERROR
    // ==================================================

    if (!walletResponse.ok) {

      console.error(
        "WALLET ERROR:",
        walletData
      );

      return;

    }


    // ==================================================
    // USERNAME
    // ==================================================

    const name =
      userData.user?.name ||
      "User";


    // ==================================================
    // BALANCE
    // ==================================================

    const balance =
      Number(
        walletData.balance || 0
      ).toFixed(2);


    // ==================================================
    // SAVE USERNAME
    // ==================================================

    localStorage.setItem(
      "userName",
      name
    );


    // ==================================================
    // SHOW LOGGED-IN NAVBAR
    // ==================================================

    authNav.innerHTML = `

      <a
        class="nav-link username-link"
        href="#"
      >
        ${name}
      </a>


      <a
        class="nav-link wallet-balance"
        href="wallet.html"
      >
        $${balance}
      </a>


      <a
        class="nav-link"
        href="#"
        onclick="logout(); return false;"
      >
        Logout
      </a>

    `;


  } catch (error) {

    console.error(
      "NAVBAR ERROR:",
      error
    );

  }

}


// ======================================================
// SHOW LOGIN
// ======================================================

function showLogin() {

  authNav.innerHTML = `

    <a
      class="nav-link"
      href="login.html"
    >
      Login
    </a>

  `;

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

  localStorage.removeItem("token");

  localStorage.removeItem("userName");

  showLogin();

  window.location.href =
    "index.html";

}


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadUserNavbar();

  }
);


// ======================================================
// WHEN RETURNING TO PAGE
// ======================================================

window.addEventListener(
  "pageshow",
  function () {

    loadUserNavbar();

  }
);


// ======================================================
// REFRESH WALLET
// EVERY 10 SECONDS
// ======================================================

setInterval(
  function () {

    if (
      localStorage.getItem("token")
    ) {

      loadUserNavbar();

    }

  },
  10000
);