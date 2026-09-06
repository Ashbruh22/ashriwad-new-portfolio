#!/usr/bin/env python3
"""Grade the Experience section's working clip down onto a black background.

    pip install pillow numpy imageio-ffmpeg
    python3 scripts/build-working-clip.py

Input  : assets/character-working.mp4 — the character standing on black, then
         dissolving into a desk and typing. The dissolve is in the footage, not
         built here; the hero's scroll handler just scrubs through it.
Output : public/experience/working.webm (VP9)
         public/experience/working.mp4  (H.264, faststart)
         public/experience/working-poster.webp

Both encodes ship and the browser fetches whichever it can play. They come out
within a few percent of each other in size — the graded frames are mostly flat
black, which both codecs handle about equally — so this is purely about reach:
Safari and iOS need the H.264, and Chromium builds without proprietary codecs
(Playwright's bundled one, some Linux distributions) can only play the VP9.

Two encoder choices are not about size: `+faststart`, so the browser can seek
without having fetched the whole file, and a short GOP, so scrubbing lands on a
nearby keyframe instead of decoding forward from a distant one.

The clip's background is a rendered office, not a keyable colour, so there is no
cutout to be had — matting it properly needs a segmentation model this build has
no access to. What works instead is lighting: the room is already dim, and the
character, his laptop and a sliver of desk are the only brightly lit things in
frame. Crushing the low end and multiplying by an ellipse centred on him drops
the walls, shelf and plant to true black and leaves that pool of light, which
reads as him working in the dark and matches the flat black hero above.
"""
import io
import subprocess
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'character-working.mp4'
OUT = ROOT / 'public' / 'experience'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

SIZE = (1024, 576)      # ~2x the panel it renders in; smaller frames seek faster
POSTER_AT = 4.0         # seconds — he is settled at the desk and typing by here

# Grade: everything below FLOOR goes to black, what survives is stretched back up.
FLOOR, GAIN = 42.0, 1.3
# Vignette, in source pixels: an ellipse over the character, laptop and desk edge.
VIG = dict(cx=560.0, cy=380.0, rx=430.0, ry=380.0, soft=1.55, gamma=1.4)


def vignette_mask(height: int, width: int) -> np.ndarray:
    yy, xx = np.mgrid[0:height, 0:width]
    d = np.sqrt(((xx - VIG['cx']) / VIG['rx']) ** 2 + ((yy - VIG['cy']) / VIG['ry']) ** 2)
    m = np.clip((VIG['soft'] - d) / (VIG['soft'] - 1.0), 0, 1) ** VIG['gamma']
    return m[..., None].astype(np.float32)


def graded(frame: np.ndarray, mask: np.ndarray) -> np.ndarray:
    lit = np.clip((frame.astype(np.float32) - FLOOR) * GAIN, 0, 255)
    return (lit * mask).astype(np.uint8)


def encode(name: str, codec: str, params: list[str], fps: float) -> None:
    reader = imageio_ffmpeg.read_frames(str(SRC))
    meta = next(reader)
    width, height = meta['size']
    mask = vignette_mask(height, width)

    writer = imageio_ffmpeg.write_frames(
        str(OUT / name), SIZE, fps=fps, quality=None, codec=codec,
        pix_fmt_out='yuv420p', macro_block_size=None,
        # -g 12 on both: a keyframe every half-second, so a scrub lands near one
        # instead of decoding forward from a distant I-frame.
        output_params=['-an', '-g', '12', *params],
    )
    writer.send(None)
    for raw in reader:
        frame = np.frombuffer(raw, dtype=np.uint8).reshape(height, width, 3)
        out = Image.fromarray(graded(frame, mask)).resize(SIZE, Image.LANCZOS)
        writer.send(np.asarray(out))
    writer.close()


def poster() -> None:
    png = subprocess.run(
        [FFMPEG, '-v', 'error', '-ss', str(POSTER_AT), '-i', str(SRC),
         '-frames:v', '1', '-f', 'image2', '-vcodec', 'png', '-'],
        capture_output=True, check=True).stdout
    frame = np.array(Image.open(io.BytesIO(png)).convert('RGB'))
    mask = vignette_mask(*frame.shape[:2])
    (Image.fromarray(graded(frame, mask))
     .resize(SIZE, Image.LANCZOS)
     .save(OUT / 'working-poster.webp', quality=82, method=6))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    fps = float(next(imageio_ffmpeg.read_frames(str(SRC)))['fps'])

    encode('working.webm', 'libvpx-vp9',
           ['-crf', '34', '-b:v', '0', '-row-mt', '1'], fps)
    encode('working.mp4', 'libx264',
           ['-preset', 'slow', '-crf', '25', '-movflags', '+faststart'], fps)
    poster()

    for name in ('working.webm', 'working.mp4', 'working-poster.webp'):
        print(f'{name}: {(OUT / name).stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
