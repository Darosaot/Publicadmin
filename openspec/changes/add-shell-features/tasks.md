# Tasks

Items already built before this change was written are ticked; each says how it was verified.

## 1. Locale loading

- [x] 1.1 Split Spanish into its own chunk, await it before first paint and before switching; verify `npm run build` emits a separate chunk and the main chunk gzip falls (345 kB to about 220 kB)
- [x] 1.2 Cover the seam in `tests/engine/i18n.test.ts` (English fallback before load, Spanish after) and the e2e test that an English reader never requests the chunk
- [x] 1.3 Document in `docs/game-design.md` section 8p and the README

## 2. Save transfer

- [x] 2.1 Add `IMPORT_SAVE`, raw save read, file naming and the stricter shape check; verify `tests/engine/challenge.test.ts` (export section), `tests/engine/save.test.ts` and `tests/ui/state.test.ts` pass
- [x] 2.2 Add the utility strip with Export and Import, confirm-before-replace, and a notice; verify the e2e round trip and the rejected-file test pass
- [x] 2.3 Document in section 8p

## 3. Shared challenges

- [x] 3.1 Add the date-to-seed-and-department derivation and the optional `challenge` label; verify `tests/engine/challenge.test.ts` (same UTC day, ISO week and year boundary, name does not change the run, free play unlabelled)
- [x] 3.2 Add the Free/Daily/Weekly selector with the department locked; verify the e2e test shows exactly one choosable department and the exported file carries `daily:YYYY-MM-DD`
- [x] 3.3 Document in section 8p

## 4. Career summary card

- [x] 4.1 Add the summary builder, text renderer, block sparkline and share link; verify `tests/ui/summary.test.ts` passes
- [x] 4.2 Add the canvas card with copy and download; verify the e2e test copies text containing the name and `?seed=` and downloads `public-service-story.png`
- [x] 4.3 Look at the rendered card in English and Spanish at a long name and a long Spanish title, and confirm no text runs off the image

## 5. Sound

- [x] 5.1 Add the synthesised cues, ambient bed, persistence and hidden-tab pause; verify `tests/ui/sound.test.ts` (every cue well formed, safe without audio support)
- [x] 5.2 Wire taps, events, reports and endings through one listener and one state-diff hook; verify the e2e toggle test (off by default, remembered across reload)
- [ ] 5.3 Listen in a real browser: tap volume, cue levels against the ambient bed, no clicks on note starts or ends

## 6. Moment ceremonies

- [x] 6.1 Add pure ceremony detection and thresholds; verify `tests/ui/ceremony.test.ts` (promotion up only, long initiatives only, long-serving farewell and the longest-serving of several, ministry only, no replay, no cross-career false positives)
- [x] 6.2 Add the full-screen component with queueing and reduced-motion styles; verify the e2e test shows the ceremony after accepting a post and not after reload
- [ ] 6.3 Check the four ceremonies visually and with reduced motion on, including the ministry over the ending screen

## 7. Integration

- [x] 7.1 Add Spanish for every new interface string; verify `tests/engine/i18n.test.ts` key parity passes
- [x] 7.2 Run `npm run typecheck` and `npm test` (562 tests); verify both pass
- [x] 7.3 Run the whole Playwright suite (`npm run test:e2e`) against the production build and verify no existing e2e test regressed
- [x] 7.4 Run `openspec validate add-shell-features --strict` and verify it passes
- [x] 7.5 Run `npm run balance` and confirm the numbers in section 11 are unchanged (no rule was touched, so they should be)

## Workflow follow-up

- Open a draft pull request for review.
- Archive the change after review and verify the specs appear under `openspec/specs/`.
