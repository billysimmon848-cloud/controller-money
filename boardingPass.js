/* =========================================================
   BOARDING PASS GENERATOR
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
  "https://api.justdoks.com/api";


/* =========================================================
   DOCUMENT STYLING
========================================================= */

const documentTextColor =
  "#222";

const documentFont =
  "Arial";

const documentLineHeight =
  1.15;

const documentPaddingTop =
  1;


/*
  Base font size for generated/downloaded
  boarding pass text.

  This is intentionally smaller than
  the old preview font.
*/

const DOCUMENT_BASE_FONT_SIZE =
  40;


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
   OLD DOWNLOAD MODAL
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
   MANAGEMENT
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
   WATERMARK / DOWNLOAD
========================================================= */

const flightWatermarkAction =
  document.getElementById(
    "flightWatermarkAction"
  );

const profileDownloadBtn =
  document.getElementById(
    "profileDownloadBtn"
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

const classInput =
  document.getElementById(
    "class"
  );


/*
  INPUT ORDER

  0 = passenger name
  1 = class
  2 = from
  3 = to
  4 = date
  5 = time
  6 = duration
  7 = currency
  8 = price
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
  0;

let generatedTotal =
  0;

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
   CURRENCY
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
   DOCUMENT POSITIONS
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


  /*
    CLASS - FIRST POSITION
  */

  boardingPass: {
    left: 48.8,
    top: 19.4,
    width: 25
  },


  /*
    CLASS - SECOND POSITION
  */

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


  /*
    CLASS / PASSENGER CATEGORY
  */

  taxes: {
    left: 80.5,
    top: 30.5,
    width: 17
  },

  amount: {
    left: 80,
    top: 27,
    width: 15
  },

  total: {
    left: 79.9,
    top: 33,
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
  },

  sequence: {
    left: 46,
    top: 79.6,
    width: 14
  }

};


/* =========================================================
   AUTH
========================================================= */

function getToken() {

  return (
    localStorage.getItem(
      "token"
    ) ||
    localStorage.getItem(
      "authToken"
    )
  );

}


function authHeaders() {

  const token =
    getToken();

  const headers = {
    "Content-Type":
      "application/json"
  };

  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }

  return headers;

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
   RANDOM VALUES
========================================================= */

function generateGate() {

  const gates = [
    "A01",
    "A02",
    "A03",
    "B01",
    "B02",
    "B03",
    "C01",
    "C02",
    "C03",
    "D01",
    "D02",
    "D03"
  ];

  return (
    gates[
    Math.floor(
      Math.random() *
      gates.length
    )
    ]
  );

}


function generateSeat() {

  const number =
    Math.floor(
      1 +
      Math.random() *
      30
    );

  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ];

  const letter =
    letters[
    Math.floor(
      Math.random() *
      letters.length
    )
    ];

  return `${number}${letter}`;

}


function generateSequence() {

  return `SEQ. ${Math.floor(
    1000 +
    Math.random() *
    9000
  )
    }`;

}


/* =========================================================
   FORM VALUES
========================================================= */

function getClassValue() {

  if (!classInput) {
    return "";
  }

  return String(
    classInput.value || ""
  ).trim();

}


function getCurrency() {

  if (!formInputs[7]) {
    return "USD";
  }

  return (
    formInputs[7].value ||
    "USD"
  );

}


/* =========================================================
   DISPLAY VALUE
========================================================= */

function getDisplayValue(
  value
) {

  return String(
    value ?? ""
  )
    .trim()
    .toUpperCase();

}


/* =========================================================
   CURRENCY FORMATTING
========================================================= */

function formatMoney(
  amount,
  currency
) {

  const symbol =
    currencySymbols[
    currency
    ] ||
    currency;

  const number =
    Number(amount) || 0;

  return `${symbol}${number.toFixed(2)}`;

}


/* =========================================================
   CALCULATE AMOUNTS
========================================================= */

function calculateAmounts() {

  const price =
    Number(
      formInputs[8]?.value
    ) || 0;

  const taxes =
    price * 0.08;

  const total =
    price + taxes;

  generatedTaxes =
    taxes;

  generatedTotal =
    total;

  return {
    price,
    taxes,
    total
  };

}


/* =========================================================
   AUTOMATIC VALUES
========================================================= */

function getAutomaticValue(
  index
) {

  if (index === 0) {

    return getDisplayValue(
      formInputs[0]?.value
    );

  }

  if (index === 1) {

    return getClassValue();

  }

  if (index === 2) {

    return getDisplayValue(
      formInputs[2]?.value
    );

  }

  if (index === 3) {

    return getDisplayValue(
      formInputs[3]?.value
    );

  }

  if (index === 4) {

    return formInputs[4]?.value || "";

  }

  if (index === 5) {

    return formInputs[5]?.value || "";

  }

  if (index === 6) {

    return formInputs[6]?.value || "";

  }

  return "";

}


