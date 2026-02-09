# core/data.py
import os
from dataclasses import dataclass
from typing import List, Tuple

import torch
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms


@dataclass(frozen=True)
class DataConfig:
    data_dir: str = "../data"
    img_size: int = 224
    val_ratio: float = 0.2
    seed: int = 42
    batch_size: int = 32
    num_workers: int = 4


class TransformFactory:
    @staticmethod
    def build(img_size: int = 224):
        train_tfms = transforms.Compose(
            [
                transforms.RandomResizedCrop(img_size, scale=(0.7, 1.0)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],  # ImageNet
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )
        val_tfms = transforms.Compose(
            [
                transforms.Resize(int(img_size * 1.15)),
                transforms.CenterCrop(img_size),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )
        return train_tfms, val_tfms


class ImageFolderDataModule:
    """
    Reproduit exactement :
    - ImageFolder chargé une seule fois
    - random_split avec seed
    - train transform vs val transform en modifiant dataset.transform
    """
    def __init__(self, cfg: DataConfig):
        self.cfg = cfg
        self.class_names: List[str] = []
        self.train_ds = None
        self.val_ds = None

    def setup(self) -> None:
        if not os.path.isdir(self.cfg.data_dir):
            raise FileNotFoundError(
                f"data_dir introuvable: {self.cfg.data_dir}\n"
                f"Astuce: depuis src/, utilise --data_dir ../data"
            )

        train_tfms, val_tfms = TransformFactory.build(self.cfg.img_size)

        full_ds = datasets.ImageFolder(root=self.cfg.data_dir, transform=train_tfms)
        n_total = len(full_ds)
        n_val = int(n_total * self.cfg.val_ratio)
        n_train = n_total - n_val

        generator = torch.Generator().manual_seed(self.cfg.seed)
        train_ds, val_ds = random_split(full_ds, [n_train, n_val], generator=generator)

        # IMPORTANT: train_ds et val_ds partagent full_ds
        train_ds.dataset.transform = train_tfms
        val_ds.dataset.transform = val_tfms

        self.class_names = full_ds.classes
        self.train_ds = train_ds
        self.val_ds = val_ds

    def train_dataloader(self) -> DataLoader:
        return DataLoader(
            self.train_ds,
            batch_size=self.cfg.batch_size,
            shuffle=True,
            num_workers=self.cfg.num_workers,
            pin_memory=True,
        )

    def val_dataloader(self) -> DataLoader:
        return DataLoader(
            self.val_ds,
            batch_size=self.cfg.batch_size,
            shuffle=False,
            num_workers=self.cfg.num_workers,
            pin_memory=True,
        )
