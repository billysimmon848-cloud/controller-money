/* =========================================================
   BOARDING PASS GENERATOR
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
  "https://api.justdoks.com/api";


/* =========================================================
   DOCUMENT TEXT STYLING
========================================================= */

const documentTextColor =
  "#2f5f77";

const documentFont =
  "Arial";

const documentLineHeight =
  1.15;

const documentPaddingTop =
  1;


/* =========================================================
   ELEMENTS
========================================================= */

const pdf =
  document.getElementById(
    "pdf"
  );

const bedspreadForm =
  document.getElementById(
    "bedspreadForm"
  );

const generatedDocument =
  document.getElementById(
    "generatedDocument"
  );

const editButton =
  document.getElementById(
    "editButton"
  );

const downloadButton =
  document.getElementById(
    "downloadButton"
  );


/* =========================================================
   DOWNLOAD MODAL
========================================================= */

const downloadModal =
  document.getElementById(
    "downloadModal"
  );

const modalOverlay =
  document.getElementById(
    "modalOverlay"
  );

const closeModal =
  document.getElementById(
    "closeModal"
  );

const downloadFree =
  document.getElementById(
    "downloadFree"
  );

const downloadClean =
  document.getElementById(
    "downloadClean"
  );


/* =========================================================
   NAVBAR
========================================================= */

const navbarUserName =
  document.getElementById(
    "navbarUserName"
  );

const navbarWalletBalance =
  document.getElementById(
    "navbarWalletBalance"
  );

const navbarLogout =
  document.getElementById(
    "navbarLogout"
  );

const navbarToggler =
  document.getElementById(
    "navbarToggler"
  );

const authNav =
  document.getElementById(
    "authNav"
  );


/* =========================================================
   BOARDING PASS MANAGEMENT
========================================================= */

const flightManagement =
  document.getElementById(
    "flightManagement"
  );

const createdFlights =
  document.getElementById(
    "createdFlights"
  );

const createFlightView =
  document.getElementById(
    "createFlightView"
  );

const selectedFlightView =
  document.getElementById(
    "selectedFlightView"
  );

const selectedFlightName =
  document.getElementById(
    "selectedFlightName"
  );

const selectedFlightTracking =
  document.getElementById(
    "selectedFlightTracking"
  );

const newFlightBtn =
  document.getElementById(
    "newFlightBtn"
  );


/* =========================================================
   PROFILE FIELDS
========================================================= */

const profileClass =
  document.getElementById(
    "profileClass"
  );

const profileFrom =
  document.getElementById(
    "profileFrom"
  );

const profileTo =
  document.getElementById(
    "profileTo"
  );

const profileDate =
  document.getElementById(
    "profileDate"
  );

const profileTime =
  document.getElementById(
    "profileTime"
  );

const profileDuration =
  document.getElementById(
    "profileDuration"
  );

const profileGate =
  document.getElementById(
    "profileGate"
  );

const profileSeat =
  document.getElementById(
    "profileSeat"
  );

const profileSequence =
  document.getElementById(
    "profileSequence"
  );

const profilePrice =
  document.getElementById(
    "profilePrice"
  );

const profileTaxes =
  document.getElementById(
    "profileTaxes"
  );

const profileTotal =
  document.getElementById(
    "profileTotal"
  );


/* =========================================================
   STATUS
========================================================= */

const flightStatusSelect =
  document.getElementById(
    "flightStatusSelect"
  );

const changeFlightStatusBtn =
  document.getElementById(
    "changeFlightStatusBtn"
  );


/* =========================================================
   TRACKING
========================================================= */

const profileTrackingNumber =
  document.getElementById(
    "profileTrackingNumber"
  );

const trackFlightBtn =
  document.getElementById(
    "trackFlightBtn"
  );


/* =========================================================
   WATERMARK ACTION
========================================================= */

const flightWatermarkAction =
  document.getElementById(
    "flightWatermarkAction"
  );


/* =========================================================
   FORM INPUTS
========================================================= */

const formInputs =
  bedspreadForm
    ? bedspreadForm.querySelectorAll(
        "input, select"
      )
    : [];


/*
   INPUT ORDER

   0  name
   1  class
   2  from
   3  to
   4  date
   5  time
   6  gate
   7  seat
   8  price
   9  taxes
   10 sequence
   11 total
   12 tracking
   13 duration
   14 currency
*/


/* =========================================================
   STATE
========================================================= */

let generatedGate =
  "";

let generatedSeat =
  "";

let generatedSequence =
  "";

let generatedTrackingNumber =
  "";

let generatedTaxes =
  "";

let generatedTotal =
  "";

let generatedDuration =
  "";

let selectedCurrency =
  "USD";


let bedspreadWatermarkEnabled =
  false;


let savedBoardingPasses =
  [];

let selectedBoardingPass =
  null;


/* =========================================================
   CURRENCY SYMBOLS
========================================================= */

