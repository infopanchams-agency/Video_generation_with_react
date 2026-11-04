"""Synthesise the licence-free music bed from timing.json.

Usage (from videos/winroom-launch):
    python3 scripts/build_music.py                         # 16:9 film -> public/audio/music.wav
    python3 scripts/build_music.py timing.square.json public/audio/square/music.wav

Every note is placed by sample index from the bar map in timing.json
(scenes[].barBeats), so nothing can drift. 120 BPM at 48 kHz = 24,000 samples
per beat = exactly 15 video frames.

Arrangement follows section 5.1 of the build brief, by bar number. The
square cut uses the same script; its timing file maps each bar number to the
section of the film it comes from (scenes[].musicBars).
"""

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, sosfilt_zi

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
RNG = np.random.default_rng(7)  # fixed seed: the bed is identical on every run

timing_path = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "timing.json")
out_path = ROOT / (sys.argv[2] if len(sys.argv) > 2 else "public/audio/music.wav")
T = json.loads(timing_path.read_text())
FPS = T["fps"]
SPF = SR // FPS  # samples per video frame (1600)
SPB = T["framesPerBeat"] * SPF  # samples per beat (24000)
N = T["durationInFrames"] * SPF

# ---------------------------------------------------------------- bar map
# bars[i] = (film bar number used for the arrangement, start sample, beats)
bars = []
pos = 0
for scene in T["scenes"]:
    first = scene["bars"][0]
    music_bars = scene.get("musicBars", list(range(first, first + len(scene["barBeats"]))))
    for bar_no, beats in zip(music_bars, scene["barBeats"]):
        bars.append((bar_no, pos, beats))
        pos += beats * SPB
assert pos == N, f"bar map covers {pos} samples, film is {N}"


def bar_start(bar_no: int) -> int:
    return next(s for (b, s, _) in bars if b == bar_no)


# ---------------------------------------------------------------- notes
def midi_hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


# A minor, one chord per bar: Am - F - C - G (MIDI note numbers).
CHORDS = {
    "Am": {"root": 33, "tones": [57, 60, 64]},
    "F": {"root": 29, "tones": [57, 60, 65]},
    "C": {"root": 36, "tones": [55, 60, 64]},
    "G": {"root": 31, "tones": [55, 59, 62]},
}
LOOP = ["Am", "F", "C", "G"]


def chord_for(bar_no: int) -> dict:
    if bar_no >= 29:  # end card resolves to the tonic
        return CHORDS["Am"]
    return CHORDS[LOOP[(bar_no - 1) % 4]]


# ---------------------------------------------------------------- buffers
drums = np.zeros(N)
bass = np.zeros(N)
pad = np.zeros((N, 2))
note_log = []


def env(n: int, attack: float, decay: float, release: float = 0.004) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.minimum(1.0, t / max(attack, 1e-4))
    e = a * np.exp(-t / decay)
    r = int(release * SR)
    if r and n > r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def add(buf: np.ndarray, start: int, sig: np.ndarray) -> None:
    start = int(start)
    if start >= len(buf):
        return
    end = min(len(buf), start + len(sig))
    if start < 0:
        sig = sig[-start:]
        start = 0
        end = min(len(buf), len(sig))
    buf[start:end] += sig[: end - start]


def log(what: str, sample: int) -> None:
    note_log.append((what, sample))


def kick(at: int, gain: float) -> None:
    n = int(0.40 * SR)
    t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t / 0.035)
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.16)
    add(drums, at, gain * sig)
    log("kick", at)


def hat(at: int, gain: float) -> None:
    n = int(0.06 * SR)
    noise = sosfilt(butter(4, 7000, "hp", fs=SR, output="sos"), RNG.standard_normal(n))
    add(drums, at, gain * noise * env(n, 0.001, 0.015))


def clap(at: int, gain: float) -> None:
    n = int(0.25 * SR)
    noise = sosfilt(butter(2, [900, 2500], "bp", fs=SR, output="sos"), RNG.standard_normal(n))
    e = env(n, 0.001, 0.07)
    for off in (0.0, 0.011, 0.022):  # three quick bursts
        e += 0.5 * env(n, 0.001, 0.008) * (np.arange(n) >= int(off * SR))
    add(drums, at, gain * noise * e / 2)
    log("clap", at)


def snare(at: int, gain: float) -> None:
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    noise = sosfilt(butter(2, 1800, "hp", fs=SR, output="sos"), RNG.standard_normal(n))
    sig = 0.7 * noise * env(n, 0.001, 0.04) + 0.5 * np.sin(2 * np.pi * 190 * t) * env(n, 0.001, 0.03)
    add(drums, at, gain * sig)


def tick(at: int, gain: float) -> None:
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    add(drums, at, gain * np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.012))
    log("tick", at)


