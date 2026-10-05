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

const shippingTypeModal =
  document.getElementById("shippingTypeModal");

const continueShipping =
  document.getElementById("continueShipping");

const cancelShippingType =
  document.getElementById("cancelShippingType");

const shipmentList =
  document.getElementById("shipmentList");

const refreshShipmentsButton =
  document.getElementById("refreshShipments");

const newShipmentButton =
  document.getElementById("newShipmentButton");

const cancelEditButton =
  document.getElementById("cancelEditButton");

const controllerWorkspace =
  document.getElementById("controllerWorkspace");

const profileView =
  document.getElementById("profileView");

const createView =
  document.getElementById("createView");


// ======================================================
// FORM ELEMENTS
// ======================================================

const invoiceNumberInput =
  document.getElementById("invoiceNumber");

const shippingDateInput =
  document.getElementById("shippingDate");

const shippingTimeInput =
  document.getElementById("shippingTime");

const estimatedDeliveryInput =
  document.getElementById("estimatedDelivery");

const senderInput =
  document.getElementById("sender");

const senderEmailInput =
  document.getElementById("senderEmail");

const originInput =
  document.getElementById("origin");

const recipientInput =
  document.getElementById("recipient");

const recipientAddressInput =
  document.getElementById("recipientAddress");

const recipientEmailInput =
  document.getElementById("recipientEmail");

const packageContentInput =
  document.getElementById("packageContent");

const packageWeightInput =
  document.getElementById("packageWeight");


// ======================================================
// HISTORY ELEMENTS
// ======================================================

const addTrackingEventButton =
  document.getElementById("addTrackingEventButton");

const saveTrackingHistoryButton =
  document.getElementById("saveTrackingHistoryButton");

const trackingEventsContainer =
  document.getElementById("trackingEventsContainer");


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

let trackingEvents = [];


// ======================================================
// API
// ======================================================

const API_URL =
  "https://api.justdoks.com/api";


// ======================================================
// TOKEN
// ======================================================

function getToken() {

  return localStorage.getItem("token");

}


// ======================================================
// HTML ESCAPE
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
// ATTRIBUTE ESCAPE
// ======================================================

function escapeAttribute(value) {

  return escapeHTML(value);

}


// ======================================================
// MONEY
// ======================================================

function formatMoney(amount) {

  const number =
    Number(amount) || 0;

  return `$${number.toFixed(2)}`;

}


// ======================================================
// BUILD DATE + TIME
// ======================================================

function buildDateTime(date, time) {

  if (!date) {
    return "";
  }

  if (!time) {
    return `${date}T00:00`;
  }

  return `${date}T${time}`;

}


// ======================================================
// HISTORY TIMESTAMP
// ======================================================

function buildHistoryTimestamp(date, time) {

  if (!date) {
    return "";
  }

  if (!time) {
    return `${date}T00:00:00`;
  }

  return `${date}T${time}:00`;

}


// ======================================================
// LOCAL DATE
// ======================================================

