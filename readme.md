# Hand Written Number Recognizer

A full-stack web application that recognizes handwritten digits (0–9) using a convolutional neural network trained on the MNIST dataset. Users can draw digits on a canvas or upload images, and the model returns predictions with confidence scores.

## Architecture

```
┌─────────────────────┐     HTTP      ┌──────────────────────┐
│   Frontend (HTML/   │ ◄──────────►  │  Flask Web Server    │
│    CSS/JavaScript)  │  JSON/Form    │  (Python)            │
│                     │               │                      │
│  ┌───────────────┐  │  /predict_    │  ┌────────────────┐  │
│  │  Canvas (280x280)│  written     │  │  /predict_written│  │
│  │  or File Input │  │  /predict_    │  │  /predict_image │  │
│  └───────┬───────┘  │  image       │  └────────┬───────┘  │
│          │          │               │           │          │
│     28x28 array     │               │  ┌────────▼───────┐  │
│          │          │               │  │  CNN Model     │  │
│          ▼          │               │  │  (TensorFlow/  │  │
│  ┌──────────────┐   │               │  │   Keras)       │  │
│  │ Confidence   │   │               │  │  handwritten.  │  │
│  │ Bar Chart    │   │               │  │  keras         │  │
│  └──────────────┘   │               │  └────────────────┘  │
└─────────────────────┘               └──────────────────────┘
```

### Components

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | Vanilla HTML, CSS, JavaScript | Canvas drawing, file upload, confidence bar chart |
| **Backend** | Python Flask | Two prediction endpoints, image preprocessing |
| **Model** | TensorFlow / Keras CNN | Trained on MNIST, 15 epochs, ~99% test accuracy |
| **Image Processing** | OpenCV | Denoising, adaptive thresholding, resizing |

## Model Architecture (CNNs)

The model is a sequential CNN with 3 convolutional blocks and 2 dense layers:

- **Input:** 28×28 grayscale image
- **Convolutional blocks:** 3 blocks of Conv2D→Conv2D→MaxPool2D→Dropout (filters: 32→64→128)
- **Dense layers:** 256 → 128 → 10 (Softmax output)
- **Regularization:** Dropout (0.25 after conv blocks, 0.5 after dense layers)
- **Optimizer:** Adam | **Loss:** Sparse Categorical Crossentropy

## Tools & Libraries

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.12+ | Runtime |
| Flask | 3.1.1 | Web server |
| TensorFlow (CPU) | 2.19.0 | Model inference & training |
| OpenCV | 4.11.0 | Image preprocessing |
| NumPy | 2.1.3 | Array operations |

## Getting Started

### Prerequisites

- Python 3.12+
- pip

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/HandWrittenNumberRecognizer.git
cd HandWrittenNumberRecognizer

# Create and activate a virtual environment
python3 -m venv .env
source .env/bin/activate    # Linux/macOS
# .env\Scripts\Activate.ps1  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Run the Web App

```bash
python main.py
```

Open **http://localhost:5000** in your browser.

### Train a New Model

```bash
cd Model
python train_model.py
```

The trained model is saved to `Model/handwritten.keras`.

### Evaluate the Model

```bash
cd Model
python test_model.py
```

## Usage

1. Click **Write** to draw a digit on the canvas, then click **Predict**.
2. Click **Select Image** to upload an image of a handwritten digit.
3. The app displays the predicted digit and a confidence bar chart for all 10 classes.

## License

MIT — see [LICENSE](LICENSE)
