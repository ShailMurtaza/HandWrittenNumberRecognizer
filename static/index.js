const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

function showCanvas() {
    document.getElementById('canvas-container').style.display = 'inline-block';
    document.getElementById('photo-container').style.display = 'none';
}

function openCamera() {
    document.getElementById('photo-container').style.display = 'inline-block';
    document.getElementById('canvas-container').style.display = 'none';

    const video = document.getElementById('camera');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.log('Camera access denied or not supported.' + err);
        });
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
    document.getElementById('loading').style.display = 'block';
    const imageData = ctx.getImageData(0, 0, 28, 28).data; // Shrink logic should go here if needed
    const gray = [];

    for (let i = 0; i < imageData.length; i += 4) {
        gray.push(imageData[i]); // just using red as grayscale
    }

    // Dummy API request
    fetch('/predict_written', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: gray })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('result').textContent = 'RESULT: ' + data.digit;
        })
        .catch(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('result').textContent = 'RESULT: Error';
        });
}

// Predict from camera (dummy simulation)
function predictImage() {
    document.getElementById('loading').style.display = 'block';

    // Simulate delay and fake result
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('result').textContent = 'RESULT: 7 (mocked)';
    }, 1500);

    // Actual implementation would capture frame from video and send to /predict_image
}
