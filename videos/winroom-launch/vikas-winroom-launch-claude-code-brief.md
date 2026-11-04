# Winroom by Aerobee: launch film build brief for Claude Code

**How to use this file:** open Claude Code, select the repo `infopanchams-agency/Video_generation_with_react`, attach this file, `vikas-winroom-launch-vo-script.md`, `VA Final.mp3`, and the storyboard export, and send:

> Read `vikas-winroom-launch-claude-code-brief.md` and build the video it describes. Start with Step 0.

- **Owner:** Vikas Singh (CEO, Aerobee)
- **Version:** Build brief v1.5, 5 November 2026 (values set, recorded VO, no API calls)
- **Status:** Draft. Vikas approves the stills and the audio mix before the final render.

---

## PROJECT VALUES (set by Vikas)

| Field | Value |
|---|---|
| Storyboard | Attached: the Claude Design export. If it is missing, build from the scene table in section 4 and tell me. |
| Graphite hex | `#0E0F11` |
| Winroom accent (Amber) hex | `#F2A93B` |
| Signal Cyan hex | `#2FD3E0` |
| Voice-over | Attached: `VA Final.mp3` (all 13 lines in one file). Split it as in section 5.2. No API calls. |
| Music | "generate" (code-built music bed, licence-free) |
| Call-to-action URL | None. Show the Aerobee wordmark only, no URL. |

---

## 0. RULES FOR YOU (CLAUDE CODE)

1. Write the company name as **"Aerobee"** only. The product is **"Winroom by Aerobee"**. Never use any old product name.
2. Show no numbers, metrics, customer names, or third-party logos. All UI data is dummy data from this file.
3. Do not render an MP4 until I write "render". Show me stills and the Studio preview first.
4. Work on a new git branch `vikas/winroom-launch-video`. Commit at the end of each step. Do not open a pull request unless I ask.
5. Do not change any file under `packages/`. The repo is the Remotion monorepo (version 4.0.540). It is the reference, not the place for this project.
6. Do not call ElevenLabs or any paid API. The voice-over is the attached `VA Final.mp3`. Do not generate or fake any audio except the music and the sound effects in this brief.
7. If the storyboard and this file disagree: this file wins on **timing and copy**. The storyboard wins on **layout and look**. List each difference for me.
8. If a fact is missing, write `NOT SET – ask Vikas` in the code and tell me. Do not guess.
9. Every line, spoken or on screen, is in English. No line is in Hindi or Hinglish. (The narrator may *name* the languages Winroom supports.)

### Step 0. Read first
Read these files in the repo and follow them:
- `AGENTS.md`
- `.agents/skills/remotion-best-practices/SKILL.md` (the router)
- `.agents/skills/remotion-best-practices/remotion-create/SKILL.md` and `video-layout.md`
- `.agents/skills/remotion-best-practices/remotion-markup/`: `SKILL.md`, `multi-scene-video.md`, `transitions.md`, `sequencing.md`, `timing.md`, `audio.md`, `sfx.md`, `calculate-metadata.md`, `google-fonts.md`, `text-highlights.md`
- `.agents/skills/remotion-best-practices/remotion-interactivity/` (timeline structure)
- `.agents/skills/remotion-best-practices/remotion-captions/`
- `.agents/skills/remotion-best-practices/remotion-multimedia/get-audio-duration.md`

Then give me a plan in 10 lines or fewer and wait for "go".

---

## 1. PROJECT SETUP

```bash
mkdir -p videos && cd videos
npx create-video@latest --yes --blank --no-tailwind winroom-launch
cd winroom-launch
npm i
npx remotion add @remotion/transitions @remotion/google-fonts @remotion/media @remotion/captions
```

- `videos/` is outside the `packages/**` workspace glob, so the monorepo does not pick it up. Use `npm` inside this folder only.
- Python 3 with `numpy` and `scipy` builds the music and checks the audio: `pip install numpy scipy --break-system-packages` if needed. `ffmpeg` must be on the path.
- Start Studio as soon as the project runs (`npx remotion studio --no-open`) and keep it open.

