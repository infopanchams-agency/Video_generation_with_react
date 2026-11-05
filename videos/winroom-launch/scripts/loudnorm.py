"""Two-pass ffmpeg loudnorm: -14 LUFS integrated, -1 dBTP true peak.

Usage (from videos/winroom-launch):
    python3 scripts/loudnorm.py out/winroom-launch-16x9.raw.mp4 out/winroom-launch-16x9.mp4

The video stream is copied untouched; only the audio is normalised.
Prints the input measurement and the measured values of the final file.
"""

import json
import re
import subprocess
import sys

# TP is set 0.5 dB under the -1 dBTP ceiling: AAC encoding adds a little overshoot.
TARGET = "I=-14:TP=-1.5:LRA=11"


def measure(path: str) -> dict:
    err = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", f"loudnorm={TARGET}:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    return json.loads(re.findall(r"\{[^{}]+\}", err)[-1])


src, dst = sys.argv[1], sys.argv[2]
m = measure(src)
print(f"pass 1 (input):  {m['input_i']} LUFS, true peak {m['input_tp']} dBTP, LRA {m['input_lra']}")
subprocess.run(
    ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", src, "-c:v", "copy", "-af",
     f"loudnorm={TARGET}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
     f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
     "-ar", "48000", "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", dst],
    check=True,
)
f = measure(dst)
print(f"final file:      {f['input_i']} LUFS, true peak {f['input_tp']} dBTP, LRA {f['input_lra']}")
