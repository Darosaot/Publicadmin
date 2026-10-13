# Design

## Context

The engine (`src/engine/`) is pure TypeScript with a seeded RNG whose cursor lives in the save; React is a thin layer; there is no backend and one `localStorage` save slot. English strings are registered into the content registry as modules import, so the engine cannot run without them. See `proposal.md` for motivation. The behaviours are in `specs/`.

The constraint that shapes everything: **nothing here may change a simulation rule or the balance**, because the balance is pinned by 280-career bot sweeps. So every feature is either presentation (sound, ceremony, card), device plumbing (locale loading, file transfer), or a pure label (challenge id).

## Goals / Non-Goals

**Goals:**
- Add the six capabilities with no change to engine rules, save version, or measured balance.
- Keep every new behaviour testable without a browser where possible (cues as data, ceremony detection as a pure function, challenge derivation as a pure function).

**Non-Goals:**
- A server, accounts or leaderboards. Comparison is by card and shared date only.
- Music, per-event sound design, or a mixer.
- Multiple save slots (file transfer is the escape hatch for now).

## Decisions

**1. Spanish is a dynamic-import chunk; English stays static.**
`translate.ts` keeps English in the main bundle and holds a per-locale loader. `loadLocale` is awaited before first render for a stored non-default language, and `setLocale` awaits it before switching. Until loaded, the Spanish dictionary list is the English one, which is the same fallback an untranslated key already gets, so no path can show a raw key.
*Alternatives:* lazy-load all languages including English (rejected: the engine needs English registered at import); fetch JSON at runtime (rejected: loses type checking and the parity test that compares dictionaries).

**2. Export is the existing serialisation; import reuses `deserialize`.**
No new format. Import therefore inherits migrations and pruning for free, and a reload and an import cannot disagree. `hasRequiredShape` was tightened to the collections the UI iterates unconditionally, since hand-edited files are now an input.
*Alternative:* a separate "share string" (base64). Deferred: files cover the need, and a string would be a second format to keep in step.

**3. Challenges are `hash(UTC date) -> seed, department`.**
FNV-1a over the id string; department chosen from a second hash of the same id. Weekly uses ISO 8601 weeks. The id is stored on the state as an optional string, omitted for free play, so existing saves, `cloneState` and the migration chain are untouched (no version bump).
*Alternatives:* local time (rejected: not shared); server-issued seeds (rejected: needs a backend); letting players choose a department (rejected: departments differ in difficulty by design, so scores would not compare).

**4. Sound is synthesised; cues are data.**
Web Audio oscillators with short envelopes; each cue is an array of notes, which is what the unit test validates. One document-level click listener handles taps; state cues come from comparing the previous and current state in a hook, so no screen must remember to call it and a reload cannot fire one. The setting lives in its own `localStorage` key, outside the save.
*Alternatives:* audio files (rejected: binaries, download size, licensing); per-button handlers (rejected: forgotten on the next feature).

**5. Ceremonies are detected by diffing, not by new engine events.**
`detectCeremonies(before, after, registry)` is a pure function over two states; the hook keeps the previous state in a ref. It returns nothing for a different career (seed or name differs), which keeps import and new-game from looking like promotions. Thresholds (7 cycles, 36 turns) are named constants.
*Alternative:* have the engine emit "ceremony" events into the state (rejected: it would put presentation into the save and the simulation, and need a migration).

**6. The card has one data builder and two renderers.**
`buildSummary` reads the ended state; text and canvas both render that object, so they cannot diverge. The canvas waits for the pixel fonts to load before drawing and uses its own palette, since it is an image people post elsewhere.

**7. One utility strip, outside every screen.**
Sound, export and import are device-level, so they live in a footer rendered once, not in each screen.

## Risks / Trade-offs

- [`monthsInPost` counts turns, not months, despite its name] -> the farewell threshold is expressed in turns and documented; years shown to the player use the post's own months-per-turn.
- [Browsers block audio before a gesture] -> the context is created lazily, resumed on every click, and the ambient bed restarts on the first gesture for a returning player.
- [The canvas can draw before fonts load and keep the fallback face] -> fonts are requested first; drawing proceeds regardless if the browser cannot report.
- [An imported file could be a valid shape with nonsense values] -> accepted: it only affects the importer's own career; unknown content ids are pruned as in a normal load.
- [Importing the same career at a later point could replay one ceremony] -> accepted as harmless, since ceremonies are presentation only.
- [A page left open across UTC midnight] -> the challenge is computed when the new-game screen mounts; a stale page starts the run it advertised.
- [Daily/weekly seeds could land on an unfavourable department] -> intended: it is the same for everyone.

## Migration Plan

No data migration: save version stays 9, `challenge` is optional. Deploy is the normal static build. Rollback is reverting the commit; saves written with `challenge` load fine in the previous build because the field is simply ignored.