### File layout

```
videos/winroom-launch/
  timing.json              <- the single source of truth for every frame, beat and audio event
  src/
    timing.ts              <- imports timing.json, exports typed helpers (beat(), bar(), scene ranges)
    theme.ts               <- colour tokens and fonts
    script.ts              <- all on-screen copy and VO lines
    Root.tsx               <- registers both compositions
    WinroomLaunch.tsx      <- TransitionSeries of the 10 scenes + AudioLayer
    AudioLayer.tsx         <- music, VO and SFX, all placed from timing.json
    scenes/S01Hook.tsx ... S10EndCard.tsx
    ui/                    <- LeadCard, Transcript, CoachingCard, CrmField, ChatPanel, FlowGraph, Loop
  scripts/
    build_music.py         <- writes public/audio/music.wav from timing.json
    split_vo.py            <- splits VA Final.mp3 into 13 clips + word timings (Whisper)
    check_sync.py          <- fails if any audio event is off the grid or VO overruns a scene
  public/audio/            <- music.wav, vo/, sfx/
```

---

## 2. THE BEAT GRID (everything syncs to this)

| Value | Number |
|---|---|
| Frame rate | 30 fps |
| Tempo | 120 BPM |
| 1 beat | **15 frames** (0.5 s) |
| 1 bar (4 beats) | **60 frames** (2 s) |
| Film length | 30 bars = **1,800 frames** (60 s) |
| Audio sample rate | 48,000 Hz, stereo, 24-bit WAV for stems |

I chose 120 BPM because a beat is an exact whole number of frames at 30 fps. Every cut and every hit can land exactly on a frame. Do not change the tempo or the frame rate.

**Sync rules**
- **S1. Scene cuts land on bar lines** (frame divisible by 60).
- **S2. Hits land on beats** (frame divisible by 15). Hits are card entries, CRM field ticks, loop nodes, button presses, and logo builds. Each hit has a matching sound in `timing.json`.
- **S3. Words follow the voice, not the beat.** Kinetic captions use the VO word timestamps (section 5.2). Each VO line *starts* on a beat.
- **S4. Transient sounds are aligned by their peak, not their start.** For a whoosh, measure the peak offset in the WAV and start it `peakOffsetFrames` early, so the peak lands on the cut.
- **S5. All transitions are hard cuts** except the 2 marked "fade 8 f". For those, add the overlap back so the total stays 1,800 frames.

---

## 3. timing.json (create exactly this, then build from it)

