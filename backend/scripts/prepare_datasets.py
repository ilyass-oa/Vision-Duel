#!/usr/bin/env python3
"""Prepare ImageFolder-compatible datasets for Model A and Model B."""
import os
import sys

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
DATASET = os.path.join(BASE, "resources", "dataset")
TRAIN = os.path.join(DATASET, "training_images")

MODEL_A_SRC = os.path.join(TRAIN, "model_a")
MODEL_B_SRC = os.path.join(TRAIN, "model_b")
PAS_CHAT_SRC = os.path.join(TRAIN, "pas_chat")

# Model A: specialist (clean CHAT only)
MODEL_A_DEST = os.path.join(DATASET, "model_a_data")
# Model B: robust (mixed CHAT only)
MODEL_B_DEST = os.path.join(DATASET, "model_b_data")


def symlink_files(src_dir, dst_dir, prefix=""):
    """Create symlinks from src_dir/* into dst_dir."""
    count = 0
    if not os.path.exists(src_dir):
        print(f"Warning: Source directory not found: {src_dir}")
        return 0

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


import shutil

def prepare():
    # Define (Destination, Label, SourceList)
    tasks = [
        (MODEL_A_DEST, "CHAT", [("clean", MODEL_A_SRC)]),
        (MODEL_A_DEST, "PAS_CHAT", [("others", PAS_CHAT_SRC)]),
        (MODEL_B_DEST, "CHAT", [("mixed", MODEL_B_SRC)]),
        (MODEL_B_DEST, "PAS_CHAT", [("others", PAS_CHAT_SRC)]),
    ]

    # Pre-clean destination directories to ensure no stale symlinks
    for dest in [MODEL_A_DEST, MODEL_B_DEST]:
        if os.path.exists(dest):
            print(f"Cleaning existing dataset: {dest}")
            shutil.rmtree(dest)

    for model_dir, label, sources in tasks:
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