/* =========================================================
   UPDATE DOCUMENT VALUES
========================================================= */

function updateDocumentValues() {

  if (!pdf) {
    return;
  }


  const name =
    getDisplayValue(
      formInputs[0]?.value
    );


  const selectedClass =
    getClassValue();


  const from =
    getDisplayValue(
      formInputs[2]?.value
    );


  const to =
    getDisplayValue(
      formInputs[3]?.value
    );


  const date =
    formInputs[4]?.value ||
    "";


  const time =
    formInputs[5]?.value ||
    "";


  const currency =
    getCurrency();


  const price =
    Number(
      formInputs[8]?.value
    ) || 0;


  /*
    Make sure the amount values are
    current before drawing them.
  */

  const taxes =
    Number(
      generatedTaxes
    ) || 0;


  const total =
    Number(
      generatedTotal
    ) || (
      price +
      taxes
    );


  const values = {

    name:
      name,

    name2:
      name,


    /*
      CLASS
    */

    boardingPass:
      selectedClass,

    boardingPass2:
      selectedClass,


    from:
      from,

    from2:
      from,


    to:
      to,

    to2:
      to,


    date:
      date,

    date2:
      date,


    time:
      time,

    time2:
      time,


    gate:
      generatedGate,

    gate2:
      generatedGate,


    seat:
      generatedSeat,

    seat2:
      generatedSeat,

    /*
      PRICE
    */

    amount:
      formatMoney(
        price,
        currency
      ),


    /*
      TAX
    */

    taxes:
      formatMoney(
        taxes,
        currency
      ),


    /*
      TOTAL
    */

    total:
      formatMoney(
        total,
        currency
      ),


    /*
      TRACKING NUMBER
    */

    trackingNumber1:
      generatedTrackingNumber,

    trackingNumber2:
      generatedTrackingNumber,

    sequence:
      generatedSequence,

  };


  Object.keys(
    textPositions
  ).forEach(
    function (key) {

      const element =
        pdf.querySelector(
          `.pdf-value[data-field="${key}"]`
        );


      if (!element) {
        return;
      }


      element.textContent =
        values[key] ?? "";

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


  /*
    IMPORTANT:

    DO NOT use:
      pdf.innerHTML = "";

    The original boarding-pass image
    already exists inside #pdf.

    We only remove the text elements
    that this script previously created.
  */

  pdf
    .querySelectorAll(
      ".pdf-value"
    )
    .forEach(
      function (element) {

        element.remove();

      }
    );


  /*
    Make sure the original card image
    stays behind everything.
  */

  const background =
    pdf.querySelector(
      "img"
    );


  if (background) {

    background.style.position =
      "absolute";

    background.style.left =
      "0";

    background.style.top =
      "0";

    background.style.width =
      "100%";

    background.style.height =
      "100%";

    background.style.objectFit =
      "fill";

    background.style.zIndex =
      "0";

  }


  /*
    Add document text.
  */

  Object.keys(
    textPositions
  ).forEach(
    function (key) {

      const position =
        textPositions[key];


      const element =
        document.createElement(
          "div"
        );


      element.className =
        "pdf-value";


      element.dataset.field =
        key;


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


      element.style.fontSize =
        `${DOCUMENT_BASE_FONT_SIZE}px`;


      element.style.lineHeight =
        documentLineHeight;


      element.style.fontWeight =
        "600";


      element.style.whiteSpace =
        "nowrap";


      element.style.overflow =
        "hidden";


      element.style.textOverflow =
        "clip";


      element.style.paddingTop =
        `${documentPaddingTop}px`;


      element.style.boxSizing =
        "border-box";


      element.style.pointerEvents =
        "none";


      element.style.zIndex =
        "5";


      pdf.appendChild(
        element
      );

    }
  );


  updateDocumentValues();

}


/* =========================================================
   WATERMARK
========================================================= */

function createWatermark() {

  const existing =
    pdf?.querySelector(
      ".boarding-pass-watermark"
    );

  if (existing) {
    existing.remove();
  }


  if (
    !pdf ||
    !bedspreadWatermarkEnabled
  ) {
    return;
  }


  const watermark =
    document.createElement(
      "div"
    );


  watermark.className =
    "boarding-pass-watermark";


  watermark.style.position =
    "absolute";


  watermark.style.inset =
    "0";


  watermark.style.display =
    "grid";


  watermark.style.gridTemplateColumns =
    "repeat(5, 1fr)";


  watermark.style.gridTemplateRows =
    "repeat(3, 1fr)";


  watermark.style.pointerEvents =
    "none";


  watermark.style.zIndex =
    "20";


  for (
    let i = 0;
    i < 15;
    i++
  ) {

    const item =
      document.createElement(
        "div"
      );


    item.textContent =
      "TEST / FREE";


    item.style.display =
      "flex";


    item.style.alignItems =
      "center";


    item.style.justifyContent =
      "center";


    item.style.fontFamily =
      "Arial";


    item.style.fontSize =
      "16px";


    item.style.fontWeight =
      "700";


    item.style.transform =
      "rotate(-25deg)";


    item.style.opacity =
      "0.16";


    item.style.whiteSpace =
      "nowrap";


    watermark.appendChild(
      item
    );

  }


  pdf.appendChild(
    watermark
  );

}


/* =========================================================
   CREATE DOCUMENT
========================================================= */

function createDocument() {

  buildDocument();

  createWatermark();

}

/* =========================================================
   CANVAS DOCUMENT
========================================================= */

function createDocumentCanvas(
  includeWatermark
) {

  return new Promise(
    function (resolve, reject) {

      if (!pdf) {

        reject(
          new Error(
            "Boarding pass document not found."
          )
        );

        return;

      }


      /*
        Get the ORIGINAL boarding-pass image.
      */

      const background =
        pdf.querySelector(
          "img"
        );


      if (!background) {

        reject(
          new Error(
            "Boarding pass background image not found."
          )
        );

        return;

      }


      /*
        Wait for the image if necessary.
      */

      function drawDocument() {

        if (
          !background.naturalWidth ||
          !background.naturalHeight
        ) {

          reject(
            new Error(
              "Boarding pass background image has no dimensions."
            )
          );

          return;

        }


        const canvas =
          document.createElement(
            "canvas"
          );


        const width =
          background.naturalWidth;


        const height =
          background.naturalHeight;


        canvas.width =
          width;


        canvas.height =
          height;


        const ctx =
          canvas.getContext(
            "2d"
          );


        /*
          1. DRAW ORIGINAL CARD
        */

        ctx.drawImage(
          background,
          0,
          0,
          width,
          height
        );


        /*
          2. DRAW TEXT
        */

        const elements =
          pdf.querySelectorAll(
            ".pdf-value"
          );


        elements.forEach(
          function (element) {

            const field =
              element.dataset.field;


            const position =
              textPositions[field];


            if (!position) {
              return;
            }


            const text =
              element.textContent ||
              "";


            if (!text) {
              return;
            }


            /*
              Use the exact same 14px
              base size used by the document.
            */

            const fontSize = 14;


            ctx.font =
              `600 ${fontSize}px ${documentFont}`;


            ctx.fillStyle =
              documentTextColor;


            ctx.textBaseline =
              "top";


            const x =
              (
                position.left /
                100
              ) *
              width;


            const y =
              (
                position.top /
                100
              ) *
              height;


            ctx.fillText(
              text,
              x,
              y
            );

          }
        );


        /*
          3. WATERMARK
        */

        if (
          includeWatermark
        ) {

          drawCanvasWatermark(
            ctx,
            width,
            height
          );

        }


        resolve(
          canvas
        );

      }


      /*
        IMAGE ALREADY LOADED
      */

      if (
        background.complete &&
        background.naturalWidth
      ) {

        drawDocument();

        return;

      }


      /*
        IMAGE NOT LOADED YET
      */

      background.onload =
        function () {

          drawDocument();

        };


      background.onerror =
        function () {

          reject(
            new Error(
              "Unable to load boarding pass background image."
            )
          );

        };

    }
  );

}


/* =========================================================
   CANVAS WATERMARK
========================================================= */

function drawCanvasWatermark(
  ctx,
  width,
  height
) {

  ctx.save();


  ctx.globalAlpha =
    0.16;


  ctx.fillStyle =
    "#000000";


  ctx.font =
    "700 24px Arial";


  ctx.textAlign =
    "center";


  ctx.textBaseline =
    "middle";


  for (
    let row = 0;
    row < 3;
    row++
  ) {

    for (
      let col = 0;
      col < 5;
      col++
    ) {

      const x =
        (
          col +
          0.5
        ) *
        (
          width /
          5
        );


      const y =
        (
          row +
          0.5
        ) *
        (
          height /
          3
        );


      ctx.save();


      ctx.translate(
        x,
        y
      );


      ctx.rotate(
        -25 *
        Math.PI /
        180
      );


      ctx.fillText(
        "TEST / FREE",
        0,
        0
      );


      ctx.restore();

    }

  }


  ctx.restore();

}


/* =========================================================
   DOWNLOAD JPG
========================================================= */

async function downloadJPG(
  includeWatermark
) {

  const canvas =
    await createDocumentCanvas(
      includeWatermark
    );


  const link =
    document.createElement(
      "a"
    );


  link.download =
    `boarding-pass-${generatedTrackingNumber || "document"}.jpg`;


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


  if (
    typeof window.jspdf ===
    "undefined"
  ) {

    alert(
      "PDF library is not available."
    );

    return;

  }


  const {
    jsPDF
  } =
    window.jspdf;


  const imageData =
    canvas.toDataURL(
      "image/jpeg",
      0.95
    );


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
    `boarding-pass-${generatedTrackingNumber || "document"}.pdf`
  );

}


/* =========================================================
   DOWNLOAD BOARDING PASS
========================================================= */

async function downloadBoardingPass(
  format,
  includeWatermark
) {

  try {

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

      return;

    }

  } catch (error) {

    console.error(
      "DOWNLOAD BOARDING PASS ERROR:",
      error
    );

    alert(
      "Unable to download boarding pass."
    );

  }

}