```json
{
  "fps": 30,
  "bpm": 120,
  "framesPerBeat": 15,
  "framesPerBar": 60,
  "durationInFrames": 1800,
  "scenes": [
    {"id": "S01Hook",       "from": 0,    "to": 120,  "bars": [1, 2]},
    {"id": "S02Questions",  "from": 120,  "to": 360,  "bars": [3, 6]},
    {"id": "S03Fragmented", "from": 360,  "to": 480,  "bars": [7, 8]},
    {"id": "S04Reveal",     "from": 480,  "to": 600,  "bars": [9, 10],  "transitionIn": "fade8"},
    {"id": "S05LiveCall",   "from": 600,  "to": 840,  "bars": [11, 14]},
    {"id": "S06PostCall",   "from": 840,  "to": 1080, "bars": [15, 18]},
    {"id": "S07OneInbox",   "from": 1080, "to": 1260, "bars": [19, 21]},
    {"id": "S08ChatSetup",  "from": 1260, "to": 1440, "bars": [22, 24]},
    {"id": "S09Loop",       "from": 1440, "to": 1560, "bars": [25, 26]},
    {"id": "S10EndCard",    "from": 1560, "to": 1800, "bars": [27, 30], "transitionIn": "fade8"}
  ],
  "vo": [
    {"id": "vo01",  "speaker": "narrator",  "scene": "S01Hook",       "start": 15,   "maxEnd": 110,  "phoneFilter": false},
    {"id": "vo02",  "speaker": "salesLead", "scene": "S02Questions",  "start": 135,  "maxEnd": 350,  "phoneFilter": false},
    {"id": "vo03",  "speaker": "salesLead", "scene": "S03Fragmented", "start": 375,  "maxEnd": 465,  "phoneFilter": false},
    {"id": "vo04",  "speaker": "narrator",  "scene": "S04Reveal",     "start": 510,  "maxEnd": 590,  "phoneFilter": false},
    {"id": "vo05a", "speaker": "customer",  "scene": "S05LiveCall",   "start": 630,  "maxEnd": 715,  "phoneFilter": true},
    {"id": "vo05b", "speaker": "narrator",  "scene": "S05LiveCall",   "start": 720,  "maxEnd": 835,  "phoneFilter": false},
    {"id": "vo06a", "speaker": "rep",       "scene": "S06PostCall",   "start": 840,  "maxEnd": 925,  "phoneFilter": true},
    {"id": "vo06b", "speaker": "narrator",  "scene": "S06PostCall",   "start": 930,  "maxEnd": 1075, "phoneFilter": false},
    {"id": "vo07",  "speaker": "narrator",  "scene": "S07OneInbox",   "start": 1095, "maxEnd": 1250, "phoneFilter": false},
    {"id": "vo08",  "speaker": "narrator",  "scene": "S08ChatSetup",  "start": 1275, "maxEnd": 1430, "phoneFilter": false},
    {"id": "vo09",  "speaker": "narrator",  "scene": "S09Loop",       "start": 1455, "maxEnd": 1550, "phoneFilter": false},
    {"id": "vo10a", "speaker": "salesLead", "scene": "S10EndCard",    "start": 1590, "maxEnd": 1645, "phoneFilter": false},
    {"id": "vo10b", "speaker": "narrator",  "scene": "S10EndCard",    "start": 1650, "maxEnd": 1770, "phoneFilter": false}
  ],
  "hits": [
    {"frame": 0,    "what": "S01 first word 'Everyone'",          "sfx": null},
    {"frame": 60,   "what": "S01 UI tiles multiply (bar 2)",       "sfx": null},
    {"frame": 120,  "what": "S02 question 1 in",                   "sfx": "switch"},
    {"frame": 195,  "what": "S02 question 2 in",                   "sfx": "switch"},
    {"frame": 270,  "what": "S02 question 3 in",                   "sfx": "switch"},
    {"frame": 360,  "what": "S03 tiles split apart",               "sfx": null},
    {"frame": 420,  "what": "S03 empty notes field + cursor",      "sfx": null},
    {"frame": 480,  "what": "S04 cut to Graphite (impact)",        "sfx": "whoosh", "alignPeak": true},
    {"frame": 495,  "what": "S04 'Winroom' wordmark builds",       "sfx": null},
    {"frame": 540,  "what": "S04 'by Aerobee' in",                 "sfx": null},
    {"frame": 615,  "what": "S05 dial button press",               "sfx": "mouse-click"},
    {"frame": 630,  "what": "S05 call connects, customer line in transcript","sfx": null},
    {"frame": 735,  "what": "S05 coaching card slides in",         "sfx": "switch"},
    {"frame": 840,  "what": "S06 rep reply line in transcript",    "sfx": null},
    {"frame": 930,  "what": "S06 call ends, outcome chip 'Site visit booked'","sfx": "ding"},
    {"frame": 960,  "what": "S06 CRM field 1 ticks",               "sfx": "mouse-click"},
    {"frame": 990,  "what": "S06 CRM field 2 ticks",               "sfx": "mouse-click"},
    {"frame": 1035, "what": "S06 follow-up task checks in",        "sfx": "ding"},
    {"frame": 1095, "what": "S07 Voice row in",                    "sfx": null},
    {"frame": 1110, "what": "S07 WhatsApp row in",                 "sfx": null},
    {"frame": 1125, "what": "S07 Email row in",                    "sfx": null},
    {"frame": 1140, "what": "S07 LinkedIn row in",                 "sfx": null},
    {"frame": 1200, "what": "S07 playbook tiles stack",            "sfx": "page-turn"},
    {"frame": 1275, "what": "S08 admin message sends",             "sfx": "mouse-click"},
    {"frame": 1320, "what": "S08 flow node 1",                     "sfx": null},
    {"frame": 1335, "what": "S08 flow node 2",                     "sfx": null},
    {"frame": 1350, "what": "S08 flow node 3",                     "sfx": null},
    {"frame": 1365, "what": "S08 flow node 4",                     "sfx": null},
    {"frame": 1455, "what": "S09 loop node 'Call'",                "sfx": null},
    {"frame": 1470, "what": "S09 loop node 'Log'",                 "sfx": null},
    {"frame": 1485, "what": "S09 loop node 'Coach'",               "sfx": null},
    {"frame": 1500, "what": "S09 loop node 'Next call'",           "sfx": null},
    {"frame": 1560, "what": "S10 cut (impact)",                    "sfx": "whoosh", "alignPeak": true},
    {"frame": 1590, "what": "S10 'Built for sales people.'",       "sfx": null},
    {"frame": 1650, "what": "S10 'By sales people.'",              "sfx": null},
    {"frame": 1710, "what": "S10 wordmark + CTA",                  "sfx": null}
  ],
  "sfxFiles": {
    "whoosh": "https://remotion.media/whoosh.wav",
    "switch": "https://remotion.media/switch.wav",
    "mouse-click": "https://remotion.media/mouse-click.wav",
    "ding": "https://remotion.media/ding.wav",
    "page-turn": "https://remotion.media/page-turn.wav"
  }
}
```

