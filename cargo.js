// ======================================================
// CARGO CONTROLLER
// ======================================================

const mainShippingWebsite =
  "https://zenditcargo.com";

const CLEAN_SHIPPING_PRICE = 5;


// ======================================================
// DOM ELEMENTS
// ======================================================

const shippingForm =
  document.getElementById("shippingForm");

const shippingMessage =
  document.getElementById("shippingMessage");

const createShippingButton =
  document.getElementById("createShipping");

const shippingStatus =
  document.getElementById("shippingStatus");

const errorMessageGroup =
  document.getElementById("errorMessageGroup");

const errorMessage =
  document.getElementById("errorMessage");

const continueShipping =
  document.getElementById("continueShipping");

const shippingTypeModal =
  document.getElementById("shippingTypeModal");

const shippingDocument =
  document.getElementById("shippingDocument");

const documentStatus =
  document.getElementById("documentStatus");

const downloadDocument =
  document.getElementById("downloadDocument");

const removeWatermark =
  document.getElementById("removeWatermark");

const shipmentsList =
  document.getElementById("shipmentsList");

const refreshShipments =
  document.getElementById("refreshShipments");

const newShipmentButton =
  document.getElementById("newShipmentButton");

const cancelEditButton =
  document.getElementById("cancelEditButton");

const watermarkLayer =
  document.getElementById("watermarkLayer");


// ======================================================
// CONTROLLER LAYOUT
// ======================================================

const workspaceGrid =
  document.querySelector(".workspace-grid");


// ======================================================
// FORM ELEMENTS
// ======================================================

const invoiceNumber =
  document.getElementById("invoiceNumber");

const shipmentDate =
  document.getElementById("shipmentDate");

const shipmentTime =
  document.getElementById("shipmentTime");

const estimatedDelivery =
  document.getElementById("estimatedDelivery");

const estimatedDeliveryTime =
  document.getElementById("estimatedDeliveryTime");

const sender =
  document.getElementById("sender");

const senderEmail =
  document.getElementById("senderEmail");

const origin =
  document.getElementById("origin");

const recipient =
  document.getElementById("recipient");

const recipientEmail =
  document.getElementById("recipientEmail");

const recipientAddress =
  document.getElementById("recipientAddress");

const packageContent =
  document.getElementById("packageContent");

const packageWeight =
  document.getElementById("packageWeight");


// ======================================================
// STATE
// ======================================================

let selectedShippingType = "test";

let generatedTrackingNumber = "";

let currentUserId = "";

let currentUser = null;

let currentShipment = null;

let userShipments = [];

let editingShipment = false;

let currentWalletBalance = 0;


// ======================================================
// GET TOKEN
// ======================================================

function getToken() {

  return localStorage.getItem("token");

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ======================================================
// ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(value) {

  return escapeHTML(value);

}


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(value) {

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "$0.00";
  }

  return "$" + amount.toFixed(2);

}


// ======================================================
// BUILD DATE TIME
// ======================================================

function buildDateTime(
  dateValue,
  timeValue
) {

  if (!dateValue) {
    return "";
  }

  if (!timeValue) {
    return dateValue;
  }

  return `${dateValue}T${timeValue}`;

}


// ======================================================
// AUTH USER
// ======================================================

async function getCurrentUser() {

  const token = getToken();

  if (!token) {
    return null;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    return data.user || data;

  } catch (error) {

    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return null;

  }

}


// ======================================================
// CARGO NAVBAR
// ======================================================

function updateCargoNavbar() {

  if (!authNav) {
    return;
  }

  if (!currentUser) {

    authNav.innerHTML = `

      <a
        href="login.html"
        class="btn btn-primary"
      >
        Login
      </a>

    `;

    return;

  }

  const name =
    currentUser.name ||
    currentUser.username ||
    currentUser.email ||
    "User";

  authNav.innerHTML = `

    <div class="cargo-account-nav">

      <span class="cargo-user-name">
        ${escapeHTML(name)}
      </span>

      <span class="cargo-wallet-balance">

        <strong id="cargoNavbarWallet">
          ${formatMoney(
    currentWalletBalance
  )}
        </strong>

      </span>

      <button
        type="button"
        class="btn btn-outline-danger btn-sm"
        onclick="logoutCargo()"
      >
        Logout
      </button>

    </div>

  `;

}


// ======================================================
// LOGOUT
// ======================================================

function logoutCargo() {

  localStorage.removeItem("token");

  window.location.href =
    "login.html";

}


// ======================================================
// LOAD WALLET
// ======================================================

