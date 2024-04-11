/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import AddOnSdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

let gallery;

let imageHandlerCount = 0;

// Wait for the SDK to be ready before rendering elements in the DOM.
AddOnSdk.ready.then(async () => {
    console.log("addonsdk called");

    // Create elements in the DOM.
    gallery = document.createElement("div");
    gallery.className = "gallery";

    setupInput();

});

function setupInput() {
    console.log("setupInput() called");
    const inputElement = document.getElementById('imageUpload');
    if (inputElement) {
        inputElement.addEventListener('change', handleImgUpload);
    }
}

// p5 setup
function setup() {
    console.log("P5 should be setup and working");
    noCanvas();
}

function handleImgUpload(event) {
    const files = event.target.files;
    console.log("files.length:", files.length);
    if (files.length > 0) {
        const file = files[0];

        gallery.innerHTML = '';

        const image = document.createElement("img");

        console.log("handleImgUpload call", imageHandlerCount);

        console.log(file)

        let img = loadImage(
            URL.createObjectURL(file),
            // file,
            // (e) => console.error("Failed to load image: ", e)
        );

        console.log(img);

        let imgUrl = createAsciiArt(img);

        // console.log(imgUrl);

        image.src = imgUrl;

        // console.log(image.src);

        image.addEventListener("click", addToDocument);

        console.log("made it pasts addeventlisterner");

        AddOnSdk.app.enableDragToDocument(image, {
            previewCallback: element => {
                return new URL(element.src);
            },
            completionCallback: async (element) => {
                return [{ blob: await getBlob(element.src) }];
            }
        });

        console.log("made it pasts enableDragToDocument");

        gallery.appendChild(image);

        console.log("made it pasts appendChild image");

        // Register event handler for "dragstart" event
        AddOnSdk.app.on("dragstart", startDrag);
        // Register event handler for 'dragend' event
        AddOnSdk.app.on("dragend", endDrag);
    
        document.body.appendChild(gallery);

        console.log("made it pasts appendChild gallery");
    }
}


/**
 * Add image to the document.
 */
async function addToDocument(event) {
    console.log("addToDocument called");
    const url = event.currentTarget.src;
    const blob = await getBlob(url);
    AddOnSdk.app.document.addImage(blob);
}

/**
 * Handle "dragstart" event
 */
function startDrag(eventData) {
    console.log("The drag event has started for", eventData.element.id);
}

/**
 * Handle "dragend" event
 */
function endDrag(eventData) {
    if (!eventData.dropCancelled) {
        console.log("The drag event has ended for", eventData.element.id);
    } else {
        console.log("The drag event was cancelled for", eventData.element.id);
    }
}

/**
 * Get the binary object for the image.
 */
async function getBlob(url) {
    console.log("getBlob called");
    return await fetch(url).then(response => response.blob());
}



function createAsciiArt(img) {
  console.log("ascii called");

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
    //   imageOutput.elt.src = graphics.elt.toDataURL('image/jpeg');
    //   return graphics.elt.toDataURL('image/jpeg');

    return graphics.elt.toDataURL('image/jpeg');
}



// Maps brightness of a pixel to a character
const chars = '@#%&?*+=-:. ';
function getCharForBrightness(brightness) {
  const charIndex = map(brightness, 0, 255, chars.length - 1, 0);
  return chars[Math.round(charIndex)];
}