Download the 5 SFX files into `public/audio/sfx/` so the render does not depend on the network. Use no other sounds from the remotion.media list (the rest are meme sounds).

---

## 4. SCENES, COPY, AND VO (in `src/script.ts`)

All copy is final unless I change it. Dummy data only.

| Scene | Frames | On screen | VO line |
|---|---|---|---|
| S01 Hook | 0–119 | Kinetic type: **Everyone is building.** Small UI tiles multiply across a grid on bar 2. | Narrator: "Everyone's building. Faster than ever." |
| S02 Questions | 120–359 | 3 questions stack, one per hit: **Who's calling your customers?** / **Who logs what they said?** / **Who coaches the rep before the next call?** | Sales lead: "But who's calling your customers? Who logs what they said? Who coaches your rep before the next call?" |
| S03 Fragmented | 360–479 | Tiles split into a dialer tab, a CRM tab, a spreadsheet and a chat app, and drift apart. A CRM note field `notes: ——` with a blinking cursor (cursor blinks on the beat: 15 frames on, 15 off). | Sales lead: "Five tools. Empty notes. Last quarter's playbook." |
| S04 Reveal | 480–599 | Hard Graphite. **Winroom** wordmark builds letter by letter from frame 495. **by Aerobee** at 540. | Narrator: "Meet Winroom." |
| S05 Live call | 600–839 | Lead card "Rohan M. · Site visit pending". Dial press at 615. Call connects at 630. Call timer in JetBrains Mono. Two-track transcript (Rep / Customer). Customer line types in as it is spoken: *"Feels a bit pricey… maybe after the visit."* At 735 one coaching card slides in: label **Price objection**, hint line **Anchor on the site visit. Offer Saturday 11 AM.** One card on screen at a time. | Customer (phone filter, 630): "Feels a bit pricey… maybe after the visit." Narrator (720): "Live coaching, mid-call. In English, Hindi, or Hinglish." |
| S06 Post-call | 840–1079 | Rep reply types into the transcript (840). Call ends and outcome chip **Site visit booked** shows (930). CRM fields type in mono: `asc_call_outcome: site_visit_booked` (960), `asc_next_action: email_visit_details` (990). Task row "Email visit details to Rohan M. · before Sat 11 AM" checks in (1035). | Rep (phone filter, 840): "I'll email you the details before the visit." Narrator (930): "Winroom logs the call and sets the next step. Nobody types notes." |
| S07 One inbox | 1080–1259 | 4 labelled rows (Voice, WhatsApp, Email, LinkedIn; text labels, no logos) slide into one contact timeline, one per beat. At 1200, 3 playbook file tiles stack under a coaching card (layered stack). | Narrator: "Voice. WhatsApp. Email. LinkedIn. One place. Coached by your own playbook." |
| S08 Chat setup | 1260–1439 | Plain chat panel, no avatar. Admin message types out: *"New inbound line for site-visit leads. Route to the Pune team. Missed calls go to WhatsApp."* Send at 1275. A flow graph builds in Signal Cyan, one node per beat from 1320: Inbound line → Site-visit leads → Pune team / Missed → WhatsApp. | Narrator: "Set it up by chatting. Describe the flow. Winroom builds it." |
| S09 Loop | 1440–1559 | One closed loop with 4 nodes (Call, Log, Coach, Next call), one node per beat from 1455. The amber stroke draws round the loop and closes on frame 1515. | Narrator: "Every call coaches the next one." |
| S10 End card | 1560–1799 | **Built for sales people.** (1590) **By sales people.** (1650). Wordmark **Winroom** / *by Aerobee* and **Book a pilot** (1710, no URL). Hold to the end. | Sales lead (1590): "Built for sales people." Narrator (1650): "By sales people. Winroom, by Aerobee." |

