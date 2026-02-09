# core/engine.py
from dataclasses import dataclass
from typing import Tuple

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from image_classifier.utils import AverageMeter, accuracy_top1


@dataclass
class EpochResult:
    loss: float
    acc: float


class Engine:
    def __init__(self, device: torch.device):
        self.device = device

    def train_one_epoch(
        self,
        model: nn.Module,
        loader: DataLoader,
        criterion: nn.Module,
        optimizer: optim.Optimizer,
    ) -> EpochResult:
        model.train()
        loss_meter = AverageMeter()
        acc_meter = AverageMeter()

        for images, targets in loader:
            images = images.to(self.device, non_blocking=True)
            targets = targets.to(self.device, non_blocking=True)

            optimizer.zero_grad(set_to_none=True)
            logits = model(images)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()

            acc = accuracy_top1(logits, targets)
            loss_meter.update(loss.item(), n=images.size(0))
            acc_meter.update(acc, n=images.size(0))

        return EpochResult(loss=loss_meter.avg, acc=acc_meter.avg)

    @torch.no_grad()
    def evaluate(
        self,
        model: nn.Module,
        loader: DataLoader,
        criterion: nn.Module,
    ) -> EpochResult:
        model.eval()
        loss_meter = AverageMeter()
        acc_meter = AverageMeter()

        for images, targets in loader:
            images = images.to(self.device, non_blocking=True)
            targets = targets.to(self.device, non_blocking=True)

            logits = model(images)
            loss = criterion(logits, targets)

            acc = accuracy_top1(logits, targets)
            loss_meter.update(loss.item(), n=images.size(0))
            acc_meter.update(acc, n=images.size(0))

        return EpochResult(loss=loss_meter.avg, acc=acc_meter.avg)