const currencySymbols = {

  USD: "$",

  EUR: "€",

  GBP: "£",

  NGN: "₦",

  CAD: "C$",

  AUD: "A$"

};


/* =========================================================
   TEXT POSITIONS
========================================================= */

const textPositions = {

  name: {
    left: 25,
    top: 35.8,
    width: 38
  },

  name2: {
    left: 70,
    top: 41.2,
    width: 24
  },


  boardingPass: {
    left: 48.8,
    top: 19.4,
    width: 25
  },

  boardingPass2: {
    left: 73.5,
    top: 18.5,
    width: 25
  },


  from: {
    left: 24.8,
    top: 45,
    width: 50
  },

  from2: {
    left: 70,
    top: 47.5,
    width: 16
  },


  to: {
    left: 24.9,
    top: 54.3,
    width: 50
  },

  to2: {
    left: 70.1,
    top: 55,
    width: 24
  },


  date: {
    left: 24.7,
    top: 63.5,
    width: 16
  },

  date2: {
    left: 70.1,
    top: 63,
    width: 16
  },


  time: {
    left: 36,
    top: 63.5,
    width: 14
  },

  time2: {
    left: 79,
    top: 62.5,
    width: 15
  },


  gate: {
    left: 50.5,
    top: 63.5,
    width: 12
  },

  gate2: {
    left: 71,
    top: 71,
    width: 12
  },


  seat: {
    left: 57,
    top: 63.5,
    width: 12
  },

  seat2: {
    left: 78,
    top: 71,
    width: 12
  },


  adult: {
    left: 80,
    top: 22,
    width: 15
  },


  taxes: {
    left: 80.5,
    top: 25.5,
    width: 17
  },


  amount: {
    left: 46,
    top: 79.6,
    width: 14
  },


  total: {
    left: 79.9,
    top: 32,
    width: 22
  },


  trackingNumber1: {
    left: 36,
    top: 80,
    width: 14
  },

  trackingNumber2: {
    left: 72,
    top: 81,
    width: 14
  }

};


/* =========================================================
   AUTH
========================================================= */

function getToken() {

  return localStorage.getItem(
    "token"
  );

}


/* =========================================================
   AUTH HEADERS
========================================================= */

