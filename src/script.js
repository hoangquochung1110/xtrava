console.log("sanity check");
const dragDropArea = document.getElementById("dragDropArea");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

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

    for (const file of files) {
        if (!file.type.startsWith("image/")) {
            alert("Only image files are allowed.");
            return;
        }
        let img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result; // Set the image source to the file data
        };
        img.onload = function() {
            drawImages([img]);
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
    //   ctx.drawImage(img, x, y, width, height);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    });
}
