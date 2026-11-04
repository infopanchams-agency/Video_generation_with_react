"""Measure each SFX file's loudest peak and write public/audio/sfx/sfx_meta.json.

Sync rule S4: transient sounds are aligned by their peak. AudioLayer starts a
sound `peakOffsetFrames` early when its hit has "alignPeak": true.
"""

import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "timing.json").read_text())
FPS = T["fps"]
SFX_DIR = ROOT / "public/audio/sfx"

meta = {}
for name, rel in T["sfxFiles"].items():
    data, sr = sf.read(ROOT / "public" / rel, always_2d=True)
    mono = np.abs(data).max(axis=1)
    peak = int(np.argmax(mono))
    meta[name] = {
        "file": rel,
        "sampleRate": sr,
        "peakSample": peak,
        "peakSeconds": round(peak / sr, 4),
        "peakOffsetFrames": round(peak / sr * FPS),
        "durationFrames": int(np.ceil(len(mono) / sr * FPS)),
    }
    print(f"{name:12} sr {sr}  peak at {peak / sr:.3f} s = {round(peak / sr * FPS)} frames  length {len(mono) / sr:.2f} s")

(SFX_DIR / "sfx_meta.json").write_text(json.dumps(meta, indent=2) + "\n")