function authHeaders() {

  const token =
    getToken();

  return {

    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`

  };

}


/* =========================================================
   LOAD USER
========================================================= */

async function loadUser() {

  const token =
    getToken();

  if (!token) {

    window.location.href =
      "login.html";

    return null;

  }


  try {

    const response =
      await fetch(
        `${API_URL}/auth/me`,
        {
          headers:
            authHeaders()
        }
      );


    if (!response.ok) {

      throw new Error(
        "Authentication failed"
      );

    }


    const result =
      await response.json();


    const user =
      result.user ||
      result;


    if (navbarUserName) {

      navbarUserName.textContent =
        user.username ||
        user.name ||
        user.email ||
        "User";

    }


    return user;

  }

  catch (error) {

    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "login.html";

    return null;

  }

}


/* =========================================================
   LOAD WALLET
========================================================= */

async function loadWallet() {

  try {

    const response =
      await fetch(
        `${API_URL}/wallet`,
        {
          headers:
            authHeaders()
        }
      );


    if (!response.ok) {

      return;

    }


    const wallet =
      await response.json();


    const balance =
      Number(
        wallet.balance || 0
      );


    if (navbarWalletBalance) {

      navbarWalletBalance.textContent =
        `$${balance.toFixed(2)}`;

    }

  }

  catch (error) {

    console.error(
      "Wallet loading failed:",
      error
    );

  }

}


/* =========================================================
   RANDOM GATE
========================================================= */

function generateGate() {

  const letters =
    "ABCDEF";

  const letter =
    letters[
      Math.floor(
        Math.random() *
        letters.length
      )
    ];


  const number =
    Math.floor(
      1 +
      Math.random() *
      30
    );


  return `${letter}${number}`;

}


/* =========================================================
   RANDOM SEAT
========================================================= */

function generateSeat() {

  const letters =
    "ABCDEF";

  const row =
    Math.floor(
      1 +
      Math.random() *
      35
    );


  const letter =
    letters[
      Math.floor(
        Math.random() *
        letters.length
      )
    ];


  return `${row}${letter}`;

}


/* =========================================================
   SEQUENCE
========================================================= */

function generateSequence() {

  return `SEQ. ${
    Math.floor(
      1000 +
      Math.random() * 9000
    )
  }`;

}


/* =========================================================
   DURATION
========================================================= */

function generateDuration() {

  const hours =
    Math.floor(
      1 +
      Math.random() * 8
    );


  const minutesOptions = [
    0,
    10,
    15,
    20,
    30,
    45,
    50
  ];


  const minutes =
    minutesOptions[
      Math.floor(
        Math.random() *
        minutesOptions.length
      )
    ];


  return `${hours}h ${minutes}m`;

}


/* =========================================================
   GET SELECTED CURRENCY
========================================================= */

function getCurrency() {

  const currencyInput =
    formInputs[14];


  if (
    currencyInput &&
    currencyInput.value
  ) {

    return currencyInput.value;

  }


  return "USD";

}


/* =========================================================
   CALCULATE PRICE
========================================================= */

function calculateAmounts() {

  const priceInput =
    formInputs[8];


  const price =
    Number(
      priceInput?.value || 0
    );


  const taxes =
    price * 0.08;


  const total =
    price + taxes;


  generatedTaxes =
    taxes.toFixed(2);


  generatedTotal =
    total.toFixed(2);


  selectedCurrency =
    getCurrency();

}


/* =========================================================
   GENERATE AUTOMATIC VALUES
========================================================= */

function generateAutomaticValues() {

  generatedGate =
    generateGate();


  generatedSeat =
    generateSeat();


  generatedSequence =
    generateSequence();


  generatedTrackingNumber =
    "";


  generatedDuration =
    generateDuration();


  calculateAmounts();

}


/* =========================================================
   WRAPPING FIELDS
========================================================= */

function isWrappingField(index) {

  return (

    index === 0 ||

    index === 1 ||

    index === 2 ||

    index === 3

  );

}


/* =========================================================
   DISPLAY VALUE
========================================================= */

function getDisplayValue(
  index
) {

  const input =
    formInputs[index];


  if (!input) {

    return "";

  }


  let value =
    input.value || "";


  if (
    index === 0 ||
    index === 2 ||
    index === 3
  ) {

    value =
      value.toUpperCase();

  }


  if (index === 8) {

    const symbol =
      currencySymbols[
        selectedCurrency
      ] || "$";


    value =
      `${symbol}${Number(
        value || 0
      ).toFixed(2)}`;

  }


  return value;

}


/* =========================================================
   AUTOMATIC VALUE
========================================================= */

function getAutomaticValue(
  index
) {

  if (index === 6) {

    return generatedGate;

  }


  if (index === 7) {

    return generatedSeat;

  }


  if (index === 9) {

    return generatedTaxes;

  }


  if (index === 10) {

    return generatedSequence;

  }


  if (index === 11) {

    return generatedTotal;

  }


  if (index === 12) {

    return generatedTrackingNumber;

  }


  if (index === 13) {

    return generatedDuration;

  }


  return "";

}


/* =========================================================
   CREATE TEXT ELEMENT
========================================================= */

function createTextElement(
  key,
  value
) {

  const position =
    textPositions[key];


  if (!position) {

    return null;

  }


  const element =
    document.createElement(
      "div"
    );


  element.className =
    "pdf-value";


  element.dataset.key =
    key;


  element.textContent =
    value || "";


  element.style.position =
    "absolute";


  element.style.left =
    `${position.left}%`;


  element.style.top =
    `${position.top}%`;


  element.style.width =
    `${position.width}%`;


  element.style.color =
    documentTextColor;


  element.style.fontFamily =
    documentFont;


  element.style.lineHeight =
    documentLineHeight;


  element.style.paddingTop =
    `${documentPaddingTop}px`;


  element.style.boxSizing =
    "border-box";


  return element;

}


/* =========================================================
   UPDATE DOCUMENT VALUES
========================================================= */

function updateDocumentValues() {

  if (!pdf) {

    return;

  }


  const values =
    pdf.querySelectorAll(
      ".pdf-value"
    );


  values.forEach(
    element => {

      const key =
        element.dataset.key;


      if (!key) {

        return;

      }


      let value =
        "";


      const mapping = {

        name:
          getDisplayValue(0),

        name2:
          getDisplayValue(0),

        boardingPass:
          "BOARDING PASS",

        boardingPass2:
          "BOARDING PASS",

        from:
          getDisplayValue(2),

        from2:
          getDisplayValue(2),

        to:
          getDisplayValue(3),

        to2:
          getDisplayValue(3),

        date:
          getDisplayValue(4),

        date2:
          getDisplayValue(4),

        time:
          getDisplayValue(5),

        time2:
          getDisplayValue(5),

        gate:
          generatedGate,

        gate2:
          generatedGate,

        seat:
          generatedSeat,

        seat2:
          generatedSeat,

        adult:
          getDisplayValue(1),

        taxes:
          `${currencySymbols[selectedCurrency] || "$"}${generatedTaxes}`,

        amount:
          getDisplayValue(8),

        total:
          `${currencySymbols[selectedCurrency] || "$"}${generatedTotal}`,

        trackingNumber1:
          generatedTrackingNumber,

        trackingNumber2:
          generatedTrackingNumber

      };


      value =
        mapping[key] || "";


      element.textContent =
        value;

    }
  );

}


/* =========================================================
   BUILD DOCUMENT
========================================================= */

function buildDocument() {

  if (!pdf) {

    return;

  }


  pdf
    .querySelectorAll(
      ".pdf-value"
    )
    .forEach(
      element =>
        element.remove()
    );


  Object.keys(
    textPositions
  ).forEach(
    key => {

      let value =
        "";


      if (
        key === "boardingPass" ||
        key === "boardingPass2"
      ) {

        value =
          "BOARDING PASS";

      }


      const element =
        createTextElement(
          key,
          value
        );


      if (element) {

        pdf.appendChild(
          element
        );

      }

    }
  );


  updateDocumentValues();

}


/* =========================================================
   UPPERCASE INPUTS
========================================================= */

function setupUppercaseInputs() {

  [0, 2, 3]
    .forEach(
      index => {

        const input =
          formInputs[index];


        if (!input) {

          return;

        }


        input.addEventListener(
          "input",
          () => {

            input.value =
              input.value.toUpperCase();


            updateDocumentValues();

          }
        );

      }
    );

}


/* =========================================================
   WATERMARK
========================================================= */

function removeWatermark() {

  if (!pdf) {

    return;

  }


  pdf
    .querySelectorAll(
      ".bedspread-document-watermark"
    )
    .forEach(
      element =>
        element.remove()
    );

}


/* =========================================================
   ADD WATERMARK
========================================================= */

function addWatermark() {

  if (!pdf) {

    return;

  }


  removeWatermark();


  for (
    let row = 0;
    row < 5;
    row++
  ) {

    for (
      let column = 0;
      column < 3;
      column++
    ) {

      const watermark =
        document.createElement(
          "div"
        );


      watermark.className =
        "bedspread-document-watermark";


      watermark.textContent =
        "TEST / FREE";


      watermark.style.position =
        "absolute";


      watermark.style.left =
        `${10 + column * 34}%`;


      watermark.style.top =
        `${8 + row * 21}%`;


      watermark.style.transform =
        "rotate(-30deg)";


      watermark.style.pointerEvents =
        "none";


      pdf.appendChild(
        watermark
      );

    }

  }

}


/* =========================================================
   WATERMARK STATE
========================================================= */

function updateWatermark() {

  removeWatermark();


  if (
    bedspreadWatermarkEnabled
  ) {

    addWatermark();

  }

}


/* =========================================================
   CREATE BOARDING PASS
========================================================= */

async function createBoardingPass() {

  if (!bedspreadForm) {

    return;

  }


  generateAutomaticValues();

  updateDocumentValues();


  const data = {

    name:
      formInputs[0]?.value || "",

    class:
      formInputs[1]?.value || "",

    from:
      formInputs[2]?.value || "",

    to:
      formInputs[3]?.value || "",

    date:
      formInputs[4]?.value || "",

    time:
      formInputs[5]?.value || "",

    gate:
      generatedGate,

    seat:
      generatedSeat,

    price:
      Number(
        formInputs[8]?.value || 0
      ),

    taxes:
      Number(
        generatedTaxes
      ),

    sequence:
      generatedSequence,

    total:
      Number(
        generatedTotal
      ),

    duration:
      generatedDuration,

    currency:
      selectedCurrency

  };


  try {

    const response =
      await fetch(
        `${API_URL}/boardingPass`,
        {

          method:
            "POST",

          headers:
            authHeaders(),

          body:
            JSON.stringify(
              data
            )

        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Unable to create boarding pass"
      );

    }


    if (
      result.boardingPass
    ) {

      generatedTrackingNumber =
        result.boardingPass.trackingNumber;

    }


    bedspreadWatermarkEnabled =
      true;


    updateDocumentValues();

    updateWatermark();


    if (
      generatedDocument
    ) {

      generatedDocument.style.display =
        "";

    }


    await loadBoardingPasses();


    const createdPass =
      savedBoardingPasses.find(
        pass =>
          pass.trackingNumber ===
          generatedTrackingNumber
      );


    if (createdPass) {

      selectBoardingPass(
        createdPass
      );

    }


    await loadWallet();


    if (
      generatedDocument
    ) {

      generatedDocument.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  }

  catch (error) {

    alert(
      error.message ||
      "Unable to create boarding pass."
    );

  }

}


/* =========================================================
   FORM SUBMIT
========================================================= */

if (bedspreadForm) {

  bedspreadForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      await createBoardingPass();

    }
  );

}


/* =========================================================
   EDIT BUTTON
========================================================= */

if (editButton) {

  editButton.addEventListener(
    "click",
    () => {

      if (
        generatedDocument
      ) {

        generatedDocument.style.display =
          "none";

      }


      if (bedspreadForm) {

        bedspreadForm.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    }
  );

}


/* =========================================================
   OPEN DOWNLOAD MODAL
========================================================= */

if (downloadButton) {

  downloadButton.addEventListener(
    "click",
    () => {

      if (!generatedTrackingNumber) {

        return;

      }


      if (downloadModal) {

        downloadModal.style.display =
          "flex";

      }

    }
  );

}


/* =========================================================
   CLOSE DOWNLOAD MODAL
========================================================= */

function closeDownloadModal() {

  if (downloadModal) {

    downloadModal.style.display =
      "none";

  }

}


if (closeModal) {

  closeModal.addEventListener(
    "click",
    closeDownloadModal
  );

}


if (modalOverlay) {

  modalOverlay.addEventListener(
    "click",
    closeDownloadModal
  );

}


/* =========================================================
   FORMAT MODAL
========================================================= */

function createFormatModal(
  downloadFunction
) {

  const existing =
    document.getElementById(
      "formatModal"
    );


  if (existing) {

    existing.remove();

  }


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "formatModal";


  overlay.style.position =
    "fixed";


  overlay.style.inset =
    "0";


  overlay.style.background =
    "rgba(0,0,0,0.5)";


  overlay.style.display =
    "flex";


  overlay.style.alignItems =
    "center";


  overlay.style.justifyContent =
    "center";


  overlay.style.zIndex =
    "99999";


  const box =
    document.createElement(
      "div"
    );


  box.style.background =
    "#fff";


  box.style.padding =
    "25px";


  box.style.borderRadius =
    "10px";


  box.style.textAlign =
    "center";


  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    "Choose Format";


  const jpgButton =
    document.createElement(
      "button"
    );


  jpgButton.textContent =
    "JPG";


  const pdfButton =
    document.createElement(
      "button"
    );


  pdfButton.textContent =
    "PDF";


  const closeButton =
    document.createElement(
      "button"
    );


  closeButton.textContent =
    "Cancel";


  box.appendChild(
    title
  );


  box.appendChild(
    jpgButton
  );


  box.appendChild(
    pdfButton
  );


  box.appendChild(
    closeButton
  );


  overlay.appendChild(
    box
  );


  document.body.appendChild(
    overlay
  );


  closeButton.onclick =
    () => overlay.remove();


  jpgButton.onclick =
    async () => {

      overlay.remove();

      await downloadFunction(
        "jpg"
      );

    };


  pdfButton.onclick =
    async () => {

      overlay.remove();

      await downloadFunction(
        "pdf"
      );

    };

}


/* =========================================================
   CREATE DOCUMENT CANVAS
========================================================= */

async function createDocumentCanvas(
  includeWatermark
) {

  if (!pdf) {

    return null;

  }


  const image =
    pdf.querySelector(
      "img"
    );


  if (!image) {

    return null;

  }


  const canvas =
    document.createElement(
      "canvas"
    );


  const width =
    image.naturalWidth ||
    image.width;


  const height =
    image.naturalHeight ||
    image.height;


  canvas.width =
    width;


  canvas.height =
    height;


  const context =
    canvas.getContext(
      "2d"
    );


  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );


  const values =
    pdf.querySelectorAll(
      ".pdf-value"
    );


  const pdfRect =
    pdf.getBoundingClientRect();


  values.forEach(
    element => {

      const rect =
        element.getBoundingClientRect();


      const left =
        (
          rect.left -
          pdfRect.left
        ) *
        (
          width /
          pdfRect.width
        );


      const top =
        (
          rect.top -
          pdfRect.top
        ) *
        (
          height /
          pdfRect.height
        );


      const elementWidth =
        rect.width *
        (
          width /
          pdfRect.width
        );


      const elementHeight =
        rect.height *
        (
          height /
          pdfRect.height
        );


      const computed =
        window.getComputedStyle(
          element
        );


      let fontSize =
        parseFloat(
          computed.fontSize
        );


      fontSize *=
        width /
        pdfRect.width;


      context.fillStyle =
        computed.color ||
        documentTextColor;


      context.font =
        `${computed.fontWeight} ${fontSize}px ${documentFont}`;


      context.textBaseline =
        "top";


      context.fillText(
        element.textContent,
        left,
        top,
        elementWidth
      );

    }
  );


  if (includeWatermark) {

    context.save();


    context.globalAlpha =
      0.22;


    context.fillStyle =
      "#555";


    context.font =
      `bold ${Math.max(
        18,
        width * 0.025
      )}px Arial`;


    context.textAlign =
      "center";


    context.textBaseline =
      "middle";


    for (
      let row = 0;
      row < 5;
      row++
    ) {

      for (
        let column = 0;
        column < 3;
        column++
      ) {

        const x =
          width *
          (
            0.15 +
            column * 0.35
          );


        const y =
          height *
          (
            0.12 +
            row * 0.2
          );


        context.save();


        context.translate(
          x,
          y
        );


        context.rotate(
          -30 *
          Math.PI /
          180
        );


        context.fillText(
          "TEST / FREE",
          0,
          0
        );


        context.restore();

      }

    }


    context.restore();

  }


  return canvas;

}


/* =========================================================
   DOWNLOAD IMAGE
========================================================= */

async function downloadJPG(
  includeWatermark
) {

  const canvas =
    await createDocumentCanvas(
      includeWatermark
    );


  if (!canvas) {

    return;

  }


  const link =
    document.createElement(
      "a"
    );


  link.download =
    "bedspread-boarding-pass.jpg";


  link.href =
    canvas.toDataURL(
      "image/jpeg",
      0.95
    );


  link.click();

}


/* =========================================================
   DOWNLOAD PDF
========================================================= */

async function downloadPDF(
  includeWatermark
) {

  const canvas =
    await createDocumentCanvas(
      includeWatermark
    );


  if (!canvas) {

    return;

  }


  const imageData =
    canvas.toDataURL(
      "image/jpeg",
      0.95
    );


  const {
    jsPDF
  } =
    window.jspdf;


  const orientation =
    canvas.width >=
    canvas.height
      ? "landscape"
      : "portrait";


  const pdfDocument =
    new jsPDF({
      orientation,
      unit: "px",
      format: [
        canvas.width,
        canvas.height
      ]
    });


  pdfDocument.addImage(
    imageData,
    "JPEG",
    0,
    0,
    canvas.width,
    canvas.height
  );


  pdfDocument.save(
    "bedspread-boarding-pass.pdf"
  );

}


/* =========================================================
   DOWNLOAD
========================================================= */

async function downloadBoardingPass(
  format,
  includeWatermark
) {

  if (
    format === "jpg"
  ) {

    await downloadJPG(
      includeWatermark
    );

    return;

  }


  if (
    format === "pdf"
  ) {

    await downloadPDF(
      includeWatermark
    );

  }

}


/* =========================================================
   FREE DOWNLOAD
========================================================= */

if (downloadFree) {

  downloadFree.addEventListener(
    "click",
    () => {

      closeDownloadModal();


      bedspreadWatermarkEnabled =
        true;


      updateWatermark();


      createFormatModal(
        format =>
          downloadBoardingPass(
            format,
            true
          )
      );

    }
  );

}


/* =========================================================
   CLEAN DOWNLOAD
========================================================= */

if (downloadClean) {

  downloadClean.addEventListener(
    "click",
    async () => {

      closeDownloadModal();


      if (
        !generatedTrackingNumber
      ) {

        return;

      }


      try {

        const response =
          await fetch(
            `${API_URL}/boardingPass/${encodeURIComponent(
              generatedTrackingNumber
            )}/upgrade`,
            {

              method:
                "PATCH",

              headers:
                authHeaders()

            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Unable to upgrade boarding pass."
          );

        }


        bedspreadWatermarkEnabled =
          false;


        updateWatermark();


        await loadWallet();

        await loadBoardingPasses();


        createFormatModal(
          format =>
            downloadBoardingPass(
              format,
              false
            )
        );

      }

      catch (error) {

        alert(
          error.message ||
          "Unable to upgrade boarding pass."
        );

      }

    }
  );

}


/* =========================================================
   LOAD SAVED BOARDING PASSES
========================================================= */

async function loadBoardingPasses() {

  if (!createdFlights) {

    return;

  }


  try {

    const response =
      await fetch(
        `${API_URL}/boardingPass/mine`,
        {
          headers:
            authHeaders()
        }
      );


    if (!response.ok) {

      throw new Error(
        "Unable to load boarding passes."
      );

    }


    const result =
      await response.json();


    savedBoardingPasses =
      result.boardingPasses ||
      result ||
      [];


    renderBoardingPasses();

  }

  catch (error) {

    console.error(
      "Boarding pass loading failed:",
      error
    );

  }

}


/* =========================================================
   RENDER SAVED BOARDING PASSES
========================================================= */

function renderBoardingPasses() {

  if (!createdFlights) {

    return;

  }


  createdFlights.innerHTML =
    "";


  if (
    savedBoardingPasses.length === 0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.textContent =
      "No boarding passes created yet.";


    createdFlights.appendChild(
      empty
    );


    return;

  }


  savedBoardingPasses.forEach(
    pass => {

      const item =
        document.createElement(
          "button"
        );


      item.type =
        "button";


      item.className =
        "created-flight-item";


      const name =
        pass.name ||
        "Unnamed Passenger";


      const tracking =
        pass.trackingNumber ||
        "";


      const status =
        pass.currentStatus ||
        "Processing";


      item.innerHTML = `

        <div>

          <strong>
            ${escapeHTML(name)}
          </strong>

          <small>
            ${escapeHTML(tracking)}
          </small>

        </div>

        <span>
          ${escapeHTML(status)}
        </span>

      `;


      item.addEventListener(
        "click",
        () => {

          selectBoardingPass(
            pass
          );

        }
      );


      createdFlights.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   SHOW CREATE VIEW
========================================================= */

function showCreateBoardingPassView() {

  if (createFlightView) {

    createFlightView.style.display =
      "";

  }


  if (selectedFlightView) {

    selectedFlightView.style.display =
      "none";

  }

}


/* =========================================================
   SHOW SELECTED VIEW
========================================================= */

function showSelectedBoardingPassView() {

  if (createFlightView) {

    createFlightView.style.display =
      "none";

  }


  if (selectedFlightView) {

    selectedFlightView.style.display =
      "";

  }

}


/* =========================================================
   SELECT BOARDING PASS
========================================================= */

function selectBoardingPass(
  pass
) {

  if (!pass) {

    return;

  }


  selectedBoardingPass =
    pass;


  selectedFlightName &&
    (
      selectedFlightName.textContent =
        pass.name ||
        "Unnamed Passenger"
    );


  selectedFlightTracking &&
    (
      selectedFlightTracking.textContent =
        pass.trackingNumber ||
        ""
    );


  profileClass &&
    (
      profileClass.value =
        pass.class ||
        ""
    );


  profileFrom &&
    (
      profileFrom.value =
        pass.from ||
        ""
    );


  profileTo &&
    (
      profileTo.value =
        pass.to ||
        ""
    );


  profileDate &&
    (
      profileDate.value =
        pass.date ||
        ""
    );


  profileTime &&
    (
      profileTime.value =
        pass.time ||
        ""
    );


  profileDuration &&
    (
      profileDuration.value =
        pass.duration ||
        ""
    );


  profileGate &&
    (
      profileGate.value =
        pass.gate ||
        ""
    );


  profileSeat &&
    (
      profileSeat.value =
        pass.seat ||
        ""
    );


  profileSequence &&
    (
      profileSequence.value =
        pass.sequence ||
        ""
    );


  profilePrice &&
    (
      profilePrice.value =
        pass.price ??
        ""
    );


  profileTaxes &&
    (
      profileTaxes.value =
        pass.taxes ??
        ""
    );


  profileTotal &&
    (
      profileTotal.value =
        pass.total ??
        ""
    );


  profileTrackingNumber &&
    (
      profileTrackingNumber.value =
        pass.trackingNumber ||
        ""
    );


  if (flightStatusSelect) {

    flightStatusSelect.value =
      pass.currentStatus ||
      "Processing";

  }


  bedspreadWatermarkEnabled =
    pass.watermarkEnabled !== false;


  loadPassIntoGenerator(
    pass
  );


  updateWatermark();


  showSelectedBoardingPassView();

}


/* =========================================================
   LOAD SAVED PASS INTO GENERATOR
========================================================= */

function loadPassIntoGenerator(
  pass
) {

  if (!pass) {

    return;

  }


  if (formInputs[0]) {

    formInputs[0].value =
      pass.name ||
      "";

  }


  if (formInputs[1]) {

    formInputs[1].value =
      pass.class ||
      "";

  }


  if (formInputs[2]) {

    formInputs[2].value =
      pass.from ||
      "";

  }


  if (formInputs[3]) {

    formInputs[3].value =
      pass.to ||
      "";

  }


  if (formInputs[4]) {

    formInputs[4].value =
      pass.date ||
      "";

  }


  if (formInputs[5]) {

    formInputs[5].value =
      pass.time ||
      "";

  }


  if (formInputs[8]) {

    formInputs[8].value =
      pass.price ??
      "";

  }


  if (formInputs[14]) {

    formInputs[14].value =
      pass.currency ||
      "USD";

  }


  generatedGate =
    pass.gate ||
    "";


  generatedSeat =
    pass.seat ||
    "";


  generatedSequence =
    pass.sequence ||
    "";


  generatedTrackingNumber =
    pass.trackingNumber ||
    "";


  generatedTaxes =
    Number(
      pass.taxes || 0
    ).toFixed(2);


  generatedTotal =
    Number(
      pass.total || 0
    ).toFixed(2);


  generatedDuration =
    pass.duration ||
    "";


  selectedCurrency =
    pass.currency ||
    "USD";


  updateDocumentValues();


  if (
    generatedDocument
  ) {

    generatedDocument.style.display =
      "";

  }

}


/* =========================================================
   NEW BOARDING PASS
========================================================= */

if (newFlightBtn) {

  newFlightBtn.addEventListener(
    "click",
    () => {

      selectedBoardingPass =
        null;


      bedspreadWatermarkEnabled =
        false;


      if (bedspreadForm) {

        bedspreadForm.reset();

      }


      generatedGate =
        "";

      generatedSeat =
        "";

      generatedSequence =
        "";

      generatedTrackingNumber =
        "";

      generatedTaxes =
        "";

      generatedTotal =
        "";

      generatedDuration =
        "";

      selectedCurrency =
        "USD";


      updateDocumentValues();

      removeWatermark();


      if (
        generatedDocument
      ) {

        generatedDocument.style.display =
          "none";

      }


      showCreateBoardingPassView();


      if (bedspreadForm) {

        bedspreadForm.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    }
  );

}


/* =========================================================
   CHANGE STATUS
========================================================= */

if (changeFlightStatusBtn) {

  changeFlightStatusBtn.addEventListener(
    "click",
    async () => {

      if (
        !selectedBoardingPass
      ) {

        return;

      }


      const status =
        flightStatusSelect?.value ||
        "Processing";


      try {

        const response =
          await fetch(
            `${API_URL}/boardingPass/${encodeURIComponent(
              selectedBoardingPass.trackingNumber
            )}/status`,
            {

              method:
                "PATCH",

              headers:
                authHeaders(),

              body:
                JSON.stringify({
                  status
                })

            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Unable to change status."
          );

        }


        await loadBoardingPasses();


        const updatedPass =
          savedBoardingPasses.find(
            pass =>
              pass.trackingNumber ===
              selectedBoardingPass.trackingNumber
          );


        if (updatedPass) {

          selectBoardingPass(
            updatedPass
          );

        }


        alert(
          "Boarding pass status updated."
        );

      }

      catch (error) {

        alert(
          error.message ||
          "Unable to change status."
        );

      }

    }
  );

}


/* =========================================================
   TRACK BOARDING PASS
========================================================= */

if (trackFlightBtn) {

  trackFlightBtn.addEventListener(
    "click",
    () => {

      if (
        !selectedBoardingPass ||
        !selectedBoardingPass.trackingNumber
      ) {

        return;

      }


      const trackingNumber =
        encodeURIComponent(
          selectedBoardingPass.trackingNumber
        );


      window.open(
        `https://travellnest.com/?tracking=${trackingNumber}`,
        "_blank"
      );

    }
  );

}