/* =========================================================
   FORMAT MODAL
========================================================= */

function createFormatModal(
  includeWatermark
) {

  const existing =
    document.getElementById(
      "boardingPassFormatModal"
    );

  if (existing) {
    existing.remove();
  }


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "boardingPassFormatModal";


  overlay.style.position =
    "fixed";


  overlay.style.inset =
    "0";


  overlay.style.background =
    "rgba(0,0,0,0.65)";


  overlay.style.display =
    "flex";


  overlay.style.alignItems =
    "center";


  overlay.style.justifyContent =
    "center";


  overlay.style.zIndex =
    "99999";


  const modal =
    document.createElement(
      "div"
    );


  modal.style.width =
    "min(400px, 90%)";


  modal.style.background =
    "#ffffff";


  modal.style.borderRadius =
    "12px";


  modal.style.padding =
    "24px";


  modal.style.boxSizing =
    "border-box";


  modal.innerHTML = `

    <h3 style="
      margin:0 0 8px;
      color:#111827;
    ">
      Download Boarding Pass
    </h3>

    <p style="
      margin:0 0 20px;
      color:#6b7280;
    ">
      Choose your file format.
    </p>

    <div style="
      display:flex;
      gap:10px;
    ">

      <button
        type="button"
        id="boardingPassDownloadJPG"
        style="
          flex:1;
          padding:12px;
          border:1px solid #d1d5db;
          border-radius:8px;
          cursor:pointer;
        "
      >
        JPG
      </button>

      <button
        type="button"
        id="boardingPassDownloadPDF"
        style="
          flex:1;
          padding:12px;
          border:1px solid #d1d5db;
          border-radius:8px;
          cursor:pointer;
        "
      >
        PDF
      </button>

    </div>

    <button
      type="button"
      id="boardingPassCloseFormat"
      style="
        width:100%;
        margin-top:10px;
        padding:10px;
        border:0;
        background:transparent;
        cursor:pointer;
      "
    >
      Cancel
    </button>

  `;


  overlay.appendChild(
    modal
  );


  document.body.appendChild(
    overlay
  );


  document
    .getElementById(
      "boardingPassDownloadJPG"
    )
    ?.addEventListener(
      "click",
      async function () {

        await downloadBoardingPass(
          "jpg",
          includeWatermark
        );

        overlay.remove();

      }
    );


  document
    .getElementById(
      "boardingPassDownloadPDF"
    )
    ?.addEventListener(
      "click",
      async function () {

        await downloadBoardingPass(
          "pdf",
          includeWatermark
        );

        overlay.remove();

      }
    );


  document
    .getElementById(
      "boardingPassCloseFormat"
    )
    ?.addEventListener(
      "click",
      function () {

        overlay.remove();

      }
    );


  overlay.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        overlay
      ) {

        overlay.remove();

      }

    }
  );

}


