// ======================================================
// API
// ======================================================

const API_URL =
"https://api.justdoks.com/api";


// ======================================================
// SECTIONS
// ======================================================

const loginSection =
  document.getElementById("loginSection");

const signupSection =
  document.getElementById("signupSection");

const forgotPasswordSection =
  document.getElementById("forgotPasswordSection");

const resetPasswordSection =
  document.getElementById("resetPasswordSection");


// ======================================================
// NAVIGATION LINKS
// ======================================================

const showSignup =
  document.getElementById("showSignup");

const showLogin =
  document.getElementById("showLogin");

const showForgotPassword =
  document.getElementById("showForgotPassword");

const forgotBackToLogin =
  document.getElementById("forgotBackToLogin");


// ======================================================
// FORMS
// ======================================================

const loginForm =
  document.getElementById("loginForm");

const signupForm =
  document.getElementById("signupForm");

const forgotPasswordForm =
  document.getElementById("forgotPasswordForm");

const resetPasswordForm =
  document.getElementById("resetPasswordForm");


// ======================================================
// MESSAGES
// ======================================================

const loginMessage =
  document.getElementById("loginMessage");

const signupMessage =
  document.getElementById("signupMessage");

const forgotMessage =
  document.getElementById("forgotMessage");

const resetMessage =
  document.getElementById("resetMessage");


// ======================================================
// BUTTONS
// ======================================================

const loginButton =
  document.getElementById("loginButton");

const signupButton =
  document.getElementById("signupButton");

const forgotButton =
  document.getElementById("forgotButton");

const resetButton =
  document.getElementById("resetButton");


// ======================================================
// DEVELOPMENT RESET
// ======================================================

const developmentResetBox =
  document.getElementById(
    "developmentResetBox"
  );

const developmentResetLink =
  document.getElementById(
    "developmentResetLink"
  );


// ======================================================
// SHOW ONLY ONE SECTION
// ======================================================

function showSection(section) {

  loginSection.style.display =
    "none";

  signupSection.style.display =
    "none";

  forgotPasswordSection.style.display =
    "none";

  resetPasswordSection.style.display =
    "none";


  section.style.display =
    "block";


  // Clear messages

  loginMessage.textContent =
    "";

  signupMessage.textContent =
    "";

  forgotMessage.textContent =
    "";

  resetMessage.textContent =
    "";

}


// ======================================================
// SHOW LOGIN
// ======================================================

showLogin.onclick =
  function(event) {

    event.preventDefault();

    showSection(
      loginSection
    );

  };


// ======================================================
// SHOW SIGNUP
// ======================================================

showSignup.onclick =
  function(event) {

    event.preventDefault();

    showSection(
      signupSection
    );

  };


// ======================================================
// SHOW FORGOT PASSWORD
// ======================================================

showForgotPassword.onclick =
  function(event) {

    event.preventDefault();

    showSection(
      forgotPasswordSection
    );

  };


// ======================================================
// BACK TO LOGIN FROM FORGOT PASSWORD
// ======================================================

forgotBackToLogin.onclick =
  function(event) {

    event.preventDefault();

    showSection(
      loginSection
    );

  };


// ======================================================
// LOGIN
// ======================================================

