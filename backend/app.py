"""Flask API server — real model inference for 'Certifier une IA' activity."""
import os
import sys
import random
import tempfile
from pathlib import Path
import numpy as np

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from PIL import Image, ImageFilter

# Add backend/ to path so we can import core.*
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.predictor import Predictor


# Configuration

PROJECT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ACTIVITY_IMAGES_DIR = os.path.join(PROJECT_ROOT, "resources", "dataset", "activity_images")
LOOKALIKE_DIR = os.path.join(ACTIVITY_IMAGES_DIR, "LookAlike")
MODEL_A_CKPT = os.path.join(PROJECT_ROOT, "runs", "model_a", "best.pt")
MODEL_B_CKPT = os.path.join(PROJECT_ROOT, "runs", "model_b", "best.pt")


# App

app = Flask(__name__)
# CORS configuration: Accept all origins for tunnel access (ngrok/cloudflare)
# In production, specify exact origins: origins=["https://your-domain.ngrok-free.app"]
CORS(app, origins="*", supports_credentials=True)

# Load real predictors

print(f"Loading Model A from {MODEL_A_CKPT}")
predictor_a = Predictor(MODEL_A_CKPT)
print(f"  -> classes: {predictor_a.class_names}")

print(f"Loading Model B from {MODEL_B_CKPT}")
predictor_b = Predictor(MODEL_B_CKPT)
print(f"  -> classes: {predictor_b.class_names}")


# Discover activity images and compute ground truth using Model B

VALID_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def discover_images():
    """List activity images and extract ground truth from filename."""
    images = []
    for fname in sorted(os.listdir(ACTIVITY_IMAGES_DIR)):
        ext = os.path.splitext(fname)[1].lower()
        if ext not in VALID_EXT:
            continue
            
        fname_lower = fname.lower()
        if fname_lower.startswith('c'):
            truth = "CHAT"
        elif fname_lower.startswith('p'):
            truth = "PAS_CHAT"
        else:
            continue
            
        path = os.path.join(ACTIVITY_IMAGES_DIR, fname)
        images.append({
            "id": fname,
            "url": f"/static/activity/{fname}",
            "truth": truth,
            "path": path,
        })
    return images


def discover_lookalike_images():
    """List LookAlike images — all are PAS_CHAT (faux amis)."""
    images = []
    if not os.path.exists(LOOKALIKE_DIR):
        return images
    for fname in sorted(os.listdir(LOOKALIKE_DIR)):
        ext = os.path.splitext(fname)[1].lower()
        if ext not in VALID_EXT:
            continue
        path = os.path.join(LOOKALIKE_DIR, fname)
        images.append({
            "id": f"LookAlike/{fname}",
            "url": f"/static/activity/LookAlike/{fname}",
            "truth": "PAS_CHAT",
            "path": path,
        })
    return images


print(f"Activity images dir: {ACTIVITY_IMAGES_DIR}")
ALL_IMAGES = discover_images()
LOOKALIKE_IMAGES = discover_lookalike_images()
# Add lookalike images to ALL_IMAGES so predict() can find them
ALL_IMAGES.extend(LOOKALIKE_IMAGES)
print(f"Found {len(ALL_IMAGES)} total images ({len(LOOKALIKE_IMAGES)} lookalike)")
for img in ALL_IMAGES:
    print(f"  {img['id']}: {img['truth']}")


# Progressive training lab: lightweight model trained live in the activity

LAB_LEVELS = [250, 500, 700, 1000]
LAB_TRAINING_ROOT = os.path.join(PROJECT_ROOT, "resources", "dataset", "training_images")
LAB_CHAT_DIRS = [
    os.path.join(LAB_TRAINING_ROOT, "model_a"),
    os.path.join(LAB_TRAINING_ROOT, "model_b"),
]
LAB_NON_CHAT_DIRS = [
    os.path.join(LAB_TRAINING_ROOT, "pas_chat"),
]


def list_dataset_files(directories):
    files = []
    for directory in directories:
        if not os.path.exists(directory):
            continue
        for root, _, names in os.walk(directory):
            for name in names:
                if os.path.splitext(name)[1].lower() in VALID_EXT:
                    files.append(os.path.join(root, name))
    return files


LAB_CHAT_FILES = list_dataset_files(LAB_CHAT_DIRS)
LAB_NON_CHAT_FILES = list_dataset_files(LAB_NON_CHAT_DIRS)
LAB_FEATURE_CACHE = {}
LAB_STATE = {
    "trained": False,
    "dataset_size": 0,
    "weights": None,
    "bias": 0.0,
    "mu": None,
    "sigma": None,
    "train_accuracy": 0.0,
    "val_accuracy": 0.0,
}

