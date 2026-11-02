// ======================================================
// CARGO1 CONTROLLER
// Separate from the original Cargo system
// Clean shipping price: $50
// ======================================================

const mainShippingWebsite =
  "https://zenditcargo.com";

const CLEAN_SHIPPING_PRICE = 50;


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

const estimatedDeliveryTimeInput =
  document.getElementById("estimatedDeliveryTime");

const senderInput =
  document.getElementById("sender");

const senderEmailInput =
  document.getElementById("senderEmail");

const originInput =
  document.getElementById("origin");

const recipientEmailInput =
  document.getElementById("recipientEmail");

const packageContentInput =
  document.getElementById("packageContent");

const packageWeightInput =
  document.getElementById("packageWeight");

const recipientFirstNameInput =
  document.getElementById("recipientFirstName");

const recipientLastNameInput =
  document.getElementById("recipientLastName");

const recipientPhoneInput =
  document.getElementById("recipientPhone");

const recipientAddressInput =
  document.getElementById("recipientAddress");

const recipientCityInput =
  document.getElementById("recipientCity");

const recipientPostalCodeInput =
  document.getElementById("recipientPostalCode");

const recipientCountryInput =
  document.getElementById("recipientCountry");

const recipientImageInput =
  document.getElementById("recipientImage");


const cartonImageInput =
  document.getElementById("cartonImageInput");

const cartonImagePreview =
  document.getElementById("cartonImagePreview");

const cartonImagePreviewContainer =
  document.getElementById("cartonImagePreviewContainer");

let cartonImageData = "";

const recipientImagePreview =
  document.getElementById("recipientImagePreview");

const recipientImagePreviewContainer =
  document.getElementById("recipientImagePreviewContainer");

const recipientCropModal =
  document.getElementById("recipientCropModal");

const recipientCropImage =
  document.getElementById("recipientCropImage");

const recipientCropZoom =
  document.getElementById("recipientCropZoom");

const saveRecipientCropButton =
  document.getElementById("saveRecipientCrop");


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

let recipientImageData = "";

let recipientCropper = null;

let recipientImageObjectUrl = "";

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
// API CONFIGURATION
// ======================================================

// Cargo1-specific shipment routes use /cargo1.
// Authentication and wallet endpoints remain shared.
const API_URL =
  "https://api.justdoks.com/api";


// ======================================================
// TOKEN
// ======================================================

function getToken() {
  return localStorage.getItem("token");
}



if (cartonImageInput) {
  cartonImageInput.addEventListener("change", function () {
    const file = cartonImageInput.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showMessage("Please select an image file.", "danger");
      cartonImageInput.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {
      cartonImageData = reader.result;

      if (cartonImagePreview) {
        cartonImagePreview.src = cartonImageData;
      }

      if (cartonImagePreviewContainer) {
        cartonImagePreviewContainer.style.display = "";
      }
    };

    reader.readAsDataURL(file);
  });
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
// PDF DATE
// ======================================================

function formatPdfDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day =
    String(date.getDate()).padStart(2, "0");

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const year =
    date.getFullYear();

  return `${day}/${month}/${year}`;
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

  // LOGGED OUT
  if (!token || !currentUser) {
    authNav.innerHTML = `
      <div class="nav-item">
        <a
          href="login.html"
          class="nav-link"
        >
          Login
        </a>
      </div>
    `;

    return;
  }

  // USER NAME
  const name =
    currentUser.name ||
    currentUser.fullName ||
    currentUser.email ||
    "User";

  // NAVBAR
  authNav.innerHTML = `
    <div class="nav-item">
      <a
        href="#"
        class="nav-link username-link"
        onclick="return false;"
      >
        ${escapeHTML(name)}
      </a>
    </div>

    <div class="nav-item">
      <a
        href="wallet.html"
        class="nav-link wallet-balance"
      >
        ${formatMoney(currentWalletBalance)}
      </a>
    </div>

    <div class="nav-item">
      <a
        href="#"
        class="nav-link"
        onclick="logoutCargo(); return false;"
      >
        Logout
      </a>
    </div>
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
    selectedShippingType = selected.value;
  }

  const modal =
    bootstrap.Modal.getOrCreateInstance(
      shippingTypeModal
    );

  modal.show();
}


// ======================================================
// CLOSE SHIPPING TYPE MODAL
// ======================================================

function closeShippingTypeModal() {
  if (!shippingTypeModal) {
    return;
  }

  const modal =
    bootstrap.Modal.getOrCreateInstance(
      shippingTypeModal
    );

  modal.hide();
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

      continueShipping.blur();

      const modal =
        bootstrap.Modal.getOrCreateInstance(
          shippingTypeModal
        );

      shippingTypeModal.addEventListener(
        "hidden.bs.modal",
        function handleModalHidden() {
          shippingTypeModal.removeEventListener(
            "hidden.bs.modal",
            handleModalHidden
          );

          createShipping();
        }
      );

      modal.hide();
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
        timestamp: new Date().toISOString()
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
                <label>Date</label>
                <input
                  type="date"
                  value="${escapeAttribute(date)}"
                  data-history-field="date"
                  data-index="${index}"
                >
              </div>

              <div class="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value="${escapeAttribute(time)}"
                  data-history-field="time"
                  data-index="${index}"
                >
              </div>

              <div class="form-group">
                <label>Status</label>
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
                          ${event.status === status
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
                <label>Location</label>
                <input
                  type="text"
                  value="${escapeAttribute(event.location || "")}"
                  placeholder="Location"
                  data-history-field="location"
                  data-index="${index}"
                >
              </div>

              <div class="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value="${escapeAttribute(event.description || "")}"
                  placeholder="Description"
                  data-history-field="description"
                  data-index="${index}"
                >
              </div>
            </div>
          </div>
        `;
      })
      .join("");
}