/* =========================================================
   SELECTED PASS WATERMARK / CLEAN ACTION
========================================================= */

if (flightWatermarkAction) {

  flightWatermarkAction.addEventListener(
    "click",
    async () => {

      if (
        !selectedBoardingPass
      ) {

        return;

      }


      if (
        selectedBoardingPass.watermarkEnabled ===
        false
      ) {

        createFormatModal(
          format =>
            downloadBoardingPass(
              format,
              false
            )
        );


        return;

      }


      try {

        const response =
          await fetch(
            `${API_URL}/boardingPass/${encodeURIComponent(
              selectedBoardingPass.trackingNumber
            )}/upgrade`,
            {

              method:
                "PATCH",

              headers:
                authHeaders()

            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Unable to upgrade boarding pass."
          );

        }


        await loadWallet();

        await loadBoardingPasses();


        const updatedPass =
          savedBoardingPasses.find(
            pass =>
              pass.trackingNumber ===
              selectedBoardingPass.trackingNumber
          );


        if (updatedPass) {

          selectBoardingPass(
            updatedPass
          );

        }


        createFormatModal(
          format =>
            downloadBoardingPass(
              format,
              false
            )
        );

      }

      catch (error) {

        alert(
          error.message ||
          "Unable to upgrade boarding pass."
        );

      }

    }
  );

}


