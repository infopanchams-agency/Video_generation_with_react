# Winroom by Aerobee: launch film

Remotion project for the Winroom launch film (16:9, 63.5 s) and the LinkedIn
square cut (1:1, 30 s). Built from `vikas-winroom-launch-claude-code-brief.md`
and `vikas-winroom-launch-vo-script.md` (both in this folder).

## Single source of truth

- `timing.json`: every frame, beat and audio event of the 16:9 film (v2, 1,905 frames).
- `timing.square.json`: the same for the 1:1 cut (900 frames).

Scenes, audio placement, music and checks all read these files. No frame is
typed by hand in a scene.

## Rebuild everything

Run from this folder. Needs Python 3 with `numpy scipy soundfile pocketsphinx`, and `ffmpeg`.

```bash
npm i
python3 scripts/split_vo.py          # VA Final.mp3 -> 13 clips, word timings, phone-filtered call lines
python3 scripts/measure_sfx.py       # SFX peak offsets
python3 scripts/build_music.py       # public/audio/music.wav + stems
python3 scripts/build_music.py timing.square.json public/audio/square/music.wav
python3 scripts/check_sync.py
python3 scripts/check_sync.py timing.square.json public/audio/square/music.wav
```

## Preview and render

```bash
npx remotion studio
npx remotion render WinroomLaunch16x9 out/winroom-launch-16x9.raw.mp4
npx remotion render WinroomLaunch1x1 out/winroom-launch-1x1.raw.mp4
python3 scripts/loudnorm.py out/winroom-launch-16x9.raw.mp4 out/winroom-launch-16x9.mp4
python3 scripts/loudnorm.py out/winroom-launch-1x1.raw.mp4 out/winroom-launch-1x1.mp4
```

`loudnorm.py` is a two-pass ffmpeg loudnorm to -14 LUFS integrated, -1 dBTP true peak.

## Notes

- Word timings come from PocketSphinx forced alignment (Whisper model downloads were blocked in the build environment).
- Five VO lines were longer than their scenes. Per Vikas, each scene gained 1-2 beats and each line a 1.02-1.11x pitch-preserving speed-up. See `notes` in `timing.json`.
- The generated music WAVs are not committed; the build script recreates them identically.