// ======================================================
// TRACKING HISTORY FIELD CHANGES
// ======================================================

if (trackingEventsContainer) {
  trackingEventsContainer.addEventListener(
    "input",
    function (event) {
      const field =
        event.target.dataset.historyField;

      const index =
        Number(event.target.dataset.index);

      if (!field || Number.isNaN(index)) {
        return;
      }

      if (!trackingEvents[index]) {
        return;
      }

      if (field === "date" || field === "time") {
        const editor =
          event.target.closest(".tracking-event-editor");

        const dateInput =
          editor?.querySelector(
            '[data-history-field="date"]'
          );

        const timeInput =
          editor?.querySelector(
            '[data-history-field="time"]'
          );

        const timestamp =
          buildHistoryTimestamp(
            dateInput?.value,
            timeInput?.value
          );

        if (timestamp) {
          trackingEvents[index].timestamp =
            new Date(timestamp).toISOString();
        }

        return;
      }

      trackingEvents[index][field] =
        event.target.value;
    }
  );

  trackingEventsContainer.addEventListener(
    "change",
    function (event) {
      const field =
        event.target.dataset.historyField;

      const index =
        Number(event.target.dataset.index);

      if (!field || Number.isNaN(index)) {
        return;
      }

      if (!trackingEvents[index]) {
        return;
      }

      if (field === "date" || field === "time") {
        const editor =
          event.target.closest(".tracking-event-editor");

        const dateInput =
          editor?.querySelector(
            '[data-history-field="date"]'
          );

        const timeInput =
          editor?.querySelector(
            '[data-history-field="time"]'
          );

        const timestamp =
          buildHistoryTimestamp(
            dateInput?.value,
            timeInput?.value
          );

        if (timestamp) {
          trackingEvents[index].timestamp =
            new Date(timestamp).toISOString();
        }

        return;
      }

      trackingEvents[index][field] =
        event.target.value;
    }
  );
}


// ======================================================
// SAVE TRACKING HISTORY
// ======================================================

