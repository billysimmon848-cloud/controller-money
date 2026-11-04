
// ======================================================
// JUSTDOKS GRAPHICS
// ======================================================


// ======================================================
// API
// API_URL IS DECLARED IN index.js
// ======================================================

const CLEAN_GRAPHICS_PRICE = 3;


// ======================================================
// BACKGROUNDS
// ======================================================

const backgrounds = {
  table: {
    src: "./images/bg%20table.png",
    image: new Image()
  },

  "brown-bed": {
    src: "./images/bg%20b1.jpeg",
    image: new Image()
  },

  "red-bed": {
    src: "./images/bg%20b2.jpeg",
    image: new Image()
  },

  "blue-bed": {
    src: "./images/bg%20b3.jpeg",
    image: new Image()
  }
};

const foreground = new Image();

foreground.src = "./images/ss-removebg-preview.png";

Object.values(backgrounds).forEach((background) => {
  background.image.src = background.src;
});


// ======================================================
// CANVAS
// ======================================================

const canvas = document.querySelector("#canvas");

const context = canvas.getContext("2d");

const renderScale = Math.max(
  2,
  window.devicePixelRatio || 1
);

const sceneSize = document.querySelector("#scene-size");

const backgroundSelect =
  document.querySelector("#background-select");

const nameInput = document.querySelector("#name");

const numberInput = document.querySelector("#number");

const signatureCanvas =
  document.querySelector("#signature-canvas");

const signatureContext =
  signatureCanvas.getContext("2d");

const addSignatureButton =
  document.querySelector("#add-signature");


// ======================================================
// MODAL ELEMENTS
// ======================================================

const downloadButton =
  document.querySelector("#download");

const downloadModal =
  document.querySelector("#download-modal");

const modalBackdrop =
  document.querySelector("#download-modal-backdrop");

const modalClose =
  document.querySelector("#modal-close");

const freeDownloadButton =
  document.querySelector("#free-download");

const cleanDownloadButton =
  document.querySelector("#clean-download");

const downloadMessage =
  document.querySelector("#download-message");


// ======================================================
// DOCUMENT WORKSPACE ELEMENTS
// ======================================================

const workspace =
  document.querySelector("#workspace");

const previewPanel =
  document.querySelector("#preview-panel");

const documentsList =
  document.querySelector("#documents-list");

const emptyDocuments =
  document.querySelector("#empty-documents");

const createButton =
  document.querySelector("#create");

const previewButton =
  document.querySelector("#preview-button");

const backToCreateButton =
  document.querySelector("#back-to-create");

const removeWatermarkPreviewButton =
  document.querySelector("#remove-watermark-preview");


// ======================================================
// CREATED DOCUMENTS
// ======================================================

let createdDocuments = [];

let activeDocumentId = null;

let isCreatingDocument = false;

let isProcessingPayment = false;


// ======================================================
// PLACEMENT SETTINGS
// ======================================================

const fixedPlacement = {
  size: 65,
  left: 15.5,
  vertical: 69
};

const textPlacement = {
  name: {
    top: 0.57,
    left: 0.19,
    width: 0.65
  },

  number: {
    top: 0.45,
    left: 0.26,
    width: 0.5
  },

  signature: {
    top: 0.60,
    left: 0.28,
    width: 0.50
  }
};

const backgroundScale = 1;

let activeBackground = "table";

let isSigning = false;

let hasSignature = false;

let signatureAdded = false;


// ======================================================
// AUTHENTICATION
// ======================================================

function getGraphicsToken() {

  return localStorage.getItem("token");

}


// ======================================================
// API REQUEST
// ======================================================

async function graphicsRequest(endpoint, options = {}) {

  const token = getGraphicsToken();

  if (!token) {

    throw new Error(
      "Please log in to access your Graphics documents."
    );

  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    }
  );


  let data;

  try {

    data = await response.json();

  } catch (error) {

    throw new Error(
      "The server returned an invalid response."
    );

  }


  if (!response.ok || !data.success) {

    throw new Error(
      data.message || "Graphics request failed."
    );

  }

  return data;

}


// ======================================================
// GET AUTHENTICATED IMAGE
// ======================================================

