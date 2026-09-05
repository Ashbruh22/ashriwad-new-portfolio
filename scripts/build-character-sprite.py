#!/usr/bin/env python3
"""Rebuild the hero character's 3x3 gaze sprite sheet from the source clip.

    pip install pillow numpy scipy imageio-ffmpeg
    python3 scripts/build-character-sprite.py

Input  : assets/character-source.mp4 (a 10s render of the character looking around)
Output : public/hero/character-sprite.webp  — 3x3 sheet, row-major:
             up-left      up        up-right
             left         centre    right
             down-left    down      down-right
         public/hero/character-poster.webp  — the centre cell alone, used for
         the reduced-motion / no-JS fallback.

The clip's camera is locked, so the nine frames need no re-alignment: only the
head turns between them. The pure-black background is keyed to alpha by
flood-filling the near-black region in from the frame border, which leaves the
character's neon rim light intact (it is bright enough to stop the fill) and so
lets the sprite sit on either theme.

The clip only ever turns him toward the viewer's left, so the right-hand column
is the left-hand column mirrored. He is near enough symmetrical for that to
read as a real turn — the cap brim and the hood swap sides, which is exactly
what turning the other way does — and the hero switches poses rather than
cross-fading them, so a mirrored cell never has to blend with an unmirrored one.
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

# (seconds into the clip, mirror?) for each of the nine gaze directions,
# row-major: up-left / up / up-right, left / centre / right, and so on.
FRAMES = [
    (2.60, False), (0.75, False), (2.60, True),
    (3.50, False), (9.00, False), (3.50, True),
    (1.50, False), (1.75, False), (1.50, True),
]
CENTRE = 4
CROP = (280, 0, 1000, 720)  # 720x720 square around the character
CELL = 620


def frame(t: float) -> np.ndarray:
    png = subprocess.run(
        [FFMPEG, '-v', 'error', '-ss', str(t), '-i', str(SRC),
         '-frames:v', '1', '-f', 'image2', '-vcodec', 'png', '-'],
        capture_output=True, check=True).stdout
    return np.array(Image.open(io.BytesIO(png)).convert('RGB')).astype(np.float32)


def subject_alpha(rgb: np.ndarray, dark: float = 22.0, glow: float = 55.0) -> np.ndarray:
    """1.0 inside the silhouette (the black cap included), rim glow fading out."""
    bright = rgb.max(axis=2)
    labels, _ = ndi.label(bright < dark)
    edge = set(np.unique(np.concatenate(
        [labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])))
    edge.discard(0)
    fg = ~np.isin(labels, list(edge))          # silhouette + rim glow + sparkles

    blobs, n = ndi.label(fg)                   # drop the drifting sparkle stars
    if n > 1:
        sizes = ndi.sum(fg, blobs, range(1, n + 1))
        fg = blobs == int(np.argmax(sizes)) + 1
    fg = ndi.binary_fill_holes(fg)

    solid = ndi.binary_erosion(fg, iterations=2)
    alpha = np.where(solid, 1.0, np.where(fg, np.clip(bright / glow, 0, 1), 0.0))
    return np.clip(ndi.gaussian_filter(alpha, 0.7), 0, 1)


def cell(t: float, mirror: bool, size: int) -> Image.Image:
    rgb = frame(t)
    rgba = np.dstack([rgb, subject_alpha(rgb) * 255]).astype(np.uint8)
    image = Image.fromarray(rgba, 'RGBA').crop(CROP)
    if mirror:
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    return image.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGBA', (CELL * 3, CELL * 3), (0, 0, 0, 0))
    for i, (t, mirror) in enumerate(FRAMES):
        sheet.paste(cell(t, mirror, CELL), ((i % 3) * CELL, (i // 3) * CELL))
    sheet.save(OUT / 'character-sprite.webp', quality=80, method=6)
    cell(*FRAMES[CENTRE], CELL).save(OUT / 'character-poster.webp', quality=82, method=6)
    for name in ('character-sprite.webp', 'character-poster.webp'):
        print(f'{name}: {(OUT / name).stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
