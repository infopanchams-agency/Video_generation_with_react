"""Split VA Final.mp3 into the 13 VO clips and write word timings.

Usage (from videos/winroom-launch):
    python3 scripts/split_vo.py [path/to/vo-script.md]

Word timings: the brief asks for Whisper. Whisper model downloads
(huggingface.co, openaipublic.azureedge.net) are blocked by this environment's
network policy, so this script uses CMU PocketSphinx *forced alignment*
(pip package `pocketsphinx`, model bundled in the wheel). Because the script
text is known, forced alignment gives word start/end times directly; it does
not need a speech-to-text guess. To confirm the audio really says each line,
the script also runs PocketSphinx free recognition per clip and prints a
word-overlap score.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from pocketsphinx import Decoder

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/audio/vo/source/va-final.mp3"
OUT_DIR = ROOT / "public/audio/vo"
TIMING = json.loads((ROOT / "timing.json").read_text())
FPS = TIMING["fps"]
PAD_S = 0.040
SILENCE_DB = -40
SILENCE_MIN_S = 0.15

# Words missing from the CMU dictionary, with ARPAbet pronunciations taken
# from the VO script's pronunciation notes.
EXTRA_WORDS = {
    "winroom": "W IH N R UW M",
    "aerobee": "EH R OW B IY",
    "hinglish": "HH IH NG G L IH SH",
    "midcall": "M IH D K AO L",  # "mid-call" (hyphen dropped by norm())
}


def read_script(md_path: Path) -> list[dict]:
    """Returns [{id, text}] from the 'Paste into ElevenLabs' column, tags removed."""
    lines = []
    for row in md_path.read_text().splitlines():
        m = re.match(r"^\| (vo\d+[ab]?) \|.*\| `([^`]+)` \|$", row)
        if m:
            text = re.sub(r"\[[^\]]*\]", "", m.group(2))
            lines.append({"id": m.group(1), "text": re.sub(r"\s+", " ", text).strip()})
    return lines


def norm(token: str) -> str:
    return re.sub(r"[^a-z']", "", token.lower().replace("’", "'"))


def decode_16k(path: Path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16)


def make_decoder(**kwargs) -> Decoder:
    d = Decoder(samprate=16000, **kwargs)
    for w, phones in EXTRA_WORDS.items():
        if d.lookup_word(w) is None:
            d.add_word(w, phones, True)
    return d


def align(audio: np.ndarray, words: list[str]) -> list[tuple[str, float, float]]:
    d = make_decoder(bestpath=False)
    d.set_align_text(" ".join(words))
    d.start_utt()
    d.process_raw(audio.tobytes(), full_utt=True)
    d.end_utt()
    out = []
    for seg in d.seg():
        w = re.sub(r"\(\d+\)$", "", seg.word)
        if w in ("<s>", "</s>", "<sil>", "[NOISE]"):
            continue
        out.append((w, seg.start_frame / 100.0, (seg.end_frame + 1) / 100.0))
    return out


def recognise(audio: np.ndarray) -> list[str]:
    d = make_decoder()
    d.start_utt()
    d.process_raw(audio.tobytes(), full_utt=True)
    d.end_utt()
    hyp = d.hyp()
    return hyp.hypstr.split() if hyp else []


def silences(path: Path) -> list[tuple[float, float]]:
    err = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af",
         f"silencedetect=noise={SILENCE_DB}dB:d={SILENCE_MIN_S}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    if len(ends) > len(starts):  # file starts in silence
        starts = [0.0] + starts
    return list(zip(starts, ends))


def duration(path: Path) -> float:
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout.strip())


def main() -> None:
    md = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "vikas-winroom-launch-vo-script.md"
    script = read_script(md)
    vo_ids = [v["id"] for v in TIMING["vo"]]
    if [s["id"] for s in script] != vo_ids:
        sys.exit(f"Script IDs {[s['id'] for s in script]} do not match timing.json {vo_ids}")

    audio = decode_16k(SOURCE)
    total_s = len(audio) / 16000
    sil = silences(SOURCE)

    tokens = []  # (line index, display token, normalised word)
    for i, s in enumerate(script):
        for tok in s["text"].split():
            if norm(tok):
                tokens.append((i, tok, norm(tok)))

    aligned = align(audio, [t[2] for t in tokens])
    if [a[0] for a in aligned] != [t[2] for t in tokens]:
        sys.exit("Forced alignment failed: the aligner could not fit the script to the audio.")

    rows = []
    timings = {}
    for i, s in enumerate(script):
        words = [(t[1], a[1], a[2]) for t, a in zip(tokens, aligned) if t[0] == i]
        first, last = words[0][1], words[-1][2]
        prev_end = max((a[2] for t, a in zip(tokens, aligned) if t[0] == i - 1), default=0.0)
        next_start = min((a[1] for t, a in zip(tokens, aligned) if t[0] == i + 1), default=total_s)
        # Silence that sits in the gap before the first word / after the last word.
        before = [e for (st, e) in sil if e <= first + 0.06 and e >= prev_end - 0.06]
        after = [st for (st, e) in sil if st >= last - 0.06 and st <= next_start + 0.06]
        cut_in = min(max(before), first) if before else first
        cut_out = max(min(after), last) if after else last
        clip_start = max(0.0, cut_in - PAD_S)
        clip_end = min(total_s, cut_out + PAD_S)
        timings[s["id"]] = {
            "clipStartS": clip_start,
            "clipEndS": clip_end,
            "silenceBefore": bool(before),
            "silenceAfter": bool(after),
            "words": [
                {"text": w, "startMs": round((a - clip_start) * 1000), "endMs": round((b - clip_start) * 1000)}
                for (w, a, b) in words
            ],
        }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for v in TIMING["vo"]:
        t = timings[v["id"]]
        out = OUT_DIR / f"{v['id']}.mp3"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(SOURCE), "-ss", f"{t['clipStartS']:.3f}",
             "-to", f"{t['clipEndS']:.3f}", "-ar", "48000", "-c:a", "libmp3lame", "-q:a", "2", str(out)],
            check=True,
        )
        (OUT_DIR / f"{v['id']}.words.json").write_text(json.dumps(t["words"], indent=2) + "\n")
        clip_audio = audio[int(t["clipStartS"] * 16000): int(t["clipEndS"] * 16000)]
        heard = recognise(clip_audio)
        expected = [norm(w["text"]) for w in t["words"]]
        overlap = len(set(heard) & set(expected)) / len(set(expected))
        length = duration(out)
        max_len = (v["maxEnd"] - v["start"]) / FPS
        rows.append({
            "id": v["id"],
            "text": " ".join(w["text"] for w in t["words"]),
            "sourceIn": round(t["clipStartS"], 3),
            "sourceOut": round(t["clipEndS"], 3),
            "lengthS": round(length, 3),
            "lengthFrames": round(length * FPS, 1),
            "maxS": round(max_len, 3),
            "overS": round(max(0.0, length - max_len), 3),
            "pass": length <= max_len,
            "silenceCut": t["silenceBefore"] and t["silenceAfter"],
            "recognised": " ".join(heard),
            "recognitionOverlap": round(overlap, 2),
        })

    (OUT_DIR / "split_report.json").write_text(json.dumps(rows, indent=2) + "\n")
    print(f"{'ID':6} {'len s':>6} {'max s':>6} {'over':>6}  result  silence  heard  text")
    for r in rows:
        print(f"{r['id']:6} {r['lengthS']:6.2f} {r['maxS']:6.2f} {r['overS']:6.2f}  "
              f"{'PASS' if r['pass'] else 'FAIL':6}  {'yes' if r['silenceCut'] else 'no ':7}  "
              f"{r['recognitionOverlap']:4.0%}   {r['text']}")
    failed = [r["id"] for r in rows if not r["pass"]]
    if failed:
        print(f"\nSTOP: {len(failed)} clip(s) longer than their max length: {', '.join(failed)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
