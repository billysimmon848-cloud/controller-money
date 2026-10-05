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

const shipmentsList =
  document.getElementById("shipmentsList");

const refreshShipments =
  document.getElementById("refreshShipments");

const newShipmentButton =
  document.getElementById("newShipmentButton");

const cancelEditButton =
  document.getElementById("cancelEditButton");


// ======================================================
// HISTORY DOM ELEMENTS
// ======================================================

const addTrackingEventButton =
  document.getElementById(
    "addTrackingEventButton"
  );

const saveTrackingHistoryButton =
  document.getElementById(
    "saveTrackingHistoryButton"
  );

const trackingEventsContainer =
  document.getElementById(
    "trackingEventsContainer"
  );


// ======================================================
// REMOVE OLD DOCUMENT PREVIEW
// ======================================================

const oldShippingDocument =
  document.getElementById("shippingDocument");

if (oldShippingDocument) {

  oldShippingDocument.remove();

}


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
// TRACKING HISTORY STATE
// ======================================================

let trackingEvents = [];


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

  if (
    value === null ||
    value === undefined
  ) {

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

  const amount =
    Number(value);

  if (
    Number.isNaN(amount)
  ) {

    return "$0.00";

  }

  return "$" +
    amount.toFixed(2);

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
// BUILD HISTORY TIMESTAMP
// ======================================================

function buildHistoryTimestamp(
  dateValue,
  timeValue
) {

  if (!dateValue) {

    return "";

  }

  if (!timeValue) {

    return dateValue;

  }

  const date =
    new Date(
      `${dateValue}T${timeValue}`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }

  return date.toISOString();

}


// ======================================================
// GET LOCAL DATE FROM TIMESTAMP
// ======================================================

function getLocalDateFromTimestamp(
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

    return "";

  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}


// ======================================================
// GET LOCAL TIME FROM TIMESTAMP
// ======================================================

function getLocalTimeFromTimestamp(
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

    return "";

  }

  const hours =
    String(
      date.getHours()
    ).padStart(
      2,
      "0"
    );

  const minutes =
    String(
      date.getMinutes()
    ).padStart(
      2,
      "0"
    );

  return `${hours}:${minutes}`;

}


// ======================================================
// AUTH USER
// ======================================================