---

## 5. AUDIO BUILD

Build 3 layers: music, VO, SFX. Every layer reads `timing.json`. No audio position is typed by hand anywhere else.

### 5.1 Music (`scripts/build_music.py`)

If I chose **"generate"**, write a Python script (numpy + scipy) that synthesises a clean, minimal tech music bed and writes `public/audio/music.wav`: 48 kHz, stereo, exactly 60.000 s (2,880,000 samples). It places every note by sample, from the beat grid, so it cannot drift.

Arrangement (bar numbers start at 1; bar n starts at `(n-1) * 2.0 s`):

| Bars | Section | Layers |
|---|---|---|
| 1–2 | Hook | Low sine sub pulse on beats 1 and 3. Closed hi-hat on 8ths, quiet. |
| 3–6 | Questions | Add soft kick on beat 1 of each bar. A low-pass filter opens slowly over the 4 bars. A soft tick on each question hit. |
| 7–8 | Fragmented | Strip to hats and a detuned pad. Bar 8: a 1-bar white-noise riser with rising band-pass that ends exactly on frame 480. |
| 9–10 | Reveal | Impact on beat 1 of bar 9 (sub drop + noise burst, 0.6 s decay). Then 3 beats of near-silence. Pad chord enters on bar 10. |
| 11–14 | Live call | Full groove: 4-on-the-floor kick at low level, clap on beats 2 and 4, bass on the root following the chord loop, hats on 16ths. |
| 15–18 | Post-call | Same groove. Add a plucked arpeggio on 8ths. |
| 19–24 | One inbox, chat setup | Same groove. Bar 21 and bar 24: drop the kick on beat 4 for a fill (snare roll on 16ths). |
| 25–26 | Loop | Kick off. 4 rising pluck notes on the 4 loop-node hits (1455, 1470, 1485, 1500). Pad holds. |
| 27–30 | End card | Impact on frame 1560. Pad chord resolves to the tonic. Kick returns for bars 27–28 only. Last 1 s (frames 1770–1799): fade to silence. |

- Key: A minor. Chord loop, one chord per bar: Am – F – C – G.
- Use simple waveforms (sine, triangle, filtered saw) with short attack/release envelopes so nothing clicks. Apply a light soft-clip limiter on the master. Peak at –1 dBFS.
- Also write stems (`music_drums.wav`, `music_bass.wav`, `music_pad.wav`) so I can change the mix.
- Print a list of every note-on time in seconds and frames for bars 9 and 25 so I can check them.