if (saveTrackingHistoryButton) {
  saveTrackingHistoryButton.addEventListener(
    "click",
    async function () {
      if (!editingShipment || !currentShipment) {
        showMessage(
          "Create or open a shipment before saving its tracking history.",
          "warning"
        );

        return;
      }

      const validEvents =
        trackingEvents.filter(function (event) {
          return (
            event.status &&
            event.location &&
            event.timestamp
          );
        });

      if (!validEvents.length) {
        showMessage(
          "Add a status, location, date and time before saving history.",
          "warning"
        );

        return;
      }

      const token =
        getToken();

      if (!token) {
        showMessage(
          "Please login first.",
          "danger"
        );

        return;
      }

      try {
        saveTrackingHistoryButton.disabled = true;

        const payload =
          collectShipmentData();

        payload.trackingEvents =
          validEvents;

        const trackingNumber =
          currentShipment.trackingNumber;

        const response =
          await fetch(
            `${API_URL}/cargo1/${encodeURIComponent(trackingNumber)}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            }
          );

        const data =
          await response.json().catch(function () {
            return {};
          });

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error ||
            "Unable to save tracking history."
          );
        }

        currentShipment =
          data.shipment || data;

        trackingEvents =
          Array.isArray(currentShipment.trackingEvents)
            ? currentShipment.trackingEvents
            : validEvents;

        renderTrackingEvents();

        await loadShipments();

        showMessage(
          "Tracking history saved successfully.",
          "success"
        );

      } catch (error) {
        showMessage(
          error.message ||
          "Unable to save tracking history.",
          "danger"
        );

      } finally {
        saveTrackingHistoryButton.disabled = false;
      }
    }
  );
}


// ======================================================
// RECIPIENT IMAGE SELECTION
// ======================================================

if (recipientImageInput) {
  recipientImageInput.addEventListener(
    "change",
    function () {
      const file =
        recipientImageInput.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        showMessage(
          "Please choose an image file.",
          "warning"
        );

        recipientImageInput.value = "";

        return;
      }

      const maxSize =
        10 * 1024 * 1024;

      if (file.size > maxSize) {
        showMessage(
          "The image must be smaller than 10 MB.",
          "warning"
        );

        recipientImageInput.value = "";

        return;
      }

      if (recipientImageObjectUrl) {
        URL.revokeObjectURL(
          recipientImageObjectUrl
        );
      }

      recipientImageObjectUrl =
        URL.createObjectURL(file);

      if (!recipientCropImage) {
        recipientImageData = "";

        showMessage(
          "The image crop controls are missing from the HTML.",
          "warning"
        );

        return;
      }

      recipientCropImage.src =
        recipientImageObjectUrl;

      recipientCropImage.onload =
        function () {
          openRecipientCropModal();
        };
    }
  );
}


// ======================================================
// OPEN RECIPIENT CROP MODAL
// ======================================================

function openRecipientCropModal() {
  if (
    !recipientCropImage ||
    !recipientCropModal
  ) {
    return;
  }

  if (typeof Cropper === "undefined") {
    showMessage(
      "Cropper.js is not loaded. Include the Cropper.js library in the Cargo1 HTML.",
      "danger"
    );

    return;
  }

  if (recipientCropper) {
    recipientCropper.destroy();

    recipientCropper = null;
  }

  recipientCropper =
    new Cropper(recipientCropImage, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: "move",
      autoCropArea: 0.9,
      responsive: true,
      background: false,
      guides: true,
      center: true,
      movable: true,
      zoomable: true,
      rotatable: false,
      scalable: false
    });

  if (recipientCropZoom) {
    recipientCropZoom.value = 1;
  }

  bootstrap.Modal
    .getOrCreateInstance(recipientCropModal)
    .show();
}


// ======================================================
// RECIPIENT CROP ZOOM
// ======================================================

if (recipientCropZoom) {
  recipientCropZoom.addEventListener(
    "input",
    function () {
      if (!recipientCropper) {
        return;
      }

      const zoom =
        Number(recipientCropZoom.value);

      if (!Number.isFinite(zoom) || zoom <= 0) {
        return;
      }

      recipientCropper.zoomTo(zoom);
    }
  );
}


// ======================================================
// SAVE RECIPIENT CROP
// ======================================================

if (saveRecipientCropButton) {
  saveRecipientCropButton.addEventListener(
    "click",
    function () {
      if (!recipientCropper) {
        showMessage(
          "Choose an image before cropping.",
          "warning"
        );

        return;
      }

      const canvas =
        recipientCropper.getCroppedCanvas({
          width: 256,
          height: 256,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high"
        });

      if (!canvas) {
        showMessage(
          "Unable to crop this image.",
          "danger"
        );

        return;
      }

      recipientImageData =
        canvas.toDataURL("image/png");

      if (recipientImagePreview) {
        recipientImagePreview.src =
          recipientImageData;
      }

      if (recipientImagePreviewContainer) {
        recipientImagePreviewContainer.style.display = "";
      }

      bootstrap.Modal
        .getOrCreateInstance(recipientCropModal)
        .hide();

      recipientCropper.destroy();

      recipientCropper = null;

      showMessage(
        "Recipient image cropped successfully.",
        "success"
      );
    }
  );
}


// ======================================================
// CLEAR RECIPIENT IMAGE
// ======================================================

function clearRecipientImage() {
  recipientImageData = "";

  if (recipientImageInput) {
    recipientImageInput.value = "";
  }

  if (recipientImagePreview) {
    recipientImagePreview.removeAttribute("src");
  }

  if (recipientImagePreviewContainer) {
    recipientImagePreviewContainer.style.display = "none";
  }

  if (recipientCropper) {
    recipientCropper.destroy();

    recipientCropper = null;
  }

  if (recipientImageObjectUrl) {
    URL.revokeObjectURL(
      recipientImageObjectUrl
    );

    recipientImageObjectUrl = "";
  }
}


// ======================================================
// OPTIONAL REMOVE IMAGE BUTTON
// ======================================================

const removeRecipientImageButton =
  document.getElementById("removeRecipientImage");

if (removeRecipientImageButton) {
  removeRecipientImageButton.addEventListener(
    "click",
    clearRecipientImage
  );
}


// ======================================================
// DISPLAY MESSAGES
// ======================================================

function showMessage(message, type) {
  const messageType =
    type || "info";

  if (shippingMessage) {
    shippingMessage.textContent = message;

    shippingMessage.className =
      `alert alert-${messageType}`;

    shippingMessage.style.display = "";

    return;
  }

  window.alert(message);
}


// ======================================================
// ERROR MESSAGE FIELD
// ======================================================

function updateErrorMessageVisibility() {
  if (!errorMessageGroup || !shippingStatus) {
    return;
  }

  const showError =
    shippingStatus.value === "Error";

  errorMessageGroup.style.display =
    showError ? "" : "none";
}

if (shippingStatus) {
  shippingStatus.addEventListener(
    "change",
    updateErrorMessageVisibility
  );

  updateErrorMessageVisibility();
}

// ======================================================
// COLLECT FORM DATA
// ======================================================

function collectShipmentData() {
  const recipientFirstName =
    recipientFirstNameInput?.value.trim() || "";

  const recipientLastName =
    recipientLastNameInput?.value.trim() || "";

  const recipientFullName =
    `${recipientFirstName} ${recipientLastName}`.trim();

  return {
    invoiceNumber:
      invoiceNumberInput?.value.trim() || "",

    date:
      shippingDateInput?.value || "",

    time:
      shippingTimeInput?.value || "",

    estimatedDelivery:
      buildDateTime(
        estimatedDeliveryInput?.value,
        estimatedDeliveryTimeInput?.value
      ),

    estimatedDeliveryTime:
      estimatedDeliveryTimeInput?.value || "",

    sender:
      senderInput?.value.trim() || "",

    senderEmail:
      senderEmailInput?.value.trim() || "",

    origin:
      originInput?.value.trim() || "",

    recipientFirstName:
      recipientFirstName,

    recipientLastName:
      recipientLastName,

    recipientName:
      recipientFullName,

    recipientPhone:
      recipientPhoneInput?.value.trim() || "",

    recipientEmail:
      recipientEmailInput?.value.trim() || "",

    recipientAddress:
      recipientAddressInput?.value.trim() || "",

    recipientCity:
      recipientCityInput?.value.trim() || "",

    recipientPostalCode:
      recipientPostalCodeInput?.value.trim() || "",

    recipientCountry:
      recipientCountryInput?.value.trim() || "",

    recipientImage:
      recipientImageData || "",

    packageContent:
      packageContentInput?.value.trim() || "",

    packageWeight:
      packageWeightInput?.value.trim() || "",

    status:
      shippingStatus?.value || "Processing",

    errorMessage:
      errorMessage?.value.trim() || "",

    trackingEvents:
      trackingEvents.filter(function (event) {
        return (
          event.status &&
          event.location &&
          event.timestamp
        );
      })
  };
}


// ======================================================
// VALIDATE SHIPMENT DATA
// ======================================================

function validateShipmentData(data) {
  const requiredFields = [
    ["invoiceNumber", "Invoice number"],
    ["date", "Shipping date"],
    ["sender", "Sender name"],
    ["origin", "Shipment origin"],
    ["recipientFirstName", "Recipient first name"],
    ["recipientLastName", "Recipient last name"],
    ["recipientAddress", "Recipient address"],
    ["recipientCity", "Recipient city"],
    ["recipientCountry", "Recipient country"],
    ["packageContent", "Package contents"]
  ];

  for (const field of requiredFields) {
    if (!data[field[0]]) {
      showMessage(
        `${field[1]} is required.`,
        "warning"
      );

      return false;
    }
  }

  if (
    data.status === "Error" &&
    !data.errorMessage
  ) {
    showMessage(
      "Enter an error message when the shipment status is Error.",
      "warning"
    );

    return false;
  }

  return true;
}


// ======================================================
// SET BUTTON LOADING STATE
// ======================================================

function setCreateButtonLoading(loading) {
  if (!createShippingButton) {
    return;
  }

  createShippingButton.disabled = loading;

  createShippingButton.textContent =
    loading
      ? "Please wait..."
      : editingShipment
        ? "Update Shipment"
        : "Create Shipment";
}


// ======================================================
// CREATE SHIPMENT
// ======================================================

async function createShipping() {
  const token =
    getToken();

  if (!token) {
    showMessage(
      "Please login first.",
      "danger"
    );

    return;
  }

  const data =
    collectShipmentData();

  if (!validateShipmentData(data)) {
    return;
  }

  const cleanShipping =
    selectedShippingType === "clean";

  // Cargo1 clean shipping costs $50.
  // The backend must also enforce this price.
  data.shippingType = cleanShipping ? "clean" : "test";

  try {
    setCreateButtonLoading(true);

    const response =
      await fetch(`${API_URL}/cargo1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

    const result =
      await response.json().catch(function () {
        return {};
      });

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        "Unable to create Cargo1 shipment."
      );
    }

    currentShipment =
      result.shipment || result;

    generatedTrackingNumber =
      currentShipment.trackingNumber || "";

    showMessage(
      generatedTrackingNumber
        ? `Cargo1 shipment created. Tracking number: ${generatedTrackingNumber}`
        : "Cargo1 shipment created successfully.",
      "success"
    );

    saveDraft();

    await loadShipments();

    if (currentShipment.trackingNumber) {
      editShipmentByTrackingNumber(
        currentShipment.trackingNumber
      );
    }

  } catch (error) {
    showMessage(
      error.message ||
      "Unable to create Cargo1 shipment.",
      "danger"
    );

  } finally {
    setCreateButtonLoading(false);
  }
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

  if (!currentShipment?.trackingNumber) {
    showMessage(
      "Open a Cargo1 shipment before updating it.",
      "warning"
    );

    return;
  }

  const data =
    collectShipmentData();

  if (!validateShipmentData(data)) {
    return;
  }

  try {
    setCreateButtonLoading(true);

    const trackingNumber =
      currentShipment.trackingNumber;

    const response =
      await fetch(
        `${API_URL}/cargo1/${encodeURIComponent(trackingNumber)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data)
        }
      );

    const result =
      await response.json().catch(function () {
        return {};
      });

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        "Unable to update Cargo1 shipment."
      );
    }

    currentShipment =
      result.shipment || result;

    showMessage(
      "Cargo1 shipment updated successfully.",
      "success"
    );

    saveDraft();

    await loadShipments();

    setControllerMode("profile");

  } catch (error) {
    showMessage(
      error.message ||
      "Unable to update Cargo1 shipment.",
      "danger"
    );

  } finally {
    setCreateButtonLoading(false);
  }
}


// ======================================================
// RESET FORM
// ======================================================

function resetShipmentForm() {
  if (shippingForm) {
    shippingForm.reset();
  }

  currentShipment = null;

  generatedTrackingNumber = "";

  editingShipment = false;

  trackingEvents = [];

  clearRecipientImage();

  renderTrackingEvents();

  updateErrorMessageVisibility();

  setCreateButtonLoading(false);

  if (createShippingButton) {
    createShippingButton.textContent =
      "Create Shipment";
  }

  if (cancelEditButton) {
    cancelEditButton.style.display = "none";
  }

  if (shippingStatus) {
    shippingStatus.value = "Processing";
  }

  if (errorMessage) {
    errorMessage.value = "";
  }

  if (shippingMessage) {
    shippingMessage.textContent = "";
    shippingMessage.style.display = "none";
  }

  clearDraft();
}


// ======================================================
// NEW SHIPMENT BUTTON
// ======================================================

if (newShipmentButton) {
  newShipmentButton.addEventListener(
    "click",
    function () {
      resetShipmentForm();

      setControllerMode("create");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );
}


// ======================================================
// CANCEL EDIT BUTTON
// ======================================================

if (cancelEditButton) {
  cancelEditButton.addEventListener(
    "click",
    function () {
      resetShipmentForm();

      setControllerMode("profile");
    }
  );
}


// ======================================================
// REFRESH SHIPMENTS BUTTON
// ======================================================

if (refreshShipmentsButton) {
  refreshShipmentsButton.addEventListener(
    "click",
    function () {
      loadShipments();
    }
  );
}

// ======================================================
// LOAD CARGO1 SHIPMENTS
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
    if (refreshShipmentsButton) {
      refreshShipmentsButton.disabled = true;
    }

    const response =
      await fetch(`${API_URL}/cargo1/mine`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    const result =
      await response.json().catch(function () {
        return {};
      });

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        "Unable to load Cargo1 shipments."
      );
    }

    userShipments =
      Array.isArray(result.shipments)
        ? result.shipments
        : Array.isArray(result)
          ? result
          : [];

    renderShipments();

  } catch (error) {
    console.error(
      "Unable to load Cargo1 shipments:",
      error
    );

    if (shipmentList) {
      shipmentList.innerHTML = `
        <p class="text-danger">
          Unable to load shipments. Please refresh and try again.
        </p>
      `;
    }

  } finally {
    if (refreshShipmentsButton) {
      refreshShipmentsButton.disabled = false;
    }
  }
}


// ======================================================
// RENDER SHIPMENT LIST
// ======================================================

function renderShipments() {
  if (!shipmentList) {
    return;
  }

  if (!userShipments.length) {
    shipmentList.innerHTML = `
      <div class="shipment-empty">
        <p>You have not created any Cargo1 shipments yet.</p>
      </div>
    `;

    return;
  }

  shipmentList.innerHTML =
    userShipments.map(function (shipment, index) {
      const trackingNumber =
        shipment.trackingNumber || "";

      const recipientName =
        [
          shipment.recipientFirstName,
          shipment.recipientLastName
        ]
          .filter(Boolean)
          .join(" ") ||
        shipment.recipientName ||
        "Recipient not specified";

      const status =
        shipment.status || "Processing";

      const shippingType =
        shipment.shippingType ||
        (shipment.isClean ? "clean" : "test");

      const paid =
        Boolean(shipment.isPaid);

      return `
        <div class="shipment-card">

          <div class="shipment-card-header">
            <h5>
              ${escapeHTML(shipment.invoiceNumber || "Shipment")}
            </h5>

            <span class="shipment-status">
              ${escapeHTML(status)}
            </span>
          </div>

          <p>
            <strong>Tracking:</strong>
            ${escapeHTML(trackingNumber)}
          </p>

          <p>
            <strong>Recipient:</strong>
            ${escapeHTML(recipientName)}
          </p>

          <p>
            <strong>Destination:</strong>
            ${escapeHTML(shipment.recipientCountry || "")}
          </p>

          <p>
            <strong>Type:</strong>
            ${escapeHTML(shippingType)}
          </p>

          <p>
            <strong>Payment:</strong>
            ${paid ? "Paid" : "Unpaid"}
          </p>

          <div class="shipment-card-actions">

            <button
              type="button"
              class="btn btn-primary btn-sm"
              onclick="selectShipment(${index})"
            >
              Edit
            </button>

            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              onclick="downloadShipmentPDF(${index})"
            >
              Download PDF
            </button>

            <button
              type="button"
              class="btn btn-outline-danger btn-sm"
              onclick="deleteShipment(${index})"
            >
              Delete
            </button>

          </div>

        </div>
      `;
    }).join("");
}


// ======================================================
// EDIT SHIPMENT BY INDEX
// ======================================================

function editShipment(index) {
  const shipment =
    userShipments[index];

  if (!shipment) {
    showMessage(
      "Shipment not found.",
      "warning"
    );

    return;
  }

  fillShipmentForm(shipment);
}


// ======================================================
// EDIT SHIPMENT BY TRACKING NUMBER
// ======================================================

function editShipmentByTrackingNumber(trackingNumber) {
  const shipment =
    userShipments.find(function (item) {
      return item.trackingNumber === trackingNumber;
    });

  if (shipment) {
    fillShipmentForm(shipment);
  }
}


// ======================================================
// FILL SHIPMENT FORM
// ======================================================

function fillShipmentForm(shipment) {
  currentShipment = shipment;

  editingShipment = true;

  generatedTrackingNumber =
    shipment.trackingNumber || "";

  if (invoiceNumberInput) {
    invoiceNumberInput.value =
      shipment.invoiceNumber || "";
  }

  if (shippingDateInput) {
    shippingDateInput.value =
      shipment.date ||
      getLocalDateFromTimestamp(shipment.createdAt) ||
      "";
  }

  if (shippingTimeInput) {
    shippingTimeInput.value =
      shipment.time ||
      getLocalTimeFromTimestamp(shipment.createdAt) ||
      "";
  }

  if (estimatedDeliveryInput) {
    estimatedDeliveryInput.value =
      shipment.estimatedDelivery
        ? getLocalDateFromTimestamp(
          shipment.estimatedDelivery
        )
        : "";
  }

  if (estimatedDeliveryTimeInput) {
    estimatedDeliveryTimeInput.value =
      shipment.estimatedDeliveryTime ||
      (
        shipment.estimatedDelivery
          ? getLocalTimeFromTimestamp(
            shipment.estimatedDelivery
          )
          : ""
      );
  }

  if (senderInput) {
    senderInput.value =
      shipment.sender || "";
  }

  if (senderEmailInput) {
    senderEmailInput.value =
      shipment.senderEmail || "";
  }

  if (originInput) {
    originInput.value =
      shipment.origin || "";
  }

  if (recipientFirstNameInput) {
    recipientFirstNameInput.value =
      shipment.recipientFirstName || "";
  }

  if (recipientLastNameInput) {
    recipientLastNameInput.value =
      shipment.recipientLastName || "";
  }

  if (recipientPhoneInput) {
    recipientPhoneInput.value =
      shipment.recipientPhone || "";
  }

  if (recipientEmailInput) {
    recipientEmailInput.value =
      shipment.recipientEmail || "";
  }

  if (recipientAddressInput) {
    recipientAddressInput.value =
      shipment.recipientAddress || "";
  }

  if (recipientCityInput) {
    recipientCityInput.value =
      shipment.recipientCity || "";
  }

  if (recipientPostalCodeInput) {
    recipientPostalCodeInput.value =
      shipment.recipientPostalCode || "";
  }

  if (recipientCountryInput) {
    recipientCountryInput.value =
      shipment.recipientCountry || "";
  }

  if (packageContentInput) {
    packageContentInput.value =
      shipment.packageContent || "";
  }

  if (packageWeightInput) {
    packageWeightInput.value =
      shipment.packageWeight || "";
  }

  if (shippingStatus) {
    shippingStatus.value =
      shipment.status || "Processing";
  }

  if (errorMessage) {
    errorMessage.value =
      shipment.errorMessage || "";
  }

  recipientImageData =
    shipment.recipientImage || "";

  if (recipientImagePreview) {
    if (recipientImageData) {
      recipientImagePreview.src =
        recipientImageData;
    } else {
      recipientImagePreview.removeAttribute("src");
    }
  }

  if (recipientImagePreviewContainer) {
    recipientImagePreviewContainer.style.display =
      recipientImageData ? "" : "none";
  }

  trackingEvents =
    Array.isArray(shipment.trackingEvents)
      ? shipment.trackingEvents.map(function (event) {
        return {
          status: event.status || "Processing",
          location: event.location || "",
          description: event.description || "",
          timestamp:
            event.timestamp || new Date().toISOString()
        };
      })
      : [];

  renderTrackingEvents();

  updateErrorMessageVisibility();

  if (createShippingButton) {
    createShippingButton.textContent =
      "Update Shipment";
  }

  if (cancelEditButton) {
    cancelEditButton.style.display = "";
  }

  setControllerMode("create");

  saveDraft();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ======================================================
// DELETE SHIPMENT
// ======================================================

async function deleteShipment(index) {
  const shipment =
    userShipments[index];

  if (!shipment?.trackingNumber) {
    showMessage(
      "Shipment not found.",
      "warning"
    );

    return;
  }

  const confirmed =
    window.confirm(
      `Delete Cargo1 shipment ${shipment.trackingNumber}? This cannot be undone.`
    );

  if (!confirmed) {
    return;
  }

  const token =
    getToken();

  if (!token) {
    showMessage(
      "Please login first.",
      "danger"
    );

    return;
  }

  try {
    const response =
      await fetch(
        `${API_URL}/cargo1/${encodeURIComponent(shipment.trackingNumber)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    const result =
      await response.json().catch(function () {
        return {};
      });

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        "Unable to delete shipment."
      );
    }

    if (
      currentShipment?.trackingNumber ===
      shipment.trackingNumber
    ) {
      resetShipmentForm();

      setControllerMode("profile");
    }

    showMessage(
      "Cargo1 shipment deleted.",
      "success"
    );

    await loadShipments();

  } catch (error) {
    showMessage(
      error.message ||
      "Unable to delete Cargo1 shipment.",
      "danger"
    );
  }
}

function isCargo1ShipmentPaidClean(shipment) {
  return Boolean(
    shipment &&
    shipment.shippingType === "clean" &&
    shipment.paymentStatus === "paid" &&
    shipment.watermarkEnabled === false
  );
}

// ======================================================
// DOWNLOAD SHIPMENT PDF
// ======================================================

async function downloadShipmentPDF(index) {
  const shipment =
    userShipments[index];

  if (!shipment) {
    showMessage(
      "Shipment not found.",
      "warning"
    );

    return;
  }

  if (typeof window.jspdf === "undefined") {
    showMessage(
      "The PDF library is not loaded. Include jsPDF in the Cargo1 HTML.",
      "danger"
    );

    return;
  }

  const jsPDF =
    window.jspdf.jsPDF;


  // LOAD THE LETTERHEAD IMAGE
  const letterheadImage = new Image();

  letterheadImage.src = "images/cargo-letterhead.png";

  try {
    await new Promise(function (resolve, reject) {
      letterheadImage.onload = resolve;
      letterheadImage.onerror = reject;
    });
  } catch (error) {
    showMessage(
      "Could not load the letterhead image. Check images/cargo-letterhead.png.",
      "danger"
    );

    return;
  }


  const pdf =
    new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

  const pageWidth =
    pdf.internal.pageSize.getWidth();


  const pageHeight =
    pdf.internal.pageSize.getHeight();

  // ADD LETTERHEAD TO A PDF PAGE
  function addLetterheadBackground() {
    pdf.addImage(
      letterheadImage,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight
    );
  }

  // ADD THE BACKGROUND TO THE FIRST PAGE
  addLetterheadBackground();

  const margin = 16;


  const contentWidth =
    pageWidth - margin * 2;

  let y = 18;

  function addSectionHeading(text) {
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(47, 95, 119);

    pdf.text(text, margin, y);

    y += 3;

    pdf.setDrawColor(47, 95, 119);
    pdf.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 6;
  }

  function addField(label, value) {
    const safeValue =
      value === undefined ||
        value === null ||
        value === ""
        ? "—"
        : String(value);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(70, 70, 70);

    pdf.text(`${label}:`, margin, y);

    pdf.setFont("helvetica", "normal");

    const lines =
      pdf.splitTextToSize(
        safeValue,
        contentWidth - 35
      );

    pdf.text(lines, margin + 35, y);

    y += Math.max(6, lines.length * 4.5);


    if (y > pageHeight - 25) {
      pdf.addPage();

      addLetterheadBackground();

      y = 20;
    }

  }

  // HEADER
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(47, 95, 119);

  pdf.text("ZENDITCARGO", margin, y);

  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(90, 90, 90);

  pdf.text(
    mainShippingWebsite,
    margin,
    y
  );

  y += 9;

  pdf.setDrawColor(47, 95, 119);

  pdf.line(
    margin,
    y,
    pageWidth - margin,
    y
  );

  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(35, 35, 35);

  pdf.text("SHIPPING DOCUMENT", margin, y);

  y += 9;

  // INVOICE
  addSectionHeading("SHIPMENT DETAILS");

  addField(
    "Invoice number",
    shipment.invoiceNumber
  );

  addField(
    "Tracking number",
    shipment.trackingNumber
  );

  addField(
    "Shipping date",
    formatPdfDate(shipment.date)
  );

  addField(
    "Shipping time",
    shipment.time
  );

  addField(
    "Estimated delivery",
    formatPdfDate(shipment.estimatedDelivery)
  );

  addField(
    "Delivery time",
    shipment.estimatedDeliveryTime
  );

  addField(
    "Status",
    shipment.status
  );

  // SENDER
  addSectionHeading("SENDER");

  addField(
    "Name",
    shipment.sender
  );

  addField(
    "Email",
    shipment.senderEmail
  );

  addField(
    "Origin",
    shipment.origin
  );

  // RECIPIENT
  addSectionHeading("RECIPIENT");

  addField(
    "First name",
    shipment.recipientFirstName
  );

  addField(
    "Last name",
    shipment.recipientLastName
  );

  addField(
    "Phone",
    shipment.recipientPhone
  );

  addField(
    "Email",
    shipment.recipientEmail
  );

  addField(
    "Address",
    shipment.recipientAddress
  );

  addField(
    "City",
    shipment.recipientCity
  );

  addField(
    "Postal code",
    shipment.recipientPostalCode
  );

  addField(
    "Country",
    shipment.recipientCountry
  );

  // PACKAGE
  addSectionHeading("PACKAGE");

  addField(
    "Contents",
    shipment.packageContent
  );

  addField(
    "Weight",
    shipment.packageWeight
  );

  // TRACKING HISTORY
  if (
    Array.isArray(shipment.trackingEvents) &&
    shipment.trackingEvents.length
  ) {
    addSectionHeading("TRACKING HISTORY");

    shipment.trackingEvents.forEach(
      function (event) {
        addField(
          "Date and time",
          event.timestamp
            ? new Date(event.timestamp).toLocaleString()
            : ""
        );

        addField(
          "Status",
          event.status
        );

        addField(
          "Location",
          event.location
        );

        if (event.description) {
          addField(
            "Description",
            event.description
          );
        }
      }
    );
  }

  // ERROR MESSAGE
  if (shipment.errorMessage) {
    addSectionHeading("SHIPMENT NOTICE");

    addField(
      "Message",
      shipment.errorMessage
    );
  }

  // RECIPIENT IMAGE
  if (
    shipment.recipientImage &&
    typeof shipment.recipientImage === "string"
  ) {
    try {
      const imageFormat =
        shipment.recipientImage.startsWith(
          "data:image/jpeg"
        )
          ? "JPEG"
          : "PNG";

      pdf.addImage(
        shipment.recipientImage,
        imageFormat,
        pageWidth - margin - 30,
        30,
        30,
        30
      );
    } catch (error) {
      console.warn(
        "Recipient image could not be added to the PDF.",
        error
      );
    }
  }

  // FREE / TEST WATERMARK
  const isPaidClean =
    isCargo1ShipmentPaidClean(shipment);

  if (!isPaidClean) {
    const pageCount =
      pdf.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {
      pdf.setPage(page);

      pdf.saveGraphicsState();

      pdf.setTextColor(225, 225, 225);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(38);

      pdf.text(
        "TEST / FREE",
        pageWidth / 2,
        pageHeight / 2,
        {
          align: "center",
          angle: 35
        }
      );

      pdf.restoreGraphicsState();
    }
  }

  // FOOTER
  const pageCount =
    pdf.internal.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    pdf.setPage(page);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);

    pdf.text(
      "Generated by ZenditCargo — Cargo1",
      margin,
      pageHeight - 9
    );

    pdf.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 9,
      {
        align: "right"
      }
    );
  }

  const filename =
    `${shipment.trackingNumber || "cargo1-shipment"}.pdf`;

  pdf.save(filename);
}


