# Audio assets

These files are **required** for Stealth Mode to work end-to-end on a real
device. They are not in source control because they are production audio
work and shouldn't bloat the repo until they exist.

## What to add

### `focus-session.m4a` (required for Stealth Mode)

- ~30 minute loop, AAC `.m4a`, mono is fine, 44.1 kHz
- Content: low-volume ambient (recommended: brown noise at about -40 dBFS,
  or a soft pad / drone)
- Why low-volume: it has to be **real** audio (not silence — iOS will kill
  silent tracks) but quiet enough that a user on AirPods barely notices it.
  Real volume = our App Review notes are defensible ("user-controllable
  focus audio companion").
- Why ~30 min: RNTP loops the track during a stealth session; 30 min covers
  even a slow user with breaks. Track loops via RNTP's autoplay-next on the
  same track id.
- License: must be royalty-free / owned outright. Public-domain ambient
  recordings or commissioned work both work.

After dropping the file in this directory, change `lib/audio/decoy-track.ts`
to use:

```ts
url: require('../../assets/audio/focus-session.m4a'),
```

instead of the `https://example.com/silence.m4a` placeholder.

### `covers/minimal_violet.png` / `gradient_blue.png` / `paper_grain.png` (recommended)

- 1024×1024 PNG, no SQZ branding, no Kegel/anatomy imagery
- Matches the visual identity of generic "focus / ambient podcast" cover art
- Wire into `lib/audio/decoy-track.ts` via the same `require()` pattern,
  selecting by `config.cover`.

### `cues/<style>_<phase>.m4a` (optional — only if shipping audio cues in v1)

- ≤ 200 ms clips
- Styles: `tone` (soft electronic chime), `whisper` (whispered word of the
  phase name)
- Phases: `squeeze`, `hold`, `release`
- Implement the actual `Audio.Sound.createAsync` calls in `lib/audio/cues.ts`
  once the clips exist.

## Until then

Stealth Mode currently runs without these assets — but:

- The lockscreen Now Playing card won't appear (the network placeholder
  fails)
- iOS will suspend JS within ~10 s of screen lock → haptics drop
- Audio cues are silently skipped (no-op in `cues.ts`)

Haptics on screen-on still work. Normal mode is fully functional.