loginForm.onsubmit =
  async function(event) {

    event.preventDefault();


    loginMessage.textContent =
      "Logging in...";

    loginButton.disabled =
      true;


    const email =
      document
        .getElementById("email")
        .value
        .trim();


    const password =
      document
        .getElementById("password")
        .value;


    try {

      const response =
        await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              password
            })
          }
        );


      const data =
        await response.json();


      console.log(
        "LOGIN RESPONSE:",
        data
      );


      // ==========================================
      // LOGIN FAILED
      // ==========================================

      if (!response.ok) {

        loginMessage.textContent =
          data.message ||
          "Login failed.";

        loginButton.disabled =
          false;

        return;

      }


      // ==========================================
      // CHECK TOKEN
      // ==========================================

      if (!data.token) {

        loginMessage.textContent =
          "Login failed: server did not return a token.";

        loginButton.disabled =
          false;

        return;

      }


      // ==========================================
      // SAVE TOKEN
      // ==========================================

      localStorage.setItem(
        "token",
        data.token
      );


      // ==========================================
      // SAVE USERNAME
      // ==========================================

      if (data.user) {

        localStorage.setItem(
          "userName",
          data.user.name || ""
        );

      }


      // ==========================================
      // GET USER ROLE
      // ==========================================

      const userRole =
        data.user?.role ||
        "user";


      // ==========================================
      // SAVE USER ROLE
      // ==========================================

      localStorage.setItem(
        "userRole",
        userRole
      );


      console.log(
        "USER ROLE:",
        userRole
      );


      // ==========================================
      // ADMIN REDIRECT
      // ==========================================

      if (
        userRole === "admin"
      ) {

        console.log(
          "Admin detected. Redirecting to admin dashboard..."
        );


        window.location.href =
          "admin.html";


        return;

      }


      // ==========================================
      // NORMAL USER REDIRECT
      // ==========================================

      console.log(
        "Normal user detected. Redirecting to user dashboard..."
      );


      window.location.href =
        "index.html";


    } catch(error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      loginMessage.textContent =
        "Unable to connect to server.";


      loginButton.disabled =
        false;

    }

};


// ======================================================
// SIGNUP
// ======================================================

signupForm.onsubmit =
  async function(event) {

    event.preventDefault();


    signupMessage.textContent =
      "Creating your account...";


    signupButton.disabled =
      true;


    const name =
      document
        .getElementById("signupName")
        .value
        .trim();


    const email =
      document
        .getElementById("signupEmail")
        .value
        .trim();


    const password =
      document
        .getElementById("signupPassword")
        .value;


    const confirmPassword =
      document
        .getElementById(
          "signupConfirmPassword"
        )
        .value;


    // ==========================================
    // CHECK PASSWORD MATCH
    // ==========================================

    if (
      password !==
      confirmPassword
    ) {

      signupMessage.textContent =
        "Passwords do not match.";

      signupButton.disabled =
        false;

      return;

    }


    // ==========================================
    // CHECK PASSWORD LENGTH
    // ==========================================

    if (
      password.length < 6
    ) {

      signupMessage.textContent =
        "Password must be at least 6 characters long.";

      signupButton.disabled =
        false;

      return;

    }


    try {

      const response =
        await fetch(
          `${API_URL}/auth/signup`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              name,
              email,
              password

            })

          }
        );


      const data =
        await response.json();


      console.log(
        "SIGNUP RESPONSE:",
        data
      );


      // ==========================================
      // SIGNUP FAILED
      // ==========================================

      if (!response.ok) {

        signupMessage.textContent =
          data.message ||
          "Signup failed.";

        signupButton.disabled =
          false;

        return;

      }


      // ==========================================
      // CHECK TOKEN
      // ==========================================

      if (!data.token) {

        signupMessage.textContent =
          "Account was created, but automatic login failed.";

        signupButton.disabled =
          false;

        return;

      }


      // ==========================================
      // SAVE TOKEN
      // ==========================================

      localStorage.setItem(
        "token",
        data.token
      );


      // ==========================================
      // SAVE USERNAME
      // ==========================================

      if (data.user) {

        localStorage.setItem(
          "userName",
          data.user.name || ""
        );

      }


      // ==========================================
      // SAVE ROLE
      // ==========================================

      const userRole =
        data.user?.role ||
        "user";


      localStorage.setItem(
        "userRole",
        userRole
      );


      // ==========================================
      // NORMAL SIGNUP REDIRECT
      // ==========================================

      window.location.href =
        "index.html";


    } catch(error) {

      console.error(
        "SIGNUP ERROR:",
        error
      );


      signupMessage.textContent =
        "Unable to connect to server.";


      signupButton.disabled =
        false;

    }

};


// ======================================================
// FORGOT PASSWORD
// ======================================================