print(f"Lab dataset: CHAT={len(LAB_CHAT_FILES)} PAS_CHAT={len(LAB_NON_CHAT_FILES)}")


def extract_lab_features(image_path):
    """Extract compact numeric features for fast live training."""
    try:
        with Image.open(image_path) as pil:
            rgb = pil.convert("RGB").resize((24, 24), Image.Resampling.BILINEAR)

        arr = np.asarray(rgb, dtype=np.float32) / 255.0
        gray = arr.mean(axis=2)

        gray_small = np.asarray(
            Image.fromarray((gray * 255).astype(np.uint8)).resize((12, 12), Image.Resampling.BILINEAR),
            dtype=np.float32,
        ) / 255.0

        color_mean = arr.mean(axis=(0, 1))
        color_std = arr.std(axis=(0, 1))
        return np.concatenate([gray_small.flatten(), color_mean, color_std], axis=0).astype(np.float32)
    except Exception as exc:
        print(f"[lab] failed to load feature for {image_path}: {exc}")
        return None


def get_lab_features(image_path):
    if image_path not in LAB_FEATURE_CACHE:
        LAB_FEATURE_CACHE[image_path] = extract_lab_features(image_path)
    return LAB_FEATURE_CACHE[image_path]


def sigmoid(values):
    clipped = np.clip(values, -35.0, 35.0)
    return 1.0 / (1.0 + np.exp(-clipped))


def build_lab_dataset(chat_files, pas_chat_files):
    features = []
    labels = []

    for path in chat_files:
        f = get_lab_features(path)
        if f is None:
            continue
        features.append(f)
        labels.append(1.0)

    for path in pas_chat_files:
        f = get_lab_features(path)
        if f is None:
            continue
        features.append(f)
        labels.append(0.0)

    if not features:
        return None, None

    x = np.vstack(features).astype(np.float32)
    y = np.array(labels, dtype=np.float32)

    order = np.random.permutation(len(y))
    return x[order], y[order]


def fit_logistic_model(x, y, epochs=220, learning_rate=0.2):
    mu = x.mean(axis=0)
    sigma = x.std(axis=0) + 1e-6
    xn = (x - mu) / sigma

    n_samples, n_features = xn.shape
    w = np.zeros(n_features, dtype=np.float32)
    b = 0.0

    for _ in range(epochs):
        logits = xn.dot(w) + b
        probs = sigmoid(logits)
        error = probs - y

        grad_w = (xn.T.dot(error) / float(n_samples)) + 1e-4 * w
        grad_b = float(error.mean())

        w -= learning_rate * grad_w
        b -= learning_rate * grad_b

    return w, b, mu, sigma


def predict_with_lab_model(feature_vector):
    x = (feature_vector - LAB_STATE["mu"]) / LAB_STATE["sigma"]
    logit = float(np.dot(x, LAB_STATE["weights"]) + LAB_STATE["bias"])
    return float(sigmoid(logit))


# Routes

@app.route("/static/activity/<path:filename>")
def serve_activity_image(filename):
    return send_from_directory(ACTIVITY_IMAGES_DIR, filename)


MODEL_A_DATA = os.path.join(PROJECT_ROOT, "resources", "dataset", "model_a_data")
MODEL_B_DATA = os.path.join(PROJECT_ROOT, "resources", "dataset", "model_b_data")
MODEL_A_RAW_TRAINING = os.path.join(PROJECT_ROOT, "resources", "dataset", "training_images", "model_a")


@app.route("/static/training/<path:filename>")
def serve_training_image(filename):
    """Serve training images from model_a_data or model_b_data."""
    if filename.startswith("a/"):
        return send_from_directory(MODEL_A_DATA, filename[2:])
    elif filename.startswith("a_raw/"):
        return send_from_directory(MODEL_A_RAW_TRAINING, filename[6:])
    elif filename.startswith("b/"):
        return send_from_directory(MODEL_B_DATA, filename[2:])
    return jsonify({"error": "Invalid path"}), 404


def sample_training_images(data_dir, prefix, count=8, preferred_file=None):
    """Pick a few sample CHAT images."""
    samples = []
    cls_dir = os.path.join(data_dir, "CHAT")
    if os.path.exists(cls_dir):
        files = [f for f in os.listdir(cls_dir) if os.path.splitext(f)[1].lower() in VALID_EXT]
        chosen = []

        if preferred_file and preferred_file in files:
            chosen.append(preferred_file)

        remaining = [fname for fname in files if fname not in chosen]
        extra_count = min(max(count - len(chosen), 0), len(remaining))
        if extra_count:
            chosen.extend(random.sample(remaining, extra_count))

        for fname in chosen:
            samples.append({
                "url": f"/static/training/{prefix}/CHAT/{fname}",
                "label": "CHAT",
            })
    return samples