def sub(at: int, midi: int, dur: float, gain: float) -> None:
    n = int(dur * SR)
    t = np.arange(n) / SR
    add(bass, at, gain * np.sin(2 * np.pi * midi_hz(midi) * t) * env(n, 0.006, dur * 0.6, 0.03))
    log(f"sub {midi}", at)


def bassnote(at: int, midi: int, dur: float, gain: float) -> None:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi_hz(midi)
    tri = 2 * np.abs(2 * ((t * f) % 1) - 1) - 1
    sig = 0.7 * tri + 0.5 * np.sin(2 * np.pi * f * t)
    add(bass, at, gain * sig * env(n, 0.004, dur * 0.8, 0.02))


def saw(f: float, t: np.ndarray) -> np.ndarray:
    return 2 * ((t * f) % 1) - 1


def pad_chord(at: int, tones: list, dur: float, gain: float, detune: float = 0.12) -> None:
    n = int(dur * SR)
    t = np.arange(n) / SR
    left = np.zeros(n)
    right = np.zeros(n)
    for m in tones:
        f = midi_hz(m)
        left += saw(f * 2 ** (-detune / 12), t) + 0.5 * saw(f * 2 ** (0.03 / 12), t)
        right += saw(f * 2 ** (detune / 12), t) + 0.5 * saw(f * 2 ** (-0.03 / 12), t)
    sos = butter(2, 1400, "lp", fs=SR, output="sos")
    a = int(0.25 * SR)
    r = int(0.30 * SR)
    shape = np.ones(n)
    shape[:a] = np.linspace(0, 1, a)
    shape[-r:] *= np.linspace(1, 0, r)
    add(pad[:, 0], at, gain * sosfilt(sos, left) * shape / len(tones))
    add(pad[:, 1], at, gain * sosfilt(sos, right) * shape / len(tones))
    log(f"pad {tones}", at)


def pluck(at: int, midi: int, gain: float, decay: float = 0.25) -> None:
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = midi_hz(midi)
    sig = sosfilt(butter(2, 3000, "lp", fs=SR, output="sos"), saw(f, t) + 0.6 * np.sin(2 * np.pi * f * t))
    e = env(n, 0.002, decay, 0.01)
    add(pad[:, 0], at, gain * sig * e)
    add(pad[:, 1], at, gain * sig * e)
    log(f"pluck {midi}", at)


def impact(at: int, gain: float) -> None:
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    f = 30 + 60 * np.exp(-t / 0.08)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.6, 0.05)
    noise = sosfilt(butter(2, 3000, "lp", fs=SR, output="sos"), RNG.standard_normal(n)) * env(n, 0.0005, 0.12)
    add(drums, at, gain * (body + 0.6 * noise))
    log("impact", at)


def riser(end: int, length: int, gain: float) -> None:
    """White noise through a band-pass whose centre rises; ends exactly at `end`."""
    start = end - length
    noise = RNG.standard_normal(length)
    out = np.zeros(length)
    block = SR // 100
    zi = None
    for i in range(0, length, block):
        p = i / length
        fc = 400 * (8000 / 400) ** p
        sos = butter(2, [fc * 0.8, min(fc * 1.25, SR / 2 - 100)], "bp", fs=SR, output="sos")
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        out[i: i + block], zi = sosfilt(sos, noise[i: i + block], zi=zi)
    ramp = np.linspace(0, 1, length) ** 2
    ramp[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))  # stop cleanly on the cut
    add(drums, start, gain * out * ramp * 4)
    log("riser end", end)


# ---------------------------------------------------------------- arrangement
hit_frames = {h["what"]: h["frame"] for h in T["hits"]}
question_hits = [h["frame"] for h in T["hits"] if "question" in h["what"]]
loop_hits = [h["frame"] for h in T["hits"] if "loop node" in h["what"]]
max_bar = max(b for (b, _, _) in bars)

