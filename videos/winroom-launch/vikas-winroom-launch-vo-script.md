# Winroom by Aerobee: launch film voice-over script (4 speakers)

- **Version:** VO v1.1, 5 November 2026. All lines in English. Draft for Vikas.
- **Tool:** ElevenLabs Text to Speech, Eleven v4 (the model that reads audio tags like `[curious]`).
- **Matches:** `vikas-winroom-launch-claude-code-brief.md` (timing.json IDs vo01 to vo10b).

## How to make the files in ElevenLabs

1. Make **one clip per line**. Do not record the film as one long dialogue. Each clip must start at its own frame in the video.
2. Paste the text in the **"Paste into ElevenLabs"** column exactly, tags included. Tags in square brackets are spoken as emotion, not as words.
3. Download each clip and name it with its ID: `vo01.mp3`, `vo02.mp3` … `vo10b.mp3`. That makes 13 files.
4. Check each clip's length against the **Max length** column. If a clip is too long, regenerate it once. If it is still long, use the shorter fallback line.
5. Leave the phone sound to Claude Code. Record the customer and rep lines clean. Claude Code adds the phone filter.

## The 4 voices

| Speaker | Who they are | Voice to pick | Settings |
|---|---|---|---|
| **Narrator** | The Winroom brand voice. Calm, sure, a little warm. Never salesy. | **Roger** (Laid-back, Casual, Resonant) works. An Indian English male or female voice from the Voice Library also works. | Stability: middle. Similarity: high. Language: English. |
| **Sales lead** | An Indian founder or head of sales, early 30s. Tired of tool chaos. Real, not angry. | An Indian English **female** voice, so the contrast with the narrator is clear. | Stability: toward Creative (tags work better). Language: English. |
| **Customer** | "Rohan M.", a property buyer on the phone. Polite, hesitant about price. | An Indian English **male** voice, casual. | Stability: toward Creative. Language: English. |
| **Rep** | A young Winroom user closing the visit. Friendly, confident. | An Indian English voice that is clearly **different** from the customer. | Stability: middle. Language: English. |

If the model ignores a tag, move Stability toward **Creative** and generate again. If a tag is still ignored, delete it. The line still works without it.

## The script

Max length = the time before the next scene starts. The film runs at 30 frames per second.

| ID | Scene | Speaker | Starts at | Max length | Paste into ElevenLabs |
|---|---|---|---|---|---|
| vo01 | S01 Hook | Narrator | 0:00.5 | 3.1 s | `[confident] Everyone's building. [short pause] Faster than ever.` |
| vo02 | S02 Questions | Sales lead | 0:04.5 | 7.1 s | `[curious] But who's calling your customers? [frustrated] Who logs what they said? [exasperated] Who coaches your rep... before the next call?` |
| vo03 | S03 Fragmented | Sales lead | 0:12.5 | 3.0 s | `[sighs] Five tools. Empty notes. Last quarter's playbook.` |
| vo04 | S04 Reveal | Narrator | 0:17.0 | 2.6 s | `[warm] Meet Winroom.` |
| vo05a | S05 Live call | Customer | 0:21.0 | 2.8 s | `[hesitant] Feels a bit pricey... maybe after the visit.` |
| vo05b | S05 Live call | Narrator | 0:24.0 | 3.8 s | `[confident] Live coaching, mid-call. [short pause] In English, Hindi, or Hinglish.` |
| vo06a | S06 Post-call | Rep | 0:28.0 | 2.8 s | `[warm] I'll email you the details before the visit.` |
| vo06b | S06 Post-call | Narrator | 0:31.0 | 4.8 s | `Winroom logs the call and sets the next step. [short pause] [lightly amused] Nobody types notes.` |
| vo07 | S07 One inbox | Narrator | 0:36.5 | 5.1 s | `Voice. WhatsApp. Email. LinkedIn. [short pause] One place. Coached by your own playbook.` |
| vo08 | S08 Chat setup | Narrator | 0:42.5 | 5.1 s | `[confident] Set it up by chatting. [short pause] Describe the flow. Winroom builds it.` |
| vo09 | S09 Loop | Narrator | 0:48.5 | 3.1 s | `[thoughtful] Every call coaches the next one.` |
| vo10a | S10 End card | Sales lead | 0:53.0 | 1.8 s | `[proud] Built for sales people.` |
| vo10b | S10 End card | Narrator | 0:55.0 | 4.0 s | `[warm] By sales people. [short pause] Winroom, by Aerobee.` |

### Shorter fallback lines (use only if a clip runs long)

| ID | Fallback |
|---|---|
| vo02 | `[curious] Who's calling your customers? [frustrated] Who logs the call? [exasperated] Who coaches your rep?` (update the on-screen questions to match) |
| vo05b | `[confident] Live coaching. English, Hindi, Hinglish.` |
| vo06a | `[warm] I'll email you the details.` |
| vo06b | `Winroom sets the next step. [short pause] Nobody types notes.` |
| vo07 | `Voice, WhatsApp, email, LinkedIn. [short pause] One place.` |

## Delivery notes for each speaker

- **Narrator:** short, even sentences. Land each sentence firmly. Slow down only on "Meet Winroom" and "Winroom, by Aerobee".
- **Sales lead:** this is the viewer's own voice. Each of the 3 questions builds a little more than the last. The sigh in vo03 is tired, not dramatic. "Built for sales people" is said with pride, like a founder at a launch.
- **Customer:** natural, polite Indian English, the way a buyer talks on a call. The "..." is a real hesitation.
- **Rep:** friendly and sure. The line shows the rep took the coaching card's advice and moved to the visit.

## Pronunciation

- **Aerobee:** AIR-oh-bee. If the voice says it wrong, write `Air-oh-bee` in the ElevenLabs text, but keep "Aerobee" in all on-screen copy.
- **Winroom:** WIN-room, one word.
- **CRM:** say the letters, C-R-M.

## Checks before you upload to Claude Code

- 13 files, named exactly as the IDs above.
- No clip is longer than its max length.
- The customer and rep lines are clean (no phone effect added yet).
- No real names. "Rohan M." is dummy data.
- Every line is in English. No line is in Hindi or Hinglish. (vo05b only names the languages Winroom supports.)
