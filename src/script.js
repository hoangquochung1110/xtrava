console.log("sanity check");
const dragDropArea = document.getElementById("dragDropArea");
const output = document.getElementById("output");

// Step 1 - Add an event listener for the dragover event
dragDropArea.addEventListener("dragover", (e) => {
    e.preventDefault();  // This turns off the browser's default drag and drop handler.
    dragDropArea.classList.add("dragover");
});

// Step 2 - Add an event listener for the drop event
dragDropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDropArea.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length === 0) {
        alert("No files selected.");
        return;
    }
    output.innerHTML = "";

    for (const file of files) {
        if (!file.type.startsWith("image/")) {
            alert("Only image files are allowed.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.onload = function() {
                console.log(img.width, img.height);
            };
            output.appendChild(img);
        };
        reader.onerror = (err) => {
            console.error("Error reading file:", err);
            alert("An error occurred while reading the file.");
        };
        reader.readAsDataURL(file);
    }
});

function drawImages(images) {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Iterate through the images
    images.forEach((img, index) => {
      // Calculate the dimensions to maintain aspect ratio
      const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
  
      // Draw the image onto the canvas
      ctx.drawImage(img, x, y, width, height);
    });
  }