// ======================================================
// CLEAN SHIPPING UPGRADE
// ======================================================

async function upgradeShipment(index) {
  const shipment =
    userShipments[index];

  if (!shipment?.trackingNumber) {
    showMessage(
      "Shipment not found.",
      "warning"
    );

    return;
  }

  if (isCargo1ShipmentPaidClean(shipment)) {
    showMessage(
      "This shipment has already been upgraded.",
      "info"
    );

    return;
  }

  const token =
    getToken();

  if (!token) {
    showMessage(
      "Please login first.",
      "danger"
    );

    return;
  }

  const confirmed =
    window.confirm(
      `Upgrade this Cargo1 shipment for $${CLEAN_SHIPPING_PRICE.toFixed(2)}?`
    );

  if (!confirmed) {
    return;
  }

  try {
    const response =
      await fetch(
        `${API_URL}/cargo1/${encodeURIComponent(shipment.trackingNumber)}/upgrade`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: CLEAN_SHIPPING_PRICE
          })
        }
      );

    const result =
      await response.json().catch(function () {
        return {};
      });

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        "Unable to upgrade this shipment."
      );
    }

    showMessage(
      result.message ||
      "Upgrade request completed.",
      "success"
    );

    await loadShipments();

  } catch (error) {
    showMessage(
      error.message ||
      "Unable to upgrade this shipment.",
      "danger"
    );
  }
}

