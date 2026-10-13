# Spec Delta

## Purpose

Turns a finished career into something a player can post or send, in image and text form, without any server.

## ADDED Requirements

### Requirement: Every ended career offers a shareable card
The ending screen SHALL offer a card for a career that has reached any ending, including unsuccessful ones, and SHALL NOT offer one for a career still in progress.

#### Scenario: Burnout is shareable
- **WHEN** a career ends in burnout
- **THEN** the ending screen shows the card and its share controls

### Requirement: The card states the career's facts
The card SHALL show the player's name, the ending, department, track, years of service, final post, and the reputation recorded over the career. If the player met Elena Vásquez it SHALL also say whether she finished ahead, behind, on the same rung, or left. If the career was a challenge it SHALL name the challenge; otherwise it SHALL show the seed.

#### Scenario: Challenge label replaces seed
- **WHEN** the career was the weekly challenge of 2026-W42
- **THEN** the card reads "Weekly challenge 2026-W42" and does not show a seed

#### Scenario: Elena not met
- **WHEN** the player never met Elena
- **THEN** the card makes no comparison with her

### Requirement: The reputation chart is on a fixed scale
The reputation chart SHALL use a fixed 0 to 100 axis so that a career that never changed looks flat.

#### Scenario: Flat career
- **WHEN** reputation is 50 in every cycle
- **THEN** every column of the chart has the same height

### Requirement: The card can be copied as text and downloaded as an image
The system SHALL let the player copy a plain-text version and download a PNG image of the card. Both SHALL be built from the same data and so state the same facts.

#### Scenario: Copy
- **WHEN** the player chooses "Copy as text"
- **THEN** the clipboard holds the text card and the screen says it was copied

#### Scenario: Clipboard unavailable
- **WHEN** the browser refuses clipboard access
- **THEN** the screen says copying is not available and nothing else changes

#### Scenario: Download
- **WHEN** the player chooses "Download image"
- **THEN** a PNG file named `public-service-story.png` is downloaded

### Requirement: The shared link reproduces the right run
A free-play card's link SHALL carry the career's seed so a friend can play the same career. A challenge card's link SHALL be the bare game address, since the date already determines the run.

#### Scenario: Free play link
- **WHEN** a free-play career with seed 7 is shared
- **THEN** the link ends with `?seed=7`

#### Scenario: Challenge link
- **WHEN** a daily-challenge career is shared
- **THEN** the link carries no seed

### Requirement: The card follows the chosen language
All text on the card SHALL be in the player's chosen language.

#### Scenario: Spanish
- **WHEN** the language is Spanish
- **THEN** the card text and copied text use Spanish labels
