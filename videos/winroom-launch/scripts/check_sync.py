"""Sync checks from section 8 of the build brief, adapted to the v2 bar map.

Usage (from videos/winroom-launch):
    python3 scripts/check_sync.py                                   # 16:9 film
    python3 scripts/check_sync.py timing.square.json public/audio/square/music.wav

Fails (exit 1) if:
 1. A scene does not start on a bar line, or the scenes do not cover the film with no gap.
    (v2: bars can be 4, 5 or 6 beats long, so a bar line is any bar start in the bar map.
    Every bar line is still on the 15-frame beat grid.)
 2. A hit frame is not on a beat (divisible by 15).
 3. A VO clip ends after its maxEnd, or a VO line does not start on a beat.
 4. music.wav is not exactly durationInFrames x 1600 samples.
 5. The onset check on music.wav finds an impact more than 1 frame from its cut.
 6. An SFX peak lands more than 1 frame from its hit.
"""

import json
import math
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
timing_path = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "timing.json")
music_path = ROOT / (sys.argv[2] if len(sys.argv) > 2 else "public/audio/music.wav")
T = json.loads(timing_path.read_text())
FPS = T["fps"]
FPB = T["framesPerBeat"]
SR = 48000
SPF = SR // FPS
report = {r["id"]: r for r in json.loads((ROOT / "public/audio/vo/split_report.json").read_text())}
sfx_meta = json.loads((ROOT / "public/audio/sfx/sfx_meta.json").read_text())

failures = []


def check(ok: bool, label: str, detail: str = "") -> None:
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{('  ' + detail) if detail else ''}")
    if not ok:
        failures.append(label)


print(f"check_sync: {timing_path.name}  ({T['durationInFrames']} frames)")

# 1. scenes on bar lines, contiguous, cover the film
print("1. Scene cuts on bar lines")
bar_lines = []
pos = 0
for s in T["scenes"]:
    for beats in s["barBeats"]:
        bar_lines.append(pos)
        pos += beats * FPB
check(pos == T["durationInFrames"], "bar map covers the film", f"{pos} of {T['durationInFrames']} frames")
expected = 0
for s in T["scenes"]:
    check(s["from"] == expected, f"{s['id']} starts where the previous scene ends", f"from {s['from']}")
    check(s["from"] in bar_lines and s["from"] % FPB == 0, f"{s['id']} cut on a bar line", f"frame {s['from']}")
    expected = s["to"]
check(expected == T["durationInFrames"], "last scene ends on the last frame", f"{expected}")

# 2. hits on beats
print("2. Hits on beats")
off = [h for h in T["hits"] if h["frame"] % FPB]
check(not off, f"all {len(T['hits'])} hits on the {FPB}-frame grid", ", ".join(f"{h['key']}@{h['frame']}" for h in off))

# 3. VO within maxEnd, starting on beats
print("3. VO clips")
for v in T["vo"]:
    frames = math.ceil(report[v["id"]]["lengthS"] * FPS)
    if v.get("clipFrames"):
        frames = min(frames, v["clipFrames"])
    end = v["start"] + frames
    check(end <= v["maxEnd"] and v["start"] % FPB == 0, f"{v['id']} {v['start']}-{end}", f"maxEnd {v['maxEnd']}, {v['maxEnd'] - end} frames spare")

# 4. music length
print("4. Music length")
info = sf.info(music_path)
want = T["durationInFrames"] * SPF
check(info.frames == want and info.samplerate == SR, f"{music_path.name} is {want} samples", f"got {info.frames} at {info.samplerate} Hz")

# 5. impact onsets
print("5. Impact onsets in the music")
audio, _ = sf.read(music_path, always_2d=True)
mono = np.abs(audio).mean(axis=1)
hop = SR // 1000  # 1 ms envelope
env = np.array([mono[i: i + hop].max() for i in range(0, len(mono) - hop, hop)])
for h in [h for h in T["hits"] if h.get("alignPeak")]:
    centre = int(h["frame"] / FPS * 1000)
    # Loudest energy peak within +-1 s, then its attack: the steepest 3 ms rise
    # in the 150 ms before that peak. (A riser climbs gradually; the impact's
    # transient is the sharpest jump.)
    lo, hi = max(0, centre - 1000), min(len(env), centre + 1000)
    peak = lo + int(np.argmax(env[lo:hi]))
    a = peak - 150
    rise = env[a + 3: peak + 1] - env[a: peak - 2]
    onset_ms = a + int(np.argmax(rise))
    diff_frames = (onset_ms - centre) / 1000 * FPS
    check(abs(diff_frames) <= 1, f"impact at {h['key']} (frame {h['frame']})", f"onset at frame {onset_ms / 1000 * FPS:.2f} ({diff_frames:+.2f})")

# 6. SFX peaks
print("6. SFX peaks")
for h in [h for h in T["hits"] if h["sfx"]]:
    m = sfx_meta[h["sfx"]]
    start = h["frame"] - m["peakOffsetFrames"]  # same rule as AudioLayer.tsx
    peak_frame = start + m["peakSample"] / m["sampleRate"] * FPS
    check(abs(peak_frame - h["frame"]) <= 1, f"{h['sfx']:11} @ {h['key']} (frame {h['frame']})", f"peak at {peak_frame:.2f}")

print(f"\n{'FAILED: ' + str(len(failures)) + ' check(s)' if failures else 'ALL CHECKS PASSED'}")
sys.exit(1 if failures else 0)
