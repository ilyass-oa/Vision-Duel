# predict.py
import argparse
from core.predictor import Predictor


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ckpt", type=str, required=True, help="Chemin vers best.pt")
    parser.add_argument("--image", type=str, required=True, help="Chemin vers une image")
    args = parser.parse_args()

    pred = Predictor(args.ckpt).predict_image(args.image)
    print(f"Pred: {pred.label} (p={pred.prob:.4f})")


if __name__ == "__main__":
    main()