/* =========================================================
   PROFILE DOWNLOAD
========================================================= */

if (selectedFlightView) {

  selectedFlightView.addEventListener(
    "click",
    event => {

      const target =
        event.target;


      if (
        target.dataset?.downloadBoardingPass !==
        "true"
      ) {

        return;

      }


      if (
        !selectedBoardingPass
      ) {

        return;

      }


      loadPassIntoGenerator(
        selectedBoardingPass
      );


      createFormatModal(
        format =>
          downloadBoardingPass(
            format,
            selectedBoardingPass.watermarkEnabled !==
              false
          )
      );

    }
  );

}


/* =========================================================
   NAVBAR LOGOUT
========================================================= */

if (navbarLogout) {

  navbarLogout.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "token"
      );


      window.location.href =
        "login.html";

    }
  );

}


/* =========================================================
   NAVBAR TOGGLER
========================================================= */

if (navbarToggler) {

  navbarToggler.addEventListener(
    "click",
    () => {

      if (authNav) {

        authNav.classList.toggle(
          "show"
        );

      }

    }
  );

}


/* =========================================================
   ESCAPE MODALS
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeDownloadModal();


      const formatModal =
        document.getElementById(
          "formatModal"
        );


      if (formatModal) {

        formatModal.remove();

      }

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeBoardingPass() {

  const user =
    await loadUser();


  if (!user) {

    return;

  }


  await loadWallet();

  await loadBoardingPasses();


  buildDocument();

  setupUppercaseInputs();


  showCreateBoardingPassView();


  if (
    generatedDocument
  ) {

    generatedDocument.style.display =
      "none";

  }

}


/* =========================================================
   START
========================================================= */

initializeBoardingPass();