@app.route("/api/training-samples")
def training_samples():
    """Return sample training images for both models."""
    model_a_samples = sample_training_images(MODEL_A_DATA, "a", count=3)
    model_a_fixed = {
        "url": "/static/training/a_raw/images (183).jpeg",
        "label": "CHAT",
    }

    return jsonify({
        "model_a": [model_a_fixed, *model_a_samples],
        "model_b": sample_training_images(MODEL_B_DATA, "b", count=4),
    })


@app.route("/api/activity/images", methods=["GET"])
def list_images():
    """Return all activity images (excluding lookalike) with ground truth labels."""
    return jsonify([
        {"id": img["id"], "url": img["url"], "truth": img["truth"]}
        for img in ALL_IMAGES if not img["id"].startswith("LookAlike/")
    ])


@app.route("/api/activity/lookalike", methods=["GET"])
def list_lookalike_images():
    """Return LookAlike images for Test 3 (Faux Amis)."""
    return jsonify([
        {"id": img["id"], "url": img["url"], "truth": img["truth"]}
        for img in LOOKALIKE_IMAGES
    ])


@app.route("/api/predict", methods=["POST"])
def predict():
    """Run both models on an activity image. Returns real predictions."""
    data = request.json or {}
    image_id = data.get("image_id", "")

    # Find image path
    img_info = next((img for img in ALL_IMAGES if img["id"] == image_id), None)
    if not img_info:
        return jsonify({"error": f"Image '{image_id}' not found"}), 404

    image_path = img_info["path"]

    # Run both real predictors
    pred_a = predictor_a.predict_image(image_path)
    pred_b = predictor_b.predict_image(image_path)

    return jsonify({
        "truth": img_info["truth"],
        "model_a": {
            "label": pred_a.label,
            "confidence": round(pred_a.prob * 100, 1),
        },
        "model_b": {
            "label": pred_b.label,
            "confidence": round(pred_b.prob * 100, 1),
        },
    })


