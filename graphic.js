const backgrounds = {
      table: { src: "./images/bg%20table.png", image: new Image() },
      "brown-bed": { src: "./images/bg%20b1.jpeg", image: new Image() },
      "red-bed": { src: "./images/bg%20b2.jpeg", image: new Image() },
      "blue-bed": { src: "./images/bg%20b3.jpeg", image: new Image() }
    };
    const foreground = new Image();
    foreground.src = "./images/ss-removebg-preview.png";

    Object.values(backgrounds).forEach((background) => {
      background.image.src = background.src;
    });

    const canvas = document.querySelector("#canvas");
    const context = canvas.getContext("2d");
    const renderScale = Math.max(2, window.devicePixelRatio || 1);
    const sceneSize = document.querySelector("#scene-size");
    const backgroundSelect = document.querySelector("#background-select");
    const nameInput = document.querySelector("#name");
    const numberInput = document.querySelector("#number");
    const signatureCanvas = document.querySelector("#signature-canvas");
    const signatureContext = signatureCanvas.getContext("2d");
    const addSignatureButton = document.querySelector("#add-signature");
    const fixedPlacement = { size: 65, left: 15.5, vertical: 69 };
    const textPlacement = {
      name: { top: 0.57, left: 0.19, width: 0.65 },
      number: { top: 0.45, left: 0.26, width: 0.5 },
      signature: { top: 0.60, left: 0.28, width: 0.50 }
    };
    const backgroundScale = 1;
    let activeBackground = "table";
    let isSigning = false;
    let hasSignature = false;
    let signatureAdded = false;

    function getReferenceBackground() {
      return backgrounds[activeBackground].image;
    }

    function getPlacement() {
      const background = getReferenceBackground();
      const width = background.naturalWidth * fixedPlacement.size / 100;
      const height = width * foreground.naturalHeight / foreground.naturalWidth;
      return {
        x: background.naturalWidth * fixedPlacement.left / 100,
        y: background.naturalHeight * fixedPlacement.vertical / 100 - height / 2,
        width,
        height
      };
    }

    function render() {
      const background = backgrounds[activeBackground].image;
      const reference = getReferenceBackground();
      if (
        !background.complete || !background.naturalWidth ||
        !reference.complete || !reference.naturalWidth ||
        !foreground.complete || !foreground.naturalWidth
      ) {
        return;
      }

      const outputWidth = background.naturalWidth;
      const outputHeight = background.naturalHeight;
      const sceneWidth = reference.naturalWidth * backgroundScale;
      const sceneHeight = reference.naturalHeight * backgroundScale;
      const insetX = (reference.naturalWidth - sceneWidth) / 2;
      const insetY = (reference.naturalHeight - sceneHeight) / 2;
      const scaleX = outputWidth / sceneWidth;
      const scaleY = outputHeight / sceneHeight;
      canvas.width = Math.round(outputWidth * renderScale);
      canvas.height = Math.round(outputHeight * renderScale);
      context.setTransform(renderScale, 0, 0, renderScale, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      const sceneAspect = outputWidth / outputHeight;
      const sourceX = 0;
      const sourceY = background.naturalHeight * 0.1;
      const sourceWidth = background.naturalWidth * 0.9;
      const sourceHeight = background.naturalHeight * 0.9;
      const sourceAspect = sourceWidth / sourceHeight;
      let cropWidth = sourceWidth;
      let cropHeight = sourceHeight;
      if (sourceAspect > sceneAspect) {
        cropWidth = sourceHeight * sceneAspect;
      } else {
        cropHeight = sourceWidth / sceneAspect;
      }
      const backgroundZoom = 1;
      cropWidth /= backgroundZoom;
      cropHeight /= backgroundZoom;
      const cropPositionX = 0.85;
      const cropPositionY = 0.05;
      const cropX = sourceX + (sourceWidth - cropWidth) * cropPositionX;
      const cropY = sourceY + (sourceHeight - cropHeight) * cropPositionY;
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

      const placement = getPlacement();
      const horizontalShift = 30 * outputWidth / canvas.clientWidth;
      const centerX = (placement.x + placement.width / 2 - insetX) * scaleX + horizontalShift;
      const verticalShift = 50 * outputHeight / canvas.clientHeight;
      const centerY = (placement.y + placement.height / 2 - insetY) * scaleY - verticalShift;
      const width = placement.width * scaleX;
      const height = placement.height * scaleX;
      context.save();
      context.translate(centerX, centerY);
      context.rotate(-1.5 * Math.PI / 180);
      context.shadowColor = "rgba(35, 23, 12, 0.38)";
      context.shadowBlur = 7 * scaleX;
      context.shadowOffsetX = 1 * scaleX;
      context.shadowOffsetY = 4 * scaleX;
      context.drawImage(foreground, -width / 2, -height / 2, width, height);
      context.shadowColor = "transparent";

// NAME AND NUMBER
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

  const areaWidth = width * placement.width;

  // Center horizontally inside the assigned area
  const centerX =
    -width / 2 +
    width * placement.left +
    areaWidth / 2;

  // Keep the vertical position controlled by top
  const centerY =
    -height / 2 +
    height * placement.top;

  context.font = `400 ${Math.max(10, height * 0.06)}px sans-serif`;

  context.fillText(
    value,
    centerX,
    centerY,
    areaWidth
  );

});