If I attached a **licensed track** instead:
1. Measure its tempo and first downbeat (use `librosa` beat tracking, or `aubio`). Report both.
2. If the tempo is 119–121 BPM, align its first downbeat to frame 0 with `trimBefore`. If it is outside that range, stop and ask me. Do not time-stretch without asking.
3. Mark where its drop lands. If the drop is not within 1 beat of frame 480 or 600, tell me which cut point you suggest.

### 5.2 Voice-over: 4 speakers, from `VA Final.mp3`

The VO uses 4 voices. The full lines are in `vikas-winroom-launch-vo-script.md`. Copy the text into `src/script.ts` without the square-bracket tags (they were directions for the voice, not words).

| Speaker ID | Role | Lines |
|---|---|---|
| `narrator` | Calm, confident brand voice | vo01, vo04, vo05b, vo06b, vo07, vo08, vo09, vo10b |
| `salesLead` | Indian founder / sales head, the person with the problem | vo02, vo03, vo10a |
| `customer` | Lead on the phone ("Rohan M."), Indian English | vo05a |
| `rep` | Winroom user on the phone, Indian English | vo06a |

The voice-over is already recorded. It is one file, `VA Final.mp3` (MP3, 44.1 kHz). Do not call ElevenLabs or any other text-to-speech service. Do not generate, re-record, or change any voice.