/* =========================================================
   CREATE BOARDING PASS
========================================================= */

async function createBoardingPass(
  event
) {

  if (event) {
    event.preventDefault();
  }


  if (!bedspreadForm) {
    return;
  }


  const name =
    formInputs[0]?.value
      ?.trim() || "";


  const boardingPassType =
    getClassValue();

  const from =
    formInputs[2]?.value
      ?.trim() || "";


  const to =
    formInputs[3]?.value
      ?.trim() || "";


  const date =
    formInputs[4]?.value
      ?.trim() || "";


  const time =
    formInputs[5]?.value
      ?.trim() || "";


  const duration =
    formInputs[6]?.value
      ?.trim() || "";


  const currency =
    getCurrency();


  const price =
    Number(
      formInputs[8]?.value
    ) || 0;


  if (
    !name ||
    !boardingPassType ||
    !from ||
    !to ||
    !date ||
    !time ||
    !duration
  ) {

    alert(
      "Please complete all required fields."
    );

    return;

  }


  generatedGate =
    generateGate();


  generatedSeat =
    generateSeat();


  generatedSequence =
    generateSequence();


  generatedDuration =
    duration;


  selectedCurrency =
    currency;


  const amounts =
    calculateAmounts();


  try {

    const response =
      await fetch(
        `${API_URL}/boardingPass`,
        {
          method: "POST",
          headers:
            authHeaders(),

          body:
            JSON.stringify({

              name,

              boardingPassType,

              from,

              to,

              date,

              time,

              duration,

              currency,

              price:
                amounts.price,

              taxes:
                amounts.taxes,

              total:
                amounts.total,

              gate:
                generatedGate,

              seat:
                generatedSeat,

              sequence:
                generatedSequence

            })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to create boarding pass."
      );

    }


    generatedTrackingNumber =
      data.trackingNumber ||
      data.boardingPass
        ?.trackingNumber ||
      "";


    bedspreadWatermarkEnabled =
      true;


    createDocument();


    if (generatedDocument) {

      generatedDocument.style.display =
        "block";

    }


    await loadBoardingPasses();


    const createdPass =
      savedBoardingPasses.find(
        function (pass) {

          return (
            pass.trackingNumber ===
            generatedTrackingNumber
          );

        }
      );


    if (createdPass) {

      selectBoardingPass(
        createdPass
      );

    }


    await loadWallet();


    if (generatedDocument) {

      generatedDocument.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  } catch (error) {

    console.error(
      "CREATE BOARDING PASS ERROR:",
      error
    );

    alert(
      error.message ||
      "Unable to create boarding pass."
    );

  }

}


/* =========================================================
   LOAD BOARDING PASSES
========================================================= */

async function loadBoardingPasses() {

  try {

    const response =
      await fetch(
        `${API_URL}/boardingPass/mine`,
        {
          headers:
            authHeaders()
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load boarding passes."
      );

    }


    savedBoardingPasses =
      Array.isArray(data)
        ? data
        : (
          Array.isArray(
            data.boardingPasses
          )
            ? data.boardingPasses
            : []
        );


    renderBoardingPasses();

  } catch (error) {

    console.error(
      "LOAD BOARDING PASSES ERROR:",
      error
    );

  }

}


/* =========================================================
   RENDER BOARDING PASSES
========================================================= */

function renderBoardingPasses() {

  if (!createdFlights) {
    return;
  }


  createdFlights.innerHTML =
    "";


  if (
    savedBoardingPasses.length ===
    0
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
    function (pass) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "created-flight-item";


      const profileButton =
        document.createElement(
          "button"
        );


      profileButton.type =
        "button";


      profileButton.className =
        "created-flight-profile";


      const name =
        pass.name ||
        "Unnamed Passenger";


      const tracking =
        pass.trackingNumber ||
        "";


      const status =
        pass.currentStatus ||
        "Processing";


      profileButton.innerHTML = `

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


      profileButton.addEventListener(
        "click",
        function () {

          selectBoardingPass(
            pass
          );

        }
      );


      const deleteButton =
        document.createElement(
          "button"
        );


      deleteButton.type =
        "button";


      deleteButton.className =
        "delete-flight-btn";


      deleteButton.textContent =
        "Delete";


      deleteButton.addEventListener(
        "click",
        async function (event) {

          event.stopPropagation();


          const confirmed =
            confirm(
              `Delete boarding pass for ${name}?`
            );


          if (!confirmed) {
            return;
          }


          try {

            const response =
              await fetch(
                `${API_URL}/boardingPass/${encodeURIComponent(
                  tracking
                )}`,
                {
                  method:
                    "DELETE",

                  headers:
                    authHeaders()
                }
              );


            const data =
              await response.json();


            if (!response.ok) {

              throw new Error(
                data.message ||
                "Unable to delete boarding pass."
              );

            }


            if (
              selectedBoardingPass &&
              selectedBoardingPass.trackingNumber ===
              tracking
            ) {

              selectedBoardingPass =
                null;


              if (
                generatedDocument
              ) {

                generatedDocument.style.display =
                  "none";

              }


              showCreateBoardingPassView();

            }


            await loadBoardingPasses();

          } catch (error) {

            console.error(
              "DELETE BOARDING PASS ERROR:",
              error
            );

            alert(
              error.message ||
              "Unable to delete boarding pass."
            );

          }

        }
      );


      item.appendChild(
        profileButton
      );


      item.appendChild(
        deleteButton
      );


      createdFlights.appendChild(
        item
      );

    }
  );

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


  loadPassIntoGenerator(
    pass
  );


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


  /*
    PASSENGER
  */

  if (formInputs[0]) {

    formInputs[0].value =
      pass.name ||
      "";

  }


  /*
    CLASS

    Backend currently stores this as:
      class

    Older records may contain:
      boardingPassType
  */

  const savedClass =
    pass.class ||
    pass.boardingPassType ||
    "";


  if (classInput) {

    classInput.value =
      savedClass;

  }


  /*
    FROM
  */

  if (formInputs[2]) {

    formInputs[2].value =
      pass.from ||
      "";

  }


  /*
    TO
  */

  if (formInputs[3]) {

    formInputs[3].value =
      pass.to ||
      "";

  }


  /*
    DATE
  */

  if (formInputs[4]) {

    formInputs[4].value =
      pass.date ||
      "";

  }


  /*
    TIME
  */

  if (formInputs[5]) {

    formInputs[5].value =
      pass.time ||
      "";

  }


  /*
    DURATION
  */

  if (formInputs[6]) {

    formInputs[6].value =
      pass.duration ||
      "";

  }


  /*
    CURRENCY
  */

  if (formInputs[7]) {

    formInputs[7].value =
      pass.currency ||
      "USD";

  }


  /*
    PRICE

    This is the important part for
    profile downloads.
  */

  if (formInputs[8]) {

    formInputs[8].value =
      Number(
        pass.price
      ) || 0;

  }


  /*
    GENERATED VALUES
  */

  generatedGate =
    pass.gate ||
    generateGate();


  generatedSeat =
    pass.seat ||
    generateSeat();


  generatedSequence =
    pass.sequence ||
    generateSequence();


  generatedTrackingNumber =
    pass.trackingNumber ||
    "";


  generatedTaxes =
    Number(
      pass.taxes
    ) || 0;


  generatedTotal =
    Number(
      pass.total
    ) || 0;


  generatedDuration =
    pass.duration ||
    "";


  selectedCurrency =
    pass.currency ||
    "USD";


  /*
    WATERMARK
  */

  bedspreadWatermarkEnabled =
    pass.watermarkEnabled !==
    false;


  /*
    Rebuild the document using
    the saved profile values.
  */

  createDocument();


  if (generatedDocument) {

    generatedDocument.style.display =
      "block";

  }


  /*
    Update the right-side profile.
  */

  updateSelectedProfile(
    pass
  );

}


/* =========================================================
   UPDATE SELECTED PROFILE
========================================================= */

function updateSelectedProfile(
  pass
) {

  if (!pass) {
    return;
  }


  if (
    selectedFlightName
  ) {

    selectedFlightName.textContent =
      pass.name ||
      "Unnamed Passenger";

  }


  if (
    selectedFlightTracking
  ) {

    selectedFlightTracking.textContent =
      pass.trackingNumber ||
      "";

  }


  if (
    profileClass
  ) {

    profileClass.textContent =
      pass.boardingPassType ||
      pass.class ||
      "";

  }


  if (
    profileFrom
  ) {

    profileFrom.textContent =
      pass.from ||
      "";

  }


  if (
    profileTo
  ) {

    profileTo.textContent =
      pass.to ||
      "";

  }


  if (
    profileDate
  ) {

    profileDate.textContent =
      pass.date ||
      "";

  }


  if (
    profileTime
  ) {

    profileTime.textContent =
      pass.time ||
      "";

  }


  if (
    profileDuration
  ) {

    profileDuration.textContent =
      pass.duration ||
      "";

  }


  if (
    profileGate
  ) {

    profileGate.textContent =
      pass.gate ||
      generatedGate ||
      "";

  }


  if (
    profileSeat
  ) {

    profileSeat.textContent =
      pass.seat ||
      generatedSeat ||
      "";

  }


  if (
    profileSequence
  ) {

    profileSequence.textContent =
      pass.sequence ||
      generatedSequence ||
      "";

  }


  if (
    profilePrice
  ) {

    profilePrice.textContent =
      formatMoney(
        pass.price,
        pass.currency ||
        "USD"
      );

  }


  if (
    profileTaxes
  ) {

    profileTaxes.textContent =
      formatMoney(
        pass.taxes,
        pass.currency ||
        "USD"
      );

  }


  if (
    profileTotal
  ) {

    profileTotal.textContent =
      formatMoney(
        pass.total,
        pass.currency ||
        "USD"
      );

  }


  if (
    profileTrackingNumber
  ) {

    profileTrackingNumber.textContent =
      pass.trackingNumber ||
      "";

  }


  if (
    flightStatusSelect
  ) {

    flightStatusSelect.value =
      pass.currentStatus ||
      "Processing";

  }


  updateWatermarkAction(
    pass
  );

}


/* =========================================================
   CREATE VIEW
========================================================= */

function showCreateBoardingPassView() {

  if (
    createFlightView
  ) {

    createFlightView.style.display =
      "block";

  }


  if (
    selectedFlightView
  ) {

    selectedFlightView.style.display =
      "none";

  }

}


/* =========================================================
   SELECTED VIEW
========================================================= */

function showSelectedBoardingPassView() {

  if (
    createFlightView
  ) {

    createFlightView.style.display =
      "none";

  }


  if (
    selectedFlightView
  ) {

    selectedFlightView.style.display =
      "block";

  }

}


/* =========================================================
   NEW BOARDING PASS
========================================================= */

function startNewBoardingPass() {

  selectedBoardingPass =
    null;


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
    0;

  generatedTotal =
    0;

  generatedDuration =
    "";

  selectedCurrency =
    "USD";

  bedspreadWatermarkEnabled =
    false;


  if (
    generatedDocument
  ) {

    generatedDocument.style.display =
      "none";

  }


  showCreateBoardingPassView();

}


/* =========================================================
   UPDATE WATERMARK ACTION
========================================================= */

function updateWatermarkAction(
  pass
) {

  if (!flightWatermarkAction) {
    return;
  }


  const isClean =
    pass &&
    pass.watermarkEnabled ===
    false;


  if (isClean) {

    flightWatermarkAction.innerHTML = `

      <div>
        <strong>
          Clean Boarding Pass
        </strong>

        <span>
          Watermark removed
        </span>
      </div>

    `;

    return;

  }


  flightWatermarkAction.innerHTML = `

    <div>
      <strong>
        Remove Watermark
      </strong>

      <span>
        Upgrade for $5
      </span>
    </div>

  `;

}

/* =========================================================
   UPGRADE BOARDING PASS
========================================================= */

async function upgradeBoardingPass() {

  if (!selectedBoardingPass) {

    alert(
      "Please select a boarding pass first."
    );

    return;

  }


  if (
    selectedBoardingPass.watermarkEnabled ===
    false
  ) {

    alert(
      "This boarding pass is already clean."
    );

    return;

  }


  const confirmed =
    confirm(
      "Remove the TEST / FREE watermark for $5?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const url =
      `${API_URL}/boardingPass/${encodeURIComponent(
        selectedBoardingPass.trackingNumber
      )}/upgrade`;


    console.log(
      "UPGRADE URL:",
      url
    );


    console.log(
      "UPGRADE TRACKING:",
      selectedBoardingPass.trackingNumber
    );


    console.log(
      "UPGRADE HEADERS:",
      authHeaders()
    );


    const response =
      await fetch(
        url,
        {
          method:
            "PATCH",

          headers:
            authHeaders()
        }
      );


    console.log(
      "UPGRADE STATUS:",
      response.status
    );


    const responseText =
      await response.text();


    console.log(
      "UPGRADE RESPONSE:",
      responseText
    );


    let data = {};

    try {

      data =
        JSON.parse(
          responseText
        );

    }

    catch (parseError) {

      console.log(
        "RESPONSE WAS NOT JSON"
      );

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        `Upgrade failed with status ${response.status}.`
      );

    }


    bedspreadWatermarkEnabled =
      false;


    await loadBoardingPasses();


    const updated =
      savedBoardingPasses.find(
        function (pass) {

          return (
            pass.trackingNumber ===
            selectedBoardingPass.trackingNumber
          );

        }
      );


    if (updated) {

      selectedBoardingPass =
        updated;


      loadPassIntoGenerator(
        updated
      );

    }


    await loadWallet();


  }

  catch (error) {

    console.error(
      "UPGRADE BOARDING PASS ERROR:",
      error
    );


    alert(
      error.message ||
      "Unable to upgrade boarding pass."
    );

  }

}



/* =========================================================
   STATUS UPDATE
========================================================= */

async function updateBoardingPassStatus() {

  if (
    !selectedBoardingPass
  ) {

    alert(
      "Please select a boarding pass first."
    );

    return;

  }


  const status =
    flightStatusSelect?.value;


  if (!status) {
    return;
  }


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


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to update status."
      );

    }


    await loadBoardingPasses();


    const updated =
      savedBoardingPasses.find(
        function (pass) {

          return (
            pass.trackingNumber ===
            selectedBoardingPass.trackingNumber
          );

        }
      );


    if (updated) {

      selectedBoardingPass =
        updated;

      updateSelectedProfile(
        updated
      );

    }

  } catch (error) {

    console.error(
      "STATUS UPDATE ERROR:",
      error
    );

    alert(
      error.message ||
      "Unable to update status."
    );

  }

}


/* =========================================================
   WALLET
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


    const data =
      await response.json();


    if (!response.ok) {
      return;
    }


    const balance =
      Number(
        data.balance ??
        data.wallet?.balance ??
        0
      );


    if (
      navbarWalletBalance
    ) {

      navbarWalletBalance.textContent =
        `$${balance.toFixed(2)}`;

    }

  } catch (error) {

    console.error(
      "LOAD WALLET ERROR:",
      error
    );

  }

}


/* =========================================================
   TRACKING
========================================================= */

function openTrackingPage() {

  if (
    !selectedBoardingPass
  ) {

    alert(
      "Please select a boarding pass first."
    );

    return;

  }


  const tracking =
    selectedBoardingPass.trackingNumber;


  if (!tracking) {
    return;
  }


  window.open(
    `https://travellnest.com/flight-tracking.html?tracking=${encodeURIComponent(
      tracking
    )}`,
    "_blank"
  );

}


/* =========================================================
   EDIT BUTTON
========================================================= */

if (
  editButton
) {

  editButton.addEventListener(
    "click",
    function () {

      showCreateBoardingPassView();

    }
  );

}


/* =========================================================
   DOWNLOAD BUTTON
========================================================= */

if (
  downloadButton
) {

  downloadButton.addEventListener(
    "click",
    function () {

      const includeWatermark =
        selectedBoardingPass
          ? selectedBoardingPass.watermarkEnabled !== false
          : bedspreadWatermarkEnabled;


      createFormatModal(
        includeWatermark
      );

    }
  );

}


/* =========================================================
   PROFILE DOWNLOAD BUTTON
========================================================= */

if (
  profileDownloadBtn
) {

  profileDownloadBtn.addEventListener(
    "click",
    function () {

      if (
        !selectedBoardingPass
      ) {

        alert(
          "Please select a boarding pass first."
        );

        return;

      }


      createFormatModal(
        selectedBoardingPass.watermarkEnabled !== false
      );

    }
  );

}


/* =========================================================
   WATERMARK ACTION
========================================================= */

if (
  flightWatermarkAction
) {

  flightWatermarkAction.addEventListener(
    "click",
    function () {

      upgradeBoardingPass();

    }
  );

}


/* =========================================================
   TRACK BUTTON
========================================================= */

if (
  trackFlightBtn
) {

  trackFlightBtn.addEventListener(
    "click",
    function () {

      openTrackingPage();

    }
  );

}


/* =========================================================
   STATUS BUTTON
========================================================= */

if (
  changeFlightStatusBtn
) {

  changeFlightStatusBtn.addEventListener(
    "click",
    function () {

      updateBoardingPassStatus();

    }
  );

}


/* =========================================================
   NEW BOARDING PASS BUTTON
========================================================= */

if (
  newFlightBtn
) {

  newFlightBtn.addEventListener(
    "click",
    function () {

      startNewBoardingPass();

    }
  );

}


/* =========================================================
   FORM SUBMIT
========================================================= */

if (
  bedspreadForm
) {

  bedspreadForm.addEventListener(
    "submit",
    function (event) {

      createBoardingPass(
        event
      );

    }
  );

}


/* =========================================================
   LIVE FORM PREVIEW
========================================================= */

formInputs.forEach(
  function (input) {

    input.addEventListener(
      "input",
      function () {

        if (
          input ===
          formInputs[7]
        ) {

          selectedCurrency =
            getCurrency();

        }


        calculateAmounts();

        updateDocumentValues();

      }
    );


    input.addEventListener(
      "change",
      function () {

        if (
          input ===
          formInputs[7]
        ) {

          selectedCurrency =
            getCurrency();

        }


        calculateAmounts();

        updateDocumentValues();

      }
    );

  }
);


/* =========================================================
   OLD MODAL
========================================================= */

if (
  closeModal &&
  downloadModal
) {

  closeModal.addEventListener(
    "click",
    function () {

      downloadModal.style.display =
        "none";

    }
  );

}


if (
  modalOverlay &&
  downloadModal
) {

  modalOverlay.addEventListener(
    "click",
    function () {

      downloadModal.style.display =
        "none";

    }
  );

}


if (
  downloadFree
) {

  downloadFree.addEventListener(
    "click",
    async function () {

      if (downloadModal) {

        downloadModal.style.display =
          "none";

      }


      createFormatModal(
        true
      );

    }
  );

}


if (
  downloadClean
) {

  downloadClean.addEventListener(
    "click",
    async function () {

      if (downloadModal) {

        downloadModal.style.display =
          "none";

      }


      createFormatModal(
        false
      );

    }
  );

}


/* =========================================================
   NAVBAR LOGOUT
========================================================= */

if (
  navbarLogout
) {

  navbarLogout.addEventListener(
    "click",
    function () {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "authToken"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href =
        "login.html";

    }
  );

}


/* =========================================================
   NAVBAR TOGGLER
========================================================= */

if (
  navbarToggler &&
  authNav
) {

  navbarToggler.addEventListener(
    "click",
    function () {

      authNav.classList.toggle(
        "active"
      );

    }
  );

}


/* =========================================================
   LOAD USER
========================================================= */

async function loadUser() {

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
      return;
    }


    const data =
      await response.json();


    const user =
      data.user ||
      data;


    if (
      navbarUserName &&
      user
    ) {

      navbarUserName.textContent =
        user.name ||
        user.username ||
        user.email ||
        "";

    }

  } catch (error) {

    console.error(
      "LOAD USER ERROR:",
      error
    );

  }

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeBoardingPass() {

  createDocument();


  if (
    generatedDocument
  ) {

    generatedDocument.style.display =
      "none";

  }


  showCreateBoardingPassView();


  await loadUser();

  await loadWallet();

  await loadBoardingPasses();

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeBoardingPass();

  }
);