async function getGraphicsImage(imageUrl) {

  const token = getGraphicsToken();

  if (!token) {

    throw new Error(
      "Please log in to access this image."
    );

  }


  // Backend image URLs begin with /api.
  // API_URL already ends with /api.

  const imagePath =
    imageUrl.replace(/^\/api/, "");

  const response = await fetch(
    `${API_URL}${imagePath}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );


  if (!response.ok) {

    let message = "Unable to load graphics image.";

    try {

      const data = await response.json();

      message = data.message || message;

    } catch (error) {}

    throw new Error(message);

  }


  const blob = await response.blob();

  return URL.createObjectURL(blob);

}


// ======================================================
// GET BACKGROUND
// ======================================================

function getReferenceBackground() {

  return backgrounds[activeBackground].image;

}


// ======================================================
// GET FOREGROUND PLACEMENT
// ======================================================

function getPlacement() {

  const background = getReferenceBackground();

  const width =
    background.naturalWidth *
    fixedPlacement.size / 100;

  const height =
    width *
    foreground.naturalHeight /
    foreground.naturalWidth;

  return {

    x:
      background.naturalWidth *
      fixedPlacement.left / 100,

    y:
      background.naturalHeight *
      fixedPlacement.vertical / 100 -
      height / 2,

    width,
    height

  };

}


// ======================================================
// RENDER SCENE
// ======================================================

function render() {

  const background =
    backgrounds[activeBackground].image;

  const reference =
    getReferenceBackground();

  if (
    !background.complete ||
    !background.naturalWidth ||

    !reference.complete ||
    !reference.naturalWidth ||

    !foreground.complete ||
    !foreground.naturalWidth
  ) {
    return;
  }

  const outputWidth =
    background.naturalWidth;

  const outputHeight =
    background.naturalHeight;

  const sceneWidth =
    reference.naturalWidth * backgroundScale;

  const sceneHeight =
    reference.naturalHeight * backgroundScale;

  const insetX =
    (reference.naturalWidth - sceneWidth) / 2;

  const insetY =
    (reference.naturalHeight - sceneHeight) / 2;

  const scaleX =
    outputWidth / sceneWidth;

  const scaleY =
    outputHeight / sceneHeight;


  // Canvas dimensions

  canvas.width =
    Math.round(outputWidth * renderScale);

  canvas.height =
    Math.round(outputHeight * renderScale);

  context.setTransform(
    renderScale,
    0,
    0,
    renderScale,
    0,
    0
  );

  context.imageSmoothingEnabled = true;

  context.imageSmoothingQuality = "high";


  // ====================================================
  // BACKGROUND CROPPING
  // ====================================================

  const sceneAspect =
    outputWidth / outputHeight;

  const sourceX = 0;

  const sourceY =
    background.naturalHeight * 0.1;

  const sourceWidth =
    background.naturalWidth * 0.9;

  const sourceHeight =
    background.naturalHeight * 0.9;

  const sourceAspect =
    sourceWidth / sourceHeight;

  let cropWidth = sourceWidth;

  let cropHeight = sourceHeight;

  if (sourceAspect > sceneAspect) {

    cropWidth =
      sourceHeight * sceneAspect;

  } else {

    cropHeight =
      sourceWidth / sceneAspect;

  }

  const backgroundZoom = 1;

  cropWidth /= backgroundZoom;

  cropHeight /= backgroundZoom;

  const cropPositionX = 0.85;

  const cropPositionY = 0.05;

  const cropX =
    sourceX +
    (sourceWidth - cropWidth) *
    cropPositionX;

  const cropY =
    sourceY +
    (sourceHeight - cropHeight) *
    cropPositionY;

  context.drawImage(
    background,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );


  // ====================================================
  // FOREGROUND PLACEMENT
  // ====================================================

  const placement = getPlacement();

  const displayWidth =
    canvas.clientWidth ||
    Math.min(
      700,
      Math.max(240, window.innerWidth - 80)
    );

  const displayHeight =
    canvas.clientHeight ||
    displayWidth * outputHeight / outputWidth;

  const horizontalShift =
    30 * outputWidth / displayWidth;

  const centerX =
    (
      placement.x +
      placement.width / 2 -
      insetX
    ) * scaleX +
    horizontalShift;

  const verticalShift =
    50 * outputHeight / displayHeight;

  const centerY =
    (
      placement.y +
      placement.height / 2 -
      insetY
    ) * scaleY -
    verticalShift;

  const width =
    placement.width * scaleX;

  const height =
    placement.height * scaleX;


  // ====================================================
  // DRAW FOREGROUND
  // ====================================================

  context.save();

  context.translate(centerX, centerY);

  context.rotate(-1.5 * Math.PI / 180);

  context.shadowColor =
    "rgba(35, 23, 12, 0.38)";

  context.shadowBlur =
    7 * scaleX;

  context.shadowOffsetX =
    1 * scaleX;

  context.shadowOffsetY =
    4 * scaleX;

  context.drawImage(
    foreground,
    -width / 2,
    -height / 2,
    width,
    height
  );

  context.shadowColor = "transparent";


  // ====================================================
  // NAME AND NUMBER
  // ====================================================

  context.fillStyle = "#17211d";

  context.textBaseline = "middle";

  context.textAlign = "center";

  [
    {
      value: nameInput.value.trim(),
      placement: textPlacement.name
    },

    {
      value: numberInput.value.trim(),
      placement: textPlacement.number
    }

  ].forEach(({ value, placement }) => {

    if (!value) return;

    const areaWidth =
      width * placement.width;

    const textCenterX =
      -width / 2 +
      width * placement.left +
      areaWidth / 2;

    const textCenterY =
      -height / 2 +
      height * placement.top;

    context.font =
      `400 ${Math.max(10, height * 0.06)}px sans-serif`;

    context.fillText(
      value,
      textCenterX,
      textCenterY,
      areaWidth
    );

  });


  // ====================================================
  // SIGNATURE
  // ====================================================

  if (signatureAdded) {

    const signaturePosition =
      textPlacement.signature;

    const signatureWidth =
      width * signaturePosition.width;

    const signatureHeight =
      signatureWidth *
      signatureCanvas.height /
      signatureCanvas.width;

    const signatureLeft =
      -width / 2 +
      width * signaturePosition.left;

    const signatureTop =
      -height / 2 +
      height * signaturePosition.top;

    context.shadowColor = "transparent";

    context.drawImage(
      signatureCanvas,
      signatureLeft,
      signatureTop,
      signatureWidth,
      signatureHeight
    );

  }

  context.restore();

  sceneSize.textContent =
    `${canvas.width} × ${canvas.height} px`;

}


// ======================================================
// TEXT INPUT EVENTS
// ======================================================

[nameInput, numberInput].forEach((input) => {

  input.addEventListener("input", render);

});


// ======================================================
// SIGNATURE
// ======================================================

function getSignaturePoint(event) {

  const bounds =
    signatureCanvas.getBoundingClientRect();

  return {

    x:
      (event.clientX - bounds.left) *
      signatureCanvas.width /
      bounds.width,

    y:
      (event.clientY - bounds.top) *
      signatureCanvas.height /
      bounds.height

  };

}


signatureCanvas.addEventListener(
  "pointerdown",
  (event) => {

    isSigning = true;

    hasSignature = true;

    addSignatureButton.disabled = false;

    const point =
      getSignaturePoint(event);

    signatureContext.beginPath();

    signatureContext.moveTo(
      point.x,
      point.y
    );

    signatureCanvas.setPointerCapture(
      event.pointerId
    );

    render();

  }
);


signatureCanvas.addEventListener(
  "pointermove",
  (event) => {

    if (!isSigning) return;

    const point =
      getSignaturePoint(event);

    signatureContext.lineWidth = 6;

    signatureContext.lineCap = "round";

    signatureContext.lineJoin = "round";

    signatureContext.strokeStyle = "#17211d";

    signatureContext.lineTo(
      point.x,
      point.y
    );

    signatureContext.stroke();

    render();

  }
);


function stopSigning() {

  isSigning = false;

}


signatureCanvas.addEventListener(
  "pointerup",
  stopSigning
);

signatureCanvas.addEventListener(
  "pointercancel",
  stopSigning
);


document
  .querySelector("#clear-signature")
  .addEventListener("click", () => {

    signatureContext.clearRect(
      0,
      0,
      signatureCanvas.width,
      signatureCanvas.height
    );

    hasSignature = false;

    signatureAdded = false;

    addSignatureButton.disabled = true;

    render();

  });


addSignatureButton.addEventListener(
  "click",
  () => {

    if (!hasSignature) return;

    signatureAdded = true;

    render();

  }
);


// ======================================================
// BACKGROUND SELECTOR
// ======================================================

backgroundSelect.addEventListener(
  "change",
  () => {

    activeBackground =
      backgroundSelect.value;

    render();

  }
);


Object.values(backgrounds).forEach(({ image }) => {

  image.addEventListener("load", render);

});


foreground.addEventListener("load", render);

window.addEventListener("resize", render);


// ======================================================
// WATERMARK GENERATOR
// ======================================================

function createWatermarkedPNG() {

  if (!canvas.width || !canvas.height) {

    throw new Error(
      "The image is not ready yet."
    );

  }

  const watermarkCanvas =
    document.createElement("canvas");

  watermarkCanvas.width = canvas.width;

  watermarkCanvas.height = canvas.height;

  const watermarkContext =
    watermarkCanvas.getContext("2d");

  watermarkContext.drawImage(
    canvas,
    0,
    0
  );

  const width =
    watermarkCanvas.width;

  const height =
    watermarkCanvas.height;

  const fontSize =
    Math.max(
      20,
      Math.round(width * 0.025)
    );


  // REPEATED DIAGONAL WATERMARK

  watermarkContext.save();

  watermarkContext.translate(
    width / 2,
    height / 2
  );

  watermarkContext.rotate(-Math.PI / 4);

  watermarkContext.font =
    `700 ${fontSize}px Arial, sans-serif`;

  watermarkContext.textAlign = "center";

  watermarkContext.textBaseline = "middle";

  watermarkContext.fillStyle =
    "rgba(255, 255, 255, 0.36)";

  watermarkContext.strokeStyle =
    "rgba(25, 35, 29, 0.18)";

  watermarkContext.lineWidth = 1.5;

  const horizontalSpacing =
    fontSize * 11;

  const verticalSpacing =
    fontSize * 5;

  for (
    let y = -width - height;
    y < width + height;
    y += verticalSpacing
  ) {

    for (
      let x = -width - height;
      x < width + height;
      x += horizontalSpacing
    ) {

      watermarkContext.strokeText(
        "JUSTDOKS.COM",
        x,
        y
      );

      watermarkContext.fillText(
        "JUSTDOKS.COM",
        x,
        y
      );

    }

  }

  watermarkContext.restore();


  // CENTRAL WATERMARK

  watermarkContext.save();

  watermarkContext.translate(
    width / 2,
    height / 2
  );

  watermarkContext.rotate(-Math.PI / 8);

  watermarkContext.font =
    `800 ${Math.max(30, Math.round(width * 0.055))}px Arial, sans-serif`;

  watermarkContext.textAlign = "center";

  watermarkContext.textBaseline = "middle";

  watermarkContext.fillStyle =
    "rgba(255, 255, 255, 0.30)";

  watermarkContext.strokeStyle =
    "rgba(20, 30, 24, 0.18)";

  watermarkContext.lineWidth = 2;

  watermarkContext.strokeText(
    "JUSTDOKS.COM",
    0,
    0
  );

  watermarkContext.fillText(
    "JUSTDOKS.COM",
    0,
    0
  );

  watermarkContext.restore();

  return watermarkCanvas.toDataURL("image/png");

}


// ======================================================
// CONVERT DATA URL TO BLOB
// ======================================================

function dataURLToBlob(dataURL) {

  const parts = dataURL.split(",");

  const mime = parts[0].match(/:(.*?);/)[1];

  const binary = atob(parts[1]);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {

    bytes[i] = binary.charCodeAt(i);

  }

  return new Blob(
    [bytes],
    { type: mime }
  );

}


// ======================================================
// DOWNLOAD PNG FUNCTION
// ======================================================

function downloadPNG(imageURL, filename) {

  if (!imageURL) {

    alert("This document is not available for download.");

    return;

  }

  const link =
    document.createElement("a");

  link.download = filename;

  link.href = imageURL;

  document.body.appendChild(link);

  link.click();

  link.remove();

}


// ======================================================
// MODAL MESSAGE
// ======================================================

function setDownloadMessage(message, type = "") {

  downloadMessage.textContent = message;

  downloadMessage.className = "download-message";

  if (type) {

    downloadMessage.classList.add(type);

  }

}


// ======================================================
// OPEN CREATE MODAL
// ======================================================

function openCreateModal() {

  if (!canvas.width || !canvas.height) {

    alert("The image is not ready yet.");

    return;

  }

  setDownloadMessage("");

  downloadModal.classList.add("active");

  downloadModal.setAttribute(
    "aria-hidden",
    "false"
  );

}


// ======================================================
// CLOSE MODAL
// ======================================================

function closeDownloadModal() {

  if (isProcessingPayment) return;

  downloadModal.classList.remove("active");

  downloadModal.setAttribute(
    "aria-hidden",
    "true"
  );

  setDownloadMessage("");

}


// ======================================================
// MODAL EVENTS
// ======================================================

createButton.addEventListener(
  "click",
  openCreateModal
);

modalClose.addEventListener(
  "click",
  closeDownloadModal
);

modalBackdrop.addEventListener(
  "click",
  closeDownloadModal
);

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      downloadModal.classList.contains("active")
    ) {

      closeDownloadModal();

    }

  }
);


// ======================================================
// REFRESH WALLET NAVBAR
// ======================================================

async function refreshGraphicsWallet() {

  if (typeof loadUserNavbar === "function") {

    try {

      await loadUserNavbar();

    } catch (error) {

      console.error(
        "WALLET REFRESH ERROR:",
        error
      );

    }

  }

}


// ======================================================
// GET DOCUMENT BY ID
// ======================================================

function getDocumentById(id) {

  return createdDocuments.find(
    (doc) => String(doc.id) === String(id)
  );

}


// ======================================================
// RENDER DOCUMENT LIST
// NAME AND STATUS ONLY
// ======================================================

function renderDocuments() {

  documentsList.innerHTML = "";

  emptyDocuments.style.display =
    createdDocuments.length
      ? "none"
      : "block";


  createdDocuments.forEach((doc) => {

    const item =
      document.createElement("div");

    item.className = "document-item";

    if (String(doc.id) === String(activeDocumentId)) {

      item.classList.add("active");

    }


    // DOCUMENT NAME

    const name =
      document.createElement("div");

    name.className = "document-item-name";

    name.textContent = doc.name;


    // DOCUMENT STATUS

    const status =
      document.createElement("div");

    status.className = "document-item-status";

    status.textContent = doc.status;


    item.appendChild(name);

    item.appendChild(status);


    // CLICK TO OPEN PREVIEW

    item.addEventListener("click", () => {

      showPreview(doc.id);

    });


    documentsList.appendChild(item);

  });


  previewButton.disabled =
    createdDocuments.length === 0;

}


// ======================================================
// LOAD SAVED DOCUMENT IMAGE
// ======================================================

async function loadDocumentImage(doc) {

  if (doc.imageBlobUrl) {

    return doc.imageBlobUrl;

  }

  if (!doc.imageUrl) {

    throw new Error(
      "This document has no saved image."
    );

  }


  const imageBlobUrl =
    await getGraphicsImage(doc.imageUrl);

  doc.imageBlobUrl = imageBlobUrl;

  return imageBlobUrl;

}


// ======================================================
// LOAD USER DOCUMENTS FROM MONGODB
// ======================================================

async function loadMyDocuments() {

  try {

    const data = await graphicsRequest(
      "/graphics/my-documents"
    );


    createdDocuments = data.documents.map((doc) => ({

      id: String(doc.id),

      name: doc.name,

      background: doc.background,

      status: doc.status,

      createdAt: doc.createdAt,

      imageUrl: doc.imageUrl,

      imageBlobUrl: null

    }));


    renderDocuments();


  } catch (error) {

    console.error(
      "LOAD GRAPHICS DOCUMENTS ERROR:",
      error
    );

    emptyDocuments.style.display = "block";

    emptyDocuments.textContent =
      error.message || "Unable to load your documents.";

  }

}


// ======================================================
// SHOW DOCUMENT PREVIEW
// ======================================================

async function showPreview(documentId) {

  const doc =
    getDocumentById(documentId);

  if (!doc) return;


  activeDocumentId = doc.id;

  renderDocuments();


  try {

    const imageURL =
      await loadDocumentImage(doc);


    // Prevent an older image request from replacing
    // a newer document selection.

    if (
      String(activeDocumentId) !== String(documentId)
    ) {
      return;
    }


    const image = new Image();

    image.onload = () => {

      previewPanel.hidden = false;

      workspace.classList.add("preview-mode");

      canvas.width = image.naturalWidth;

      canvas.height = image.naturalHeight;

      context.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
      );

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      sceneSize.textContent =
        `${canvas.width} × ${canvas.height} px`;


      // SHOW REMOVE WATERMARK ONLY FOR FREE DOCUMENTS

      removeWatermarkPreviewButton.hidden =
        doc.status !== "Free";

      removeWatermarkPreviewButton.disabled = false;

      removeWatermarkPreviewButton.textContent =
        `Remove Watermark — $${CLEAN_GRAPHICS_PRICE}`;


      renderDocuments();

    };


    image.onerror = () => {

      alert("Unable to display this document.");

    };

    image.src = imageURL;

  } catch (error) {

    console.error(
      "DOCUMENT PREVIEW ERROR:",
      error
    );

    alert(
      error.message || "Unable to load this document."
    );

  }

}


// ======================================================
// REMOVE WATERMARK BUTTON IN PREVIEW
// ======================================================

removeWatermarkPreviewButton.addEventListener(
  "click",
  () => {

    if (!activeDocumentId) return;

    removeDocumentWatermark(activeDocumentId);

  }
);


// ======================================================
// BACK TO CREATE
// ======================================================

function showCreate() {

  workspace.classList.remove("preview-mode");

  previewPanel.hidden = true;

  activeDocumentId = null;

  renderDocuments();

  render();

}


backToCreateButton.addEventListener(
  "click",
  showCreate
);


// ======================================================
// PREVIEW LATEST DOCUMENT
// ======================================================

previewButton.addEventListener(
  "click",
  () => {

    if (!createdDocuments.length) return;

    const documentId =
      activeDocumentId ||
      createdDocuments[0].id;

    showPreview(documentId);

  }
);


// ======================================================
// DOWNLOAD ACTIVE DOCUMENT
// ======================================================

downloadButton.addEventListener(
  "click",
  async () => {

    const doc =
      getDocumentById(activeDocumentId);

    if (!doc) {

      alert("Please select a document first.");

      return;

    }


    try {

      const imageURL =
        await loadDocumentImage(doc);

      downloadPNG(
        imageURL,
        `scene-${doc.background}-${doc.status.toLowerCase()}.png`
      );

    } catch (error) {

      console.error(
        "GRAPHICS DOWNLOAD ERROR:",
        error
      );

      alert(
        error.message || "Unable to download this document."
      );

    }

  }
);


// ======================================================
// CREATE DOCUMENT
// SAVE TO MONGODB
// ======================================================

async function createDocument(type) {

  if (
    isCreatingDocument ||
    isProcessingPayment
  ) {
    return;
  }


  if (!canvas.width || !canvas.height) {

    setDownloadMessage(
      "Your design is not ready yet. Please try again."
    );

    return;

  }


  isCreatingDocument = true;

  isProcessingPayment = true;

  freeDownloadButton.disabled = true;

  cleanDownloadButton.disabled = true;


  try {

    // ==================================================
    // PREPARE PNG IMAGES
    // ==================================================

    setDownloadMessage(
      "Preparing your graphics..."
    );


    const cleanPNG =
      canvas.toDataURL("image/png");

    let freePNG = null;

    if (type === "Free") {

      freePNG = createWatermarkedPNG();

    }


    // ==================================================
    // CREATE MULTIPART FORM DATA
    // ==================================================

    const formData = new FormData();

    formData.append(
      "name",
      nameInput.value.trim() ||
      `Graphics ${createdDocuments.length + 1}`
    );

    formData.append(
      "background",
      activeBackground
    );

    formData.append(
      "status",
      type
    );


    formData.append(
      "cleanPNG",
      dataURLToBlob(cleanPNG),
      "clean.png"
    );


    if (type === "Free") {

      formData.append(
        "freePNG",
        dataURLToBlob(freePNG),
        "free.png"
      );

    }


    // ==================================================
    // SAVE DOCUMENT ON BACKEND
    // CLEAN PAYMENT IS HANDLED BY THE BACKEND
    // ==================================================

    setDownloadMessage(
      type === "Clean"
        ? "Saving your document and processing $3 payment..."
        : "Saving your Free document..."
    );


    const data = await graphicsRequest(
      "/graphics/save",
      {
        method: "POST",
        body: formData
      }
    );


    // ==================================================
    // ADD SAVED DOCUMENT TO FRONTEND
    // ==================================================

    const savedDocument = {

      id: String(data.document.id),

      name: data.document.name,

      background: data.document.background,

      status: data.document.status,

      createdAt: data.document.createdAt,

      imageUrl: data.document.imageUrl,

      imageBlobUrl: null

    };


    createdDocuments.unshift(savedDocument);

    renderDocuments();


    // ==================================================
    // REFRESH WALLET AFTER CLEAN PAYMENT
    // ==================================================

    if (type === "Clean") {

      await refreshGraphicsWallet();

    }


    // ==================================================
    // CLOSE MODAL AND SHOW SAVED DOCUMENT
    // ==================================================

    closeDownloadModal();

    await showPreview(savedDocument.id);


  } catch (error) {

    console.error(
      "CREATE DOCUMENT ERROR:",
      error
    );

    setDownloadMessage(
      error.message ||
      "Unable to create and save your graphics."
    );

  } finally {

    isCreatingDocument = false;

    isProcessingPayment = false;

    freeDownloadButton.disabled = false;

    cleanDownloadButton.disabled = false;

  }

}


// ======================================================
// CREATE FREE VERSION
// ======================================================

freeDownloadButton.addEventListener(
  "click",
  () => {

    createDocument("Free");

  }
);


// ======================================================
// CREATE CLEAN VERSION - $3
// ======================================================

cleanDownloadButton.addEventListener(
  "click",
  () => {

    createDocument("Clean");

  }
);


// ======================================================
// REMOVE WATERMARK FROM EXISTING DOCUMENT
// BACKEND HANDLES PAYMENT AND UPDATE
// ======================================================

async function removeDocumentWatermark(documentId) {

  if (
    isProcessingPayment ||
    isCreatingDocument
  ) {
    return;
  }


  const doc =
    getDocumentById(documentId);

  if (!doc || doc.status !== "Free") return;


  isProcessingPayment = true;

  removeWatermarkPreviewButton.disabled = true;

  removeWatermarkPreviewButton.textContent =
    "Processing payment...";


  try {

    const data = await graphicsRequest(
      `/graphics/${encodeURIComponent(documentId)}/remove-watermark`,
      {
        method: "POST"
      }
    );


    // ==================================================
    // UPDATE LOCAL DOCUMENT DETAILS
    // ==================================================

    doc.status = "Clean";

    doc.imageUrl = data.document.imageUrl;


    // Remove the old cached watermarked image.

    if (doc.imageBlobUrl) {

      URL.revokeObjectURL(doc.imageBlobUrl);

      doc.imageBlobUrl = null;

    }


    renderDocuments();


    // Refresh wallet balance.

    await refreshGraphicsWallet();


    // Refresh preview.

    if (
      String(activeDocumentId) === String(documentId)
    ) {

      await showPreview(documentId);

    }

  } catch (error) {

    console.error(
      "REMOVE WATERMARK ERROR:",
      error
    );

    alert(
      error.message ||
      "Unable to remove the watermark."
    );


    removeWatermarkPreviewButton.disabled = false;

    removeWatermarkPreviewButton.textContent =
      `Remove Watermark — $${CLEAN_GRAPHICS_PRICE}`;

  } finally {

    isProcessingPayment = false;

  }

}


// ======================================================
// INITIAL RENDER
// ======================================================

render();


// ======================================================
// LOAD SAVED DOCUMENTS WHEN GRAPHICS OPENS
// ======================================================

loadMyDocuments();
