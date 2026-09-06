#!/usr/bin/env python3
"""Rebuild the hero character's 3x3 gaze sprite sheet from the source clip.

    pip install pillow numpy scipy imageio-ffmpeg
    python3 scripts/build-character-sprite.py

Input  : assets/character-source.mp4 — a 20s render of the character looking
         around. Only 0–12.2s is usable: the background is pure black up to
         there, and from ~12.5s an office fades in behind him, which the alpha
         key below has no way to remove.
Output : public/hero/character-sprite.webp  — 3x3 sheet, row-major:
             up-left      up        up-right
             left         centre    right
             down-left    down      down-right
         public/hero/character-poster.webp  — the centre cell alone, used for
         the reduced-motion / no-JS fallback.

This clip combines yaw with pitch — he turns *and* tilts — so all nine cells,
the four diagonals included, are real frames of the character rather than the
nearest available approximation. Nothing is mirrored, which matters here: the
backpack sits on one shoulder, and a flipped cell would make it jump sides as
the cursor crosses the middle.

Two passes over each frame:

1. **Alpha.** The pure-black background is keyed out by flood-filling the
   near-black region in from the frame border, so only pixels actually
   connected to the outside are cut; the character's own dark cap and hair,
   enclosed by his silhouette, survive.
2. **Registration.** He leans into each turn, which would make the whole bust
   jump sideways every time the hero snaps to a different pose. Each frame is
   shifted so the centre of his torso lands on the same x, leaving the head
   free to turn against a body that stays put.
"""
import io
import subprocess
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'character-source.mp4'
OUT = ROOT / 'public' / 'hero'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# Seconds into the clip for each of the nine gaze directions, row-major. Picked
# by profiling 0–12.2s at 0.25s: head-silhouette width gives the size of the
# turn, the skin centroid's y gives the tilt. Which of the two turn directions
# is the viewer's left is NOT reliably readable off a contact sheet — the hood
# makes it ambiguous — so it is settled by driving the cursor to each edge in a
# browser. Invert by swapping the outer columns.
TIMES = [
    5.00, 3.00, 1.75,
    6.00, 9.50, 1.10,
    5.90, 3.90, 8.10,
]
CENTRE = 4

CROP_W = CROP_H = 720   # square window around the character, out of 1280x720
REF_X = 640             # every frame's torso centre is registered onto this x
TORSO_ROWS = range(620, 700, 8)
CELL = 620              # output size of one cell


def frame(t: float) -> np.ndarray:
    png = subprocess.run(
        [FFMPEG, '-v', 'error', '-ss', str(t), '-i', str(SRC),
         '-frames:v', '1', '-f', 'image2', '-vcodec', 'png', '-'],
        capture_output=True, check=True).stdout
    return np.array(Image.open(io.BytesIO(png)).convert('RGB')).astype(np.float32)


def subject_alpha(rgb: np.ndarray, dark: float = 22.0, edge: float = 55.0) -> np.ndarray:
    """1.0 inside the silhouette (the black cap included), soft at the edges."""
    bright = rgb.max(axis=2)
    labels, _ = ndi.label(bright < dark)
    outside = set(np.unique(np.concatenate(
        [labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])))
    outside.discard(0)
    fg = ~np.isin(labels, list(outside))

    blobs, n = ndi.label(fg)                   # drop any stray specks
    if n > 1:
        sizes = ndi.sum(fg, blobs, range(1, n + 1))
        fg = blobs == int(np.argmax(sizes)) + 1
    fg = ndi.binary_fill_holes(fg)

    solid = ndi.binary_erosion(fg, iterations=2)
    alpha = np.where(solid, 1.0, np.where(fg, np.clip(bright / edge, 0, 1), 0.0))
    return np.clip(ndi.gaussian_filter(alpha, 0.7), 0, 1)


def torso_centre(solid: np.ndarray) -> float:
    spans = []
    for row in TORSO_ROWS:
        xs = np.nonzero(solid[row])[0]
        if len(xs):
            spans.append((xs.min() + xs.max()) / 2)
    return float(np.mean(spans))


def cell(t: float, size: int) -> Image.Image:
    rgb = frame(t)
    alpha = subject_alpha(rgb)
    shift = REF_X - torso_centre(alpha > 0.6)
    left = int(round(REF_X - CROP_W / 2 - shift))
    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    return (Image.fromarray(rgba, 'RGBA')
            .crop((left, 0, left + CROP_W, CROP_H))
            .resize((size, size), Image.LANCZOS))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGBA', (CELL * 3, CELL * 3), (0, 0, 0, 0))
    for i, t in enumerate(TIMES):
        sheet.paste(cell(t, CELL), ((i % 3) * CELL, (i // 3) * CELL))
    sheet.save(OUT / 'character-sprite.webp', quality=80, method=6)
    cell(TIMES[CENTRE], CELL).save(OUT / 'character-poster.webp', quality=82, method=6)
    for name in ('character-sprite.webp', 'character-poster.webp'):
        print(f'{name}: {(OUT / name).stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