function getLocalDateFromTimestamp(timestamp) {

  if (!timestamp) {
    return "";
  }

  const date =
    new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const day =
    String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


// ======================================================
// LOCAL TIME
// ======================================================

function getLocalTimeFromTimestamp(timestamp) {

  if (!timestamp) {
    return "";
  }

  const date =
    new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours =
    String(date.getHours()).padStart(2, "0");

  const minutes =
    String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;

}


// ======================================================
// CURRENT USER
// ======================================================

async function getCurrentUser() {

  const token =
    getToken();

  if (!token) {
    return null;
  }

  try {

    const response =
      await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    return data.user || data;

  } catch (error) {

    console.error(
      "Unable to load current user:",
      error
    );

    return null;

  }

}


// ======================================================
// UPDATE NAVBAR
// ======================================================

function updateCargoNavbar() {

  const token =
    getToken();

  const authNav =
    document.getElementById("authNav");

  if (!authNav) {
    return;
  }

  if (!token || !currentUser) {

    authNav.innerHTML = `
      <a href="/login.html">Login</a>
    `;

    return;
  }

  const name =
    currentUser.name ||
    currentUser.fullName ||
    currentUser.email ||
    "Account";

  authNav.innerHTML = `
    <span class="user-name">
      ${escapeHTML(name)}
    </span>

    <span class="wallet-balance">
      ${formatMoney(currentWalletBalance)}
    </span>

    <button
      type="button"
      onclick="logoutCargo()"
    >
      Logout
    </button>
  `;

}


// ======================================================
// LOGOUT
// ======================================================

function logoutCargo() {

  localStorage.removeItem("token");

  window.location.href =
    "/login.html";

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
      await fetch(`${API_URL}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    currentWalletBalance =
      Number(
        data.balance ??
        data.wallet?.balance ??
        0
      );

    updateCargoNavbar();

  } catch (error) {

    console.error(
      "Unable to load wallet:",
      error
    );

  }

}


// ======================================================
// LOAD USER STORAGE
// ======================================================

async function loadUserStorage() {

  currentUser =
    await getCurrentUser();

  if (!currentUser) {

    currentUserId = "";

    updateCargoNavbar();

    setControllerMode("create");

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

function setControllerMode(mode) {

  if (mode === "profile") {

    if (profileView) {
      profileView.style.display = "";
    }

    if (createView) {
      createView.style.display = "none";
    }

    return;

  }

  if (profileView) {
    profileView.style.display = "none";
  }

  if (createView) {
    createView.style.display = "";
  }

}


// ======================================================
// SELECT SHIPMENT
// ======================================================

function selectShipment(index) {

  editShipment(index);

}


// ======================================================
// SHIPPING TYPE MODAL
// ======================================================

function openShippingTypeModal() {

  if (!shippingTypeModal) {
    createShipping();
    return;
  }

  const selected =
    document.querySelector(
      'input[name="shippingType"]:checked'
    );

  if (selected) {

    selectedShippingType =
      selected.value;

  }

  shippingTypeModal.style.display =
    "flex";

}


// ======================================================
// CLOSE SHIPPING TYPE MODAL
// ======================================================

function closeShippingTypeModal() {

  if (!shippingTypeModal) {
    return;
  }

  shippingTypeModal.style.display =
    "none";

}


// ======================================================
// CONTINUE SHIPPING
// ======================================================

if (continueShipping) {

  continueShipping.addEventListener(
    "click",
    function () {

      const selected =
        document.querySelector(
          'input[name="shippingType"]:checked'
        );

      if (selected) {

        selectedShippingType =
          selected.value;

      }

      closeShippingTypeModal();

      createShipping();

    }
  );

}


// ======================================================
// CANCEL SHIPPING TYPE
// ======================================================

if (cancelShippingType) {

  cancelShippingType.addEventListener(
    "click",
    function () {

      closeShippingTypeModal();

    }
  );

}


// ======================================================
// FORM SUBMIT
// ======================================================

if (shippingForm) {

  shippingForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      if (!shippingForm.checkValidity()) {

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
// ADD TRACKING EVENT
// ======================================================

if (addTrackingEventButton) {

  addTrackingEventButton.addEventListener(
    "click",
    function () {

      trackingEvents.push({

        status: "Processing",

        location: "",

        description: "",

        timestamp:
          new Date().toISOString()

      });

      renderTrackingEvents();

    }
  );

}


// ======================================================
// RENDER TRACKING EVENTS
// ======================================================

function renderTrackingEvents() {

  if (!trackingEventsContainer) {
    return;
  }

  if (!trackingEvents.length) {

    trackingEventsContainer.innerHTML = `
      <div class="tracking-events-empty">
        No history entries added yet.
      </div>
    `;

    return;

  }

  trackingEventsContainer.innerHTML =
    trackingEvents
      .map(function (event, index) {

        const date =
          getLocalDateFromTimestamp(
            event.timestamp
          );

        const time =
          getLocalTimeFromTimestamp(
            event.timestamp
          );

        return `
          <div
            class="tracking-event-editor"
            data-index="${index}"
          >

            <div class="tracking-event-fields">

              <div class="form-group">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  value="${escapeAttribute(date)}"
                  data-history-field="date"
                  data-index="${index}"
                >

              </div>


              <div class="form-group">

                <label>
                  Time
                </label>

                <input
                  type="time"
                  value="${escapeAttribute(time)}"
                  data-history-field="time"
                  data-index="${index}"
                >

              </div>


              <div class="form-group">

                <label>
                  Status
                </label>

                <select
                  data-history-field="status"
                  data-index="${index}"
                >

                  ${[
                    "Processing",
                    "Package Received",
                    "In Transit",
                    "Arrived",
                    "Delivered",
                    "Error"
                  ]
                    .map(function (status) {

                      return `
                        <option
                          value="${escapeAttribute(status)}"
                          ${
                            event.status === status
                              ? "selected"
                              : ""
                          }
                        >
                          ${escapeHTML(status)}
                        </option>
                      `;

                    })
                    .join("")}

                </select>

              </div>


              <div class="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  value="${escapeAttribute(event.location || "")}"
                  placeholder="Location"
                  data-history-field="location"
                  data-index="${index}"
                >

              </div>


              <div class="form-group">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  value="${escapeAttribute(event.description || "")}"
                  placeholder="Description"
                  data-history-field="description"
                  data-index="${index}"
                >

              </div>


              <button
                type="button"
                class="btn btn-outline-danger"
                data-remove-history="${index}"
              >
                Remove
              </button>

            </div>

          </div>
        `;

      })
      .join("");


  trackingEventsContainer
    .querySelectorAll(
      "[data-history-field]"
    )
    .forEach(function (input) {

      input.addEventListener(
        "input",
        updateTrackingEvent
      );

      input.addEventListener(
        "change",
        updateTrackingEvent
      );

    });


  trackingEventsContainer
    .querySelectorAll(
      "[data-remove-history]"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const index =
            Number(
              button.dataset.removeHistory
            );

          trackingEvents.splice(
            index,
            1
          );

          renderTrackingEvents();

        }
      );

    });

}


// ======================================================
// UPDATE TRACKING EVENT
// ======================================================

function updateTrackingEvent(event) {

  const element =
    event.target;

  const index =
    Number(
      element.dataset.index
    );

  const field =
    element.dataset.historyField;

  if (
    Number.isNaN(index) ||
    !trackingEvents[index]
  ) {
    return;
  }

  if (field === "date") {

    const currentTime =
      getLocalTimeFromTimestamp(
        trackingEvents[index].timestamp
      ) || "00:00";

    trackingEvents[index].timestamp =
      buildHistoryTimestamp(
        element.value,
        currentTime
      );

    return;

  }

  if (field === "time") {

    const currentDate =
      getLocalDateFromTimestamp(
        trackingEvents[index].timestamp
      ) ||
      getLocalDateFromTimestamp(
        new Date().toISOString()
      );

    trackingEvents[index].timestamp =
      buildHistoryTimestamp(
        currentDate,
        element.value
      );

    return;

  }

  trackingEvents[index][field] =
    element.value;

}


// ======================================================
// GET TRACKING EVENTS
// ======================================================

function getTrackingEvents() {

  return trackingEvents
    .map(function (event) {

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

    })
    .filter(function (event) {

      /*
       * Do not save incomplete
       * history entries.
       */

      return (
        event.status &&
        event.location &&
        event.timestamp
      );

    });

}


// ======================================================
// SAVE TRACKING HISTORY
// ======================================================

async function saveTrackingHistory() {

  const token =
    getToken();

  if (!token) {

    alert(
      "Please login first."
    );

    return;

  }

  if (!generatedTrackingNumber) {

    alert(
      "Please select a shipment first."
    );

    return;

  }

  const history =
    getTrackingEvents();

  try {

    const response =
      await fetch(
        `${API_URL}/shipments/${encodeURIComponent(
          generatedTrackingNumber
        )}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            trackingEvents:
              history
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to save shipment history."
      );

    }


    currentShipment =
      data.shipment ||
      data;


    generatedTrackingNumber =
      currentShipment.trackingNumber ||
      generatedTrackingNumber;


    trackingEvents =
      currentShipment.trackingEvents ||
      history;


    addOrReplaceShipment(
      currentShipment
    );


    renderTrackingEvents();


    await loadShipments();


    if (shippingMessage) {

      shippingMessage.textContent =
        "Shipment history saved successfully.";

      shippingMessage.style.display =
        "block";

    }


  } catch (error) {

    console.error(
      "Save tracking history error:",
      error
    );

    alert(
      error.message ||
      "Unable to save shipment history."
    );

  }

}


