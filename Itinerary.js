/* =========================================================
   FLIGHT DOCUMENT GENERATOR
   ========================================================= */


/* =========================================================
   API
   ========================================================= */

const API_URL =
"https://api.justdoks.com/api";


/* =========================================================
   DOCUMENT TEXT STYLING
   ========================================================= */

const documentTextColor = '#2f5f77ef';

const passengerContinuationColor = '#222222';


const terminalFontSize = 12;

const terminalFontWeight = 500;


const timeDateFontSize = 18;

const timeDateFontWeight = 700;


const sequenceFontSize =
  terminalFontSize;

const sequenceFontWeight =
  terminalFontWeight;


const nameFontSize = 26;

const nameFontWeight =
  timeDateFontWeight;


const passengerContinuation =
  "you're ready to fly";


const passengerContinuationFontSize =
  nameFontSize;

const passengerContinuationFontWeight =
  nameFontWeight;


const documentFont = 'Arial';

const documentLineHeight = 1.15;

const documentPaddingTop = 1;


/* =========================================================
   CHARACTER LIMITS
   ========================================================= */

const airportMaxLength = 24;

const destinationMaxLength = 39;


/* =========================================================
   ELEMENTS
   ========================================================= */

const pdf =
  document.getElementById('pdf');


const flightForm =
  document.getElementById('flightForm');


const generatedDocument =
  document.getElementById('generatedDocument');


const editButton =
  document.getElementById('editButton');


const downloadButton =
  document.getElementById('downloadButton');


const downloadModal =
  document.getElementById('downloadModal');


const modalOverlay =
  document.getElementById('modalOverlay');


const closeModal =
  document.getElementById('closeModal');


const downloadJpg =
  document.getElementById('downloadJpg');


const downloadPdf =
  document.getElementById('downloadPdf');


/* =========================================================
   FLIGHT PROFILE ELEMENTS
   ========================================================= */

const flightManagement =
  document.getElementById(
    'flightManagement'
  );


const createdFlights =
  document.getElementById(
    'createdFlights'
  );


const createFlightView =
  document.getElementById(
    'createFlightView'
  );


const selectedFlightView =
  document.getElementById(
    'selectedFlightView'
  );


const newFlightBtn =
  document.getElementById(
    'newFlightBtn'
  );


const selectedFlightName =
  document.getElementById(
    'selectedFlightName'
  );


const selectedFlightTracking =
  document.getElementById(
    'selectedFlightTracking'
  );


const profileFlightNumber =
  document.getElementById(
    'profileFlightNumber'
  );


const profileFrom =
  document.getElementById(
    'profileFrom'
  );


const profileTo =
  document.getElementById(
    'profileTo'
  );


const profileDate =
  document.getElementById(
    'profileDate'
  );


const profileDeparture =
  document.getElementById(
    'profileDeparture'
  );


const profileClass =
  document.getElementById(
    'profileClass'
  );


const profileTerminal =
  document.getElementById(
    'profileTerminal'
  );


const profileSeat =
  document.getElementById(
    'profileSeat'
  );


const profileBooking =
  document.getElementById(
    'profileBooking'
  );


const profileTrackingNumber =
  document.getElementById(
    'profileTrackingNumber'
  );


const trackFlightBtn =
  document.getElementById(
    'trackFlightBtn'
  );


const flightStatusSelect =
  document.getElementById(
    'flightStatusSelect'
  );

const flightDurationInput =
  document.getElementById(
    'flightDuration'
  );


const changeFlightStatusBtn =
  document.getElementById(
    'changeFlightStatusBtn'
  );


const flightWatermarkAction =
  document.getElementById(
    'flightWatermarkAction'
  );


/* =========================================================
   FORM INPUTS
   ========================================================= */

const formInputs = [

  document.getElementById('sequenceNo'),

  document.getElementById('name'),

  document.getElementById('flightNo'),

  document.getElementById('fromCity'),

  null,

  document.getElementById('fromTerminal'),

  document.getElementById('toCity'),

  null,

  document.getElementById('group'),

  document.getElementById('seat'),

  document.getElementById('date'),

  document.getElementById('security'),

  document.getElementById('boardingAt'),

  document.getElementById('departure'),

  document.getElementById('airline'),

  document.getElementById('class'),

  document.getElementById('booking'),

  document.getElementById('securityTime'),

  document.getElementById('lowerBoarding'),

  document.getElementById('bagDrop')

];


/* =========================================================
   FIELD POSITIONS
   ========================================================= */

const fieldPositions = [

  [81, 1.6, 12],

  [3, 20.8, 34],

  [3.8, 27, 12],

  [27.5, 27, 18],

  null,

  [27.5, 31, 18],

  [51.2, 27, 18],

  null,

  [75.5, 27, 6],

  [90, 27, 6],

  [3.8, 36.5, 19],

  [27.5, 36.5, 20],

  [51.2, 36.5, 20],

  [75.5, 36.5, 20],

  [3.8, 42, 19],

  [27.5, 42, 17],

  [51.2, 42, 28],

  [60.5, 70, 10],

  [91.3, 70, 10],

  [28.5, 70, 10]

];


/* =========================================================
   FLIGHT STATE
   ========================================================= */

let createdFlight =
  null;


let selectedFlightType =
  null;


let flightWatermarkEnabled =
  false;


let flightCreated =
  false;


/* =========================================================
   FLIGHT PROFILE STATE
   ========================================================= */

let flightProfiles = [];

let selectedFlightId = null;


/* =========================================================
   RANDOM VALUE HELPERS
   ========================================================= */

let lastBooking = '';

let lastFlight = '';

let lastSequence = '';

let lastGroup = '';

let lastSeat = '';


function randomNumber(
  min,
  max
) {

  return Math.floor(
    Math.random() *
    (max - min + 1)
  ) + min;

}


function randomLetter() {

  const letters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


  return letters[
    Math.floor(
      Math.random() *
      letters.length
    )
  ];

}


/* =========================================================
   GENERATE BOOKING
   ========================================================= */

function generateBooking() {

  let value;


  do {

    value =
      randomLetter() +
      randomLetter() +
      randomNumber(
        1000,
        9999
      );

  } while (
    value === lastBooking
  );


  lastBooking =
    value;


  return value;

}


/* =========================================================
   GENERATE FLIGHT NUMBER
   ========================================================= */

function generateFlightNumber() {

  let value;


  do {

    value =
      randomLetter() +
      randomLetter() +
      randomNumber(
        1000,
        9999
      );

  } while (
    value === lastFlight
  );


  lastFlight =
    value;


  return value;

}


/* =========================================================
   GENERATE SEQUENCE NUMBER
   ========================================================= */

function generateSequenceNumber() {

  let number;


  do {

    number =
      randomNumber(
        100,
        999
      );

  } while (
    number === lastSequence
  );


  lastSequence =
    number;


  return `Seq. No. ${number}`;

}


/* =========================================================
   GENERATE GROUP
   ========================================================= */

function generateGroup() {

  let value;


  do {

    value =
      randomLetter();

  } while (
    value === lastGroup
  );


  lastGroup =
    value;


  return value;

}


/* =========================================================
   GENERATE SEAT
   ========================================================= */

function generateSeat() {

  let value;


  do {

    value =
      randomNumber(
        1,
        30
      )
        .toString()
        .padStart(
          2,
          '0'
        ) +
      randomLetter();

  } while (
    value === lastSeat
  );


  lastSeat =
    value;


  return value;

}


/* =========================================================
   GENERATE TERMINAL
   ========================================================= */

function generateTerminal() {

  return String(
    randomNumber(
      1,
      9
    )
  );

}


/* =========================================================
   CHANGE TIME
   ========================================================= */

function changeTime(
  time,
  minutes
) {

  if (!time) {

    return '';

  }


  const parts =
    time.split(':');


  if (
    parts.length < 2
  ) {

    return '';

  }


  const hours =
    Number(parts[0]);


  const mins =
    Number(parts[1]);


  const date =
    new Date();


  date.setHours(
    hours
  );


  date.setMinutes(
    mins + minutes
  );


  return date
    .toTimeString()
    .slice(
      0,
      5
    );

}


/* =========================================================
   DISPLAY VALUE
   ========================================================= */

function getDisplayValue(
  input,
  index
) {

  if (
    index === 4 ||
    index === 7
  ) {

    return '';

  }


  if (!input) {

    return '';

  }


  let value =
    input.value.trim();


  if (
    index === 3
  ) {

    return value
      .slice(
        0,
        airportMaxLength
      )
      .toUpperCase();

  }


  if (
    index === 6
  ) {

    return value
      .slice(
        0,
        destinationMaxLength
      )
      .toUpperCase();

  }


  if (
    index === 1
  ) {

    return value.toUpperCase();

  }


  if (
    index === 15
  ) {

    return value.toUpperCase();

  }


  return value;

}


/* =========================================================
   DOCUMENT DISPLAY TEXT
   ========================================================= */