async function getCurrentUser() {

  const token =
    getToken();

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

  const token =
    getToken();

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

  const token =
    getToken();

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
// HISTORY — ADD ENTRY
// ======================================================

if (addTrackingEventButton) {

  addTrackingEventButton.addEventListener(
    "click",
    function () {

      trackingEvents.push({

        status:
          "Processing",

        location:
          "",

        description:
          "",

        timestamp:
          new Date().toISOString()

      });

      renderTrackingEvents();

    }
  );

}


// ======================================================
// HISTORY — SAVE ONLY HISTORY
// ======================================================

if (saveTrackingHistoryButton) {

  saveTrackingHistoryButton.addEventListener(
    "click",
    saveTrackingHistory
  );

}


// ======================================================
// HISTORY — RENDER
// ======================================================

function renderTrackingEvents() {

  if (!trackingEventsContainer) {

    return;

  }

  if (
    trackingEvents.length === 0
  ) {

    trackingEventsContainer.innerHTML = `

      <div class="tracking-events-empty">

        No history entries added yet.

      </div>

    `;

    return;

  }

  trackingEventsContainer.innerHTML =

    trackingEvents
      .map(
        function (
          event,
          index
        ) {

          return createTrackingEventEditor(
            event,
            index
          );

        }
      )
      .join("");

}


// ======================================================
// HISTORY — CREATE EDITOR
// ======================================================

function createTrackingEventEditor(
  event,
  index
) {

  const dateValue =
    getLocalDateFromTimestamp(
      event.timestamp
    );

  const timeValue =
    getLocalTimeFromTimestamp(
      event.timestamp
    );

  const status =
    event.status ||
    "Processing";

  const location =
    event.location ||
    "";

  const description =
    event.description ||
    "";

  return `

    <div
      class="tracking-event-editor"
      data-event-index="${index}"
    >

      <div class="tracking-event-editor-header">

        <strong>
          History Entry ${index + 1}
        </strong>

        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          onclick="removeTrackingEvent(${index})"
        >
          Remove
        </button>

      </div>


      <div class="tracking-event-editor-grid">


        <!-- DATE -->

        <div class="tracking-event-field">

          <label>
            Date
          </label>

          <input
            type="date"
            value="${escapeAttribute(dateValue)}"
            onchange="updateTrackingEventDate(${index}, this.value)"
          >

        </div>


        <!-- TIME -->

        <div class="tracking-event-field">

          <label>
            Time
          </label>

          <input
            type="time"
            value="${escapeAttribute(timeValue)}"
            onchange="updateTrackingEventTime(${index}, this.value)"
          >

        </div>


        <!-- STATUS -->

        <div class="tracking-event-field">

          <label>
            Status
          </label>

          <select
            onchange="updateTrackingEventStatus(${index}, this.value)"
          >

            <option
              value="Processing"
              ${
                status === "Processing"
                  ? "selected"
                  : ""
              }
            >
              Processing
            </option>

            <option
              value="Package Received"
              ${
                status === "Package Received"
                  ? "selected"
                  : ""
              }
            >
              Package Received
            </option>

            <option
              value="In Transit"
              ${
                status === "In Transit"
                  ? "selected"
                  : ""
              }
            >
              In Transit
            </option>

            <option
              value="Arrived"
              ${
                status === "Arrived"
                  ? "selected"
                  : ""
              }
            >
              Arrived
            </option>

            <option
              value="Delivered"
              ${
                status === "Delivered"
                  ? "selected"
                  : ""
              }
            >
              Delivered
            </option>

            <option
              value="Error"
              ${
                status === "Error"
                  ? "selected"
                  : ""
              }
            >
              Error
            </option>

          </select>

        </div>


        <!-- LOCATION -->

        <div class="tracking-event-field">

          <label>
            Location
          </label>

          <input
            type="text"
            value="${escapeAttribute(location)}"
            placeholder="Houston, Texas"
            onchange="updateTrackingEventLocation(${index}, this.value)"
          >

        </div>


        <!-- DESCRIPTION -->

        <div
          class="tracking-event-field tracking-event-description"
        >

          <label>
            Description
          </label>

          <textarea
            rows="3"
            placeholder="Package collected from sender."
            onchange="updateTrackingEventDescription(${index}, this.value)"
          >${escapeHTML(description)}</textarea>

        </div>

      </div>

    </div>

  `;

}


// ======================================================
// HISTORY — UPDATE DATE
// ======================================================

function updateTrackingEventDate(
  index,
  value
) {

  if (
    !trackingEvents[index]
  ) {

    return;

  }

  const currentTime =
    getLocalTimeFromTimestamp(
      trackingEvents[index].timestamp
    ) ||
    "00:00";

  trackingEvents[index].timestamp =
    buildHistoryTimestamp(
      value,
      currentTime
    );

}


// ======================================================
// HISTORY — UPDATE TIME
// ======================================================

function updateTrackingEventTime(
  index,
  value
) {

  if (
    !trackingEvents[index]
  ) {

    return;

  }

  const currentDate =
    getLocalDateFromTimestamp(
      trackingEvents[index].timestamp
    );

  trackingEvents[index].timestamp =
    buildHistoryTimestamp(
      currentDate,
      value
    );

}


// ======================================================
// HISTORY — UPDATE STATUS
// ======================================================

function updateTrackingEventStatus(
  index,
  value
) {

  if (
    !trackingEvents[index]
  ) {

    return;

  }

  trackingEvents[index].status =
    value;

}


// ======================================================
// HISTORY — UPDATE LOCATION
// ======================================================

function updateTrackingEventLocation(
  index,
  value
) {

  if (
    !trackingEvents[index]
  ) {

    return;

  }

  trackingEvents[index].location =
    value.trim();

}


// ======================================================
// HISTORY — UPDATE DESCRIPTION
// ======================================================

function updateTrackingEventDescription(
  index,
  value
) {

  if (
    !trackingEvents[index]
  ) {

    return;

  }

  trackingEvents[index].description =
    value.trim();

}


// ======================================================
// HISTORY — REMOVE ENTRY
// ======================================================

function removeTrackingEvent(
  index
) {

  if (
    !trackingEvents[index]
  ) {

    return;

  }

  trackingEvents.splice(
    index,
    1
  );

  renderTrackingEvents();

}


// ======================================================
// HISTORY — COLLECT / CLEAN
// ======================================================

function getTrackingEvents() {

  return trackingEvents
    .map(
      function (event) {

        return {

          status:
            String(
              event.status || ""
            ).trim(),

          location:
            String(
              event.location || ""
            ).trim(),

          description:
            String(
              event.description || ""
            ).trim(),

          timestamp:
            event.timestamp || ""

        };

      }
    )
    .filter(
      function (event) {

        return (
          event.status &&
          event.location &&
          event.timestamp
        );

      }
    );

}


// ======================================================
// HISTORY — SAVE ONLY HISTORY
// ======================================================

async function saveTrackingHistory() {

  const token =
    getToken();

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
      "Please select a shipment first.",
      "danger"
    );

    return;

  }

  const trackingNumber =
    currentShipment.trackingNumber;


  const history =
    getTrackingEvents();


  if (
    saveTrackingHistoryButton
  ) {

    saveTrackingHistoryButton.disabled =
      true;

    saveTrackingHistoryButton.dataset
      .originalText =
      saveTrackingHistoryButton.textContent;

    saveTrackingHistoryButton.textContent =
      "Saving History...";

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
            JSON.stringify({

              trackingEvents:
                history

            })

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
        "Unable to save shipment history."
      );

    }


    const shipment =
      data.shipment || data;


    if (
      !shipment ||
      !shipment.trackingNumber
    ) {

      throw new Error(
        "History was saved but the server did not return the shipment."
      );

    }


    currentShipment =
      shipment;


    generatedTrackingNumber =
      shipment.trackingNumber;


    trackingEvents =
      Array.isArray(
        shipment.trackingEvents
      )
        ? shipment.trackingEvents
        : [];


    addOrReplaceShipment(
      shipment
    );


    renderTrackingEvents();


    showCargoPopup(

      `Shipment History Saved Successfully\n\n` +

      `Tracking Number: ${
        shipment.trackingNumber
      }\n` +

      `History Entries: ${
        trackingEvents.length
      }`

    );


  } catch (error) {

    console.error(
      "SAVE HISTORY ERROR:",
      error
    );

    showCargoPopup(
      error.message ||
      "Unable to save shipment history."
    );

  } finally {

    if (
      saveTrackingHistoryButton
    ) {

      saveTrackingHistoryButton.disabled =
        false;

      saveTrackingHistoryButton.textContent =
        saveTrackingHistoryButton.dataset
          .originalText ||
        "Save History";

    }

  }

}