**Split the file into 13 clips (`scripts/split_vo.py`) before anything else:**
1. Copy it to `public/audio/vo/source/va-final.mp3`. Never edit the original.
2. Run Whisper on it to get word timings (`@remotion/install-whisper-cpp` or `openai-whisper`, as in the repo's captions skill). Match the words to the 13 lines in `vikas-winroom-launch-vo-script.md`. The tags in square brackets are not spoken, so ignore them when you match.
3. Cut each line at the silence just before its first word and just after its last word (`ffmpeg silencedetect`, noise −40 dB, minimum 0.15 s). Add 40 ms of padding on each side. Write `public/audio/vo/vo01.mp3` … `vo10b.mp3` at 48 kHz.
4. Save one word-timing file per clip (`public/audio/vo/<id>.words.json`, words with `startMs` and `endMs`, measured from the start of that clip).
5. Show me a table: ID, matched text, length in seconds, max length (`maxEnd − start`), pass or fail. Stop if a line is missing, out of order, or too long. Do not speed up, stretch, or cut words without asking me.

**Then:**
- **Placement:** place each clip with `<Sequence from={vo.start}>` from `timing.json`. Never move a scene to fit a clip. If a clip is too long, tell me which line and by how much.
- **Phone filter** on lines with `"phoneFilter": true` (vo05a, vo06a): high-pass 300 Hz, low-pass 3,400 Hz, light saturation, mono. Apply it with ffmpeg (`highpass=f=300,lowpass=f=3400,acompressor`) and write the result as `<id>.call.mp3`. Duck the music to 0.12 under these lines.
- **Captions:** convert the word timings to `@remotion/captions` `Caption` objects. Kinetic text in S01, S02 and S10, and the burned-in captions in the square cut, use these timings (sync rule S3).
- **Transcript sync:** in S05 and S06, the transcript text types in word by word on the word timings of vo05a and vo06a.

### 5.3 Sound effects

- Place each `hits[].sfx` with `<Sequence from={hit.frame - offset}>`, where `offset` is 0 for clicks and dings.
- For `alignPeak: true` (the whooshes): find the sample of the loudest peak in the WAV with numpy, convert to frames (`round(peakSample / 48000 * 30)`), and use that as `offset`, so the peak lands on the cut.
- SFX volume: 0.35 by default. Clicks and switches: 0.25.

### 5.4 Mix (`src/AudioLayer.tsx`)

- Keep `useCurrentFrame()` inside `AudioLayer` only, not in the scenes.
- Music base volume 0.5. **Duck** the music to 0.18 while any VO clip plays: ramp down over 6 frames before the VO start, ramp up over 10 frames after the VO end. Compute the duck ranges from the measured VO durations, not from `maxEnd`.
- No music duck on frames 480–494 and 1560–1574 (let the impacts hit).
- Final loudness target: –14 LUFS integrated, true peak –1 dBTP. After I say "render", run a 2-pass `ffmpeg loudnorm` on the rendered file and report the measured values.

---

## 6. VISUAL RULES

- **Brand tokens** in `src/theme.ts`: `graphite` (background of every frame), `amber` (Winroom accent, provisional), `signalCyan` (connective lines, flows, the loop's link arrows), `textPrimary`, `textMuted`. Use the hex codes from the PROJECT VALUES table. Keep all colours in `theme.ts` only, so they can be changed in one place.
- **Fonts** with `@remotion/google-fonts`: Space Grotesk 700 (headlines), Inter 400/600 (UI and body), JetBrains Mono 400 (CRM fields, IDs, timers, flow nodes). Latin subset only.
- **Motifs:** loop, graph and layered stack only.
- **Never:** soft gradients, glows, neural blobs, chatbot or robot icons, stock people, emoji, third-party logos.
- **Motion:** every animation uses `useCurrentFrame()` with `interpolate()` or `spring()`. No CSS transitions or keyframes. Get `fps` from `useVideoConfig()` and write timing on the JSX node. Entries use `Easing.bezier(0.16, 1, 0.3, 1)`, clamped both ends. Words slide 24 px up and fade in over 8 frames.
- **Hits move on the beat:** every element listed in `hits` starts its entry animation on exactly that frame. Import the frame from `timing.ts`. Never type the number in a scene.
- **Layout:** follow `video-layout.md`. One focal point per scene. Scale the minimum text sizes to the width: at 1920 wide, headlines about 150 px and supporting text about 78 px. Keep key text 140 px from the sides and 100 px from the top and bottom.
- **Storyboard match:** match each scene's layout, crop and colour to the attached storyboard frame for that scene.

---

## 7. COMPOSITIONS

| ID | Size | Frames | Content |
|---|---|---|---|
| `WinroomLaunch16x9` | 1920 × 1080 | 1,800 | Full film |
| `WinroomLaunch1x1` | 1080 × 1080 | 900 | Scenes S01, S02 (first 2 questions), S04, S05, S06, S10, with burned-in captions. Re-time it on the same 120 BPM grid (15 bars). Write its own `timing.square.json` and build its own music with the same script. The first frame must read with sound off: **Everyone is building.** |

Both compositions use the same scene components with a `layout` prop. Do not copy scenes.

---

## 8. CHECKS (run them, then report)

`scripts/check_sync.py` must pass. It fails if:
1. Any scene `from` is not divisible by 60, or the scenes do not cover 0–1800 with no gap.
2. Any hit frame is not divisible by 15.
3. Any VO clip ends after its `maxEnd`.
4. `music.wav` is not exactly 2,880,000 samples.
5. An onset check on `music.wav` (energy peaks) finds the bar-9 impact or the bar-27 impact more than 1 frame (33 ms) away from frames 480 and 1560.
6. An SFX peak lands more than 1 frame away from its hit.

Then:
- Grep the source for old product names and for any digit in on-screen copy except the dummy times ("11 AM"). Report the result.
- Export stills for frames 0, 300, 735, 930, 1365, 1515 and 1710 from Studio and show them to me.
- Export a 10-second audio-and-video check clip (frames 420–720) only after I approve the stills.

## 9. WHEN YOU FINISH, TELL ME

- What you built, in 5 lines or fewer.
- The `check_sync.py` result.
- Each place where you differ from the storyboard, and why.
- Every `NOT SET` still in the code.
- The exact command to render both films.
