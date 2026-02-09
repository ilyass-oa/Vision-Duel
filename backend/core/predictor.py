# core/predictor.py
from dataclasses import dataclass
from typing import Tuple

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

from image_classifier.utils import get_device, load_checkpoint


@dataclass(frozen=True)
class Prediction:
    label: str
    prob: float


class Predictor:
    def __init__(self, ckpt_path: str):
        self.device = get_device()
        self.ckpt = load_checkpoint(ckpt_path, map_location=self.device)

        self.class_names = self.ckpt["class_names"]
        self.img_size = self.ckpt.get("img_size", 224)

        self.model = self._build_model(num_classes=len(self.class_names))
        self.model.load_state_dict(self.ckpt["model_state"])
        self.model.to(self.device)
        self.model.eval()

        self.tfm = transforms.Compose(
            [
                transforms.Resize(int(self.img_size * 1.15)),
                transforms.CenterCrop(self.img_size),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

    @staticmethod
    def _build_model(num_classes: int) -> nn.Module:
        model = models.resnet18(weights=None)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
        return model

    def predict_image(self, image_path: str) -> Prediction:
        img = Image.open(image_path).convert("RGB")
        x = self.tfm(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(x)
            probs = torch.softmax(logits, dim=1).squeeze(0)
            top_idx = int(torch.argmax(probs).item())

        return Prediction(
            label=self.class_names[top_idx],
            prob=float(probs[top_idx]),
        )
