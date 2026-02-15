#!/usr/bin/env python3
"""Prepare ImageFolder-compatible datasets for Model A and Model B."""
import os
import sys

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
DATASET = os.path.join(BASE, "resources", "dataset")
TRAIN = os.path.join(DATASET, "training_images")

CLEAN_DIR = os.path.join(TRAIN, "clean")
MIXED_DIR = os.path.join(TRAIN, "mixed")
OTHERS_DIR = os.path.join(TRAIN, "others")

# Model A: specialist (clean CHAT only)
MODEL_A_DIR = os.path.join(DATASET, "model_a_data")
# Model B: robust (clean + mixed CHAT)
MODEL_B_DIR = os.path.join(DATASET, "model_b_data")


def symlink_files(src_dir, dst_dir, prefix=""):
    """Create symlinks from src_dir/* into dst_dir."""
    count = 0
    for fname in os.listdir(src_dir):
        src = os.path.join(src_dir, fname)
        if not os.path.isfile(src):
            continue
        dst_name = f"{prefix}{fname}" if prefix else fname
        dst = os.path.join(dst_dir, dst_name)
        if not os.path.exists(dst):
            os.symlink(os.path.abspath(src), dst)
        count += 1
    return count


def prepare():
    for model_dir, label, sources in [
        (MODEL_A_DIR, "CHAT", [("clean", CLEAN_DIR)]),
        (MODEL_A_DIR, "PAS_CHAT", [("others", OTHERS_DIR)]),
        (MODEL_B_DIR, "CHAT", [("clean", CLEAN_DIR), ("mixed", MIXED_DIR)]),
        (MODEL_B_DIR, "PAS_CHAT", [("others", OTHERS_DIR)]),
    ]:
        dst_dir = os.path.join(model_dir, label)
        os.makedirs(dst_dir, exist_ok=True)
        total = 0
        for prefix_name, src_dir in sources:
            n = symlink_files(src_dir, dst_dir, prefix=f"{prefix_name}_")
            total += n
        print(f"  {dst_dir}: {total} images")

    print("\nDone. Datasets ready.")


if __name__ == "__main__":
    print("Preparing datasets...")
    prepare()