// ======================================================
// CREATE SHIPPING
// ======================================================

async function createShipping() {

  const token =
    getToken();

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
      selectedShippingType,

    trackingEvents:
      getTrackingEvents()

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


    trackingEvents =
      Array.isArray(
        shipment.trackingEvents
      )
        ? shipment.trackingEvents
        : [];


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


    setControllerMode(
      "profile"
    );


    const paymentAmount =
      Number(
        shipment.paymentAmount || 0
      );


    const isClean =
      shipment.watermarkEnabled === false ||
      shipment.shippingType === "clean";


    if (isClean) {

      showCargoPopup(

        `Shipping Created Successfully\n\n` +

        `Tracking Number: ${
          shipment.trackingNumber
        }\n` +

        `Payment: ${
          formatMoney(paymentAmount)
        }\n` +

        `Wallet Balance: ${
          formatMoney(currentWalletBalance)
        }`

      );

    } else {

      showCargoPopup(

        `Test Shipping Created Successfully\n\n` +

        `Tracking Number: ${
          shipment.trackingNumber
        }\n` +

        `Payment: $0.00\n` +

        `Wallet Balance: ${
          formatMoney(currentWalletBalance)
        }\n` +

        `Document: Watermarked\n\n` +

        `You can remove the watermark for ${
          formatMoney(CLEAN_SHIPPING_PRICE)
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

  const token =
    getToken();

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
      class="shipment-card ${
        isSelected
          ? "selected-shipment"
          : ""
      }"
      onclick="selectShipment(${index})"
    >

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

          ${
            isClean
              ? "Clean"
              : "Watermarked"
          }

        </p>


        ${
          hasError
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


      <div class="shipment-card-actions">

        <button
          type="button"
          class="btn btn-sm btn-primary"
          onclick="event.stopPropagation(); downloadCargoDocument(${index})"
        >
          Download
        </button>


        <button
          type="button"
          class="btn btn-sm btn-secondary"
          onclick="event.stopPropagation(); editShipment(${index})"
        >
          Edit
        </button>


        ${
          !isClean
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


  currentShipment =
    shipment;


  generatedTrackingNumber =
    shipment.trackingNumber || "";


  editingShipment =
    true;


  setFormMode(true);


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


  if (shippingStatus) {

    shippingStatus.value =
      shipment.status ||
      shipment.currentStatus ||
      "Processing";

  }


  if (errorMessage) {

    errorMessage.value =
      shipment.errorMessage ||
      "";

  }


  // ====================================================
  // LOAD HISTORY
  // ====================================================

  trackingEvents =
    Array.isArray(
      shipment.trackingEvents
    )
      ? shipment.trackingEvents.map(
          function (event) {

            return {

              status:
                event.status ||
                "Processing",

              location:
                event.location ||
                "",

              description:
                event.description ||
                "",

              timestamp:
                event.timestamp ||
                ""

            };

          }
        )
      : [];


  renderTrackingEvents();


  updateErrorVisibility();


  renderShipments();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  showMessage(
    `Editing shipment ${escapeHTML(
      shipment.trackingNumber
    )}. Change the shipment details or history, then click "Update Shipment".`,
    "info"
  );

}


// ======================================================
// UPDATE SHIPMENT
// ======================================================

async function updateShipment() {

  const token =
    getToken();


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


  if (
    shippingForm &&
    !shippingForm.checkValidity()
  ) {

    shippingForm.reportValidity();

    return;

  }


  const selectedStatus =
    shippingStatus?.value ||
    "Processing";


  const updatedErrorMessage =
    errorMessage?.value?.trim() ||
    "";


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
      updatedErrorMessage,

    trackingEvents:
      getTrackingEvents()

  };


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


    currentShipment =
      shipment;


    generatedTrackingNumber =
      shipment.trackingNumber;


    trackingEvents =
      Array.isArray(
        shipment.trackingEvents
      )
        ? shipment.trackingEvents
        : [];


    addOrReplaceShipment(
      shipment
    );


    editingShipment =
      false;


    setFormMode(false);


    await loadWalletBalance();


    await loadShipments();


    showCargoPopup(

      `Shipment Updated Successfully\n\n` +

      `Tracking Number: ${
        shipment.trackingNumber
      }\n` +

      `Status: ${
        shipment.status ||
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

  const token =
    getToken();


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

      currentShipment =
        null;

      generatedTrackingNumber =
        "";

    }


    if (
      editingShipment &&
      currentShipment === null
    ) {

      editingShipment =
        false;

      setFormMode(false);

      clearForm();

    }


    renderShipments();


    showCargoPopup(

      `Shipment Deleted Successfully\n\n` +

      `Tracking Number: ${
        trackingNumber
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

  const token =
    getToken();


  if (!token) {

    showMessage(
      "Please login first.",
      "danger"
    );

    return;

  }


  let targetShipment =
    null;


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


    trackingEvents =
      Array.isArray(
        updatedShipment.trackingEvents
      )
        ? updatedShipment.trackingEvents
        : [];


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


    showCargoPopup(

      `Watermark Removed Successfully\n\n` +

      `Tracking Number: ${
        updatedShipment.trackingNumber
      }\n` +

      `Payment: ${
        formatMoney(
          CLEAN_SHIPPING_PRICE
        )
      }\n` +

      `Wallet Balance: ${
        formatMoney(
          currentWalletBalance
        )
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


  trackingEvents =
    [];


  renderTrackingEvents();


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
// DOWNLOAD CARGO DOCUMENT
// ======================================================

function downloadCargoDocument(
  index
) {

  const shipment =
    userShipments[index];


  if (!shipment) {

    alert(
      "Shipment not found."
    );

    return;

  }


  currentShipment =
    shipment;


  generatedTrackingNumber =
    shipment.trackingNumber || "";


  printDocument(
    shipment
  );

}


// ======================================================
// PRINT CARGO LETTERHEAD DOCUMENT - PDF
// ======================================================

async function printDocument(
  shipment = currentShipment
) {

  if (!shipment) {

    alert(
      "No shipping document available."
    );

    return;

  }


  // ====================================================
  // LOAD jsPDF
  // ====================================================

  function loadJsPDF() {

    return new Promise(
      function (
        resolve,
        reject
      ) {

        if (
          window.jspdf &&
          window.jspdf.jsPDF
        ) {

          resolve(
            window.jspdf.jsPDF
          );

          return;

        }


        const existingScript =
          document.querySelector(
            'script[data-cargo-jspdf="true"]'
          );


        if (existingScript) {

          existingScript.addEventListener(
            "load",
            function () {

              if (
                window.jspdf &&
                window.jspdf.jsPDF
              ) {

                resolve(
                  window.jspdf.jsPDF
                );

              } else {

                reject(
                  new Error(
                    "PDF library failed to load."
                  )
                );

              }

            }
          );


          existingScript.addEventListener(
            "error",
            function () {

              reject(
                new Error(
                  "Unable to load PDF library."
                )
              );

            }
          );

          return;

        }


        const script =
          document.createElement(
            "script"
          );


        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

        script.async =
          true;

        script.dataset.cargoJspdf =
          "true";


        script.onload =
          function () {

            if (
              window.jspdf &&
              window.jspdf.jsPDF
            ) {

              resolve(
                window.jspdf.jsPDF
              );

            } else {

              reject(
                new Error(
                  "PDF library failed to load."
                )
              );

            }

          };


        script.onerror =
          function () {

            reject(
              new Error(
                "Unable to load PDF library."
              )
            );

          };


        document.head.appendChild(
          script
        );

      }
    );

  }


  // ====================================================
  // LOAD LETTERHEAD
  // ====================================================

  function loadLetterhead() {

    return new Promise(
      function (
        resolve,
        reject
      ) {

        const image =
          new Image();


        image.onload =
          function () {

            resolve(
              image
            );

          };


        image.onerror =
          function () {

            reject(
              new Error(
                "Unable to load cargo-letterhead.png."
              )
            );

          };


        image.src =
          "images/cargo-letterhead.png";

      }
    );

  }


  // ====================================================
  // LETTERHEAD SIZE
  // ====================================================

  const DOCUMENT_WIDTH =
    1414;

  const DOCUMENT_HEIGHT =
    2000;


  // ====================================================
  // A4 SIZE
  // ====================================================

  const A4_WIDTH =
    210;

  const A4_HEIGHT =
    297;


  // ====================================================
  // FIELD POSITIONS
  // ====================================================

  const POSITIONS = {

    invoice: {
      left: 1100,
      top: 296
    },

    dateCreated: {
      left: 250,
      top: 368
    },

    arrivalDate: {
      left: 250,
      top: 1537
    },

    sender: {
      left: 250,
      top: 675
    },

    senderEmail: {
      left: 250,
      top: 760
    },

    tracking: {
      left: 250,
      top: 975
    },

    recipient: {
      left: 250,
      top: 1245
    },

    recipientEmail: {
      left: 250,
      top: 1380
    },

    recipientAddress: {
      left: 250,
      top: 1312
    },

    packageContent: {
      left: 250,
      top: 1618
    },

    packageWeight: {
      left: 250,
      top: 1735
    }

  };


  // ====================================================
  // VALUES
  // ====================================================

  const invoice =
    shipment.invoiceNumber ||
    "N/A";


  const tracking =
    shipment.trackingNumber ||
    "N/A";


  const dateCreated =
    extractDate(
      shipment.shipmentDate
    ) || "N/A";


  const arrivalDate =
    extractDate(
      shipment.estimatedDelivery
    ) || "N/A";


  const senderName =
    shipment.sender ||
    "N/A";


  const senderEmailValue =
    shipment.senderEmail ||
    "";


  const recipientName =
    shipment.recipient ||
    "N/A";


  const recipientEmailValue =
    shipment.recipientEmail ||
    "";


  const recipientAddressValue =
    shipment.recipientAddress ||
    "N/A";


  const packageContentValue =
    shipment.packageContent ||
    "N/A";


  const packageWeightValue =
    shipment.packageWeight ||
    "N/A";


  const isWatermarked =
    shipment.watermarkEnabled !== false;


  // ====================================================
  // CONVERT POSITION TO A4
  // ====================================================

  function convertX(
    value
  ) {

    return (
      value /
      DOCUMENT_WIDTH
    ) *
    A4_WIDTH;

  }


  function convertY(
    value
  ) {

    return (
      value /
      DOCUMENT_HEIGHT
    ) *
    A4_HEIGHT;

  }


  // ====================================================
  // TEXT SIZE
  // ====================================================

  const FONT_SIZE_MM =
    5;

  const FONT_SIZE_PT =
    FONT_SIZE_MM *
    72 /
    25.4;


  // ====================================================
  // LOAD PDF + LETTERHEAD
  // ====================================================

  try {

    showMessage(
      "Preparing shipping document...",
      "info"
    );


    const jsPDF =
      await loadJsPDF();


    const letterhead =
      await loadLetterhead();


    // ==================================================
    // CREATE A4 PDF
    // ==================================================

    const pdf =
      new jsPDF({

        orientation:
          "portrait",

        unit:
          "mm",

        format:
          "a4",

        compress:
          true

      });


    // ==================================================
    // ADD LETTERHEAD
    // ==================================================

    pdf.addImage(

      letterhead,

      "PNG",

      0,

      0,

      A4_WIDTH,

      A4_HEIGHT,

      undefined,

      "FAST"

    );


    // ==================================================
    // PDF TEXT HELPER
    // ==================================================

    function addText(
      value,
      position,
      options = {}
    ) {

      if (
        value === null ||
        value === undefined
      ) {

        return;

      }


      const text =
        String(value);


      if (
        !text.trim()
      ) {

        return;

      }


      const x =
        convertX(
          position.left
        );


      const y =
        convertY(
          position.top
        );


      pdf.setFont(
        "helvetica",
        options.bold === false
          ? "normal"
          : "bold"
      );


      pdf.setFontSize(
        options.fontSize ||
        FONT_SIZE_PT
      );


      pdf.setTextColor(
        17,
        24,
        39
      );


      pdf.text(
        text,
        x,
        y + FONT_SIZE_MM,
        {
          baseline:
            "top"
        }
      );

    }


    // ==================================================
    // INVOICE
    // ==================================================

    addText(
      invoice,
      POSITIONS.invoice
    );


    // ==================================================
    // CREATED DATE
    // ==================================================

    addText(
      dateCreated,
      POSITIONS.dateCreated
    );


    // ==================================================
    // ARRIVAL DATE
    // ==================================================

    addText(
      arrivalDate,
      POSITIONS.arrivalDate
    );


    // ==================================================
    // SENDER
    // ==================================================

    addText(
      senderName,
      POSITIONS.sender
    );


    // ==================================================
    // SENDER EMAIL
    // ==================================================

    addText(
      senderEmailValue,
      POSITIONS.senderEmail
    );


    // ==================================================
    // TRACKING
    // ==================================================

    if (
      tracking &&
      tracking !== "N/A"
    ) {

      const trackingX =
        convertX(
          POSITIONS.tracking.left
        );


      const trackingY =
        convertY(
          POSITIONS.tracking.top
        );


      pdf.setFont(
        "helvetica",
        "bold"
      );


      pdf.setFontSize(
        FONT_SIZE_PT
      );


      pdf.setTextColor(
        17,
        24,
        39
      );


      const TRACKING_SPACING =
        0.3;


      let currentX =
        trackingX;


      String(tracking)
        .split("")
        .forEach(
          function (
            character
          ) {

            pdf.text(
              character,
              currentX,
              trackingY +
                FONT_SIZE_MM,
              {
                baseline:
                  "top"
              }
            );


            currentX +=
              pdf.getTextWidth(
                character
              ) +
              TRACKING_SPACING;

          }
        );

    }


    // ==================================================
    // RECIPIENT
    // ==================================================

    addText(
      recipientName,
      POSITIONS.recipient
    );


    // ==================================================
    // RECIPIENT EMAIL
    // ==================================================

    addText(
      recipientEmailValue,
      POSITIONS.recipientEmail
    );


    // ==================================================
    // RECIPIENT ADDRESS
    // ==================================================

    addText(
      recipientAddressValue,
      POSITIONS.recipientAddress
    );


    // ==================================================
    // PACKAGE CONTENT
    // ==================================================

    addText(
      packageContentValue,
      POSITIONS.packageContent
    );


    // ==================================================
    // PACKAGE WEIGHT
    // ==================================================

    addText(
      packageWeightValue,
      POSITIONS.packageWeight
    );


    // ==================================================
    // WATERMARK
    // ==================================================

    if (isWatermarked) {

      pdf.saveGraphicsState();


      try {

        if (
          typeof pdf.GState ===
          "function"
        ) {

          pdf.setGState(
            new pdf.GState({
              opacity: 0.09
            })
          );

        }

      } catch (error) {

      }


      pdf.setFont(
        "helvetica",
        "bold"
      );


      pdf.setFontSize(

        6.4 *
        72 /
        25.4

      );


      pdf.setTextColor(
        220,
        38,
        38
      );


      const columns =
        2;

      const rows =
        4;


      const columnWidth =
        A4_WIDTH /
        columns;

      const rowHeight =
        A4_HEIGHT /
        rows;


      for (
        let row = 0;
        row < rows;
        row++
      ) {

        for (
          let column = 0;
          column < columns;
          column++
        ) {

          const x =
            (
              column *
              columnWidth
            ) +
            (
              columnWidth /
              2
            );


          const y =
            (
              row *
              rowHeight
            ) +
            (
              rowHeight /
              2
            );


          pdf.text(

            "TEST SHIPPING",

            x,

            y,

            {

              angle:
                -28,

              align:
                "center"

            }

          );

        }

      }


      pdf.restoreGraphicsState();

    }


    // ==================================================
    // FILE NAME
    // ==================================================

    const safeTracking =
      String(
        tracking
      )
        .replace(
          /[^a-zA-Z0-9_-]/g,
          "-"
        );


    const fileName =
      `ZendItCargo-${safeTracking}.pdf`;


    // ==================================================
    // DOWNLOAD
    // ==================================================

    pdf.save(
      fileName
    );


    setTimeout(
      function () {

        showMessage(
          "Shipping document downloaded successfully.",
          "success"
        );

      },
      300
    );


  } catch (error) {

    console.error(
      "CARGO PDF ERROR:",
      error
    );


    showCargoPopup(

      error.message ||
      "Unable to create shipping document."

    );

  }

}


// ======================================================
// INITIALIZE
// ======================================================

async function initializeCargo() {

  setFormMode(false);

  trackingEvents = [];

  renderTrackingEvents();

  updateErrorVisibility();

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


// ======================================================
// MOBILE NAVBAR
// ======================================================

const navbarToggler =
  document.getElementById(
    "navbarToggler"
  );


if (
  navbarToggler &&
  authNav
) {

  navbarToggler.onclick =
    function () {

      authNav.classList.toggle(
        "show"
      );


      const isOpen =
        authNav.classList.contains(
          "show"
        );


      navbarToggler.setAttribute(
        "aria-expanded",
        isOpen
      );

    };


  const navLinks =
    authNav.querySelectorAll(
      ".nav-link"
    );


  navLinks.forEach(
    function (link) {

      link.onclick =
        function () {

          authNav.classList.remove(
            "show"
          );


          navbarToggler.setAttribute(
            "aria-expanded",
            "false"
          );

        };

    }
  );

}