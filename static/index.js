const canvas_container = document.getElementById('canvas-container')
const photo_container = document.getElementById('photo-container')

const image_input = document.getElementById("image_input")
const canvas = document.getElementById('draw-canvas');
const photo_preview = document.getElementById("photo_preview")

const modal_overlay = document.getElementById("modal-overlay")
const loader = document.getElementById("loader")

const processed_image = document.getElementById("processed_image")
const result_container = document.getElementById("result_container")
const confidence_chart = document.getElementById("confidence_chart")
const modal_close_btn = document.getElementById("close_btn")

const ctx = canvas.getContext('2d');
let drawing = false;

function showCanvas() {
    canvas_container.style.display = 'block';
    photo_container.style.display = 'none';
}

function selectFile() {
    canvas_container.style.display = 'none';
    photo_container.style.display = 'block';
    image_input.click()
}

// Canvas Drawing
canvas.addEventListener('mousedown', e => {
    drawing = true;
    draw(e);
});
canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('mouseout', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);

// Touch support
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    drawing = true;
    draw(e.touches[0]);
});
canvas.addEventListener('touchend', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('touchcancel', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    draw(e.touches[0]);
});

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Predict from canvas
function predictWritten() {
    openModal()
    openLoader()

    // Create a new 28x28 canvas in memory
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = 28;
    scaledCanvas.height = 28;
    const scaledCtx = scaledCanvas.getContext("2d");
    scaledCtx.drawImage(canvas, 0, 0, 28, 28);

    const imageData = scaledCtx.getImageData(0, 0, 28, 28).data;
    const gray = [];
    var arr = []

    for (let i = 0; i < imageData.length; i += 4) {
        arr.push(imageData[i+3]);
        if (arr.length % 28 == 0) {
            gray.push(arr)
            arr = []
        }
    }

    fetch('/predict_written', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: gray })
    })
        .then(res => res.json())
        .then(data => {
            display_results(data)
        })
        .catch(() => {
            result_container.textContent = 'RESULT: Error';
        })
        .finally(() => {
            closeLoader()
            openResults()
        });
}

// Predict from camera
function predictImage() {
    if (image_input.files.length === 0) {
        alert("Please select an image.");
        return;
    }
    openModal()
    openLoader()

    const file = image_input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    fetch('/predict_image', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            display_results(data)
        })
        .catch(err => console.error("Error:", err))
        .finally(() => {
            closeLoader()
            openResults()
        });
}


image_input.addEventListener('change', () => {
    const files = image_input.files;
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = e => {
            photo_preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function closeModal() {
    loader.style.display = "none"
    modal_overlay.style.display = "none"
    processed_image.style.display = "none"
    result_container.style.display = "none"
    modal_close_btn.style.display = "none"
    confidence_chart.style.display = "none"
}

function openModal() {
    modal_overlay.style.display = "flex"
}

function openLoader() {
    loader.style.display = "block"
}

function closeLoader() {
    loader.style.display = "none"
}

function openResults() {
    processed_image.style.display = "block"
    result_container.style.display = "block"
    modal_close_btn.style.display = "block"
}

function openChart() {
    confidence_chart.style.display = "block"
}


function display_results(data) {
    const confidence = data.result
    var max_confidence = 0
    var confidence_html = ''
    for(let i=0;i<confidence.length;i++) {
        let confidence_percentage = (confidence[i] * 100).toFixed(3)
        confidence_html += `<div class="confidence_values">${i}<div class="bar" data-value="${confidence_percentage}">${confidence_percentage}%</div></div>`
        if (confidence[i] > confidence[max_confidence]) max_confidence = i 
    }
    confidence_chart.innerHTML = confidence_html
    map_bar_colors()

    result_container.textContent = 'RESULT: ' + max_confidence;
    const base64Image = data.image;
    processed_image.src = 'data:image/png;base64,' + base64Image;
    openChart()
}

function map_bar_colors() {
    const bars = document.querySelectorAll(".bar");

    // Get min/max for normalization
    const values = [...bars].map(bar => +bar.dataset.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    function mapValueToColor(val, min, max) {
        // Normalize value to 0–1
        const t = (val - min) / (max - min);

        // Example: interpolate from blue (low) to red (high)
        const r = Math.round(255 * t);
        const g = Math.round(100 * (1 - t)); // optional green fade
        const b = Math.round(255 * (1 - t));
        return `rgb(${r}, ${g}, ${b})`;
    }

    bars.forEach(bar => {
        const val = +bar.dataset.value;
        bar.style.width = `${val}%`; // Use value for width
        bar.style.background = mapValueToColor(val, min, max); // Color by width
    });
}