@app.route("/api/transform", methods=["POST"])
def transform_and_predict():
    """Apply real image transforms, then run both models."""
    data = request.json or {}
    image_id = data.get("image_id", "")
    transforms = data.get("transforms", [])

    img_info = next((img for img in ALL_IMAGES if img["id"] == image_id), None)
    if not img_info:
        return jsonify({"error": f"Image '{image_id}' not found"}), 404

    # Load and transform image using PIL
    pil_img = Image.open(img_info["path"]).convert("RGB")
    original_pred_a = predictor_a.predict_image(img_info["path"])
    original_pred_b = predictor_b.predict_image(img_info["path"])

    if transforms:
        for t in transforms:
            if t == "blur":
                pil_img = pil_img.filter(ImageFilter.GaussianBlur(radius=12))
            elif t == "darken":
                from PIL import ImageEnhance
                pil_img = ImageEnhance.Brightness(pil_img).enhance(0.3)
            elif t == "crop":
                w, h = pil_img.size
                margin_w, margin_h = int(w * 0.25), int(h * 0.25)
                pil_img = pil_img.crop((margin_w, margin_h, w - margin_w, h - margin_h))
                pil_img = pil_img.resize((w, h))
            elif t.startswith("pixelate"):
                level = t.split("_")[1] if "_" in t else "medium"
                w, h = pil_img.size
                factors = {"light": 8, "medium": 15, "heavy": 25}
                factor = factors.get(level, 15)
                pil_img = pil_img.resize((w // factor, h // factor), resample=Image.Resampling.BILINEAR)
                pil_img = pil_img.resize((w, h), resample=Image.Resampling.NEAREST)

    # Save transformed image to temp file and predict
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".jpg")
    os.close(tmp_fd)
    pil_img.save(tmp_path, format="JPEG")

    try:
        stressed_a = predictor_a.predict_image(tmp_path)
        stressed_b = predictor_b.predict_image(tmp_path)
        
        import base64
        with open(tmp_path, "rb") as img_file:
            transformed_b64 = base64.b64encode(img_file.read()).decode('utf-8')
    finally:
        os.unlink(tmp_path)

    # Compute stability: label flipped = "CASSE", big confidence drop = "FRAGILE"
    def stability(orig, stressed):
        if orig.label != stressed.label:
            return "CASSE"
        drop = orig.prob - stressed.prob
        if drop > 0.3:
            return "FRAGILE"
        return "STABLE"

    return jsonify({
        "truth": img_info["truth"],
        "model_a": {
            "label": stressed_a.label,
            "confidence": round(stressed_a.prob * 100, 1),
            "stability": stability(original_pred_a, stressed_a),
        },
        "model_b": {
            "label": stressed_b.label,
            "confidence": round(stressed_b.prob * 100, 1),
            "stability": stability(original_pred_b, stressed_b),
        },
        "transformed_base64": transformed_b64,
    })


@app.route("/api/lab/info", methods=["GET"])
def lab_info():
    """Return available live-training levels and dataset pool sizes."""
    max_balanced = 2 * min(len(LAB_CHAT_FILES), len(LAB_NON_CHAT_FILES))
    available_levels = [lvl for lvl in LAB_LEVELS if lvl <= max_balanced]
    if not available_levels and max_balanced >= 40:
        available_levels = [max_balanced - (max_balanced % 2)]

    return jsonify({
        "levels": available_levels,
        "chat_pool": len(LAB_CHAT_FILES),
        "pas_chat_pool": len(LAB_NON_CHAT_FILES),
        "max_train_size": max_balanced,
        "current_model": {
            "trained": LAB_STATE["trained"],
            "dataset_size": LAB_STATE["dataset_size"],
            "train_accuracy": LAB_STATE["train_accuracy"],
            "val_accuracy": LAB_STATE["val_accuracy"],
        },
    })


@app.route("/api/lab/train", methods=["POST"])
def lab_train():
    """Train a lightweight model on a selected subset size."""
    max_balanced = 2 * min(len(LAB_CHAT_FILES), len(LAB_NON_CHAT_FILES))
    if max_balanced < 40:
        return jsonify({"error": "Not enough images to train the lab model."}), 400

    data = request.json or {}
    try:
        requested_size = int(data.get("dataset_size", LAB_LEVELS[0]))
    except (TypeError, ValueError):
        requested_size = LAB_LEVELS[0]

    requested_size = max(40, min(requested_size, max_balanced))
    requested_size = requested_size - (requested_size % 2)
    n_each = requested_size // 2

    rng = random.Random(requested_size)
    chat_train = rng.sample(LAB_CHAT_FILES, n_each)
    pas_train = rng.sample(LAB_NON_CHAT_FILES, n_each)

    chat_train_set = set(chat_train)
    pas_train_set = set(pas_train)
    chat_left = [p for p in LAB_CHAT_FILES if p not in chat_train_set]
    pas_left = [p for p in LAB_NON_CHAT_FILES if p not in pas_train_set]

    val_each = min(120, len(chat_left), len(pas_left))
    chat_val = rng.sample(chat_left, val_each) if val_each > 0 else []
    pas_val = rng.sample(pas_left, val_each) if val_each > 0 else []

    x_train, y_train = build_lab_dataset(chat_train, pas_train)
    if x_train is None:
        return jsonify({"error": "Failed to prepare training dataset."}), 500

    np.random.seed(requested_size)
    weights, bias, mu, sigma = fit_logistic_model(x_train, y_train)

    train_probs = sigmoid(((x_train - mu) / sigma).dot(weights) + bias)
    train_preds = (train_probs >= 0.5).astype(np.float32)
    train_acc = float((train_preds == y_train).mean() * 100.0)

    if val_each > 0:
        x_val, y_val = build_lab_dataset(chat_val, pas_val)
        val_probs = sigmoid(((x_val - mu) / sigma).dot(weights) + bias)
        val_preds = (val_probs >= 0.5).astype(np.float32)
        val_acc = float((val_preds == y_val).mean() * 100.0)
    else:
        val_acc = train_acc

    LAB_STATE.update({
        "trained": True,
        "dataset_size": requested_size,
        "weights": weights,
        "bias": bias,
        "mu": mu,
        "sigma": sigma,
        "train_accuracy": round(train_acc, 1),
        "val_accuracy": round(val_acc, 1),
    })

    return jsonify({
        "trained_on": int(len(y_train)),
        "requested_size": requested_size,
        "train_accuracy": round(train_acc, 1),
        "val_accuracy": round(val_acc, 1),
    })


@app.route("/api/lab/predict", methods=["POST"])
def lab_predict():
    """Predict with the lab model currently trained by the visitor."""
    if not LAB_STATE["trained"]:
        return jsonify({"error": "Lab model not trained yet."}), 400

    data = request.json or {}
    image_id = data.get("image_id", "")
    img_info = next((img for img in ALL_IMAGES if img["id"] == image_id), None)
    if not img_info:
        return jsonify({"error": f"Image '{image_id}' not found"}), 404

    feature_vector = get_lab_features(img_info["path"])
    if feature_vector is None:
        return jsonify({"error": "Failed to read image for prediction."}), 500

    prob_chat = predict_with_lab_model(feature_vector)
    label = "CHAT" if prob_chat >= 0.5 else "PAS_CHAT"
    confidence = round(max(prob_chat, 1.0 - prob_chat) * 100.0, 1)

    return jsonify({
        "truth": img_info["truth"],
        "model": {
            "label": label,
            "confidence": confidence,
        },
        "trained_on": LAB_STATE["dataset_size"],
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