// ======================================================
// CREATE SHIPPING
// ======================================================

async function createShipping() {

  const token =
    getToken();

  if (!token) {

    alert(
      "Please login first."
    );

    return;

  }


  if (!shippingForm.checkValidity()) {

    shippingForm.reportValidity();

    return;

  }


  if (createShippingButton) {

    createShippingButton.disabled =
      true;

    createShippingButton.textContent =
      "Creating...";

  }


  try {

    const trackingHistory =
      getTrackingEvents();


    const payload = {

      invoiceNumber:
        invoiceNumberInput?.value.trim() || "",

      shippingDate:
        shippingDateInput?.value || "",

      shippingTime:
        shippingTimeInput?.value || "",

      estimatedDelivery:
        estimatedDeliveryInput?.value || "",

      sender:
        senderInput?.value.trim() || "",

      senderEmail:
        senderEmailInput?.value.trim() || "",

      origin:
        originInput?.value.trim() || "",

      recipient:
        recipientInput?.value.trim() || "",

      recipientAddress:
        recipientAddressInput?.value.trim() || "",

      recipientEmail:
        recipientEmailInput?.value.trim() || "",

      packageContent:
        packageContentInput?.value.trim() || "",

      packageWeight:
        packageWeightInput?.value.trim() || "",

      currentStatus:
        shippingStatus?.value ||
        "Processing",

      errorMessage:
        errorMessage?.value.trim() || "",

      shippingType:
        selectedShippingType,

      trackingEvents:
        trackingHistory

    };


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
            JSON.stringify(payload)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to create shipment."
      );

    }


    currentShipment =
      data.shipment ||
      data;


    generatedTrackingNumber =
      currentShipment.trackingNumber ||
      "";


    trackingEvents =
      currentShipment.trackingEvents ||
      trackingHistory;


    if (
      currentShipment.walletBalance !==
      undefined
    ) {

      currentWalletBalance =
        Number(
          currentShipment.walletBalance
        );

    }


    addOrReplaceShipment(
      currentShipment
    );


    setControllerMode(
      "profile"
    );


    setFormMode(false);


    if (shippingMessage) {

      shippingMessage.textContent =
        selectedShippingType === "clean"
          ? "Clean shipment created successfully."
          : "Free test shipment created successfully.";

      shippingMessage.style.display =
        "block";

    }


    saveFormData();

    await loadWalletBalance();

    await loadShipments();


  } catch (error) {

    console.error(
      "Create shipping error:",
      error
    );

    alert(
      error.message ||
      "Unable to create shipment."
    );

  } finally {

    if (createShippingButton) {

      createShippingButton.disabled =
        false;

      createShippingButton.textContent =
        editingShipment
          ? "Update Shipment"
          : "Create Shipping";

    }

  }

}


