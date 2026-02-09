# core/trainer.py
from dataclasses import dataclass

import torch
import torch.nn as nn
import torch.optim as optim

from core.checkpoints import CheckpointManager, CheckpointPaths
from core.data import DataConfig, ImageFolderDataModule
from core.engine import Engine
from core.modeling import ModelFactory
from image_classifier.utils import ensure_dir, get_device, seed_everything


@dataclass(frozen=True)
class TrainConfig:
    out_dir: str = "../runs/exp1"
    epochs: int = 10
    lr: float = 3e-4
    weight_decay: float = 1e-4
    no_pretrained: bool = False


class Trainer:
    def __init__(self, train_cfg: TrainConfig, data_cfg: DataConfig):
        self.train_cfg = train_cfg
        self.data_cfg = data_cfg

        seed_everything(self.data_cfg.seed)
        self.device = get_device()

        ensure_dir(self.train_cfg.out_dir)

        self.dm = ImageFolderDataModule(self.data_cfg)
        self.dm.setup()

        self.model = ModelFactory.resnet18_classifier(
            num_classes=len(self.dm.class_names),
            pretrained=not self.train_cfg.no_pretrained,
        ).to(self.device)

        self.criterion = nn.CrossEntropyLoss()

        self.optimizer = optim.AdamW(
            self.model.parameters(),
            lr=self.train_cfg.lr,
            weight_decay=self.train_cfg.weight_decay,
        )

        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode="max", factor=0.5, patience=2
        )

        self.engine = Engine(device=self.device)
        self.ckpt = CheckpointManager(CheckpointPaths(self.train_cfg.out_dir))

    def fit(self) -> None:
        print(f"Device: {self.device}")
        print(f"Classes ({len(self.dm.class_names)}): {self.dm.class_names}")
        print(f"Train: {len(self.dm.train_ds)} images | Val: {len(self.dm.val_ds)} images")

        train_loader = self.dm.train_dataloader()
        val_loader = self.dm.val_dataloader()

        for epoch in range(1, self.train_cfg.epochs + 1):
            train_res = self.engine.train_one_epoch(
                self.model, train_loader, self.criterion, self.optimizer
            )
            val_res = self.engine.evaluate(self.model, val_loader, self.criterion)

            self.scheduler.step(val_res.acc)

            print(
                f"Epoch {epoch:02d}/{self.train_cfg.epochs} | "
                f"train loss {train_res.loss:.4f} acc {train_res.acc*100:.2f}% | "
                f"val loss {val_res.loss:.4f} acc {val_res.acc*100:.2f}%"
            )

            # Sauvegarde last (identique)
            self.ckpt.save_last(
                epoch=epoch,
                model_state=self.model.state_dict(),
                optimizer_state=self.optimizer.state_dict(),
                class_names=self.dm.class_names,
                img_size=self.data_cfg.img_size,
            )

            # Sauvegarde best (identique)
            best_path = self.ckpt.maybe_save_best(
                val_acc=val_res.acc,
                epoch=epoch,
                model_state=self.model.state_dict(),
                optimizer_state=self.optimizer.state_dict(),
                class_names=self.dm.class_names,
                img_size=self.data_cfg.img_size,
            )
            if best_path is not None:
                print(
                    f"✅ New best saved: {best_path} "
                    f"(val_acc={self.ckpt.best_val_acc*100:.2f}%)"
                )

        print(f"Done. Best val acc: {self.ckpt.best_val_acc*100:.2f}%")
        print(f"Best checkpoint: {self.ckpt.paths.best}")