async function loadWalletBalance() {

  const token = getToken();

  if (!token) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/wallet`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        "WALLET ERROR:",
        data
      );

      return;

    }

    currentWalletBalance =
      Number(
        data.balance ??
        data.wallet?.balance ??
        0
      );

    const navbarWallet =
      document.getElementById(
        "cargoNavbarWallet"
      );

    if (navbarWallet) {

      navbarWallet.textContent =
        formatMoney(
          currentWalletBalance
        );

    }

  } catch (error) {

    console.error(
      "LOAD WALLET ERROR:",
      error
    );

  }

}


// ======================================================
// LOAD USER
// ======================================================

async function loadUserStorage() {

  const token = getToken();

  if (!token) {

    currentUser = null;

    updateCargoNavbar();

    if (shipmentsList) {

      shipmentsList.innerHTML = `

        <p class="text-muted">
          Please login to view your shipments.
        </p>

      `;

    }

    return;

  }

  currentUser =
    await getCurrentUser();

  if (!currentUser) {

    localStorage.removeItem("token");

    currentUser = null;

    updateCargoNavbar();

    return;

  }

  currentUserId =
    currentUser._id ||
    currentUser.id ||
    "";

  updateCargoNavbar();

  await loadWalletBalance();

  await loadShipments();

}


// ======================================================
// CONTROLLER MODE
// ======================================================

function setControllerMode(
  mode
) {

  if (!workspaceGrid) {
    return;
  }

  workspaceGrid.classList.remove(
    "create-mode",
    "profile-mode"
  );

  if (mode === "profile") {

    workspaceGrid.classList.add(
      "profile-mode"
    );

  } else {

    workspaceGrid.classList.add(
      "create-mode"
    );

  }

}


// ======================================================
// SELECT SHIPMENT
// ======================================================

function selectShipment(
  index
) {

  editShipment(index);

}


// ======================================================
// OPEN SHIPPING TYPE MODAL
// ======================================================

function openShippingTypeModal() {

  if (!shippingTypeModal) {

    console.error(
      "shippingTypeModal was not found."
    );

    return;

  }

  if (
    typeof bootstrap ===
    "undefined"
  ) {

    alert(
      "Shipping options could not be opened. Please refresh the page."
    );

    return;

  }

  const modal =
    bootstrap.Modal.getOrCreateInstance(
      shippingTypeModal
    );

  modal.show();

}


// ======================================================
// CONTINUE SHIPPING TYPE
// ======================================================

if (continueShipping) {

  continueShipping.addEventListener(
    "click",
    function () {

      const selected =
        document.querySelector(
          'input[name="shippingType"]:checked'
        );

      if (!selected) {

        alert(
          "Please select a shipping type."
        );

        return;

      }

      selectedShippingType =
        selected.value === "clean"
          ? "clean"
          : "test";

      if (
        typeof bootstrap !==
        "undefined"
      ) {

        const modal =
          bootstrap.Modal.getInstance(
            shippingTypeModal
          );

        if (modal) {
          modal.hide();
        }

      }

      createShipping();

    }
  );

}


// ======================================================
// SHIPPING FORM
// ======================================================

if (shippingForm) {

  shippingForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      if (
        !shippingForm.checkValidity()
      ) {

        shippingForm.reportValidity();

        return;

      }

      if (editingShipment) {

        updateShipment();

        return;

      }

      openShippingTypeModal();

    }
  );

}


// ======================================================
// CREATE SHIPPING
// ======================================================

async function createShipping() {

  const token = getToken();

  if (!token) {

    showMessage(
      "Please login before creating a shipment.",
      "danger"
    );

    return;

  }

  const shipmentData = {

    invoiceNumber:
      invoiceNumber?.value || "",

    shipmentDate:
      buildDateTime(
        shipmentDate?.value || "",
        shipmentTime?.value || ""
      ),

    shipmentTime:
      shipmentTime?.value || "",

    estimatedDelivery:
      buildDateTime(
        estimatedDelivery?.value || "",
        estimatedDeliveryTime?.value || ""
      ),

    estimatedDeliveryTime:
      estimatedDeliveryTime?.value || "",

    sender:
      sender?.value || "",

    senderEmail:
      senderEmail?.value || "",

    origin:
      origin?.value || "",

    recipient:
      recipient?.value || "",

    recipientEmail:
      recipientEmail?.value || "",

    recipientAddress:
      recipientAddress?.value || "",

    packageContent:
      packageContent?.value || "",

    packageWeight:
      packageWeight?.value || "",

    currentStatus:
      shippingStatus?.value ||
      "Processing",

    errorMessage:
      errorMessage?.value || "",

    shippingType:
      selectedShippingType

  };

  setCreateButtonLoading(true);

  try {

    const response =
      await fetch(
        `${API_URL}/shipments`,
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
              shipmentData
            )

        }
      );

    const responseText =
      await response.text();

    let data = {};

    try {

      data =
        responseText
          ? JSON.parse(responseText)
          : {};

    } catch (error) {

      throw new Error(
        "Server returned an invalid response."
      );

    }

    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to create shipment."
      );

    }

    const shipment =
      data.shipment || data;

    if (
      !shipment ||
      !shipment.trackingNumber
    ) {

      throw new Error(
        "Shipment was created but no tracking number was returned."
      );

    }

    currentShipment =
      shipment;

    generatedTrackingNumber =
      shipment.trackingNumber;

    currentWalletBalance =
      Number(
        data.walletBalance ??
        data.balance ??
        currentWalletBalance
      );

    await loadWalletBalance();

    addOrReplaceShipment(
      shipment
    );

    fillDocumentFromShipment(
      shipment
    );

    setControllerMode("profile");

    if (downloadDocument) {
      downloadDocument.disabled = false;
    }

    const paymentAmount =
      Number(
        shipment.paymentAmount || 0
      );

    const isClean =
      shipment.watermarkEnabled === false ||
      shipment.shippingType === "clean";


    // ==================================================
    // SUCCESS POPUP
    // ==================================================

    if (isClean) {

      showCargoPopup(

        `Shipping Created Successfully\n\n` +

        `Tracking Number: ${shipment.trackingNumber
        }\n` +

        `Payment: ${formatMoney(paymentAmount)
        }\n` +

        `Wallet Balance: ${formatMoney(currentWalletBalance)
        }`

      );

    } else {

      showCargoPopup(

        `Test Shipping Created Successfully\n\n` +

        `Tracking Number: ${shipment.trackingNumber
        }\n` +

        `Payment: $0.00\n` +

        `Wallet Balance: ${formatMoney(currentWalletBalance)
        }\n` +

        `Document: Watermarked\n\n` +

        `You can remove the watermark for ${formatMoney(CLEAN_SHIPPING_PRICE)
        }.`

      );

    }

    saveFormData();

    await loadShipments();

  } catch (error) {

    console.error(
      "CREATE SHIPPING ERROR:",
      error
    );

    showCargoPopup(
      error.message ||
      "Unable to create shipment."
    );

  } finally {

    setCreateButtonLoading(false);

  }

}


// ======================================================
// CREATE BUTTON LOADING
// ======================================================

function setCreateButtonLoading(
  loading
) {

  if (!createShippingButton) {
    return;
  }

  if (loading) {

    createShippingButton.disabled =
      true;

    createShippingButton.dataset
      .originalText =
      createShippingButton.textContent;

    createShippingButton.textContent =
      "Creating...";

  } else {

    createShippingButton.disabled =
      false;

    createShippingButton.textContent =
      createShippingButton.dataset
        .originalText ||
      "Create Shipping";

  }

}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
  message,
  type = "info",
  isHTML = false
) {

  if (!shippingMessage) {
    return;
  }

  shippingMessage.className =
    `alert alert-${type}`;

  shippingMessage.style.display =
    "block";

  if (isHTML) {

    shippingMessage.innerHTML =
      message;

  } else {

    shippingMessage.textContent =
      message;

  }

}


// ======================================================
// CARGO POPUP
// ======================================================

function showCargoPopup(
  message
) {

  alert(message);

}


// ======================================================
// TRACKING URL
// ======================================================

function getTrackingURL(
  trackingNumber
) {

  return (
    mainShippingWebsite +
    "?tracking=" +
    encodeURIComponent(
      trackingNumber
    )
  );

}


// ======================================================
// TRACKING LINK HTML
// ======================================================

function getTrackingLinkHTML(
  trackingNumber
) {

  const url =
    getTrackingURL(
      trackingNumber
    );

  return `

    <a
      href="${escapeAttribute(url)}"
      target="_blank"
      rel="noopener noreferrer"
      onclick="event.stopPropagation();"
    >
      Open Tracking Website →
    </a>

  `;

}


// ======================================================
// LOAD SHIPMENTS
// ======================================================

async function loadShipments() {

  const token = getToken();

  if (!token) {

    if (shipmentsList) {

      shipmentsList.innerHTML = `

        <p class="text-muted">
          Please login to view your shipments.
        </p>

      `;

    }

    return;

  }

  try {

    const response =
      await fetch(
        `${API_URL}/shipments/mine`,
        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load shipments."
      );

    }

    userShipments =
      Array.isArray(
        data.shipments
      )
        ? data.shipments
        : [];

    renderShipments();

  } catch (error) {

    console.error(
      "LOAD SHIPMENTS ERROR:",
      error
    );

    if (shipmentsList) {

      shipmentsList.innerHTML = `

        <div class="alert alert-danger">
          ${escapeHTML(
        error.message
      )}
        </div>

      `;

    }

  }

}


// ======================================================
// RENDER SHIPMENTS
// ======================================================

function renderShipments() {

  if (!shipmentsList) {
    return;
  }

  if (
    userShipments.length === 0
  ) {

    shipmentsList.innerHTML = `

      <div class="empty-shipments">

        <p>
          No shipments created yet.
        </p>

      </div>

    `;

    return;

  }

  shipmentsList.innerHTML =
    userShipments
      .map(
        (
          shipment,
          index
        ) =>
          createShipmentCard(
            shipment,
            index
          )
      )
      .join("");

}


// ======================================================
// CREATE SHIPMENT CARD
// ======================================================

function createShipmentCard(
  shipment,
  index
) {

  const tracking =
    shipment.trackingNumber ||
    "";

  const isClean =
    shipment.watermarkEnabled === false ||
    shipment.shippingType === "clean";

  const status =
    shipment.status ||
    shipment.currentStatus ||
    "Pending";

  const trackingURL =
    getTrackingURL(
      tracking
    );

  const hasError =
    Boolean(
      shipment.errorMessage &&
      String(
        shipment.errorMessage
      ).trim()
    );

  const isSelected =
    currentShipment &&
    currentShipment.trackingNumber ===
    tracking;

  return `

    <div
      class="shipment-card ${isSelected
      ? "selected-shipment"
      : ""
    }"
      onclick="selectShipment(${index})"
    >

      <!-- =========================
           CARD HEADER
      ========================= -->

      <div class="shipment-card-header">

        <strong>
          ${escapeHTML(
      tracking
    )}
        </strong>

        <span>
          ${escapeHTML(
      status
    )}
        </span>

      </div>


      <!-- =========================
           CARD BODY
      ========================= -->

      <div class="shipment-card-body">

        <p>

          <strong>
            Tracking:
          </strong>

          <a
            href="${escapeAttribute(
      trackingURL
    )}"
            target="_blank"
            rel="noopener noreferrer"
            onclick="event.stopPropagation();"
          >
            Open Tracking Website →
          </a>

        </p>


        <p>

          <strong>
            Document:
          </strong>

          ${isClean
      ? "Clean"
      : "Watermarked"
    }

        </p>


        ${hasError
      ? `

              <p class="shipment-card-error">

                <strong>
                  Message:
                </strong>

                ${escapeHTML(
        shipment.errorMessage
      )}

              </p>

            `
      : ""
    }

      </div>


      <!-- =========================
           CARD ACTIONS
      ========================= -->

      <div class="shipment-card-actions">


        <!-- EDIT -->

        <button
          type="button"
          class="btn btn-sm btn-secondary"
          onclick="event.stopPropagation(); editShipment(${index})"
        >
          Edit
        </button>


        <!-- REMOVE WATERMARK -->

        ${!isClean
      ? `

              <button
                type="button"
                class="btn btn-sm btn-warning"
                onclick="event.stopPropagation(); removeShipmentWatermark(${index})"
              >
                Remove Watermark — $5
              </button>

            `
      : ""
    }


        <!-- DELETE -->

        <button
          type="button"
          class="btn btn-sm btn-danger"
          onclick="event.stopPropagation(); deleteShipment(${index})"
        >
          Delete
        </button>


      </div>

    </div>

  `;

}


// ======================================================
// ADD OR REPLACE SHIPMENT
// ======================================================

function addOrReplaceShipment(
  shipment
) {

  const index =
    userShipments.findIndex(
      item =>
        item.trackingNumber ===
        shipment.trackingNumber
    );

  if (index >= 0) {

    userShipments[index] =
      shipment;

  } else {

    userShipments.unshift(
      shipment
    );

  }

  renderShipments();

}


// ======================================================
// VIEW SHIPMENT
// ======================================================

function viewShipment(
  index
) {

  const shipment =
    userShipments[index];

  if (!shipment) {

    showMessage(
      "Shipment not found.",
      "danger"
    );

    return;

  }

  currentShipment =
    shipment;

  generatedTrackingNumber =
    shipment.trackingNumber;

  setControllerMode(
    "profile"
  );

  fillDocumentFromShipment(
    shipment
  );

  showDocument();

  if (downloadDocument) {

    downloadDocument.disabled =
      false;

  }

  renderShipments();

  if (shippingDocument) {

    shippingDocument.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


// ======================================================
// EDIT SHIPMENT
// ======================================================

function editShipment(
  index
) {

  const shipment =
    userShipments[index];

  if (!shipment) {

    showMessage(
      "Shipment not found.",
      "danger"
    );

    return;

  }


  // ====================================================
  // STORE SELECTED SHIPMENT
  // ====================================================

  currentShipment =
    shipment;

  generatedTrackingNumber =
    shipment.trackingNumber || "";

  editingShipment =
    true;


  // ====================================================
  // ENTER EDIT MODE
  // ====================================================

  setFormMode(true);


  // ====================================================
  // LOAD ALL EXISTING VALUES
  // ====================================================

  if (invoiceNumber) {

    invoiceNumber.value =
      shipment.invoiceNumber ||
      "";

  }

  if (shipmentDate) {

    shipmentDate.value =
      extractDate(
        shipment.shipmentDate
      );

  }

  if (shipmentTime) {

    shipmentTime.value =
      shipment.shipmentTime ||
      extractTime(
        shipment.shipmentDate
      );

  }

  if (estimatedDelivery) {

    estimatedDelivery.value =
      extractDate(
        shipment.estimatedDelivery
      );

  }

  if (estimatedDeliveryTime) {

    estimatedDeliveryTime.value =
      shipment.estimatedDeliveryTime ||
      extractTime(
        shipment.estimatedDelivery
      );

  }

  if (sender) {

    sender.value =
      shipment.sender ||
      "";

  }

  if (senderEmail) {

    senderEmail.value =
      shipment.senderEmail ||
      "";

  }

  if (origin) {

    origin.value =
      shipment.origin ||
      "";

  }

  if (recipient) {

    recipient.value =
      shipment.recipient ||
      "";

  }

  if (recipientEmail) {

    recipientEmail.value =
      shipment.recipientEmail ||
      "";

  }

  if (recipientAddress) {

    recipientAddress.value =
      shipment.recipientAddress ||
      "";

  }

  if (packageContent) {

    packageContent.value =
      shipment.packageContent ||
      "";

  }

  if (packageWeight) {

    packageWeight.value =
      shipment.packageWeight ||
      "";

  }


  // ====================================================
  // LOAD STATUS
  // ====================================================

  if (shippingStatus) {

    shippingStatus.value =
      shipment.status ||
      shipment.currentStatus ||
      "Processing";

  }


  // ====================================================
  // LOAD ERROR MESSAGE
  // ====================================================

  if (errorMessage) {

    errorMessage.value =
      shipment.errorMessage ||
      "";

  }


  // ====================================================
  // ERROR MESSAGE VISIBILITY
  // ====================================================

  updateErrorVisibility();


  // ====================================================
  // SHOW EXISTING DOCUMENT
  // ====================================================

  fillDocumentFromShipment(
    shipment
  );

  showDocument();


  // ====================================================
  // REFRESH SELECTED CARD
  // ====================================================

  renderShipments();


  // ====================================================
  // SCROLL TO FORM
  // ====================================================

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  // ====================================================
  // SHOW EDIT MESSAGE
  // ====================================================

  showMessage(
    `Editing shipment ${escapeHTML(
      shipment.trackingNumber
    )}. Change the status or message, then click "Update Shipment".`,
    "info"
  );

}


// ======================================================
// UPDATE SHIPMENT
// ======================================================

async function updateShipment() {

  const token = getToken();

  if (!token) {

    showMessage(
      "Please login first.",
      "danger"
    );

    return;

  }

  if (
    !currentShipment ||
    !currentShipment.trackingNumber
  ) {

    showMessage(
      "No shipment selected for editing.",
      "danger"
    );

    return;

  }

  const trackingNumber =
    currentShipment.trackingNumber;


  // ====================================================
  // VALIDATE FORM
  // ====================================================

  if (
    shippingForm &&
    !shippingForm.checkValidity()
  ) {

    shippingForm.reportValidity();

    return;

  }


  // ====================================================
  // GET UPDATED VALUES
  // ====================================================

  const selectedStatus =
    shippingStatus?.value ||
    "Processing";

  const updatedErrorMessage =
    errorMessage?.value?.trim() ||
    "";


  // ====================================================
  // SEND UPDATE TO BACKEND
  // ====================================================

  const updateData = {

    invoiceNumber:
      invoiceNumber?.value || "",

    shipmentDate:
      buildDateTime(
        shipmentDate?.value || "",
        shipmentTime?.value || ""
      ),

    shipmentTime:
      shipmentTime?.value || "",

    estimatedDelivery:
      buildDateTime(
        estimatedDelivery?.value || "",
        estimatedDeliveryTime?.value || ""
      ),

    estimatedDeliveryTime:
      estimatedDeliveryTime?.value || "",

    sender:
      sender?.value || "",

    senderEmail:
      senderEmail?.value || "",

    origin:
      origin?.value || "",

    recipient:
      recipient?.value || "",

    recipientEmail:
      recipientEmail?.value || "",

    recipientAddress:
      recipientAddress?.value || "",

    packageContent:
      packageContent?.value || "",

    packageWeight:
      packageWeight?.value || "",

    currentStatus:
      selectedStatus,

    errorMessage:
      updatedErrorMessage

  };


  // ====================================================
  // UPDATE BUTTON
  // ====================================================

  if (createShippingButton) {

    createShippingButton.disabled =
      true;

    createShippingButton.dataset
      .originalText =
      createShippingButton.textContent;

    createShippingButton.textContent =
      "Updating...";

  }


  try {

    const response =
      await fetch(

        `${API_URL}/shipments/${encodeURIComponent(
          trackingNumber
        )}`,

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
              updateData
            )

        }

      );


    const responseText =
      await response.text();


    let data = {};

    try {

      data =
        responseText
          ? JSON.parse(responseText)
          : {};

    } catch (error) {

      throw new Error(
        "Server returned an invalid response."
      );

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to update shipment."
      );

    }


    const shipment =
      data.shipment || data;


    if (
      !shipment ||
      !shipment.trackingNumber
    ) {

      throw new Error(
        "Shipment was updated but the server did not return the shipment."
      );

    }


    // ==================================================
    // UPDATE LOCAL STATE
    // ==================================================

    currentShipment =
      shipment;

    generatedTrackingNumber =
      shipment.trackingNumber;


    addOrReplaceShipment(
      shipment
    );


    // ==================================================
    // UPDATE DOCUMENT
    // ==================================================

    fillDocumentFromShipment(
      shipment
    );

    showDocument();


    // ==================================================
    // EXIT EDIT MODE
    // ==================================================

    editingShipment =
      false;

    setFormMode(false);


    // ==================================================
    // REFRESH WALLET
    // ==================================================

    await loadWalletBalance();


    // ==================================================
    // REFRESH SHIPMENTS
    // ==================================================

    await loadShipments();


    // ==================================================
    // SUCCESS POPUP
    // ==================================================

    showCargoPopup(

      `Shipment Updated Successfully\n\n` +

      `Tracking Number: ${shipment.trackingNumber
      }\n` +

      `Status: ${shipment.status ||
      shipment.currentStatus ||
      "Pending"
      }`

    );


  } catch (error) {

    console.error(
      "UPDATE SHIPMENT ERROR:",
      error
    );


    showCargoPopup(
      error.message ||
      "Unable to update shipment."
    );


  } finally {

    if (createShippingButton) {

      createShippingButton.disabled =
        false;

      createShippingButton.textContent =
        createShippingButton.dataset
          .originalText ||
        (
          editingShipment
            ? "Update Shipment"
            : "Create Shipping"
        );

    }

  }

}


// ======================================================
// DELETE SHIPMENT
// ======================================================

async function deleteShipment(
  index
) {

  const token = getToken();

  if (!token) {

    showMessage(
      "Please login first.",
      "danger"
    );

    return;

  }

  const shipment =
    userShipments[index];

  if (!shipment) {

    showMessage(
      "Shipment not found.",
      "danger"
    );

    return;

  }

  const trackingNumber =
    shipment.trackingNumber;

  const confirmed =
    confirm(
      `Are you sure you want to delete shipment ${trackingNumber}?`
    );

  if (!confirmed) {
    return;
  }

  try {

    const response =
      await fetch(

        `${API_URL}/shipments/${encodeURIComponent(
          trackingNumber
        )}`,

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

    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to delete shipment."
      );

    }

    userShipments.splice(
      index,
      1
    );

    if (
      currentShipment &&
      currentShipment.trackingNumber ===
      trackingNumber
    ) {

      currentShipment = null;

      generatedTrackingNumber = "";

      clearDocument();

    }

    if (
      editingShipment &&
      currentShipment === null
    ) {

      editingShipment = false;

      setFormMode(false);

      clearForm();

    }

    renderShipments();


    // ==================================================
    // SUCCESS POPUP
    // ==================================================

    showCargoPopup(

      `Shipment Deleted Successfully\n\n` +

      `Tracking Number: ${trackingNumber
      }`

    );


  } catch (error) {

    console.error(
      "DELETE SHIPMENT ERROR:",
      error
    );

    showCargoPopup(
      error.message ||
      "Unable to delete shipment."
    );

  }

}


// ======================================================
// REMOVE WATERMARK
// ======================================================

async function removeShipmentWatermark(
  index = null
) {

  const token = getToken();

  if (!token) {

    showMessage(
      "Please login first.",
      "danger"
    );

    return;

  }

  let targetShipment = null;

  if (
    index !== null &&
    userShipments[index]
  ) {

    targetShipment =
      userShipments[index];

  } else if (
    currentShipment
  ) {

    targetShipment =
      currentShipment;

  }

  if (!targetShipment) {

    showMessage(
      "No shipment selected.",
      "danger"
    );

    return;

  }

  const targetTracking =
    targetShipment.trackingNumber;

  if (
    targetShipment.watermarkEnabled ===
    false
  ) {

    showMessage(
      "This shipment is already clean.",
      "success"
    );

    return;

  }

  const confirmed =
    confirm(
      `Remove the watermark for ${formatMoney(
        CLEAN_SHIPPING_PRICE
      )}?`
    );

  if (!confirmed) {
    return;
  }

  try {

    if (removeWatermark) {

      removeWatermark.disabled =
        true;

      removeWatermark.textContent =
        "Removing...";

    }

    const response =
      await fetch(

        `${API_URL}/shipments/${encodeURIComponent(
          targetTracking
        )}/upgrade`,

        {

          method: "PATCH",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          }

        }

      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to remove watermark."
      );

    }

    const updatedShipment =
      data.shipment || data;

    currentShipment =
      updatedShipment;

    generatedTrackingNumber =
      updatedShipment.trackingNumber;

    currentWalletBalance =
      Number(
        data.walletBalance ??
        data.balance ??
        currentWalletBalance
      );

    addOrReplaceShipment(
      updatedShipment
    );

    await loadWalletBalance();

    fillDocumentFromShipment(
      updatedShipment
    );

    showDocument();


    // ==================================================
    // SUCCESS POPUP
    // ==================================================

    showCargoPopup(

      `Watermark Removed Successfully\n\n` +

      `Tracking Number: ${updatedShipment.trackingNumber
      }\n` +

      `Payment: ${formatMoney(CLEAN_SHIPPING_PRICE)
      }\n` +

      `Wallet Balance: ${formatMoney(currentWalletBalance)
      }`

    );


    await loadShipments();


  } catch (error) {

    console.error(
      "REMOVE WATERMARK ERROR:",
      error
    );

    showCargoPopup(
      error.message ||
      "Unable to remove watermark."
    );


  } finally {

    if (removeWatermark) {

      removeWatermark.disabled =
        false;

      removeWatermark.textContent =
        "Remove Watermark — $5";

    }

  }

}


// ======================================================
// FILL SHIPPING DOCUMENT
// ======================================================

function fillDocumentFromShipment(
  shipment
) {

  if (!shipment) {
    return;
  }

  currentShipment = shipment;

  if (downloadDocument) {
    downloadDocument.disabled = false;
  }

  setText(
    "viewInvoiceNumber",
    shipment.invoiceNumber || ""
  );

  setText(
    "viewTrackingNumber",
    shipment.trackingNumber || ""
  );

  setText(
    "viewStatus",
    shipment.status ||
    shipment.currentStatus ||
    "Pending"
  );

  setText(
    "viewShipmentDate",
    formatDateDisplay(
      shipment.shipmentDate
    )
  );

  setText(
    "viewArrival",
    formatDateDisplay(
      shipment.estimatedDelivery
    )
  );

  setText(
    "viewSender",
    shipment.sender || ""
  );

  setText(
    "viewSenderEmail",
    shipment.senderEmail || ""
  );

  setText(
    "viewOrigin",
    shipment.origin || ""
  );

  setText(
    "viewRecipient",
    shipment.recipient || ""
  );

  setText(
    "viewRecipientEmail",
    shipment.recipientEmail || ""
  );

  setText(
    "viewDestination",
    shipment.recipientAddress || ""
  );

  setText(
    "viewRecipientAddress",
    shipment.recipientAddress || ""
  );

  setText(
    "viewPackageContent",
    shipment.packageContent || ""
  );

  setText(
    "viewPackageWeight",
    shipment.packageWeight || ""
  );


  const viewErrorBox =
    document.getElementById(
      "viewErrorBox"
    );


  const hasError =
    Boolean(
      shipment.errorMessage &&
      String(
        shipment.errorMessage
      ).trim()
    );


  if (hasError) {

    setText(
      "viewError",
      shipment.errorMessage
    );

    if (viewErrorBox) {

      viewErrorBox.style.display =
        "block";

    }

  } else {

    if (viewErrorBox) {

      viewErrorBox.style.display =
        "none";

    }

  }


  const isWatermarked =
    shipment.watermarkEnabled !== false;


  if (watermarkLayer) {

    watermarkLayer.style.display =
      isWatermarked
        ? "flex"
        : "none";

  }


  if (documentStatus) {

    documentStatus.textContent =
      isWatermarked
        ? "Watermarked"
        : "Clean";

    documentStatus.classList.toggle(
      "watermarked",
      isWatermarked
    );

    documentStatus.classList.toggle(
      "clean",
      !isWatermarked
    );

  }


  if (removeWatermark) {

    removeWatermark.style.display =
      isWatermarked
        ? "inline-block"
        : "none";

    removeWatermark.disabled =
      false;

    removeWatermark.textContent =
      "Remove Watermark — $5";

  }


  createDocumentTrackingLink(
    shipment.trackingNumber
  );


  if (shippingDocument) {

    shippingDocument.classList.toggle(
      "watermarked-document",
      isWatermarked
    );

    shippingDocument.classList.toggle(
      "clean-document",
      !isWatermarked
    );

  }

}


// ======================================================
// SHOW DOCUMENT
// ======================================================

function showDocument() {

  if (!shippingDocument) {
    return;
  }

  shippingDocument.style.display =
    "block";

  shippingDocument.classList.remove(
    "d-none"
  );

}


// ======================================================
// CREATE DOCUMENT TRACKING LINK
// ======================================================

function createDocumentTrackingLink(
  trackingNumber
) {

  if (!shippingDocument) {
    return;
  }

  const existing =
    document.getElementById(
      "documentTrackingLink"
    );

  if (existing) {
    existing.remove();
  }

  const trackingElement =
    document.getElementById(
      "viewTrackingNumber"
    );

  if (!trackingElement) {
    return;
  }

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.id =
    "documentTrackingLink";

  wrapper.style.marginTop =
    "8px";

  wrapper.innerHTML =
    getTrackingLinkHTML(
      trackingNumber
    );

  trackingElement.parentNode
    .appendChild(wrapper);

}


// ======================================================
// SET TEXT
// ======================================================

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {

    element.textContent =
      value ?? "";

  }

}


// ======================================================
// SET FORM MODE
// ======================================================

function setFormMode(
  editing
) {

  editingShipment =
    editing;

  if (createShippingButton) {

    createShippingButton.textContent =
      editing
        ? "Update Shipment"
        : "Create Shipping";

  }

  if (cancelEditButton) {

    cancelEditButton.style.display =
      editing
        ? "inline-block"
        : "none";

  }


  // ====================================================
  // CONTROLLER MODE
  // ====================================================

  if (editing) {

    setControllerMode(
      "profile"
    );

  } else {

    setControllerMode(
      "create"
    );

  }

}


// ======================================================
// CANCEL EDIT
// ======================================================

if (cancelEditButton) {

  cancelEditButton.addEventListener(
    "click",
    function () {

      setFormMode(false);

      currentShipment =
        null;

      generatedTrackingNumber =
        "";

      clearForm();

      clearDocument();

      renderShipments();

      if (shippingMessage) {

        shippingMessage.style.display =
          "none";

      }

    }
  );

}


// ======================================================
// NEW SHIPMENT
// ======================================================

if (newShipmentButton) {

  newShipmentButton.addEventListener(
    "click",
    function () {

      setFormMode(false);

      currentShipment =
        null;

      generatedTrackingNumber =
        "";

      clearForm();

      clearDocument();

      renderShipments();

      if (shippingMessage) {

        shippingMessage.style.display =
          "none";

      }

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


// ======================================================
// REFRESH SHIPMENTS
// ======================================================

if (refreshShipments) {

  refreshShipments.addEventListener(
    "click",
    async function () {

      await loadWalletBalance();

      await loadShipments();

    }
  );

}


// ======================================================
// ERROR VISIBILITY
// ======================================================

function updateErrorVisibility(
  forceVisible = false
) {

  if (!errorMessageGroup) {
    return;
  }

  const status =
    shippingStatus?.value ||
    "";


  const normalizedStatus =
    status
      .trim()
      .toLowerCase();


  const hasErrorStatus =
    normalizedStatus === "error" ||
    normalizedStatus === "failed" ||
    normalizedStatus === "exception";


  /*
     ERROR MESSAGE IS SHOWN ONLY WHEN
     THE CURRENT STATUS IS AN ERROR STATUS.

     The old behavior allowed an existing
     message or forceVisible to keep the
     field visible.

     We intentionally no longer do that.

     This keeps the form clean and prevents
     users from seeing an error-message field
     when the shipment is not actually in
     an error state.
  */

  errorMessageGroup.style.display =
    hasErrorStatus
      ? "block"
      : "none";

}


// ======================================================
// STATUS CHANGE
// ======================================================

if (shippingStatus) {

  shippingStatus.addEventListener(
    "change",
    function () {

      updateErrorVisibility();

    }
  );

}


// ======================================================
// CLEAR FORM
// ======================================================

function clearForm() {

  if (shippingForm) {

    shippingForm.reset();

  }

  selectedShippingType =
    "test";

  const testOption =
    document.querySelector(
      'input[name="shippingType"][value="test"]'
    );

  if (testOption) {

    testOption.checked =
      true;

  }

  updateErrorVisibility();

}


// ======================================================
// CLEAR DOCUMENT
// ======================================================

function clearDocument() {

  if (shippingDocument) {

    shippingDocument.style.display =
      "none";

    shippingDocument.classList.add(
      "d-none"
    );

  }

  const existing =
    document.getElementById(
      "documentTrackingLink"
    );

  if (existing) {
    existing.remove();
  }

  if (watermarkLayer) {

    watermarkLayer.style.display =
      "none";

  }

  if (downloadDocument) {

    downloadDocument.disabled =
      true;

  }

  if (removeWatermark) {

    removeWatermark.style.display =
      "none";

  }

}


// ======================================================
// SAVE FORM DATA
// ======================================================

function saveFormData() {

  try {

    const data = {

      invoiceNumber:
        invoiceNumber?.value || "",

      shipmentDate:
        shipmentDate?.value || "",

      shipmentTime:
        shipmentTime?.value || "",

      estimatedDelivery:
        estimatedDelivery?.value || "",

      estimatedDeliveryTime:
        estimatedDeliveryTime?.value || "",

      sender:
        sender?.value || "",

      senderEmail:
        senderEmail?.value || "",

      origin:
        origin?.value || "",

      recipient:
        recipient?.value || "",

      recipientEmail:
        recipientEmail?.value || "",

      recipientAddress:
        recipientAddress?.value || "",

      packageContent:
        packageContent?.value || "",

      packageWeight:
        packageWeight?.value || "",

      currentStatus:
        shippingStatus?.value ||
        "Processing",

      errorMessage:
        errorMessage?.value || ""

    };

    localStorage.setItem(
      "cargoFormData",
      JSON.stringify(data)
    );

  } catch (error) {

    console.error(
      "SAVE FORM ERROR:",
      error
    );

  }

}


// ======================================================
// RESTORE FORM DATA
// ======================================================

function restoreFormData() {

  try {

    const saved =
      localStorage.getItem(
        "cargoFormData"
      );

    if (!saved) {
      return;
    }

    const data =
      JSON.parse(saved);

    if (invoiceNumber) {

      invoiceNumber.value =
        data.invoiceNumber || "";

    }

    if (shipmentDate) {

      shipmentDate.value =
        data.shipmentDate || "";

    }

    if (shipmentTime) {

      shipmentTime.value =
        data.shipmentTime || "";

    }

    if (estimatedDelivery) {

      estimatedDelivery.value =
        data.estimatedDelivery || "";

    }

    if (estimatedDeliveryTime) {

      estimatedDeliveryTime.value =
        data.estimatedDeliveryTime || "";

    }

    if (sender) {

      sender.value =
        data.sender || "";

    }

    if (senderEmail) {

      senderEmail.value =
        data.senderEmail || "";

    }

    if (origin) {

      origin.value =
        data.origin || "";

    }

    if (recipient) {

      recipient.value =
        data.recipient || "";

    }

    if (recipientEmail) {

      recipientEmail.value =
        data.recipientEmail || "";

    }

    if (recipientAddress) {

      recipientAddress.value =
        data.recipientAddress || "";

    }

    if (packageContent) {

      packageContent.value =
        data.packageContent || "";

    }

    if (packageWeight) {

      packageWeight.value =
        data.packageWeight || "";

    }

    if (shippingStatus) {

      shippingStatus.value =
        data.currentStatus ||
        "Processing";

    }

    if (errorMessage) {

      errorMessage.value =
        data.errorMessage || "";

    }

    /*
       Visibility is now based only
       on the restored status.
    */

    updateErrorVisibility();

  } catch (error) {

    console.error(
      "RESTORE FORM ERROR:",
      error
    );

  }

}


// ======================================================
// EXTRACT DATE
// ======================================================

function extractDate(
  value
) {

  if (!value) {
    return "";
  }

  const stringValue =
    String(value);

  if (
    /^\d{4}-\d{2}-\d{2}/
      .test(stringValue)
  ) {

    return stringValue
      .substring(0, 10);

  }

  return "";

}


// ======================================================
// EXTRACT TIME
// ======================================================

function extractTime(
  value
) {

  if (!value) {
    return "";
  }

  const stringValue =
    String(value);

  const match =
    stringValue.match(
      /T(\d{2}:\d{2})/
    );

  if (match) {

    return match[1];

  }

  return "";

}


// ======================================================
// FORMAT DATE DISPLAY
// ======================================================

function formatDateDisplay(
  value
) {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }

  return date.toLocaleString();

}


// ======================================================
// DOWNLOAD / PRINT
// ======================================================

if (downloadDocument) {

  downloadDocument.addEventListener(
    "click",
    function () {

      printDocument();

    }
  );

}

// ======================================================
// PRINT CARGO RECEIPT
// ======================================================

function printDocument() {

  if (!currentShipment) {

    alert(
      "No shipping document available."
    );

    return;

  }


  const shipment =
    currentShipment;


  // ====================================================
  // VALUES
  // ====================================================

  const invoice =
    shipment.invoiceNumber ||
    "N/A";

  const tracking =
    shipment.trackingNumber ||
    "N/A";

  const status =
    shipment.status ||
    shipment.currentStatus ||
    "Processing";

  const shipmentDateValue =
    formatDateDisplay(
      shipment.shipmentDate
    ) || "N/A";

  const arrivalDateValue =
    formatDateDisplay(
      shipment.estimatedDelivery
    ) || "N/A";


  const senderName =
    shipment.sender ||
    "N/A";

  const senderEmailValue =
    shipment.senderEmail ||
    "N/A";

  const originValue =
    shipment.origin ||
    "N/A";


  const recipientName =
    shipment.recipient ||
    "N/A";

  const recipientEmailValue =
    shipment.recipientEmail ||
    "N/A";

  const recipientAddressValue =
    shipment.recipientAddress ||
    "N/A";


  const packageContentValue =
    shipment.packageContent ||
    "N/A";

  const packageWeightValue =
    shipment.packageWeight ||
    "N/A";


  const errorValue =
    shipment.errorMessage ||
    "";


  const isWatermarked =
    shipment.watermarkEnabled !== false;


  const trackingURL =
    getTrackingURL(
      tracking
    );


  // ====================================================
  // PRINT WINDOW
  // ====================================================

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=900,height=1000"
    );


  if (!printWindow) {

    alert(
      "Please allow pop-ups to print the shipping receipt."
    );

    return;

  }


  // ====================================================
  // SAFE HTML
  // ====================================================

  const safe =
    function (value) {

      return escapeHTML(
        value
      );

    };


  // ====================================================
  // WATERMARK
  // ====================================================

  const watermarkHTML =
    isWatermarked

      ? `

        <div class="receipt-watermark">

          <span>TEST SHIPPING</span>
          <span>TEST SHIPPING</span>
          <span>TEST SHIPPING</span>
          <span>TEST SHIPPING</span>
          <span>TEST SHIPPING</span>
          <span>TEST SHIPPING</span>
          <span>TEST SHIPPING</span>
          <span>TEST SHIPPING</span>

        </div>

      `

      : "";


  // ====================================================
  // ERROR MESSAGE
  // ====================================================

  const errorHTML =
    errorValue.trim()

      ? `

        <div class="receipt-error">

          <strong>
            Shipment Message
          </strong>

          <p>
            ${safe(errorValue)}
          </p>

        </div>

      `

      : "";


  // ====================================================
  // PRINT HTML
  // ====================================================

  printWindow.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      >

      <title>
        Cargo Receipt - ${safe(tracking)}
      </title>


      <style>

        * {
          box-sizing: border-box;
        }


        @page {
          size: A4;
          margin: 12mm;
        }


        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }


        body {
          padding: 0;
        }


        .receipt {
          position: relative;

          width: 100%;
          max-width: 186mm;

          min-height: 273mm;

          margin: 0 auto;

          background: #ffffff;

          overflow: hidden;
        }


        /* ============================================
           WATERMARK
        ============================================ */

        .receipt-watermark {
          position: absolute;

          inset: 0;

          z-index: 1;

          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          grid-template-rows:
            repeat(4, 1fr);

          align-items: center;

          justify-items: center;

          pointer-events: none;

          transform: rotate(-28deg);

          opacity: .09;
        }


        .receipt-watermark span {
          color: #dc2626;

          font-size: 27px;

          font-weight: 900;

          letter-spacing: 2px;

          white-space: nowrap;
        }


        /* ============================================
           CONTENT
        ============================================ */

        .receipt-content {
          position: relative;

          z-index: 2;

          width: 100%;

          padding: 7mm;
        }


        /* ============================================
           HEADER
        ============================================ */

        .receipt-header {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 20px;

          padding-bottom: 7mm;

          border-bottom: 2px solid #111827;
        }


        .brand {
          color: #4f46e5;

          font-size: 22px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .brand-subtitle {
          margin-top: 4px;

          color: #64748b;

          font-size: 10px;

          font-weight: 600;
        }


        .receipt-title {
          text-align: right;
        }


        .receipt-title h1 {
          margin: 0;

          color: #111827;

          font-size: 24px;

          font-weight: 900;

          letter-spacing: .5px;
        }


        .receipt-title p {
          margin: 5px 0 0;

          color: #64748b;

          font-size: 9px;
        }


        /* ============================================
           REFERENCE AREA
        ============================================ */

        .reference-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;

          margin-top: 6mm;
        }


        .reference-box {
          padding: 12px;

          border: 1px solid #dbe2ea;

          border-radius: 6px;

          background: #f8fafc;
        }


        .reference-label {
          display: block;

          margin-bottom: 5px;

          color: #64748b;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }


        .reference-value {
          display: block;

          color: #111827;

          font-size: 12px;

          font-weight: 800;

          overflow-wrap: anywhere;
        }


        /* ============================================
           STATUS
        ============================================ */

        .status-section {
          margin-top: 5mm;

          padding: 13px;

          border: 1px solid #c7d2fe;

          border-radius: 7px;

          background: #eef2ff;
        }


        .status-label {
          display: block;

          margin-bottom: 5px;

          color: #64748b;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }


        .status-value {
          color: #312e81;

          font-size: 14px;

          font-weight: 900;

          text-transform: uppercase;
        }


        /* ============================================
           DATE GRID
        ============================================ */

        .date-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;

          margin-top: 5mm;
        }


        .date-box {
          padding: 12px;

          border: 1px solid #e2e8f0;

          border-radius: 6px;
        }


        .date-label {
          display: block;

          margin-bottom: 5px;

          color: #64748b;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }


        .date-value {
          color: #334155;

          font-size: 10px;

          font-weight: 700;

          overflow-wrap: anywhere;
        }


        /* ============================================
           SECTION TITLE
        ============================================ */

        .section-title {
          margin: 7mm 0 3mm;

          padding-bottom: 5px;

          border-bottom: 1px solid #dbe2ea;

          color: #111827;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1px;

          text-transform: uppercase;
        }


        /* ============================================
           FROM / TO
        ============================================ */

        .address-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;
        }


        .address-box {
          min-height: 42mm;

          padding: 13px;

          border: 1px solid #dbe2ea;

          border-radius: 7px;
        }


        .address-label {
          display: block;

          margin-bottom: 8px;

          color: #4f46e5;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1px;

          text-transform: uppercase;
        }


        .person-name {
          color: #111827;

          font-size: 12px;

          font-weight: 800;
        }


        .person-email {
          margin-top: 5px;

          color: #475569;

          font-size: 9px;

          overflow-wrap: anywhere;
        }


        .person-location {
          margin-top: 8px;

          color: #334155;

          font-size: 9px;

          line-height: 1.5;

          overflow-wrap: anywhere;
        }


        /* ============================================
           PACKAGE
        ============================================ */

        .package-box {
          padding: 13px;

          border: 1px solid #dbe2ea;

          border-radius: 7px;
        }


        .package-grid {
          display: grid;

          grid-template-columns:
            2fr 1fr;

          gap: 12px;
        }


        .package-item-label {
          display: block;

          margin-bottom: 5px;

          color: #64748b;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }


        .package-item-value {
          color: #111827;

          font-size: 10px;

          font-weight: 700;

          line-height: 1.5;

          overflow-wrap: anywhere;
        }


        /* ============================================
           TRACKING
        ============================================ */

        .tracking-section {
          margin-top: 7mm;

          padding: 15px;

          border: 2px solid #4f46e5;

          border-radius: 8px;

          text-align: center;

          background: #f8fafc;
        }


        .tracking-label {
          display: block;

          margin-bottom: 7px;

          color: #64748b;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

          text-transform: uppercase;
        }


        .tracking-number {
          color: #16a34a;

          font-size: 20px;

          font-weight: 900;

          letter-spacing: 2px;

          overflow-wrap: anywhere;
        }


        .tracking-url {
          display: block;

          margin-top: 7px;

          color: #4f46e5;

          font-size: 8px;

          overflow-wrap: anywhere;
        }


        /* ============================================
           ERROR
        ============================================ */

        .receipt-error {
          margin-top: 5mm;

          padding: 12px;

          border: 1px solid #fecaca;

          border-radius: 6px;

          background: #fef2f2;
        }


        .receipt-error strong {
          color: #b91c1c;

          font-size: 9px;
        }


        .receipt-error p {
          margin: 5px 0 0;

          color: #7f1d1d;

          font-size: 9px;

          line-height: 1.5;

          overflow-wrap: anywhere;
        }


        /* ============================================
           FOOTER
        ============================================ */

        .receipt-footer {
          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          gap: 20px;

          margin-top: 10mm;

          padding-top: 5mm;

          border-top: 1px solid #dbe2ea;

          color: #64748b;

          font-size: 8px;

          line-height: 1.5;
        }


        .footer-right {
          text-align: right;
        }


        .footer-right strong {
          color: #334155;
        }


        /* ============================================
           PRINT
        ============================================ */

        @media print {

          html,
          body {
            width: 210mm;

            min-height: 297mm;
          }


          .receipt {
            width: 186mm;

            min-height: 273mm;

            margin: 0;
          }


          .receipt-content {
            padding: 5mm;
          }


          * {
            -webkit-print-color-adjust: exact !important;

            print-color-adjust: exact !important;
          }

        }


        /* ============================================
           SMALL PRINT WINDOW
        ============================================ */

        @media (max-width: 700px) {

          .receipt-header {
            flex-direction: column;
          }


          .receipt-title {
            text-align: left;
          }


          .reference-grid,
          .date-grid,
          .address-grid,
          .package-grid {
            grid-template-columns: 1fr;
          }


          .receipt-footer {
            flex-direction: column;

            align-items: flex-start;
          }


          .footer-right {
            text-align: left;
          }

        }

      </style>

    </head>


    <body>


      <div class="receipt">


        ${watermarkHTML}


        <div class="receipt-content">


          <!-- ======================================
               HEADER
          ======================================= -->

          <div class="receipt-header">


            <div>

              <div class="brand">
                ZENDITCARGO
              </div>

              <div class="brand-subtitle">
                Cargo &amp; Shipping Services
              </div>

            </div>


            <div class="receipt-title">

              <h1>
                CARGO RECEIPT
              </h1>

              <p>
                Official shipment document
              </p>

            </div>


          </div>


          <!-- ======================================
               REFERENCE
          ======================================= -->

          <div class="reference-grid">


            <div class="reference-box">

              <span class="reference-label">
                Invoice Number
              </span>

              <span class="reference-value">
                ${safe(invoice)}
              </span>

            </div>


            <div class="reference-box">

              <span class="reference-label">
                Tracking Number
              </span>

              <span class="reference-value">
                ${safe(tracking)}
              </span>

            </div>


          </div>


          <!-- ======================================
               STATUS
          ======================================= -->

          <div class="status-section">

            <span class="status-label">
              Shipment Status
            </span>

            <span class="status-value">
              ${safe(status)}
            </span>

          </div>


          <!-- ======================================
               DATES
          ======================================= -->

          <div class="date-grid">


            <div class="date-box">

              <span class="date-label">
                Shipment Date
              </span>

              <div class="date-value">
                ${safe(shipmentDateValue)}
              </div>

            </div>


            <div class="date-box">

              <span class="date-label">
                Expected Arrival
              </span>

              <div class="date-value">
                ${safe(arrivalDateValue)}
              </div>

            </div>


          </div>


          <!-- ======================================
               FROM / TO
          ======================================= -->

          <div class="section-title">
            Shipment Details
          </div>


          <div class="address-grid">


            <div class="address-box">

              <span class="address-label">
                From
              </span>

              <div class="person-name">
                ${safe(senderName)}
              </div>

              <div class="person-email">
                ${safe(senderEmailValue)}
              </div>

              <div class="person-location">
                ${safe(originValue)}
              </div>

            </div>


            <div class="address-box">

              <span class="address-label">
                To
              </span>

              <div class="person-name">
                ${safe(recipientName)}
              </div>

              <div class="person-email">
                ${safe(recipientEmailValue)}
              </div>

              <div class="person-location">
                ${safe(recipientAddressValue)}
              </div>

            </div>


          </div>


          <!-- ======================================
               PACKAGE
          ======================================= -->

          <div class="section-title">
            Package Information
          </div>


          <div class="package-box">


            <div class="package-grid">


              <div>

                <span class="package-item-label">
                  Package Content
                </span>

                <div class="package-item-value">
                  ${safe(packageContentValue)}
                </div>

              </div>


              <div>

                <span class="package-item-label">
                  Weight
                </span>

                <div class="package-item-value">
                  ${safe(packageWeightValue)}
                </div>

              </div>


            </div>


          </div>


          <!-- ======================================
               TRACKING
          ======================================= -->

          <div class="tracking-section">

            <span class="tracking-label">
              Track This Shipment
            </span>

            <div class="tracking-number">
              ${safe(tracking)}
            </div>

            <div class="tracking-url">
              ${safe(trackingURL)}
            </div>

          </div>


          <!-- ======================================
               ERROR MESSAGE
          ======================================= -->

          ${errorHTML}


          <!-- ======================================
               FOOTER
          ======================================= -->

          <div class="receipt-footer">


            <div>

              <strong>
                ZendItCargo
              </strong>

              <br>

              Cargo &amp; Shipping Services

              <br>

              Thank you for choosing ZendItCargo.

            </div>


            <div class="footer-right">

              <strong>
                zenditcargo.com
              </strong>

              <br>

              Tracking available online

            </div>


          </div>


        </div>


      </div>


    </body>

    </html>

  `);


  printWindow.document.close();


  printWindow.focus();


  setTimeout(
    function () {

      printWindow.print();

    },
    700
  );

}


// ======================================================
// REMOVE WATERMARK BUTTON
// ======================================================

if (removeWatermark) {

  removeWatermark.addEventListener(
    "click",
    function () {

      removeShipmentWatermark();

    }
  );

}


// ======================================================
// INITIALIZE
// ======================================================

async function initializeCargo() {

  console.log(
    "JustDoks Cargo JS loaded."
  );

  /*
     Start in CREATE mode.

     This keeps the right side showing
     Create Shipping when the page opens.
  */

  setFormMode(false);

  updateErrorVisibility();

  clearDocument();

  restoreFormData();

  await loadUserStorage();

}


// ======================================================
// START
// ======================================================

initializeCargo();


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(
  async function () {

    if (getToken()) {

      await loadWalletBalance();

      await loadShipments();

    }

  },
  60000
);