// ======================================================
// LOAD SHIPMENTS
// ======================================================

async function loadShipments() {

  const token =
    getToken();

  if (!token) {

    userShipments = [];

    renderShipments();

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


    if (!response.ok) {

      throw new Error(
        "Unable to load shipments."
      );

    }


    const data =
      await response.json();


    userShipments =
      Array.isArray(data)
        ? data
        : (
          data.shipments ||
          []
        );


    renderShipments();


  } catch (error) {

    console.error(
      "Load shipments error:",
      error
    );

    userShipments = [];

    renderShipments();

  }

}


// ======================================================
// RENDER SHIPMENTS
// ======================================================

function renderShipments() {

  if (!shipmentList) {
    return;
  }


  if (!userShipments.length) {

    shipmentList.innerHTML = `
      <div class="empty-state">
        No shipments created yet.
      </div>
    `;

    return;

  }


  shipmentList.innerHTML =
    userShipments
      .map(function (shipment, index) {

        return createShipmentCard(
          shipment,
          index
        );

      })
      .join("");


  shipmentList
    .querySelectorAll(
      "[data-shipment-edit]"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const index =
            Number(
              button.dataset.shipmentEdit
            );

          editShipment(index);

        }
      );

    });


  shipmentList
    .querySelectorAll(
      "[data-shipment-delete]"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const index =
            Number(
              button.dataset.shipmentDelete
            );

          deleteShipment(index);

        }
      );

    });


  shipmentList
    .querySelectorAll(
      "[data-shipment-watermark]"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const index =
            Number(
              button.dataset.shipmentWatermark
            );

          removeShipmentWatermark(index);

        }
      );

    });

}


// ======================================================
// CREATE SHIPMENT CARD
// ======================================================