function getDocumentDisplayText(
  text,
  index
) {

  if (
    index === 5 &&
    text
  ) {

    return `TERMINAL ${text}`;

  }


  return text;

}


/* =========================================================
   TEXT STYLE CONTROLLER
   ========================================================= */

function getTextStyle(
  index
) {

  if (
    index === 0
  ) {

    return {

      fontSize:
        sequenceFontSize,

      fontWeight:
        sequenceFontWeight,

      textAlign:
        'left',

      lineHeight:
        sequenceFontSize *
        documentLineHeight

    };

  }


  if (
    index === 1
  ) {

    return {

      fontSize:
        nameFontSize,

      fontWeight:
        nameFontWeight,

      textAlign:
        'left',

      lineHeight:
        nameFontSize *
        documentLineHeight

    };

  }


  if (
    index === 5
  ) {

    return {

      fontSize:
        terminalFontSize,

      fontWeight:
        terminalFontWeight,

      textAlign:
        'left',

      lineHeight:
        terminalFontSize *
        documentLineHeight

    };

  }


  return {

    fontSize:
      timeDateFontSize,

    fontWeight:
      timeDateFontWeight,

    textAlign:
      'left',

    lineHeight:
      timeDateFontSize *
      documentLineHeight

  };

}


/* =========================================================
   DOCUMENT VALUE ELEMENTS
   ========================================================= */

const pdfValues = [];


/* =========================================================
   CREATE DOCUMENT TEXT ELEMENTS
   ========================================================= */

formInputs.forEach(
  (
    input,
    index
  ) => {

    if (
      index === 4 ||
      index === 7 ||
      !fieldPositions[index]
    ) {

      pdfValues.push(
        null
      );

      return;

    }


    const value =
      document.createElement(
        'span'
      );


    value.className =
      `pdf-value pdf-value-${index}`;


    value.dataset.index =
      index;


    const position =
      fieldPositions[index];


    value.style.left =
      `${position[0]}%`;


    value.style.top =
      `${position[1]}%`;


    value.style.width =
      `${position[2]}%`;


    value.style.color =
      documentTextColor;


    value.style.fontFamily =
      documentFont;


    value.style.paddingTop =
      `${documentPaddingTop}px`;


    value.style.position =
      'absolute';


    value.style.zIndex =
      '2';


    value.style.pointerEvents =
      'none';


    value.style.display =
      'block';


    value.style.height =
      'auto';


    value.style.whiteSpace =
      'normal';


    value.style.overflowWrap =
      'normal';


    value.style.wordWrap =
      'normal';


    value.style.wordBreak =
      'normal';


    value.style.hyphens =
      'none';


    const style =
      getTextStyle(
        index
      );


    value.style.fontSize =
      `${style.fontSize}px`;


    value.style.fontWeight =
      style.fontWeight;


    value.style.lineHeight =
      `${style.lineHeight}px`;


    value.style.textAlign =
      style.textAlign;


    pdf.appendChild(
      value
    );


    pdfValues.push(
      value
    );

  }
);


/* =========================================================
   INPUT CHARACTER LIMITS
   ========================================================= */

const airportInput =
  document.getElementById(
    'fromCity'
  );


airportInput.maxLength =
  airportMaxLength;


const destinationInput =
  document.getElementById(
    'toCity'
  );


destinationInput.maxLength =
  destinationMaxLength;


/* =========================================================
   UPPERCASE INPUTS
   ========================================================= */

const uppercaseInputs = [

  document.getElementById(
    'name'
  ),

  document.getElementById(
    'fromCity'
  ),

  document.getElementById(
    'toCity'
  )

];


uppercaseInputs.forEach(
  input => {

    if (!input) {

      return;

    }


    input.addEventListener(
      'input',
      () => {

        input.value =
          input.value.toUpperCase();


        if (
          input === airportInput
        ) {

          input.value =
            input.value.slice(
              0,
              airportMaxLength
            );

        }


        if (
          input === destinationInput
        ) {

          input.value =
            input.value.slice(
              0,
              destinationMaxLength
            );

        }

      }
    );

  }
);


/* =========================================================
   WRAPPING CANVAS
   ========================================================= */

const wrappingCanvas =
  document.createElement(
    'canvas'
  );


const wrappingContext =
  wrappingCanvas.getContext(
    '2d'
  );


/* =========================================================
   GET TEXT LINES
   ========================================================= */

function getWrappedLines(
  text,
  maxWidth,
  fontWeight,
  fontSize
) {

  if (!text) {

    return [];

  }


  wrappingContext.font =
    `${fontWeight} ${fontSize}px ${documentFont}`;


  const words =
    text.split(' ');


  const lines = [];


  let currentLine = '';


  words.forEach(
    word => {

      if (!word) {

        return;

      }


      const fullLine =
        currentLine
          ? `${currentLine} ${word}`
          : word;


      if (
        wrappingContext.measureText(
          fullLine
        ).width <= maxWidth
      ) {

        currentLine =
          fullLine;

        return;

      }


      let remainingWord =
        word;


      while (
        remainingWord.length > 0
      ) {

        const prefix =
          currentLine
            ? `${currentLine} `
            : '';


        let part = '';

        let consumed = 0;


        for (
          let i = 0;
          i < remainingWord.length;
          i++
        ) {

          const candidate =
            part +
            remainingWord[i];


          const candidateWithHyphen =
            prefix +
            candidate +
            '-';


          if (
            wrappingContext.measureText(
              candidateWithHyphen
            ).width <= maxWidth
          ) {

            part =
              candidate;

            consumed++;

            continue;

          }


          break;

        }


        if (
          consumed === 0
        ) {

          if (currentLine) {

            lines.push(
              currentLine
            );


            currentLine =
              '';


            continue;

          }


          part =
            remainingWord.charAt(
              0
            );


          consumed =
            1;

        }


        if (
          consumed <
          remainingWord.length
        ) {

          lines.push(

            prefix +
            part +
            '-'

          );


          remainingWord =
            remainingWord.slice(
              consumed
            );


          currentLine =
            '';


          continue;

        }


        currentLine =
          prefix +
          part;


        remainingWord =
          '';

      }

    }
  );


  if (currentLine) {

    lines.push(
      currentLine
    );

  }


  return lines;

}


/* =========================================================
   WRAPPING FIELDS
   ========================================================= */

function isWrappingField(
  index
) {

  return (

    index === 3 ||

    index === 5 ||

    index === 6

  );

}


/* =========================================================
   PASSENGER NAME
   ========================================================= */

function updatePassengerName(
  element,
  name
) {

  element.innerHTML =
    '';


  if (!name) {

    return;

  }


  const nameSpan =
    document.createElement(
      'span'
    );


  nameSpan.textContent =
    name;


  nameSpan.style.fontSize =
    `${nameFontSize}px`;


  nameSpan.style.fontWeight =
    nameFontWeight;


  nameSpan.style.lineHeight =
    `${nameFontSize * documentLineHeight}px`;


  nameSpan.style.whiteSpace =
    'nowrap';


  nameSpan.style.color =
    documentTextColor;


  const continuationSpan =
    document.createElement(
      'span'
    );


  continuationSpan.textContent =
    ` ${passengerContinuation}`;


  continuationSpan.style.fontSize =
    `${passengerContinuationFontSize}px`;


  continuationSpan.style.fontWeight =
    passengerContinuationFontWeight;


  continuationSpan.style.lineHeight =
    `${passengerContinuationFontSize * documentLineHeight}px`;


  continuationSpan.style.whiteSpace =
    'nowrap';


  continuationSpan.style.color =
    passengerContinuationColor;


  element.appendChild(
    nameSpan
  );


  element.appendChild(
    continuationSpan
  );

}


/* =========================================================
   PREVIEW TEXT
   ========================================================= */

function updatePreviewWrappedText(
  element,
  text,
  index
) {

  element.innerHTML =
    '';


  if (!text) {

    return;

  }


  const style =
    getTextStyle(
      index
    );


  if (
    index === 1
  ) {

    updatePassengerName(
      element,
      text
    );

    return;

  }


  const maxWidth =
    element.clientWidth;


  if (!maxWidth) {

    element.textContent =
      text;

    return;

  }


  const lines =
    getWrappedLines(

      text,

      maxWidth,

      style.fontWeight,

      style.fontSize

    );


  lines.forEach(
    lineText => {

      const line =
        document.createElement(
          'span'
        );


      line.style.display =
        'block';


      line.style.height =
        `${style.lineHeight}px`;


      line.style.lineHeight =
        `${style.lineHeight}px`;


      line.textContent =
        lineText;


      element.appendChild(
        line
      );

    }
  );

}


/* =========================================================
   UPDATE DOCUMENT VALUES
   ========================================================= */

