# Proposal

## Why

The game's engine and content are rich, but the layer around a career was thin: the design
document's own "out of scope" list named sound, save export and ceremony for the big moments as
the gaps a player notices first; the Spanish dictionary (about 465 kB of source) shipped to every
reader; and a finished career left nothing to share or compare. These are all presentation and
device concerns, so they can be added without touching a single simulation rule.

## What Changes

- Spanish is split into its own chunk and fetched only when chosen (main bundle gzip 345 kB to about 220 kB).
- A career can be exported to a JSON file and imported back, through the normal save migrations.
- New-game offers **Daily** and **Weekly** challenges: the UTC date is hashed into a seed and a department, so everyone who plays the same day gets the same career, with no server.
- A finished career offers a shareable card (canvas image and plain text) that records ending, department, track, years, final post, reputation over time, how Elena finished, and which challenge it was.
- Sound is synthesised in the browser (no audio files), off by default, with cues for taps, events, month reports, promotion, long initiatives, partings, the ministry and endings, and a quiet ambient bed.
- Four moments (promotion, a long initiative landing, a long-serving colleague leaving, reaching the ministry) get a full-screen ceremony instead of a line in a modal.
- `GameState` gains one optional field, `challenge`, that is a label only. No simulation rule reads it.
- No **BREAKING** changes. Existing saves load unchanged; the save version stays 9.

## Capabilities

### New Capabilities
- `locale-loading`: which language dictionaries ship in the main bundle and when others are fetched.
- `save-transfer`: exporting a career to a file and importing one, including validation of untrusted files.
- `shared-challenges`: date-derived daily and weekly runs, the same for every player.
- `career-summary-card`: the end-of-career shareable card and its text form.
- `game-sound`: synthesised audio cues and ambience, with the player's on/off choice.
- `moment-ceremonies`: which game moments are given a full-screen presentation, and when.

### Modified Capabilities

None. `openspec/specs/` is empty; these are the first specs, written to describe behaviour that is already built.

## Impact

- Code: `src/engine/challenge.ts` (new), `src/engine/save.ts` (stricter shape check, raw read, file name), `src/engine/newGame.ts` and `types.ts` (optional `challenge`), `src/i18n/translate.ts` and `index.tsx`, `src/main.tsx`, `src/state/gameReducer.ts` (`IMPORT_SAVE`), and new UI under `src/ui/` (`sound.ts`, `ceremony.ts`, `summary.ts`, hooks, `Ceremony`, `SummaryCard`, `UtilityBar`).
- Docs: `docs/game-design.md` section 8p, README, section 12.
- Tests: new unit tests in `tests/engine` and `tests/ui`, and `tests/e2e/extras.spec.ts`.
- Dependencies: none added.
- Out of scope: leaderboards or any server, music tracks, multiple save slots, difficulty settings, and any change to simulation balance.