// SIGNATURE
if (signatureAdded) {

  const signaturePosition = textPlacement.signature;

  const signatureWidth = width * signaturePosition.width;

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

      sceneSize.textContent = `${canvas.width} × ${canvas.height} px`;
    }

    [nameInput, numberInput].forEach((input) => {
      input.addEventListener("input", render);
    });

    function getSignaturePoint(event) {
      const bounds = signatureCanvas.getBoundingClientRect();
      return {
        x: (event.clientX - bounds.left) * signatureCanvas.width / bounds.width,
        y: (event.clientY - bounds.top) * signatureCanvas.height / bounds.height
      };
    }

    signatureCanvas.addEventListener("pointerdown", (event) => {
      isSigning = true;
      hasSignature = true;
      addSignatureButton.disabled = false;
      const point = getSignaturePoint(event);
      signatureContext.beginPath();
      signatureContext.moveTo(point.x, point.y);
      signatureCanvas.setPointerCapture(event.pointerId);
      render();
    });

    signatureCanvas.addEventListener("pointermove", (event) => {
      if (!isSigning) return;
      const point = getSignaturePoint(event);
      signatureContext.lineWidth = 6;
      signatureContext.lineCap = "round";
      signatureContext.lineJoin = "round";
      signatureContext.strokeStyle = "#17211d";
      signatureContext.lineTo(point.x, point.y);
      signatureContext.stroke();
      render();
    });

    function stopSigning() {
      isSigning = false;
    }

    signatureCanvas.addEventListener("pointerup", stopSigning);
    signatureCanvas.addEventListener("pointercancel", stopSigning);

    document.querySelector("#clear-signature").addEventListener("click", () => {
      signatureContext.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      hasSignature = false;
      signatureAdded = false;
      addSignatureButton.disabled = true;
      render();
    });

    addSignatureButton.addEventListener("click", () => {
      if (!hasSignature) return;
      signatureAdded = true;
      render();
    });

    backgroundSelect.addEventListener("change", () => {
      activeBackground = backgroundSelect.value;
      render();
    });

    Object.values(backgrounds).forEach(({ image }) => {
      image.addEventListener("load", render);
    });
    foreground.addEventListener("load", render);
    window.addEventListener("resize", render);

    document.querySelector("#download").addEventListener("click", () => {
  if (!canvas.width || !canvas.height) {
    alert("The image is not ready yet.");
    return;
  }

  const png = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.download = `scene-${activeBackground}.png`;
  link.href = png;

  document.body.appendChild(link);
  link.click();
  link.remove();
});

    render();