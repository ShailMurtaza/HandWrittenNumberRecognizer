const image_input = document.getElementById("image_input")
const result_container = document.getElementById('result')
const loading_container = document.getElementById('loading')
const canvas = document.getElementById('draw-canvas');
const photo_preview = document.getElementById("photo_preview")
const ctx = canvas.getContext('2d');
let drawing = false;

function showCanvas() {
    document.getElementById('canvas-container').style.display = 'inline-block';
    document.getElementById('photo-container').style.display = 'none';
}

function selectFile() {
    document.getElementById('canvas-container').style.display = 'none';
    document.getElementById('photo-container').style.display = 'inline-block';
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
    loading_container.style.display = 'block';

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
        .then(res => res.text())
        .then(data => {
            result_container.textContent = 'RESULT: ' + data;
        })
        .catch(() => {
            result_container.textContent = 'RESULT: Error';
        })
        .finally(() => {
            loading_container.style.display = 'none';
        });
}

// Predict from camera (dummy simulation)
function predictImage() {
    loading_container.style.display = 'block';

    loading_container.style.display = 'none';
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
