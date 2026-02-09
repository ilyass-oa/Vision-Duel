# core/modeling.py
import torch.nn as nn
from torchvision import models


class ModelFactory:
    @staticmethod
    def resnet18_classifier(num_classes: int, pretrained: bool = True) -> nn.Module:
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        model = models.resnet18(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
        return model