// ======================================================
// CARGO1 DRAFT STORAGE
// ======================================================

const CARGO1_DRAFT_KEY =
  "justdoks_cargo1_shipment_draft";

function saveDraft() {
  if (!shippingForm) {
    return;
  }

  try {
    const draft = {
      form: collectShipmentData(),
      trackingNumber:
        currentShipment?.trackingNumber || "",
      editingShipment:
        editingShipment,
      selectedShippingType:
        selectedShippingType
    };

    localStorage.setItem(
      CARGO1_DRAFT_KEY,
      JSON.stringify(draft)
    );
  } catch (error) {
    console.warn(
      "Unable to save Cargo1 draft.",
      error
    );
  }
}


function clearDraft() {
  localStorage.removeItem(
    CARGO1_DRAFT_KEY
  );
}


function restoreDraft() {
  if (!shippingForm) {
    return;
  }

  let draft;

  try {
    const stored =
      localStorage.getItem(CARGO1_DRAFT_KEY);

    if (!stored) {
      return;
    }

    draft = JSON.parse(stored);

  } catch (error) {
    console.warn(
      "Unable to restore Cargo1 draft.",
      error
    );

    clearDraft();

    return;
  }

  if (!draft || !draft.form) {
    return;
  }

  const data =
    draft.form;

  if (invoiceNumberInput) {
    invoiceNumberInput.value =
      data.invoiceNumber || "";
  }

  if (shippingDateInput) {
    shippingDateInput.value =
      data.date || "";
  }

  if (shippingTimeInput) {
    shippingTimeInput.value =
      data.time || "";
  }

  if (estimatedDeliveryInput) {
    estimatedDeliveryInput.value =
      data.estimatedDelivery
        ? String(data.estimatedDelivery).slice(0, 10)
        : "";
  }

  if (estimatedDeliveryTimeInput) {
    estimatedDeliveryTimeInput.value =
      data.estimatedDeliveryTime || "";
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

  if (recipientFirstNameInput) {
    recipientFirstNameInput.value =
      data.recipientFirstName || "";
  }

  if (recipientLastNameInput) {
    recipientLastNameInput.value =
      data.recipientLastName || "";
  }

  if (recipientPhoneInput) {
    recipientPhoneInput.value =
      data.recipientPhone || "";
  }

  if (recipientEmailInput) {
    recipientEmailInput.value =
      data.recipientEmail || "";
  }

  if (recipientAddressInput) {
    recipientAddressInput.value =
      data.recipientAddress || "";
  }

  if (recipientCityInput) {
    recipientCityInput.value =
      data.recipientCity || "";
  }

  if (recipientPostalCodeInput) {
    recipientPostalCodeInput.value =
      data.recipientPostalCode || "";
  }

  if (recipientCountryInput) {
    recipientCountryInput.value =
      data.recipientCountry || "";
  }

  if (packageContentInput) {
    packageContentInput.value =
      data.packageContent || "";
  }

  if (packageWeightInput) {
    packageWeightInput.value =
      data.packageWeight || "";
  }

  if (shippingStatus) {
    shippingStatus.value =
      data.status || "Processing";
  }

  if (errorMessage) {
    errorMessage.value =
      data.errorMessage || "";
  }

  trackingEvents =
    Array.isArray(data.trackingEvents)
      ? data.trackingEvents
      : [];

  selectedShippingType =
    draft.selectedShippingType || "test";

  renderTrackingEvents();

  updateErrorMessageVisibility();
}


// ======================================================
// AUTOSAVE FORM DRAFT
// ======================================================

if (shippingForm) {
  shippingForm.addEventListener(
    "input",
    function () {
      saveDraft();
    }
  );

  shippingForm.addEventListener(
    "change",
    function () {
      saveDraft();
    }
  );
}


// ======================================================
// SHIPMENT LIST WITH UPGRADE ACTION
// ======================================================

// This version includes an Upgrade button for unpaid shipments.

function renderShipments() {
  if (!shipmentList) {
    return;
  }

  if (!userShipments.length) {
    shipmentList.innerHTML = `
      <div class="shipment-empty">
        <p>You have not created any Cargo1 shipments yet.</p>
      </div>
    `;

    return;
  }

  shipmentList.innerHTML =
    userShipments.map(function (shipment, index) {
      const trackingNumber =
        shipment.trackingNumber || "";

      const recipientName =
        [
          shipment.recipientFirstName,
          shipment.recipientLastName
        ]
          .filter(Boolean)
          .join(" ") ||
        shipment.recipientName ||
        "Recipient not specified";

      const status =
        shipment.status || "Processing";

      const shippingType =
        shipment.shippingType ||
        (shipment.isClean ? "clean" : "test");

      const isPaidClean =
        isCargo1ShipmentPaidClean(shipment);

      return `
        <div class="shipment-card">

          <div class="shipment-card-header">
            <h5>
              ${escapeHTML(shipment.invoiceNumber || "Cargo1 shipment")}
            </h5>

            <span class="shipment-status">
              ${escapeHTML(status)}
            </span>
          </div>

          <p>
            <strong>Tracking:</strong>
            ${escapeHTML(trackingNumber)}
          </p>

          <p>
            <strong>Recipient:</strong>
            ${escapeHTML(recipientName)}
          </p>

          <p>
            <strong>Destination:</strong>
            ${escapeHTML(shipment.recipientCountry || "")}
          </p>

          <p>
            <strong>Type:</strong>
            ${escapeHTML(shippingType)}
          </p>

          <p>
            <strong>Payment:</strong>
            ${isPaidClean ? "Paid" : "Unpaid"}
          </p>

          <div class="shipment-card-actions">

            <button
              type="button"
              class="btn btn-primary btn-sm"
              onclick="selectShipment(${index})"
            >
              Edit
            </button>

            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              onclick="downloadShipmentPDF(${index})"
            >
              Download PDF
            </button>

            ${isPaidClean
          ? ""
          : `
                  <button
                    type="button"
                    class="btn btn-success btn-sm"
                    onclick="upgradeShipment(${index})"
                  >
                    Upgrade — $50
                  </button>
                `
        }

            <button
              type="button"
              class="btn btn-outline-danger btn-sm"
              onclick="deleteShipment(${index})"
            >
              Delete
            </button>

          </div>
        </div>
      `;
    }).join("");
}


// ======================================================
// INITIALIZE CARGO1
// ======================================================

async function initializeCargo1() {
  restoreDraft();

  renderTrackingEvents();

  updateErrorMessageVisibility();

  updateCargoNavbar();

  await loadUserStorage();

  // Re-render after shipments have loaded.
  renderShipments();
}


// ======================================================
// START WHEN HTML IS READY
// ======================================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeCargo1
  );
} else {
  initializeCargo1();
}


// ======================================================
// GLOBAL FUNCTIONS USED BY HTML BUTTONS
// ======================================================

window.logoutCargo =
  logoutCargo;

window.selectShipment =
  selectShipment;

window.editShipment =
  editShipment;

window.downloadShipmentPDF =
  downloadShipmentPDF;

window.deleteShipment =
  deleteShipment;

window.upgradeShipment =
  upgradeShipment;

window.createShipping =
  createShipping;

window.updateShipment =
  updateShipment;

window.resetShipmentForm =
  resetShipmentForm;