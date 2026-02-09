# core/checkpoints.py
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from image_classifier.utils import save_checkpoint


@dataclass
class CheckpointPaths:
    out_dir: str

    @property
    def best(self) -> str:
        return os.path.join(self.out_dir, "best.pt")

    @property
    def last(self) -> str:
        return os.path.join(self.out_dir, "last.pt")


class CheckpointManager:
    def __init__(self, paths: CheckpointPaths):
        self.paths = paths
        self.best_val_acc = 0.0

    def save_last(
        self,
        epoch: int,
        model_state: Dict[str, Any],
        optimizer_state: Dict[str, Any],
        class_names: List[str],
        img_size: int,
    ) -> None:
        save_checkpoint(
            self.paths.last,
            {
                "epoch": epoch,
                "model_state": model_state,
                "optimizer_state": optimizer_state,
                "class_names": class_names,
                "img_size": img_size,
            },
        )

    def maybe_save_best(
        self,
        val_acc: float,
        epoch: int,
        model_state: Dict[str, Any],
        optimizer_state: Dict[str, Any],
        class_names: List[str],
        img_size: int,
    ) -> Optional[str]:
        if val_acc > self.best_val_acc:
            self.best_val_acc = val_acc
            save_checkpoint(
                self.paths.best,
                {
                    "epoch": epoch,
                    "model_state": model_state,
                    "optimizer_state": optimizer_state,
                    "class_names": class_names,
                    "img_size": img_size,
                    "best_val_acc": self.best_val_acc,
                },
            )
            return self.paths.best
        return None