function updateDocumentValues() {

  formInputs.forEach(
    (
      input,
      index
    ) => {

      if (
        index === 4 ||
        index === 7 ||
        !pdfValues[index]
      ) {

        return;

      }


      const text =
        getDisplayValue(
          input,
          index
        );


      const displayText =
        getDocumentDisplayText(
          text,
          index
        );


      if (
        index === 1
      ) {

        updatePassengerName(

          pdfValues[index],

          text

        );

        return;

      }


      if (
        isWrappingField(index)
      ) {

        updatePreviewWrappedText(

          pdfValues[index],

          displayText,

          index

        );


        return;

      }


      pdfValues[index].textContent =
        displayText;

    }
  );

}


/* =========================================================
   GENERATE AUTOMATIC VALUES
   ========================================================= */

function generateAutomaticValues() {

  const departure =
    document.getElementById(
      'departure'
    ).value;


  if (!departure) {

    return;

  }


  formInputs[0].value =
    generateSequenceNumber();


  formInputs[2].value =
    generateFlightNumber();


  formInputs[8].value =
    generateGroup();


  formInputs[9].value =
    generateSeat();


  formInputs[16].value =
    generateBooking();


  formInputs[5].value =
    generateTerminal();


  formInputs[14].value =
    'British Airways';


  const boardingTime =
    changeTime(
      departure,
      -60
    );


  const securityTime =
    changeTime(
      boardingTime,
      -105
    );


  const bagDropTime =
    changeTime(
      departure,
      -240
    );


  formInputs[12].value =
    boardingTime;


  formInputs[18].value =
    boardingTime;


  formInputs[11].value =
    securityTime;


  formInputs[17].value =
    securityTime;


  formInputs[19].value =
    bagDropTime;

}


/* =========================================================
   AUTHENTICATION
   ========================================================= */

function getToken() {

  return localStorage.getItem(
    'token'
  );

}


async function checkLogin() {

  const token =
    getToken();


  if (!token) {

    alert(
      'Please login before creating a flight ticket.'
    );


    window.location.href =
      'login.html';


    return false;

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

      localStorage.removeItem(
        'token'
      );


      alert(
        'Your login session has expired. Please login again.'
      );


      window.location.href =
        'login.html';


      return false;

    }


    return true;

  } catch (error) {

    console.error(
      'LOGIN CHECK ERROR:',
      error
    );


    alert(
      'Unable to verify your login. Please try again.'
    );


    return false;

  }

}


/* =========================================================
   FLIGHT TYPE MODAL
   ========================================================= */

function createFlightTypeModal() {

  const oldModal =
    document.getElementById(
      'flightTypeModal'
    );


  if (oldModal) {

    oldModal.remove();

  }


  const overlay =
    document.createElement(
      'div'
    );


  overlay.id =
    'flightTypeModal';


  overlay.style.position =
    'fixed';


  overlay.style.inset =
    '0';


  overlay.style.background =
    'rgba(0,0,0,0.55)';


  overlay.style.display =
    'flex';


  overlay.style.alignItems =
    'center';


  overlay.style.justifyContent =
    'center';


  overlay.style.padding =
    '20px';


  overlay.style.zIndex =
    '10000';


  const box =
    document.createElement(
      'div'
    );


  box.style.width =
    '100%';


  box.style.maxWidth =
    '470px';


  box.style.background =
    '#ffffff';


  box.style.borderRadius =
    '14px';


  box.style.padding =
    '28px';


  box.style.boxSizing =
    'border-box';


  box.style.boxShadow =
    '0 20px 50px rgba(0,0,0,0.2)';


  box.innerHTML = `

    <div style="
      font-size:22px;
      font-weight:700;
      margin-bottom:8px;
      color:#222;
    ">
      Choose Flight Document
    </div>


    <div style="
      font-size:14px;
      color:#777;
      line-height:1.5;
      margin-bottom:22px;
    ">
      Choose whether you want a free test
      document or a clean document.
    </div>


    <div id="flightWalletBalance"
      style="
        background:#f6f8f9;
        border-radius:8px;
        padding:10px 12px;
        margin-bottom:18px;
        font-size:13px;
        color:#555;
      ">
      Checking wallet balance...
    </div>


    <button
      id="flightFreeButton"
      type="button"
      style="
        width:100%;
        padding:14px;
        border:1px solid #d9d9d9;
        background:#ffffff;
        border-radius:9px;
        cursor:pointer;
        text-align:left;
        margin-bottom:12px;
      "
    >

      <strong style="
        display:block;
        font-size:15px;
        color:#222;
        margin-bottom:4px;
      ">
        Free / Test
      </strong>

      <span style="
        font-size:12px;
        color:#777;
      ">
        Create a test flight with a watermark.
      </span>

    </button>


    <button
      id="flightCleanButton"
      type="button"
      style="
        width:100%;
        padding:14px;
        border:none;
        background:#2f5f77;
        color:#ffffff;
        border-radius:9px;
        cursor:pointer;
        text-align:left;
      "
    >

      <strong style="
        display:block;
        font-size:15px;
        margin-bottom:4px;
      ">
        Clean / $5
      </strong>

      <span style="
        font-size:12px;
        opacity:.9;
      ">
        Create a clean flight document.
      </span>

    </button>


    <button
      id="flightTypeCancel"
      type="button"
      style="
        width:100%;
        margin-top:14px;
        padding:10px;
        border:none;
        background:transparent;
        color:#777;
        cursor:pointer;
      "
    >
      Cancel
    </button>

  `;


  overlay.appendChild(
    box
  );


  document.body.appendChild(
    overlay
  );


  document
    .getElementById(
      'flightFreeButton'
    )
    .onclick =
    function () {

      createFlight(
        'test'
      );

    };


  document
    .getElementById(
      'flightCleanButton'
    )
    .onclick =
    function () {

      createFlight(
        'clean'
      );

    };


  document
    .getElementById(
      'flightTypeCancel'
    )
    .onclick =
    function () {

      closeFlightTypeModal();

    };


  loadWalletBalance();

}


/* =========================================================
   CLOSE FLIGHT TYPE MODAL
   ========================================================= */

function closeFlightTypeModal() {

  const modal =
    document.getElementById(
      'flightTypeModal'
    );


  if (modal) {

    modal.remove();

  }

}


/* =========================================================
   LOAD WALLET BALANCE
   ========================================================= */

async function loadWalletBalance() {

  const balanceElement =
    document.getElementById(
      'flightWalletBalance'
    );


  if (!balanceElement) {

    return;

  }


  const token =
    getToken();


  if (!token) {

    balanceElement.textContent =
      'Please login to continue.';

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


    if (response.ok) {

      const balance =
        Number(
          data.balance ??
          data.wallet?.balance ??
          0
        );


      balanceElement.textContent =
        `Wallet balance: $${balance.toFixed(2)}`;

    } else {

      balanceElement.textContent =
        'Wallet balance unavailable.';

    }

  } catch (error) {

    console.error(
      'WALLET ERROR:',
      error
    );


    balanceElement.textContent =
      'Wallet balance unavailable.';

  }

}


/* =========================================================
   FLIGHT PROFILE HELPERS
   ========================================================= */

function normalizeFlight(
  flight
) {

  return {

    ...flight,

    id:
      flight._id ||
      flight.id

  };

}


function findFlightById(
  id
) {

  return flightProfiles.find(
    flight =>
      String(flight.id) ===
      String(id)
  );

}


function getFlightStatus(
  flight
) {

  return (
    flight.currentStatus ||
    flight.status ||
    'Processing'
  );

}


function isFlightWatermarked(
  flight
) {

  if (
    flight.watermarkEnabled !==
    undefined
  ) {

    return (
      flight.watermarkEnabled ===
      true
    );

  }


  return (
    flight.flightType ===
    'test'
  );

}


/* =========================================================
   FLIGHT PROFILE STYLES
   ========================================================= */