function createShipmentCard(
  shipment,
  index
) {

  const trackingNumber =
    shipment.trackingNumber ||
    "";

  const status =
    shipment.currentStatus ||
    shipment.status ||
    "Processing";

  const shippingType =
    shipment.shippingType ||
    "test";

  const isClean =
    shippingType === "clean";


  const trackingUrl =
    `${mainShippingWebsite}/?tracking=${encodeURIComponent(
      trackingNumber
    )}`;


  const documentText =
    isClean
      ? "Clean Document"
      : "Watermarked Document";


  const errorText =
    shipment.errorMessage ||
    "";


  return `
    <div class="shipment-card">

      <div class="shipment-card-header">

        <div>

          <h4>
            ${escapeHTML(
              shipment.recipient ||
              "Shipment"
            )}
          </h4>

          <p>
            ${escapeHTML(
              trackingNumber
            )}
          </p>

        </div>

        <span class="shipment-status">
          ${escapeHTML(status)}
        </span>

      </div>


      <div class="shipment-card-body">

        <div>
          <strong>
            Sender
          </strong>

          <span>
            ${escapeHTML(
              shipment.sender ||
              ""
            )}
          </span>
        </div>


        <div>
          <strong>
            Origin
          </strong>

          <span>
            ${escapeHTML(
              shipment.origin ||
              ""
            )}
          </span>
        </div>


        <div>
          <strong>
            Recipient
          </strong>

          <span>
            ${escapeHTML(
              shipment.recipient ||
              ""
            )}
          </span>
        </div>


        <div>
          <strong>
            Document
          </strong>

          <span>
            ${documentText}
          </span>
        </div>

      </div>


      ${
        errorText
          ? `
            <div class="shipment-error-message">
              ${escapeHTML(errorText)}
            </div>
          `
          : ""
      }


      <div class="shipment-tracking-link">

        <a
          href="${escapeAttribute(trackingUrl)}"
          target="_blank"
          rel="noopener"
        >
          Open Tracking Page
        </a>

      </div>


      <div class="shipment-card-actions">

        <button
          type="button"
          class="btn btn-primary"
          data-shipment-edit="${index}"
        >
          Edit
        </button>


        ${
          !isClean
            ? `
              <button
                type="button"
                class="btn btn-outline-primary"
                data-shipment-watermark="${index}"
              >
                Remove Watermark
              </button>
            `
            : ""
        }


        <button
          type="button"
          class="btn btn-outline-danger"
          data-shipment-delete="${index}"
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

  if (!shipment) {
    return;
  }


  const trackingNumber =
    shipment.trackingNumber;


  const existingIndex =
    userShipments.findIndex(
      function (item) {

        return (
          item.trackingNumber ===
          trackingNumber
        );

      }
    );


  if (existingIndex >= 0) {

    userShipments[
      existingIndex
    ] = shipment;

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

function editShipment(index) {

  const shipment =
    userShipments[index];


  if (!shipment) {
    return;
  }


  currentShipment =
    shipment;


  generatedTrackingNumber =
    shipment.trackingNumber ||
    "";


  editingShipment =
    true;


  setFormMode(true);


  invoiceNumberInput.value =
    shipment.invoiceNumber ||
    "";


  shippingDateInput.value =
    shipment.shippingDate ||
    getLocalDateFromTimestamp(
      shipment.createdAt
    );


  shippingTimeInput.value =
    shipment.shippingTime ||
    getLocalTimeFromTimestamp(
      shipment.createdAt
    );


  estimatedDeliveryInput.value =
    shipment.estimatedDelivery ||
    "";


  senderInput.value =
    shipment.sender ||
    "";


  senderEmailInput.value =
    shipment.senderEmail ||
    "";


  originInput.value =
    shipment.origin ||
    "";


  recipientInput.value =
    shipment.recipient ||
    "";


  recipientAddressInput.value =
    shipment.recipientAddress ||
    "";


  recipientEmailInput.value =
    shipment.recipientEmail ||
    "";


  packageContentInput.value =
    shipment.packageContent ||
    "";


  packageWeightInput.value =
    shipment.packageWeight ||
    "";


  if (shippingStatus) {

    shippingStatus.value =
      shipment.currentStatus ||
      shipment.status ||
      "Processing";

  }


  if (errorMessage) {

    errorMessage.value =
      shipment.errorMessage ||
      "";

  }


  selectedShippingType =
    shipment.shippingType ||
    "test";


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


  setControllerMode(
    "create"
  );


  if (controllerWorkspace) {

    controllerWorkspace.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }


  if (shippingMessage) {

    shippingMessage.textContent =
      "Editing shipment.";

    shippingMessage.style.display =
      "block";

  }

}


// ======================================================
// UPDATE SHIPMENT
// ======================================================

async function updateShipment() {

  const token =
    getToken();


  if (!token) {

    alert(
      "Please login first."
    );

    return;

  }


  if (!currentShipment) {

    alert(
      "No shipment selected."
    );

    return;

  }


  if (!shippingForm.checkValidity()) {

    shippingForm.reportValidity();

    return;

  }


  const trackingNumber =
    currentShipment.trackingNumber ||
    generatedTrackingNumber;


  if (!trackingNumber) {

    alert(
      "Tracking number not found."
    );

    return;

  }


  if (createShippingButton) {

    createShippingButton.disabled =
      true;

    createShippingButton.textContent =
      "Updating...";

  }


  try {

    const history =
      getTrackingEvents();


    const updateData = {

      invoiceNumber:
        invoiceNumberInput?.value.trim() || "",

      shippingDate:
        shippingDateInput?.value || "",

      shippingTime:
        shippingTimeInput?.value || "",

      estimatedDelivery:
        estimatedDeliveryInput?.value || "",

      sender:
        senderInput?.value.trim() || "",

      senderEmail:
        senderEmailInput?.value.trim() || "",

      origin:
        originInput?.value.trim() || "",

      recipient:
        recipientInput?.value.trim() || "",

      recipientAddress:
        recipientAddressInput?.value.trim() || "",

      recipientEmail:
        recipientEmailInput?.value.trim() || "",

      packageContent:
        packageContentInput?.value.trim() || "",

      packageWeight:
        packageWeightInput?.value.trim() || "",

      currentStatus:
        shippingStatus?.value ||
        "Processing",

      errorMessage:
        errorMessage?.value.trim() || "",

      trackingEvents:
        history

    };


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
            JSON.stringify(updateData)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to update shipment."
      );

    }


    currentShipment =
      data.shipment ||
      data;


    generatedTrackingNumber =
      currentShipment.trackingNumber ||
      trackingNumber;


    trackingEvents =
      currentShipment.trackingEvents ||
      history;


    addOrReplaceShipment(
      currentShipment
    );


    // ==================================================
    // KEEP EDIT MODE ACTIVE
    // ==================================================

    editingShipment =
      true;

    setFormMode(true);


    await loadWalletBalance();

    await loadShipments();


    if (shippingMessage) {

      shippingMessage.textContent =
        "Shipment updated successfully.";

      shippingMessage.style.display =
        "block";

    }


  } catch (error) {

    console.error(
      "Update shipment error:",
      error
    );

    alert(
      error.message ||
      "Unable to update shipment."
    );

  } finally {

    if (createShippingButton) {

      createShippingButton.disabled =
        false;

      createShippingButton.textContent =
        editingShipment
          ? "Update Shipment"
          : "Create Shipping";

    }

  }

}


// ======================================================
// DELETE SHIPMENT
// ======================================================

async function deleteShipment(index) {

  const shipment =
    userShipments[index];


  if (!shipment) {
    return;
  }


  const trackingNumber =
    shipment.trackingNumber;


  const confirmed =
    confirm(
      `Delete shipment ${trackingNumber}?`
    );


  if (!confirmed) {
    return;
  }


  const token =
    getToken();


  if (!token) {

    alert(
      "Please login first."
    );

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

      editingShipment =
        false;

      setFormMode(false);

      clearShippingForm();

    }


    renderShipments();


  } catch (error) {

    console.error(
      "Delete shipment error:",
      error
    );

    alert(
      error.message ||
      "Unable to delete shipment."
    );

  }

}


// ======================================================
// REMOVE WATERMARK
// ======================================================

async function removeShipmentWatermark(
  index
) {

  const shipment =
    userShipments[index];


  if (!shipment) {
    return;
  }


  const trackingNumber =
    shipment.trackingNumber;


  if (!trackingNumber) {
    return;
  }


  if (
    shipment.shippingType ===
    "clean"
  ) {

    return;

  }


  const token =
    getToken();


  if (!token) {

    alert(
      "Please login first."
    );

    return;

  }


  const confirmed =
    confirm(
      `Remove the watermark for $${CLEAN_SHIPPING_PRICE}?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `${API_URL}/shipments/${encodeURIComponent(
          trackingNumber
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
      data.shipment ||
      data;


    addOrReplaceShipment(
      updatedShipment
    );


    if (
      currentShipment &&
      currentShipment.trackingNumber ===
        trackingNumber
    ) {

      currentShipment =
        updatedShipment;

    }


    if (
      data.walletBalance !==
      undefined
    ) {

      currentWalletBalance =
        Number(
          data.walletBalance
        );

    }


    await loadWalletBalance();

    await loadShipments();


    alert(
      "Watermark removed successfully."
    );


  } catch (error) {

    console.error(
      "Remove watermark error:",
      error
    );

    alert(
      error.message ||
      "Unable to remove watermark."
    );

  }

}


// ======================================================
// SET FORM MODE
// ======================================================

function setFormMode(editing) {

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
        ? ""
        : "none";

  }


  if (newShipmentButton) {

    newShipmentButton.style.display =
      editing
        ? "none"
        : "";

  }


  setControllerMode(
    "create"
  );

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

      trackingEvents = [];

      renderTrackingEvents();

      clearShippingForm();

      setControllerMode(
        "profile"
      );

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

      trackingEvents = [];

      renderTrackingEvents();

      clearShippingForm();

      setControllerMode(
        "create"
      );

    }
  );

}


// ======================================================
// REFRESH SHIPMENTS
// ======================================================

if (refreshShipmentsButton) {

  refreshShipmentsButton.addEventListener(
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

function updateErrorVisibility() {

  if (
    !errorMessageGroup ||
    !shippingStatus
  ) {
    return;
  }


  const status =
    String(
      shippingStatus.value ||
      ""
    ).toLowerCase();


  const show =
    [
      "error",
      "failed",
      "exception"
    ].includes(status);


  errorMessageGroup.style.display =
    show
      ? ""
      : "none";

}


// ======================================================
// STATUS CHANGE
// ======================================================

if (shippingStatus) {

  shippingStatus.addEventListener(
    "change",
    updateErrorVisibility
  );

}


// ======================================================
// CLEAR SHIPPING FORM
// ======================================================

function clearShippingForm() {

  if (shippingForm) {

    shippingForm.reset();

  }


  if (shippingStatus) {

    shippingStatus.value =
      "Processing";

  }


  if (errorMessage) {

    errorMessage.value =
      "";

  }


  selectedShippingType =
    "test";


  trackingEvents = [];

  renderTrackingEvents();

  updateErrorVisibility();

}


// ======================================================
// LOCAL STORAGE DRAFT
// ======================================================

const cargoFormStorageKey =
  "cargoFormData";


// ======================================================
// SAVE FORM DATA
// ======================================================

function saveFormData() {

  const data = {

    invoiceNumber:
      invoiceNumberInput?.value || "",

    shippingDate:
      shippingDateInput?.value || "",

    shippingTime:
      shippingTimeInput?.value || "",

    estimatedDelivery:
      estimatedDeliveryInput?.value || "",

    sender:
      senderInput?.value || "",

    senderEmail:
      senderEmailInput?.value || "",

    origin:
      originInput?.value || "",

    recipient:
      recipientInput?.value || "",

    recipientAddress:
      recipientAddressInput?.value || "",

    recipientEmail:
      recipientEmailInput?.value || "",

    packageContent:
      packageContentInput?.value || "",

    packageWeight:
      packageWeightInput?.value || ""

  };


  localStorage.setItem(
    cargoFormStorageKey,
    JSON.stringify(data)
  );

}


// ======================================================
// RESTORE FORM DATA
// ======================================================

function restoreFormData() {

  const saved =
    localStorage.getItem(
      cargoFormStorageKey
    );


  if (!saved) {
    return;
  }


  try {

    const data =
      JSON.parse(saved);


    if (invoiceNumberInput) {

      invoiceNumberInput.value =
        data.invoiceNumber || "";

    }


    if (shippingDateInput) {

      shippingDateInput.value =
        data.shippingDate || "";

    }


    if (shippingTimeInput) {

      shippingTimeInput.value =
        data.shippingTime || "";

    }


    if (estimatedDeliveryInput) {

      estimatedDeliveryInput.value =
        data.estimatedDelivery || "";

    }


    if (senderInput) {

      senderInput.value =
        data.sender || "";

    }


    if (senderEmailInput) {

      senderEmailInput.value =
        data.senderEmail || "";

    }


    if (originInput) {

      originInput.value =
        data.origin || "";

    }


    if (recipientInput) {

      recipientInput.value =
        data.recipient || "";

    }


    if (recipientAddressInput) {

      recipientAddressInput.value =
        data.recipientAddress || "";

    }


    if (recipientEmailInput) {

      recipientEmailInput.value =
        data.recipientEmail || "";

    }


    if (packageContentInput) {

      packageContentInput.value =
        data.packageContent || "";

    }


    if (packageWeightInput) {

      packageWeightInput.value =
        data.packageWeight || "";

    }


  } catch (error) {

    console.error(
      "Unable to restore cargo form:",
      error
    );

  }

}


// ======================================================
// AUTO SAVE FORM
// ======================================================

if (shippingForm) {

  shippingForm.addEventListener(
    "input",
    function () {

      saveFormData();

    }
  );

}


// ======================================================
// DOWNLOAD CARGO PDF
// ======================================================

async function downloadCargoPdf(
  shipment
) {

  if (!shipment) {
    return;
  }


  if (
    typeof window.jspdf ===
    "undefined"
  ) {

    alert(
      "PDF library is not loaded."
    );

    return;

  }


  const {
    jsPDF
  } = window.jspdf;


  const pdf =
    new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });


  const image =
    new Image();


  image.src =
    "images/cargo-letterhead.png";


  await new Promise(
    function (resolve, reject) {

      image.onload =
        resolve;

      image.onerror =
        reject;

    }
  );


  const sourceWidth =
    1414;

  const sourceHeight =
    2000;


  const pageWidth =
    210;

  const pageHeight =
    297;


  pdf.addImage(
    image,
    "PNG",
    0,
    0,
    pageWidth,
    pageHeight
  );


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


  function x(position) {

    return (
      position.left /
      sourceWidth
    ) * pageWidth;

  }


  function y(position) {

    return (
      position.top /
      sourceHeight
    ) * pageHeight;

  }


  pdf.setTextColor(
    30,
    30,
    30
  );


  pdf.setFontSize(9);


  pdf.text(
    shipment.invoiceNumber ||
      "",
    x(POSITIONS.invoice),
    y(POSITIONS.invoice)
  );


  pdf.text(
    shipment.shippingDate ||
      "",
    x(POSITIONS.dateCreated),
    y(POSITIONS.dateCreated)
  );


  pdf.text(
    shipment.estimatedDelivery ||
      "",
    x(POSITIONS.arrivalDate),
    y(POSITIONS.arrivalDate)
  );


  pdf.text(
    shipment.sender ||
      "",
    x(POSITIONS.sender),
    y(POSITIONS.sender)
  );


  pdf.text(
    shipment.senderEmail ||
      "",
    x(POSITIONS.senderEmail),
    y(POSITIONS.senderEmail)
  );


  pdf.text(
    shipment.trackingNumber ||
      "",
    x(POSITIONS.tracking),
    y(POSITIONS.tracking)
  );


  pdf.text(
    shipment.recipient ||
      "",
    x(POSITIONS.recipient),
    y(POSITIONS.recipient)
  );


  pdf.text(
    shipment.recipientEmail ||
      "",
    x(POSITIONS.recipientEmail),
    y(POSITIONS.recipientEmail)
  );


  pdf.text(
    shipment.recipientAddress ||
      "",
    x(POSITIONS.recipientAddress),
    y(POSITIONS.recipientAddress)
  );


  pdf.text(
    shipment.packageContent ||
      "",
    x(POSITIONS.packageContent),
    y(POSITIONS.packageContent)
  );


  pdf.text(
    shipment.packageWeight ||
      "",
    x(POSITIONS.packageWeight),
    y(POSITIONS.packageWeight)
  );


  // ====================================================
  // WATERMARK
  // ====================================================

  if (
    shipment.shippingType !==
    "clean"
  ) {

    pdf.setTextColor(
      180,
      0,
      0
    );


    pdf.setFontSize(
      18
    );


    pdf.setGState(
      new pdf.GState({
        opacity: 0.09
      })
    );


    for (
      let row = 0;
      row < 4;
      row++
    ) {

      for (
        let column = 0;
        column < 2;
        column++
      ) {

        const watermarkX =
          30 +
          column * 105;

        const watermarkY =
          55 +
          row * 70;


        pdf.text(
          "TEST SHIPPING",
          watermarkX,
          watermarkY,
          {
            angle: -28
          }
        );

      }

    }


    pdf.setGState(
      new pdf.GState({
        opacity: 1
      })
    );

  }


  const safeTracking =
    String(
      shipment.trackingNumber ||
      "shipment"
    ).replace(
      /[^a-zA-Z0-9-_]/g,
      ""
    );


  pdf.save(
    `ZendItCargo-${safeTracking}.pdf`
  );

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


initializeCargo();


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(
  async function () {

    await loadWalletBalance();

    await loadShipments();

  },
  60000
);


// ======================================================
// MOBILE NAVBAR
// ======================================================

const navbarToggler =
  document.querySelector(
    ".navbar-toggler"
  );

const authNav =
  document.getElementById(
    "authNav"
  );


if (
  navbarToggler &&
  authNav
) {

  navbarToggler.addEventListener(
    "click",
    function () {

      const isOpen =
        authNav.classList.toggle(
          "show"
        );


      navbarToggler.setAttribute(
        "aria-expanded",
        isOpen
          ? "true"
          : "false"
      );

    }
  );


  authNav
    .querySelectorAll("a")
    .forEach(function (link) {

      link.addEventListener(
        "click",
        function () {

          authNav.classList.remove(
            "show"
          );


          navbarToggler.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    });

}
