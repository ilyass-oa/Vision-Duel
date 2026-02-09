# train.py
import argparse

from core.data import DataConfig
from core.trainer import TrainConfig, Trainer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="../data", help="Chemin vers data/")
    parser.add_argument("--out_dir", type=str, default="../runs/exp1", help="Dossier sortie")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--img_size", type=int, default=224)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--weight_decay", type=float, default=1e-4)
    parser.add_argument("--val_ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--num_workers", type=int, default=4)
    parser.add_argument("--no_pretrained", action="store_true", help="Désactive pretrained ImageNet")
    args = parser.parse_args()

    data_cfg = DataConfig(
        data_dir=args.data_dir,
        img_size=args.img_size,
        val_ratio=args.val_ratio,
        seed=args.seed,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
    )
    train_cfg = TrainConfig(
        out_dir=args.out_dir,
        epochs=args.epochs,
        lr=args.lr,
        weight_decay=args.weight_decay,
        no_pretrained=args.no_pretrained,
    )

    Trainer(train_cfg=train_cfg, data_cfg=data_cfg).fit()


if __name__ == "__main__":
    main()