function createFlightProfileStyle() {

  const oldStyle =
    document.getElementById(
      'flight-profile-style'
    );


  if (oldStyle) {

    return;

  }


  const style =
    document.createElement(
      'style'
    );


  style.id =
    'flight-profile-style';


  style.textContent = `

    .flight-management {

      width: 100%;

      display: grid;

      grid-template-columns:
        280px minmax(0, 1fr);

      gap: 25px;

      margin-top: 30px;

      margin-bottom: 30px;

      align-items: start;

    }


    .flight-profiles-panel {

      background: #ffffff;

      border: 1px solid #e1e7eb;

      border-radius: 12px;

      padding: 20px;

      box-sizing: border-box;

    }


    .flight-profiles-header {

      padding-bottom: 16px;

      margin-bottom: 10px;

      border-bottom:
        1px solid #eeeeee;

    }


    .flight-profiles-header h2 {

      margin: 4px 0 0;

      font-size: 19px;

      color: #222;

    }


    .created-flights {

      display: flex;

      flex-direction: column;

      gap: 6px;

    }


    .flight-profile-item {

      width: 100%;

      border: none;

      background: transparent;

      text-align: left;

      padding: 13px 12px;

      border-radius: 8px;

      cursor: pointer;

      color: #222;

      box-sizing: border-box;

    }


    .flight-profile-item:hover {

      background: #f5f8fa;

    }


    .flight-profile-item.active {

      background: #eef5f8;

      color: #2f5f77;

    }


    .flight-profile-item-name {

      font-size: 14px;

      font-weight: 700;

      word-break: break-word;

    }


    .flight-profile-item-tracking {

      margin-top: 4px;

      font-size: 11px;

      color: #888;

      word-break: break-word;

    }


    .flight-profile-item.active
    .flight-profile-item-tracking {

      color: #2f5f77;

    }


    .no-flight-profiles {

      padding: 18px 5px;

      color: #777;

      font-size: 13px;

      line-height: 1.5;

    }


    .flight-create-view {

      display: none;

    }


    .flight-create-view h2 {

      margin: 5px 0 8px;

      color: #222;

    }


    .selected-flight-view {

      display: none;

      background: #ffffff;

      border: 1px solid #e1e7eb;

      border-radius: 12px;

      padding: 28px;

      box-sizing: border-box;

    }


    .selected-flight-header {

      display: flex;

      justify-content: space-between;

      align-items: flex-start;

      gap: 20px;

      padding-bottom: 20px;

      border-bottom:
        1px solid #eeeeee;

    }


    .selected-flight-header h2 {

      margin: 5px 0 7px;

      font-size: 24px;

      color: #222;

    }


    .selected-flight-tracking {

      margin: 0;

      font-size: 13px;

      color: #777;

    }


    .new-flight-btn {

      border: 1px solid #d8e0e5;

      background: #ffffff;

      color: #2f5f77;

      border-radius: 8px;

      padding: 10px 14px;

      cursor: pointer;

      white-space: nowrap;

    }


    .new-flight-btn:hover {

      background: #f5f8fa;

    }


    .flight-profile-details {

      display: grid;

      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 0 25px;

      margin-top: 20px;

    }


    .flight-detail-row {

      display: flex;

      justify-content: space-between;

      gap: 15px;

      padding: 13px 0;

      border-bottom:
        1px solid #f0f0f0;

    }


    .flight-detail-row span {

      color: #777;

      font-size: 13px;

    }


    .flight-detail-row strong {

      color: #222;

      font-size: 13px;

      text-align: right;

      word-break: break-word;

    }


    .flight-control-section {

      margin-top: 28px;

      padding-top: 22px;

      border-top:
        1px solid #eeeeee;

    }


    .flight-control-heading {

      display: flex;

      gap: 12px;

      align-items: flex-start;

      margin-bottom: 15px;

    }


    .section-number {

      width: 30px;

      height: 30px;

      border-radius: 50%;

      background: #eef5f8;

      color: #2f5f77;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 11px;

      font-weight: 700;

      flex-shrink: 0;

    }


    .flight-control-heading h3 {

      margin: 0 0 4px;

      color: #222;

      font-size: 16px;

    }


    .flight-control-heading p {

      margin: 0;

      color: #777;

      font-size: 12px;

      line-height: 1.5;

    }


    .flight-status-control {

      display: flex;

      gap: 10px;

      align-items: center;

    }


    .flight-status-control select {

      flex: 1;

      min-width: 0;

      padding: 11px 12px;

      border: 1px solid #d9e0e4;

      border-radius: 8px;

      background: #ffffff;

      font-size: 13px;

    }


    .flight-action-btn {

      border: none;

      background: #2f5f77;

      color: #ffffff;

      border-radius: 8px;

      padding: 11px 15px;

      cursor: pointer;

      white-space: nowrap;

    }


    .flight-action-btn:disabled {

      opacity: .6;

      cursor: not-allowed;

    }


    .flight-watermark-action {

      display: flex;

      align-items: center;

      gap: 10px;

    }


    .remove-flight-watermark-btn {

      border: none;

      background: #2f5f77;

      color: #ffffff;

      padding: 11px 16px;

      border-radius: 8px;

      cursor: pointer;

    }


    .clean-flight-message {

      color: #3d704e;

      background: #eef8f1;

      border-radius: 8px;

      padding: 11px 13px;

      font-size: 12px;

    }


    .flight-tracking-box {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 20px;

      padding: 16px;

      background: #f7fafb;

      border-radius: 9px;

    }


    .flight-tracking-box span {

      display: block;

      color: #888;

      font-size: 10px;

      letter-spacing: .5px;

      margin-bottom: 5px;

    }


    .flight-tracking-box strong {

      color: #222;

      font-size: 15px;

      word-break: break-word;

    }


    .track-flight-btn {

      display: inline-block;

      background: #2f5f77;

      color: #ffffff;

      text-decoration: none;

      padding: 10px 14px;

      border-radius: 8px;

      font-size: 12px;

      white-space: nowrap;

    }


    .track-flight-btn:hover {

      opacity: .9;

    }


    @media (max-width: 900px) {

      .flight-management {

        grid-template-columns: 1fr;

      }


      .flight-profile-details {

        grid-template-columns: 1fr;

      }

    }


    @media (max-width: 600px) {

      .selected-flight-header {

        flex-direction: column;

      }


      .new-flight-btn {

        width: 100%;

      }


      .flight-status-control {

        flex-direction: column;

        align-items: stretch;

      }


      .flight-status-control select,
      .flight-action-btn {

        width: 100%;

      }


      .flight-tracking-box {

        flex-direction: column;

        align-items: stretch;

      }


      .track-flight-btn {

        text-align: center;

      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================================
   VIEW CONTROLLER
   ========================================================= */

/*
  NORMAL VIEW:

  Show:
  - Create Flight Document

  Hide:
  - Generated Document
  - Flight Profile Management
*/

function showCreateFlightView() {

  const formCard =
    flightForm
      ? flightForm.closest('.form-card')
      : null;


  if (formCard && createFlightView) {

    createFlightView.appendChild(
      formCard
    );

    formCard.style.display =
      'block';

  }


  if (generatedDocument) {

    generatedDocument.style.display =
      'none';

  }


  if (flightManagement) {

    flightManagement.style.display =
      'grid';

  }


  if (createFlightView) {

    createFlightView.style.display =
      'block';

  }


  if (selectedFlightView) {

    selectedFlightView.style.display =
      'none';

  }


  selectedFlightId =
    null;


  renderFlightProfiles();

}


/*
  PROFILE WORKSPACE:

  Show:
  - Flight Profile Management

  Hide:
  - Create Flight Document
  - Generated Document
*/

function showSelectedFlightView() {

  if (flightForm) {

    const formCard =
      flightForm.closest(
        '.form-card'
      );


    if (formCard) {

      formCard.style.display =
        'none';

    }

  }


  if (generatedDocument) {

    generatedDocument.style.display =
      'none';

  }


  if (flightManagement) {

    flightManagement.style.display =
      'grid';

  }


  if (createFlightView) {

    createFlightView.style.display =
      'none';

  }


  if (selectedFlightView) {

    selectedFlightView.style.display =
      'block';

  }

}


/*
  PROFILE LIST ONLY:

  Used immediately after creating a flight.

  The generated document remains visible,
  but the management area is available below it.
*/

function showFlightManagementList() {

  if (flightManagement) {

    flightManagement.style.display =
      'grid';

  }


  if (createFlightView) {

    createFlightView.style.display =
      'none';

  }


  if (selectedFlightView) {

    selectedFlightView.style.display =
      'none';

  }

}


/* =========================================================
   RENDER FLIGHT PROFILES
   ========================================================= */
function renderFlightProfiles() {

  if (!createdFlights) {

    return;

  }


  createdFlights.innerHTML =
    '';


  if (
    flightProfiles.length === 0
  ) {

    return;

  }


  flightProfiles.forEach(
    flight => {

      const item =
        document.createElement(
          'button'
        );


      item.type =
        'button';


      item.className =
        'flight-profile-item';


      if (
        String(flight.id) ===
        String(selectedFlightId)
      ) {

        item.classList.add(
          'active'
        );

      }


      const passenger =
        flight.passengerName ||
        'Flight Profile';


      const tracking =
        flight.trackingNumber ||
        'No tracking number';


      item.innerHTML = `

        <div
          class="flight-profile-item-name"
        >
          ${escapeHtml(
        passenger
      )}
        </div>


        <div
          class="flight-profile-item-tracking"
        >
          ${escapeHtml(
        tracking
      )}
        </div>

      `;


      item.addEventListener(
        'click',
        function () {

          openFlightProfile(
            flight.id
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
   LOAD FLIGHT PROFILES
   ========================================================= */
async function loadFlightProfiles() {

  const token =
    getToken();


  if (!token) {

    flightProfiles = [];

    selectedFlightId = null;

    renderFlightProfiles();

    showCreateFlightView();

    return;

  }


  try {

    const response =
      await fetch(
        `${API_URL}/flights/mine`,
        {

          method:
            'GET',

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
        'Unable to load flights.'
      );

    }


    const flights =
      Array.isArray(data)
        ? data
        : (
          Array.isArray(
            data.flights
          )
            ? data.flights
            : []
        );


    flightProfiles =
      flights.map(
        normalizeFlight
      );


    renderFlightProfiles();


    selectedFlightId =
      null;


    showCreateFlightView();

  } catch (error) {

    console.error(
      'LOAD FLIGHTS ERROR:',
      error
    );


    flightProfiles = [];

    selectedFlightId = null;

    renderFlightProfiles();

    showCreateFlightView();

  }

}


/* =========================================================
   OPEN FLIGHT PROFILE
   ========================================================= */
function openFlightProfile(
  flightId
) {

  const flight =
    findFlightById(
      flightId
    );


  if (!flight) {

    alert(
      'Flight profile could not be found.'
    );

    return;

  }


  selectedFlightId =
    flight.id;


  createdFlight =
    flight;


  /*
    The flight already exists,
    so allow the existing JPG/PDF
    download system to work again.
  */

  flightCreated =
    true;


  selectedFlightType =
    flight.flightType ||
    null;


  flightWatermarkEnabled =
    isFlightWatermarked(
      flight
    );


  showSelectedFlightView();


  renderFlightProfiles();


  populateFlightProfile(
    flight
  );


  updateDocumentFromFlight(
    flight
  );


  if (
    flightWatermarkEnabled
  ) {

    addWatermark();

  } else {

    removeWatermark();

  }


  if (flightManagement) {

    requestAnimationFrame(
      function () {

        flightManagement.scrollIntoView({

          behavior:
            'smooth',

          block:
            'start'

        });

      }
    );

  }

}



function downloadSelectedFlight(
  flightId
) {

  const flight =
    findFlightById(
      flightId
    );


  if (!flight) {

    alert(
      'Flight profile not found.'
    );

    return;

  }


  createdFlight =
    flight;


  selectedFlightId =
    flight.id;


  selectedFlightType =
    flight.flightType;


  flightWatermarkEnabled =
    isFlightWatermarked(
      flight
    );


  flightCreated =
    true;


  updateDocumentFromFlight(flight);


  if (
    typeof renderFlightWatermark ===
    'function'
  ) {

    renderFlightWatermark();

  }


  if (
    typeof openDownloadModal ===
    'function'
  ) {

    openDownloadModal();

  } else {

    alert(
      'Download system not found.'
    );

  }

}


async function deleteSelectedFlight(
  flightId
) {

  const flight =
    findFlightById(
      flightId
    );


  if (!flight) {

    alert(
      'Flight profile not found.'
    );

    return;

  }


  const trackingNumber =
    flight.trackingNumber;


  if (!trackingNumber) {

    alert(
      'This flight does not have a tracking number.'
    );

    return;

  }


  const confirmed =
    confirm(
      `Delete flight ${trackingNumber}?`
    );


  if (!confirmed) {

    return;

  }


  const token =
    getToken();


  if (!token) {

    alert(
      'Please login again.'
    );

    window.location.href =
      'login.html';

    return;

  }


  try {

    const response =
      await fetch(
        `${API_URL}/flights/${encodeURIComponent(
          trackingNumber
        )}`,
        {

          method:
            'DELETE',

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        'Unable to delete flight.'
      );

      return;

    }


    /* =====================================================
       REMOVE FROM CURRENT PROFILE LIST
    ===================================================== */

    flightProfiles =
      flightProfiles.filter(
        item =>
          String(
            item.id
          ) !==
          String(
            flight.id
          )
      );


    /* =====================================================
       CLEAR SELECTED FLIGHT
    ===================================================== */

    if (
      String(
        selectedFlightId
      ) ===
      String(
        flight.id
      )
    ) {

      selectedFlightId =
        null;

      createdFlight =
        null;

      flightCreated =
        false;


      if (selectedFlightView) {

        selectedFlightView.style.display =
          'none';

      }


      if (generatedDocument) {

        generatedDocument.style.display =
          'none';

      }

    }


    /* =====================================================
       REFRESH PROFILE LIST
    ===================================================== */

    renderFlightProfiles();


    alert(
      'Flight deleted successfully.'
    );


  } catch (error) {

    console.error(
      'Delete flight error:',
      error
    );


    alert(
      'Unable to delete flight.'
    );

  }

}



/* =========================================================
   FLIGHT STATUS TIME LOCK
   ========================================================= */

function updateFlightStatusControlLock(
  flight
) {

  if (
    !flightStatusSelect ||
    !changeFlightStatusBtn
  ) {

    return;

  }


  if (
    !flight ||
    !flight.estimatedArrival
  ) {

    flightStatusSelect.disabled =
      false;

    changeFlightStatusBtn.disabled =
      false;

    changeFlightStatusBtn.textContent =
      'Change Status';

    return;

  }


  const arrivalTime =
    new Date(
      flight.estimatedArrival
    ).getTime();


  const currentTime =
    Date.now();


  if (
    currentTime >= arrivalTime
  ) {

    flightStatusSelect.disabled =
      true;

    changeFlightStatusBtn.disabled =
      true;

    changeFlightStatusBtn.textContent =
      'Flight Time Expired';

    return;

  }


  flightStatusSelect.disabled =
    false;

  changeFlightStatusBtn.disabled =
    false;

  changeFlightStatusBtn.textContent =
    'Change Status';

}











/* =========================================================
   POPULATE FLIGHT PROFILE
   ========================================================= */

function populateFlightProfile(
  flight
) {

  if (selectedFlightName) {

    selectedFlightName.textContent =
      flight.passengerName ||
      'Passenger Name';

  }


  const tracking =
    flight.trackingNumber ||
    'No tracking number';


  if (selectedFlightTracking) {

    selectedFlightTracking.textContent =
      tracking;

  }


  if (profileTrackingNumber) {

    profileTrackingNumber.textContent =
      tracking;

  }


  if (profileFlightNumber) {

    profileFlightNumber.textContent =
      flight.flightNumber ||
      '—';

  }


  if (profileFrom) {

    profileFrom.textContent =
      flight.departureAirport ||
      '—';

  }


  if (profileTo) {

    profileTo.textContent =
      flight.destinationAirport ||
      '—';

  }


  if (profileDate) {

    let displayDate =
      flight.travelDate ||
      '—';


    if (
      typeof displayDate ===
      'string' &&
      displayDate.includes('T')
    ) {

      displayDate =
        displayDate.split('T')[0];

    }


    profileDate.textContent =
      displayDate;

  }


  if (profileDeparture) {

    profileDeparture.textContent =
      flight.departureTime ||
      '—';

  }


  if (profileClass) {

    profileClass.textContent =
      flight.flightClass ||
      '—';

  }


  if (profileTerminal) {

    profileTerminal.textContent =
      flight.terminal
        ? `TERMINAL ${flight.terminal}`
        : '—';

  }


  if (profileSeat) {

    profileSeat.textContent =
      flight.seat ||
      '—';

  }


  if (profileBooking) {

    profileBooking.textContent =
      flight.bookingReference ||
      '—';

  }


  const status =
    getFlightStatus(
      flight
    );


  if (flightStatusSelect) {

    const optionExists =
      Array.from(
        flightStatusSelect.options
      ).some(
        option =>
          option.value ===
          status
      );


    if (optionExists) {

      flightStatusSelect.value =
        status;

    } else {

      flightStatusSelect.value =
        'Processing';

    }

  }


  renderFlightWatermarkAction(
    flight
  );


  updateTrackingLink(
    flight
  );

  updateFlightStatusControlLock(
    flight
  );


  /* =========================================================
     PROFILE ACTION BUTTONS
     ========================================================= */

  const profileActions =
    document.getElementById(
      'flightProfileActions'
    );


  if (profileActions) {

    profileActions.innerHTML = `

      <button
        type="button"
        class="flight-download-button"
        onclick="downloadSelectedFlight('${flight.id}')"
      >
        Download Ticket
      </button>


      <button
        type="button"
        class="flight-delete-button"
        onclick="deleteSelectedFlight('${flight.id}')"
      >
        Delete Flight
      </button>

    `;

  }

}

/* =========================================================
   UPDATE TRACKING LINK
   ========================================================= */

function updateTrackingLink(
  flight
) {

  if (!trackFlightBtn) {

    return;

  }


  const tracking =
    flight.trackingNumber;


  if (!tracking) {

    trackFlightBtn.href =
      '#';

    trackFlightBtn.style.pointerEvents =
      'none';

    trackFlightBtn.style.opacity =
      '.5';

    return;

  }


  trackFlightBtn.style.pointerEvents =
    'auto';

  trackFlightBtn.style.opacity =
    '1';


  trackFlightBtn.href =
    `https://travellnest.com/?tracking=${encodeURIComponent(
      tracking
    )}`;

}


/* =========================================================
   RENDER WATERMARK ACTION
   ========================================================= */

function renderFlightWatermarkAction(
  flight
) {

  if (!flightWatermarkAction) {

    return;

  }


  flightWatermarkAction.innerHTML =
    '';


  if (
    isFlightWatermarked(
      flight
    )
  ) {

    flightWatermarkAction.innerHTML = `

      <button
        type="button"
        id="removeFlightWatermarkBtn"
        class="remove-flight-watermark-btn"
      >
        Remove Watermark
      </button>

    `;


    const button =
      document.getElementById(
        'removeFlightWatermarkBtn'
      );


    if (button) {

      button.addEventListener(
        'click',
        removeSelectedFlightWatermark
      );

    }


    return;

  }


  flightWatermarkAction.innerHTML = `

    <div class="clean-flight-message">

      Clean document — no watermark.

    </div>

  `;

}


/* =========================================================
   UPDATE DOCUMENT FROM FLIGHT
   ========================================================= */

function updateDocumentFromFlight(
  flight
) {

  if (!flight) {

    return;

  }


  const values = [

    flight.sequenceNumber ||
    '',

    flight.passengerName ||
    '',

    flight.flightNumber ||
    '',

    flight.departureAirport ||
    '',

    '',

    flight.terminal ||
    '',

    flight.destinationAirport ||
    '',

    '',

    flight.group ||
    '',

    flight.seat ||
    '',

    flight.travelDate ||
    '',

    flight.security ||
    '',

    flight.boardingAt ||
    '',

    flight.departureTime ||
    '',

    flight.airline ||
    'British Airways',

    flight.flightClass ||
    '',

    flight.bookingReference ||
    '',

    flight.securityTime ||
    '',

    flight.lowerBoarding ||
    '',

    flight.bagDrop ||
    ''

  ];


  values.forEach(
    (
      value,
      index
    ) => {

      if (
        formInputs[index]
      ) {

        formInputs[index].value =
          value;

      }

    }
  );


  updateDocumentValues();

}


/* =========================================================
   UPDATE FLIGHT ON SERVER
   ========================================================= */

/* =========================================================
   UPDATE FLIGHT ON SERVER
   ========================================================= */

async function updateFlightOnServer(
  trackingNumber,
  payload
) {

  const token =
    getToken();


  if (!token) {

    throw new Error(
      'Please login first.'
    );

  }


  if (!trackingNumber) {

    throw new Error(
      'Flight tracking number is missing.'
    );

  }


  const response =
    await fetch(
      `${API_URL}/flights/${encodeURIComponent(
        trackingNumber
      )}`,
      {

        method:
          'PATCH',

        headers: {

          'Content-Type':
            'application/json',

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


  if (!response.ok) {

    throw new Error(
      data.message ||
      'Unable to update flight.'
    );

  }


  return normalizeFlight(
    data.flight ||
    data
  );

}

/* =========================================================
   CHANGE FLIGHT STATUS
   ========================================================= */

if (changeFlightStatusBtn) {

  changeFlightStatusBtn.addEventListener(
    'click',
    async function () {

      let flight =
        createdFlight;


      if (
        !flight &&
        selectedFlightId
      ) {

        flight =
          findFlightById(
            selectedFlightId
          );

      }


      if (!flight) {

        alert(
          'Please select a flight profile first.'
        );

        return;

      }


      const trackingNumber =
        flight.trackingNumber;


      if (!trackingNumber) {

        alert(
          'This flight does not have a tracking number.'
        );

        return;

      }


      const status =
        flightStatusSelect
          ? flightStatusSelect.value
          : 'Processing';


      let errorMessage =
        '';


      if (
        status === 'Error'
      ) {

        errorMessage =
          prompt(
            'Enter the reason for the flight error:'
          ) || '';


        if (!errorMessage.trim()) {

          alert(
            'Please enter the reason for the error.'
          );

          return;

        }

      }


      try {

        changeFlightStatusBtn.disabled =
          true;


        changeFlightStatusBtn.textContent =
          'Saving...';


        const response =
          await fetch(
            `${API_URL}/flights/${encodeURIComponent(
              trackingNumber
            )}/status`,
            {

              method:
                'PATCH',

              headers: {

                'Content-Type':
                  'application/json',

                Authorization:
                  `Bearer ${getToken()}`

              },

              body:
                JSON.stringify({

                  currentStatus:
                    status,

                  errorMessage:
                    errorMessage

                })

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            'Unable to update flight status.'
          );

        }


        const updatedFlight =
          normalizeFlight(
            data.flight
          );


        createdFlight =
          updatedFlight;


        selectedFlightId =
          updatedFlight.id;


        selectedFlightType =
          updatedFlight.flightType ||
          null;


        flightCreated =
          true;


        flightWatermarkEnabled =
          isFlightWatermarked(
            updatedFlight
          );


        replaceFlightProfile(
          updatedFlight
        );


        populateFlightProfile(
          updatedFlight
        );


        updateDocumentFromFlight(
          updatedFlight
        );


        if (
          flightWatermarkEnabled
        ) {

          addWatermark();

        } else {

          removeWatermark();

        }


        alert(
          'Flight status updated successfully.'
        );


      } catch (error) {

        console.error(
          'CHANGE FLIGHT STATUS ERROR:',
          error
        );


        alert(
          error.message ||
          'Unable to change flight status.'
        );


      } finally {

        changeFlightStatusBtn.disabled =
          false;


        changeFlightStatusBtn.textContent =
          'Change Status';

      }

    }
  );

}

/* =========================================================
   REMOVE SELECTED FLIGHT WATERMARK
   ========================================================= */

async function removeSelectedFlightWatermark() {

  if (!createdFlight) {

    alert(
      'Please select a flight profile first.'
    );

    return;

  }


  const trackingNumber =
    createdFlight.trackingNumber;


  if (!trackingNumber) {

    alert(
      'This flight does not have a tracking number.'
    );

    return;

  }


  /*
    Only test/free flights should
    be upgraded here.
  */

  if (
    createdFlight.flightType !==
    'test'
  ) {

    alert(
      'This flight is already a clean document.'
    );

    return;

  }


  const button =
    document.getElementById(
      'removeFlightWatermarkBtn'
    );


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        'Removing...';

    }


    const token =
      getToken();


    if (!token) {

      throw new Error(
        'Please login first.'
      );

    }


    /*
      IMPORTANT:

      Use the upgrade route.

      Do NOT use the generic PATCH route.
    */

    const response =
      await fetch(
        `${API_URL}/flights/${encodeURIComponent(
          trackingNumber
        )}/upgrade`,
        {

          method:
            'PATCH',

          headers: {

            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        data.message ||
        'Unable to remove the watermark.'
      );

    }


    const updatedFlight =
      normalizeFlight(
        data.flight
      );


    createdFlight =
      updatedFlight;


    selectedFlightId =
      updatedFlight.id;


    selectedFlightType =
      updatedFlight.flightType;


    flightWatermarkEnabled =
      isFlightWatermarked(
        updatedFlight
      );


    flightCreated =
      true;


    replaceFlightProfile(
      updatedFlight
    );


    populateFlightProfile(
      updatedFlight
    );


    updateDocumentFromFlight(
      updatedFlight
    );


    removeWatermark();


    renderFlightWatermarkAction(
      updatedFlight
    );


    alert(
      'Watermark removed successfully. $5 has been deducted from your wallet.'
    );


  } catch (error) {

    console.error(
      'REMOVE WATERMARK ERROR:',
      error
    );


    alert(
      error.message ||
      'Unable to remove the watermark.'
    );


    const selectedFlight =
      findFlightById(
        selectedFlightId
      );


    if (selectedFlight) {

      renderFlightWatermarkAction(
        selectedFlight
      );

    }

  }

}


/* =========================================================
   REPLACE FLIGHT PROFILE
   ========================================================= */

function replaceFlightProfile(
  updatedFlight
) {

  const index =
    flightProfiles.findIndex(
      flight =>
        String(flight.id) ===
        String(updatedFlight.id)
    );


  if (index !== -1) {

    flightProfiles[index] =
      normalizeFlight(
        updatedFlight
      );

  }


  renderFlightProfiles();

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
  value
) {

  const div =
    document.createElement(
      'div'
    );


  div.textContent =
    value == null
      ? ''
      : String(value);


  return div.innerHTML;

}



/* =========================================================
   CREATE FLIGHT
   ========================================================= */

async function createFlight(
  flightType
) {

  const loggedIn =
    await checkLogin();


  if (!loggedIn) {

    return;

  }


  const token =
    getToken();


  if (!token) {

    return;

  }


  selectedFlightType =
    flightType;


  const passengerName =
    formInputs[1]?.value.trim();


  const departureAirport =
    formInputs[3]?.value.trim();


  const destinationAirport =
    formInputs[6]?.value.trim();


  const travelDate =
    formInputs[10]?.value;


  const departureTime =
    formInputs[13]?.value;


  const flightClass =
    formInputs[15]?.value;

  const flightDuration =
    Number(
      flightDurationInput?.value
    );


  if (!passengerName) {

    alert(
      'Please enter the passenger name.'
    );

    return;

  }


  if (!departureAirport) {

    alert(
      'Please enter the departure airport.'
    );

    return;

  }


  if (!destinationAirport) {

    alert(
      'Please enter the destination airport.'
    );

    return;

  }


  if (!travelDate) {

    alert(
      'Please select the travel date.'
    );

    return;

  }


  if (!departureTime) {

    alert(
      'Please select the departure time.'
    );

    return;

  }


  if (!flightClass) {

    alert(
      'Please select the flight class.'
    );

    return;

  }

  if (
    !flightDuration ||
    flightDuration < 0.5
  ) {

    alert(
      'Please enter a valid flight duration.'
    );

    return;

  }


  const freeButton =
    document.getElementById(
      'flightFreeButton'
    );


  const cleanButton =
    document.getElementById(
      'flightCleanButton'
    );


  if (freeButton) {

    freeButton.disabled =
      true;

    freeButton.style.opacity =
      '0.6';

  }


  if (cleanButton) {

    cleanButton.disabled =
      true;

    cleanButton.style.opacity =
      '0.6';

  }


  try {

    const response =
      await fetch(
        `${API_URL}/flights`,
        {

          method:
            'POST',

          headers: {

            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify({

              passengerName,

              departureAirport,

              destinationAirport,

              travelDate,

              departureTime,

              flightDuration,

              flightClass,

              flightNumber:
                formInputs[2]?.value ||
                '',

              sequenceNumber:
                formInputs[0]?.value ||
                '',

              terminal:
                formInputs[5]?.value ||
                '',

              airline:
                formInputs[14]?.value ||
                'British Airways',

              group:
                formInputs[8]?.value ||
                '',

              seat:
                formInputs[9]?.value ||
                '',

              bookingReference:
                formInputs[16]?.value ||
                '',

              security:
                formInputs[11]?.value ||
                '',

              securityTime:
                formInputs[17]?.value ||
                '',

              boardingAt:
                formInputs[12]?.value ||
                '',

              lowerBoarding:
                formInputs[18]?.value ||
                '',

              bagDrop:
                formInputs[19]?.value ||
                '',

              currentStatus:
                'Processing',

              flightType:
                flightType

            })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        'Unable to create flight.'
      );


      if (freeButton) {

        freeButton.disabled =
          false;

        freeButton.style.opacity =
          '1';

      }


      if (cleanButton) {

        cleanButton.disabled =
          false;

        cleanButton.style.opacity =
          '1';

      }


      return;

    }


    createdFlight =
      normalizeFlight(
        data.flight ||
        data
      );


    flightCreated =
      true;


    flightWatermarkEnabled =
      isFlightWatermarked(
        createdFlight
      );


    closeFlightTypeModal();


    if (
      flightWatermarkEnabled
    ) {

      addWatermark();

    } else {

      removeWatermark();

    }


    const existingIndex =
      flightProfiles.findIndex(
        flight =>
          String(flight.id) ===
          String(createdFlight.id)
      );


    if (existingIndex === -1) {

      flightProfiles.unshift(
        createdFlight
      );

    } else {

      flightProfiles[
        existingIndex
      ] =
        createdFlight;

    }


    /*
      Do not automatically open
      the profile settings.

      Keep the document visible
      after creation and make the
      profile list available.
    */

    selectedFlightId =
      null;


    renderFlightProfiles();


    showFlightManagementList();


    generatedDocument.style.display =
      'block';


    requestAnimationFrame(
      function () {

        updateDocumentValues();


        if (
          flightWatermarkEnabled
        ) {

          addWatermark();

        } else {

          removeWatermark();

        }

      }
    );


    requestAnimationFrame(
      function () {

        generatedDocument.scrollIntoView({

          behavior:
            'smooth',

          block:
            'start'

        });

      }
    );


    if (
      flightType === 'test'
    ) {

      alert(
        'Free test flight created successfully. The document is watermarked.'
      );

    } else {

      alert(
        'Clean flight created successfully. $5 has been deducted from your wallet.'
      );

    }

  } catch (error) {

    console.error(
      'CREATE FLIGHT ERROR:',
      error
    );


    alert(
      'Unable to create flight. Please try again.'
    );


    if (freeButton) {

      freeButton.disabled =
        false;

      freeButton.style.opacity =
        '1';

    }


    if (cleanButton) {

      cleanButton.disabled =
        false;

      cleanButton.style.opacity =
        '1';

    }

  }

}


/* =========================================================
   FORM SUBMIT
   ========================================================= */

if (flightForm) {

  flightForm.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();


      const loggedIn =
        await checkLogin();


      if (!loggedIn) {

        return;

      }


      if (
        !flightForm.checkValidity()
      ) {

        flightForm.reportValidity();

        return;

      }


      airportInput.value =
        airportInput.value
          .slice(
            0,
            airportMaxLength
          )
          .toUpperCase();


      destinationInput.value =
        destinationInput.value
          .slice(
            0,
            destinationMaxLength
          )
          .toUpperCase();


      generateAutomaticValues();


      updateDocumentValues();


      generatedDocument.style.display =
        'block';


      requestAnimationFrame(
        function () {

          updateDocumentValues();

        }
      );


      createFlightTypeModal();

    }
  );

}


/* =========================================================
   EDIT BUTTON
   ========================================================= */

if (editButton) {

  editButton.addEventListener(
    'click',
    function () {

      generatedDocument.style.display =
        'none';


      if (flightManagement) {

        flightManagement.style.display =
          'none';

      }


      if (flightForm) {

        const formCard =
          flightForm.closest(
            '.form-card'
          );


        if (formCard) {

          formCard.style.display =
            'block';

        }

      }


      flightCreated =
        false;


      createdFlight =
        null;


      selectedFlightType =
        null;


      flightWatermarkEnabled =
        false;


      removeWatermark();


      window.scrollTo({

        top: 0,

        behavior:
          'smooth'

      });

    }
  );

}


/* =========================================================
   NEW FLIGHT BUTTON
   ========================================================= */

if (newFlightBtn) {

  newFlightBtn.addEventListener(
    'click',
    function () {

      /*
        Return completely to the
        original Create Flight
        Document screen.
      */

      showCreateFlightView();


      if (flightForm) {

        flightForm.reset();

      }


      flightCreated =
        false;


      createdFlight =
        null;


      selectedFlightType =
        null;


      flightWatermarkEnabled =
        false;


      removeWatermark();


      updateDocumentValues();


      if (generatedDocument) {

        generatedDocument.style.display =
          'none';

      }


      window.scrollTo({

        top: 0,

        behavior:
          'smooth'

      });

    }
  );

}


/* =========================================================
   REMOVE WATERMARK
   ========================================================= */

function removeWatermark() {

  const watermark =
    pdf.querySelector(
      '.flight-document-watermark'
    );


  if (watermark) {

    watermark.remove();

  }

}


/* =========================================================
   ADD WATERMARK
   ========================================================= */

function addWatermark() {

  removeWatermark();


  const watermark =
    document.createElement(
      'div'
    );


  watermark.className =
    'flight-document-watermark';


  watermark.textContent =
    'TEST / FREE';


  watermark.style.position =
    'absolute';


  watermark.style.left =
    '50%';


  watermark.style.top =
    '50%';


  watermark.style.transform =
    'translate(-50%, -50%) rotate(-28deg)';


  watermark.style.fontFamily =
    'Arial';


  watermark.style.fontSize =
    '58px';


  watermark.style.fontWeight =
    '700';


  watermark.style.letterSpacing =
    '4px';


  watermark.style.color =
    'rgba(0, 0, 0, 0.13)';


  watermark.style.whiteSpace =
    'nowrap';


  watermark.style.pointerEvents =
    'none';


  watermark.style.zIndex =
    '999';


  pdf.appendChild(
    watermark
  );

}


/* =========================================================
   DOWNLOAD MODAL
   ========================================================= */

function openDownloadModal() {

  if (!flightCreated) {

    alert(
      'Please create the flight document first.'
    );

    return;

  }


  downloadModal.classList.add(
    'show'
  );


  downloadModal.setAttribute(
    'aria-hidden',
    'false'
  );

}


function closeDownloadModal() {

  downloadModal.classList.remove(
    'show'
  );


  downloadModal.setAttribute(
    'aria-hidden',
    'true'
  );

}


/* =========================================================
   DOWNLOAD BUTTON
   ========================================================= */

if (downloadButton) {

  downloadButton.addEventListener(
    'click',
    function () {

      if (isMobileDevice()) {

        downloadFlightPdf();

        return;

      }

      openDownloadModal();

    }
  );

}


/* =========================================================
   CLOSE DOWNLOAD MODAL
   ========================================================= */

if (closeModal) {

  closeModal.addEventListener(
    'click',
    closeDownloadModal
  );

}


/* =========================================================
   OVERLAY
   ========================================================= */

if (modalOverlay) {

  modalOverlay.addEventListener(
    'click',
    closeDownloadModal
  );

}


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
  'keydown',
  function (event) {

    if (
      event.key === 'Escape'
    ) {

      closeDownloadModal();

      closeFlightTypeModal();

    }

  }
);


/* =========================================================
   WRAPPED TEXT FOR JPG / PDF
   ========================================================= */

function drawWrappedText(
  ctx,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  fontWeight,
  fontSize
) {

  const lines =
    getWrappedLines(

      text,

      maxWidth,

      fontWeight,

      fontSize

    );


  lines.forEach(
    (
      lineText,
      lineIndex
    ) => {

      ctx.fillText(

        lineText,

        x,

        y +
        (
          lineIndex *
          lineHeight
        )

      );

    }
  );

}


/* =========================================================
   DRAW PASSENGER NAME
   ========================================================= */

function drawPassengerName(
  ctx,
  name,
  x,
  y
) {

  if (!name) {

    return;

  }


  ctx.font =
    `${nameFontWeight} ${nameFontSize}px ${documentFont}`;


  ctx.textAlign =
    'left';


  ctx.textBaseline =
    'top';


  ctx.fillStyle =
    documentTextColor;


  ctx.fillText(

    name,

    x,

    y

  );


  const nameWidth =
    ctx.measureText(
      name
    ).width;


  ctx.font =
    `${passengerContinuationFontWeight} ${passengerContinuationFontSize}px ${documentFont}`;


  ctx.fillStyle =
    passengerContinuationColor;


  ctx.fillText(

    ` ${passengerContinuation}`,

    x +
    nameWidth,

    y

  );

}


/* =========================================================
   CREATE CANVAS
   ========================================================= */

async function createDocumentCanvas() {

  const image =
    pdf.querySelector('img');


  if (!image) {

    throw new Error(
      'Flight document image not found.'
    );

  }


  if (!image.complete) {

    await new Promise(
      resolve => {

        image.onload =
          resolve;

      }
    );

  }


  const imageWidth =
    image.naturalWidth;


  const imageHeight =
    image.naturalHeight;


  const canvas =
    document.createElement(
      'canvas'
    );


  canvas.width =
    imageWidth;


  canvas.height =
    imageHeight;


  const ctx =
    canvas.getContext(
      '2d'
    );


  ctx.drawImage(

    image,

    0,

    0,

    imageWidth,

    imageHeight

  );


  formInputs.forEach(
    (
      input,
      index
    ) => {

      if (
        index === 4 ||
        index === 7 ||
        !fieldPositions[index]
      ) {

        return;

      }


      const text =
        getDisplayValue(
          input,
          index
        );


      if (!text) {

        return;

      }


      const displayText =
        getDocumentDisplayText(
          text,
          index
        );


      const position =
        fieldPositions[index];


      const x =
        imageWidth *
        (
          position[0] /
          100
        );


      const y =
        imageHeight *
        (
          position[1] /
          100
        );


      const width =
        imageWidth *
        (
          position[2] /
          100
        );


      const style =
        getTextStyle(
          index
        );


      const fontSize =
        style.fontSize;


      const fontWeight =
        style.fontWeight;


      const lineHeight =
        style.lineHeight;


      if (
        index === 1
      ) {

        drawPassengerName(

          ctx,

          text,

          x,

          y

        );


        return;

      }


      ctx.font =
        `${fontWeight} ${fontSize}px ${documentFont}`;


      ctx.fillStyle =
        documentTextColor;


      ctx.textBaseline =
        'top';


      ctx.textAlign =
        'left';


      if (
        isWrappingField(index)
      ) {

        drawWrappedText(

          ctx,

          displayText,

          x,

          y,

          width,

          lineHeight,

          fontWeight,

          fontSize

        );

      } else {

        ctx.fillText(

          displayText,

          x,

          y

        );

      }

    }
  );


  if (
    flightWatermarkEnabled
  ) {

    ctx.save();


    ctx.translate(

      canvas.width / 2,

      canvas.height / 2

    );


    ctx.rotate(

      -28 *
      Math.PI /
      180

    );


    ctx.font =
      '700 58px Arial';


    ctx.fillStyle =
      'rgba(0,0,0,0.13)';


    ctx.textAlign =
      'center';


    ctx.textBaseline =
      'middle';


    ctx.fillText(
      'TEST / FREE',
      0,
      0
    );


    ctx.restore();

  }


  return canvas;

}


/* =========================================================
   DOWNLOAD JPG
   ========================================================= */

if (downloadJpg) {

  downloadJpg.addEventListener(
    'click',
    async function () {

      try {

        const canvas =
          await createDocumentCanvas();


        const link =
          document.createElement(
            'a'
          );


        link.download =
          `${createdFlight?.trackingNumber ||
          'flight-document'
          }.jpg`;


        link.href =
          canvas.toDataURL(
            'image/jpeg',
            0.95
          );


        link.click();


        closeDownloadModal();

      } catch (error) {

        console.error(
          'JPG DOWNLOAD ERROR:',
          error
        );


        alert(
          'Unable to download the JPG.'
        );

      }

    }
  );

}


/* =========================================================
   DOWNLOAD PDF
   ========================================================= */

if (downloadPdf) {

  downloadPdf.addEventListener(
    'click',
    async function () {

      try {

        const canvas =
          await createDocumentCanvas();


        const imageData =
          canvas.toDataURL(
            'image/jpeg',
            0.95
          );


        if (
          typeof window.jspdf ===
          'undefined'
        ) {

          alert(
            'PDF library is not available.'
          );

          return;

        }


        const {
          jsPDF
        } =
          window.jspdf;


        const pdfDocument =
          new jsPDF({

            orientation:

              canvas.width >=
                canvas.height

                ? 'landscape'

                : 'portrait',

            unit:
              'px',

            format: [

              canvas.width,

              canvas.height

            ]

          });


        pdfDocument.addImage(

          imageData,

          'JPEG',

          0,

          0,

          canvas.width,

          canvas.height

        );


        pdfDocument.save(

          `${createdFlight?.trackingNumber ||
          'flight-document'
          }.pdf`

        );


        closeDownloadModal();

      } catch (error) {

        console.error(
          'PDF DOWNLOAD ERROR:',
          error
        );


        alert(
          'Unable to download the PDF.'
        );

      }

    }
  );

}


/* =========================================================
   LIVE PREVIEW
   ========================================================= */

formInputs.forEach(
  input => {

    if (!input) {

      return;

    }


    input.addEventListener(
      'input',
      function () {

        if (
          flightCreated
        ) {

          return;

        }


        updateDocumentValues();

      }
    );

  }
);


/* =========================================================
   INITIALIZE FLIGHT PROFILES
   ========================================================= */

/* Flight profile styling is handled by Itinerary.css */

if (generatedDocument) {

  generatedDocument.style.display =
    'none';

}


if (flightManagement) {

  flightManagement.style.display =
    'none';

}


if (createFlightView) {

  createFlightView.style.display =
    'none';

}


if (selectedFlightView) {

  selectedFlightView.style.display =
    'none';

}


selectedFlightId =
  null;


removeWatermark();


updateDocumentValues();


/* =========================================================
   LOAD EXISTING FLIGHTS
   ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  async function () {

    await loadFlightProfiles();

  }
);


/* =========================================================
   FLIGHT STATUS TIME CHECK
   ========================================================= */

setInterval(
  function () {

    if (!createdFlight) {

      return;

    }


    updateFlightStatusControlLock(
      createdFlight
    );

  },
  30000
);


/* =========================================================
   NAVBAR
========================================================= */

const navbarUserName =
  document.getElementById(
    'navbarUserName'
  );


const navbarWalletBalance =
  document.getElementById(
    'navbarWalletBalance'
  );


const navbarLogout =
  document.getElementById(
    'navbarLogout'
  );


/* =========================================================
   LOAD NAVBAR USER
========================================================= */

async function loadNavbarUser() {

  const token =
    getToken();


  if (!token) {

    return;

  }


  try {

    const response =
      await fetch(
        `${API_URL}/auth/me`,
        {

          method:
            'GET',

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      return;

    }


    const user =
      data.user ||
      data;


    const name =
      user.name ||
      user.fullName ||
      user.username ||
      user.email ||
      'User';


    if (navbarUserName) {

      navbarUserName.textContent =
        name;

    }


  } catch (error) {

    console.error(
      'NAVBAR USER ERROR:',
      error
    );

  }

}


/* =========================================================
   LOAD NAVBAR WALLET
========================================================= */

async function loadNavbarWallet() {

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

          method:
            'GET',

          headers: {

            Authorization:
              `Bearer ${token}`

          }

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


    if (navbarWalletBalance) {

      navbarWalletBalance.textContent =
        `$${balance.toFixed(2)}`;

    }


  } catch (error) {

    console.error(
      'NAVBAR WALLET ERROR:',
      error
    );

  }

}


/* =========================================================
   NAVBAR LOGOUT
========================================================= */

if (navbarLogout) {

  navbarLogout.addEventListener(
    'click',
    function () {

      localStorage.removeItem(
        'token'
      );


      window.location.href =
        'login.html';

    }
  );

}


/* =========================================================
   INITIALIZE NAVBAR
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  async function () {

    const loggedIn =
      await checkLogin();


    if (!loggedIn) {

      return;

    }


    await loadNavbarUser();

    await loadNavbarWallet();

  }
);

/* =========================================================
   END
   ========================================================= */