for (bar_no, s, beats) in bars:
    ch = chord_for(bar_no)
    bar_len = beats * SPB
    eighth = SPB // 2
    sixteenth = SPB // 4

    if bar_no <= 2:  # Hook
        for b in range(0, beats, 2):
            sub(s + b * SPB, ch["root"] + 12, 0.9, 0.55)
        for e in range(beats * 2):
            hat(s + e * eighth, 0.10)

    elif bar_no <= 6:  # Questions
        kick(s, 0.55)
        for b in range(0, beats, 2):
            sub(s + b * SPB, ch["root"] + 12, 0.9, 0.5)
        for e in range(beats * 2):
            hat(s + e * eighth, 0.12)
        bassnote(s, ch["root"] + 12, beats * 0.5 * 0.9, 0.25)

    elif bar_no <= 8:  # Fragmented: hats + detuned pad, riser in bar 8
        for e in range(beats * 2):
            hat(s + e * eighth, 0.11)
        pad_chord(s, ch["tones"], beats * 0.5, 0.35, detune=0.35)
        if bar_no == 8:
            riser(s + bar_len, bar_len, 0.22)

    elif bar_no == 9:  # Reveal: impact, then near-silence
        impact(s, 1.0)

    elif bar_no == 10:
        pad_chord(s, ch["tones"], beats * 0.5, 0.45)

    elif bar_no <= 24:  # Live call -> chat setup: full groove
        fill = bar_no in (21, 24)
        for b in range(beats):
            if not (fill and b == beats - 1):
                kick(s + b * SPB, 0.45)
            if b % 2 == 1:
                clap(s + b * SPB, 0.30)
        if fill:  # snare roll on 16ths over the last beat
            for k in range(4):
                snare(s + (beats - 1) * SPB + k * sixteenth, 0.12 + 0.05 * k)
        for k in range(beats * 4):
            hat(s + k * sixteenth, 0.07 if k % 2 else 0.10)
        for e in range(beats * 2):
            bassnote(s + e * eighth, ch["root"] + 12, 0.22, 0.30)
        pad_chord(s, ch["tones"], beats * 0.5, 0.30)
        if bar_no >= 15:  # plucked arpeggio on 8ths
            arp = ch["tones"] + [ch["tones"][1] + 12]
            for e in range(beats * 2):
                pluck(s + e * eighth, arp[e % len(arp)] + 12, 0.10 if bar_no <= 18 else 0.07, 0.12)

    elif bar_no <= 26:  # Loop: kick off, pad holds, plucks on the node hits
        pad_chord(s, ch["tones"], beats * 0.5, 0.35)

    else:  # End card
        if bar_no == 27:
            impact(s, 1.0)
        if bar_no <= 28:
            for b in range(beats):
                kick(s + b * SPB, 0.40)
            for e in range(beats * 2):
                hat(s + e * eighth, 0.08)
        pad_chord(s, ch["tones"], beats * 0.5, 0.40)
        sub(s, ch["root"] + 12, beats * 0.5, 0.40)

for f in question_hits:
    tick(f * SPF, 0.20)
for i, f in enumerate(loop_hits):  # 4 rising notes: A, C, E, A
    pluck(f * SPF, [69, 72, 76, 81][i % 4], 0.22, 0.35)

# Low-pass opening on drums + bass over the Questions section (bars 3-6).
if any(b == 3 for (b, _, _) in bars) and any(b == 6 for (b, _, _) in bars):
    q_start, q_end = bar_start(3), bar_start(6) + 4 * SPB
    block = SR // 100
    for buf in (drums, bass):
        seg = buf[q_start:q_end].copy()
        out = np.zeros_like(seg)
        zi = None
        for i in range(0, len(seg), block):
            p = i / len(seg)
            sos = butter(2, 300 * (12000 / 300) ** p, "lp", fs=SR, output="sos")
            if zi is None:
                zi = sosfilt_zi(sos) * seg[0]
            out[i: i + block], zi = sosfilt(sos, seg[i: i + block], zi=zi)
        buf[q_start:q_end] = out

# ---------------------------------------------------------------- mix
stems = {
    "drums": np.stack([drums, drums], axis=1),
    "bass": np.stack([bass, bass], axis=1),
    "pad": pad,
}
mix = stems["drums"] * 0.9 + stems["bass"] * 0.9 + stems["pad"] * 0.8

# Last 1 s: fade to silence.
fade = SR
for arr in [mix, *stems.values()]:
    arr[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2


def master(x: np.ndarray) -> np.ndarray:
    peak = np.max(np.abs(x)) or 1.0
    y = np.tanh(1.2 * x / peak) / np.tanh(1.2)  # light soft-clip
    return y * 10 ** (-1 / 20) / np.max(np.abs(y))  # peak -1 dBFS


def write(path: Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, np.clip(x, -1, 1), SR, subtype="PCM_24")


mix = master(mix)
assert len(mix) == N
write(out_path, mix)
for name, arr in stems.items():
    write(out_path.with_name(f"music_{name}.wav"), master(arr))

print(f"Wrote {out_path.relative_to(ROOT)}: {N} samples ({N / SR:.3f} s), stereo, 48 kHz")
for bar_no in (9, 25):
    if not any(b == bar_no for (b, _, _) in bars):
        continue
    s = bar_start(bar_no)
    beats = next(bt for (b, _, bt) in bars if b == bar_no)
    print(f"\nNote-ons in bar {bar_no} (starts frame {s // SPF}):")
    for what, at in sorted(note_log, key=lambda x: x[1]):
        if s <= at < s + beats * SPB:
            print(f"  {at / SR:8.3f} s  frame {at / SPF:7.1f}  {what}")