forgotPasswordForm.onsubmit =
  async function(event) {

    event.preventDefault();


    forgotMessage.textContent =
      "Creating password reset request...";


    forgotButton.disabled =
      true;


    developmentResetBox.style.display =
      "none";


    const email =
      document
        .getElementById("forgotEmail")
        .value
        .trim();


    try {

      const response =
        await fetch(
          `${API_URL}/auth/forgot-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email
            })
          }
        );


      const data =
        await response.json();


      console.log(
        "FORGOT PASSWORD RESPONSE:",
        data
      );


      if (!response.ok) {

        forgotMessage.textContent =
          data.message ||
          "Unable to create reset request.";

        forgotButton.disabled =
          false;

        return;

      }


      forgotMessage.textContent =
        data.message ||
        "If the account exists, a reset request has been created.";


      // ==========================================
      // DEVELOPMENT RESET LINK
      // ==========================================

      if (
        data.development &&
        data.development.resetLink
      ) {

        developmentResetLink.href =
          data.development.resetLink;


        developmentResetBox.style.display =
          "block";

      }


      forgotButton.disabled =
        false;


    } catch(error) {

      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );


      forgotMessage.textContent =
        "Unable to connect to server.";


      forgotButton.disabled =
        false;

    }

};


// ======================================================
// RESET PASSWORD
// ======================================================

resetPasswordForm.onsubmit =
  async function(event) {

    event.preventDefault();


    resetMessage.textContent =
      "Resetting password...";


    resetButton.disabled =
      true;


    const newPassword =
      document
        .getElementById("newPassword")
        .value;


    const confirmNewPassword =
      document
        .getElementById(
          "confirmNewPassword"
        )
        .value;


    // ==========================================
    // GET TOKEN FROM URL
    // ==========================================

    const urlParams =
      new URLSearchParams(
        window.location.search
      );


    const token =
      urlParams.get("token");


    const email =
      urlParams.get("email");


    // ==========================================
    // CHECK TOKEN
    // ==========================================

    if (
      !token ||
      !email
    ) {

      resetMessage.textContent =
        "Password reset link is invalid.";

      resetButton.disabled =
        false;

      return;

    }


    // ==========================================
    // CHECK PASSWORD MATCH
    // ==========================================

    if (
      newPassword !==
      confirmNewPassword
    ) {

      resetMessage.textContent =
        "Passwords do not match.";

      resetButton.disabled =
        false;

      return;

    }


    // ==========================================
    // CHECK PASSWORD LENGTH
    // ==========================================

    if (
      newPassword.length < 6
    ) {

      resetMessage.textContent =
        "Password must be at least 6 characters long.";

      resetButton.disabled =
        false;

      return;

    }


    try {

      const response =
        await fetch(
          `${API_URL}/auth/reset-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              email,

              token,

              newPassword

            })

          }
        );


      const data =
        await response.json();


      console.log(
        "RESET PASSWORD RESPONSE:",
        data
      );


      if (!response.ok) {

        resetMessage.textContent =
          data.message ||
          "Password reset failed.";

        resetButton.disabled =
          false;

        return;

      }


      // ==========================================
      // SUCCESS
      // ==========================================

      resetMessage.textContent =
        "Password reset successfully. Redirecting to login...";


      // Remove token from URL

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );


      // Return to login

      setTimeout(
        function() {

          showSection(
            loginSection
          );

        },
        2000
      );


    } catch(error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );


      resetMessage.textContent =
        "Unable to connect to server.";


      resetButton.disabled =
        false;

    }

};


// ======================================================
// CHECK WHETHER THIS IS A PASSWORD RESET LINK
// ======================================================

function checkForPasswordReset() {

  const urlParams =
    new URLSearchParams(
      window.location.search
    );


  const token =
    urlParams.get("token");


  const email =
    urlParams.get("email");


  if (
    token &&
    email
  ) {

    showSection(
      resetPasswordSection
    );

  } else {

    showSection(
      loginSection
    );

  }

}


// ======================================================
// INITIALIZE AUTH PAGE
// ======================================================

checkForPasswordReset();
