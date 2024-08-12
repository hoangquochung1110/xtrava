import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import domtoimage from 'dom-to-image';
import * as htmlToImage from 'html-to-image';


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
    // output.innerHTML = "";

    for (const file of files) {
        if (!file.type.startsWith("image/")) {
            alert("Only image files are allowed.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            output.appendChild(img);
        };
        reader.onerror = (err) => {
            console.error("Error reading file:", err);
            alert("An error occurred while reading the file.");
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('capture-btn').addEventListener('click', function() {
    const node = document.getElementById('output');

    htmlToImage.toJpeg(document.getElementById('output'), { quality: 0.95 })
    .then(function (dataUrl) {
      var link = document.createElement('a');
      link.download = 'my-image-name.jpeg';
      link.href = dataUrl;
      link.click();
    });
});
