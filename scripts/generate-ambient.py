"""Render an original seamless blue light loop; no runtime dependencies.

Requires numpy and imageio-ffmpeg in the generation environment only.
Run from the project root: python3 scripts/generate-ambient.py
"""
from pathlib import Path
import subprocess
import numpy as np
import imageio_ffmpeg

WIDTH, HEIGHT, FPS, SECONDS = 960, 540, 24, 24
y, x = np.mgrid[0:HEIGHT, 0:WIDTH].astype(np.float32)
x /= WIDTH
y /= HEIGHT
base = np.empty((HEIGHT, WIDTH, 3), dtype=np.float32)
blend = (x * 0.4 + y * 0.6)[..., None]
base[:] = np.array([0, 38, 93]) + blend * np.array([0, 18, 35])


def frame(phase):
    # Every time-dependent term is periodic, including at the loop boundary.
    glow = np.exp(-((x - (0.55 + 0.13 * np.sin(phase))) / 0.52) ** 2
                  - ((y - (1.06 + 0.08 * np.cos(phase))) / 0.58) ** 2)
    pixels = base + glow[..., None] * np.array([0, 36, 100])
    for offset, width, strength, shift in [
        (0.05, 0.19, 0.46, 0.0),
        (0.52, 0.26, 0.32, 2.1),
        (1.05, 0.20, 0.26, 4.2),
    ]:
        center = offset + 0.20 * np.sin(phase + shift) + 0.20 * np.sin(y * 3.3 + phase + shift)
        ribbon = np.exp(-((x + y * 0.30 - center) / width) ** 2)
        envelope = 0.28 + 0.72 * np.sin(y * np.pi / 2) ** 2
        pixels += (ribbon * envelope * strength)[..., None] * np.array([3, 30, 63])
    return np.uint8(np.clip(pixels, 0, 255))


output = Path(__file__).resolve().parents[1] / 'public' / 'ambient-blue.mp4'
command = [
    imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-v', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{WIDTH}x{HEIGHT}',
    '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264',
    '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', str(output),
]
encoder = subprocess.Popen(command, stdin=subprocess.PIPE)
for index in range(FPS * SECONDS):
    encoder.stdin.write(frame(2 * np.pi * index / (FPS * SECONDS)).tobytes())
encoder.stdin.close()
if encoder.wait() != 0:
    raise SystemExit('Video encoding failed')
print(f'{output.name}: {SECONDS}s, {WIDTH}×{HEIGHT}, {output.stat().st_size:,} bytes')
