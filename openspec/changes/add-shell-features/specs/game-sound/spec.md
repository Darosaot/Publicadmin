# Spec Delta

## Purpose

Adds audio feedback and atmosphere to the game while respecting that sound is opt-in, device-level, and must never get in the way.

## ADDED Requirements

### Requirement: Sound is off until the player turns it on
The system SHALL play no sound by default. A sound toggle SHALL be available on every screen and SHALL state the current setting.

#### Scenario: First visit
- **WHEN** a player opens the game for the first time
- **THEN** the toggle reads "Sound: off" and nothing is audible

#### Scenario: Turning it on
- **WHEN** the player activates the toggle
- **THEN** it reads "Sound: on" and a quiet ambient bed begins

### Requirement: The choice is remembered per device
The sound setting SHALL persist across reloads on the same device and SHALL NOT be part of a saved career or an exported file.

#### Scenario: Reload keeps it on
- **WHEN** the player turns sound on and reloads
- **THEN** the toggle still reads "Sound: on"

### Requirement: Sound is generated, not downloaded
The system SHALL produce all audio itself in the browser and SHALL NOT fetch audio files.

#### Scenario: No audio requests
- **WHEN** sound is turned on
- **THEN** no audio file is requested over the network

### Requirement: Moments have distinct cues
When sound is on, the system SHALL play a short cue for each of: pressing an enabled button, a new event appearing, the month report appearing, a promotion, a long initiative completing, a long-serving colleague leaving, reaching the ministry, and a career ending other than as Minister. A disabled button SHALL be silent.

#### Scenario: Report
- **WHEN** a month is resolved and the report appears
- **THEN** the report cue plays once

#### Scenario: Disabled control
- **WHEN** the player clicks a disabled button
- **THEN** no tap sound plays

### Requirement: Sound never persists when it should not
Turning sound off SHALL fade out and stop the ambient bed. Audio SHALL pause while the page is hidden and resume when it is visible again.

#### Scenario: Hidden tab
- **WHEN** the player switches to another tab
- **THEN** the game goes silent until they return

### Requirement: Unsupported environments are silent and safe
If the browser cannot produce audio, the toggle SHALL be hidden and no error SHALL occur anywhere in the game.

#### Scenario: No audio support
- **WHEN** the browser has no audio capability
- **THEN** the game runs normally and shows no sound toggle
