let imageOutput;

function createAsciiArt(img) {
  imageOutput = select('#imageOutput'); // Select the image element for output

  // Calculate aspect ratio and desired size of ASCII output
  const asciiWidth = 100; // Change this to control output size
  const aspectRatio = img.height / (2.3* img.width);
  const asciiHeight = asciiWidth * aspectRatio;

  img.resize(asciiWidth, asciiHeight); // Resize the image proportionally
  img.loadPixels();

  // Create a p5 graphics to draw ASCII
  let graphics = createGraphics(asciiWidth * 6, asciiHeight * 15); // Change multipliers to adjust character spacing
  graphics.background(255); // White background
  graphics.fill(0); // Black text
  graphics.textAlign(LEFT, TOP); // Align text to top left
  graphics.textSize(8); // Set text size, may need to adjust based on output
  graphics.textLeading(8); // Set line height, may need to adjust based on output

  // Draw the ASCII characters on the graphics object
  for (let j = 0; j < img.height; j++) {
    for (let i = 0; i < img.width; i++) {
      const pixelIndex = (i + j * img.width) * 4;
      const r = img.pixels[pixelIndex];
      const g = img.pixels[pixelIndex + 1];
      const b = img.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
      const char = getCharForBrightness(avg);
      graphics.text(char, i * 6, j * 15); // Change multipliers to adjust character spacing
    }
  }

  // Convert the graphics object to an image
  imageOutput.elt.src = graphics.elt.toDataURL('image/jpeg');
}



// Maps brightness of a pixel to a character
const chars = '@#%&?*+=-:. ';
function getCharForBrightness(brightness) {
  const charIndex = map(brightness, 0, 255, chars.length - 1, 0);
  return chars[Math.round(charIndex)];
}

// Handles image file upload and creates ASCII art
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    loadImage(
      URL.createObjectURL(file),
      createAsciiArt,
      (e) => console.error("Failed to load image: ", e)
    );
  }
}

// p5.js setup function runs once the page is loaded and p5 is ready
function setup() {
  noCanvas();
  // Attach the handleImageUpload function to the file input element
  const inputElement = document.getElementById('imageUpload');
  if (inputElement) {
    inputElement.addEventListener('change', handleImageUpload);
  }
}
