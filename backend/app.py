"""Flask API server — real model inference for 'Certifier une IA' activity."""
import os
import sys
import random
import tempfile

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from PIL import Image, ImageFilter

# Add backend/ to path so we can import core.*
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.predictor import Predictor


# Configuration

PROJECT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ACTIVITY_IMAGES_DIR = os.path.join(PROJECT_ROOT, "resources", "dataset", "activity_images")
MODEL_A_CKPT = os.path.join(PROJECT_ROOT, "runs", "model_a", "best.pt")
MODEL_B_CKPT = os.path.join(PROJECT_ROOT, "runs", "model_b", "best.pt")


# App

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Load real predictors

print(f"Loading Model A from {MODEL_A_CKPT}")
predictor_a = Predictor(MODEL_A_CKPT)
print(f"  -> classes: {predictor_a.class_names}")

print(f"Loading Model B from {MODEL_B_CKPT}")
predictor_b = Predictor(MODEL_B_CKPT)
print(f"  -> classes: {predictor_b.class_names}")


# Discover activity images and compute ground truth using Model B

VALID_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def discover_images():
    """List activity images and pre-classify with Model B for ground truth."""
    images = []
    for fname in sorted(os.listdir(ACTIVITY_IMAGES_DIR)):
        ext = os.path.splitext(fname)[1].lower()
        if ext not in VALID_EXT:
            continue
        path = os.path.join(ACTIVITY_IMAGES_DIR, fname)
        # Use Model B (robust) as ground truth reference
        pred = predictor_b.predict_image(path)
        images.append({
            "id": fname,
            "url": f"/static/activity/{fname}",
            "truth": pred.label,
            "path": path,
        })
    return images


print(f"Activity images dir: {ACTIVITY_IMAGES_DIR}")
ALL_IMAGES = discover_images()
print(f"Found {len(ALL_IMAGES)} activity images")
for img in ALL_IMAGES:
    print(f"  {img['id']}: {img['truth']}")


# Routes

@app.route("/static/activity/<path:filename>")
def serve_activity_image(filename):
    return send_from_directory(ACTIVITY_IMAGES_DIR, filename)


@app.route("/api/activity/images", methods=["GET"])
def list_images():
    """Return all activity images with ground truth labels."""
    return jsonify([
        {"id": img["id"], "url": img["url"], "truth": img["truth"]}
        for img in ALL_IMAGES
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
                pil_img = pil_img.filter(ImageFilter.GaussianBlur(radius=5))
            elif t == "darken":
                from PIL import ImageEnhance
                pil_img = ImageEnhance.Brightness(pil_img).enhance(0.3)
            elif t == "crop":
                w, h = pil_img.size
                margin_w, margin_h = int(w * 0.25), int(h * 0.25)
                pil_img = pil_img.crop((margin_w, margin_h, w - margin_w, h - margin_h))
                pil_img = pil_img.resize((w, h))

    # Save transformed image to temp file and predict
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        tmp_path = f.name
        pil_img.save(f, format="JPEG")

    try:
        stressed_a = predictor_a.predict_image(tmp_path)
        stressed_b = predictor_b.predict_image(tmp_path)
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
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
