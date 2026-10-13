# Spec Delta

## Purpose

Lets a player move a career between browsers and devices as a file, and protects the game from files that are not a valid career.

## ADDED Requirements

### Requirement: A career can be exported to a file
The system SHALL let the player download their current career as a JSON file from any screen, including the title screen when a saved career exists. The file SHALL contain the same data the game stores in the browser.

#### Scenario: Export during play
- **WHEN** the player chooses "Export save" while playing
- **THEN** a JSON file is downloaded containing the career as it stands now, including a half-played month

#### Scenario: File name identifies the career
- **WHEN** a career is exported
- **THEN** the file name contains a lowercase, accent-free form of the player's name and the current cycle number

#### Scenario: Nothing to export
- **WHEN** there is no career in progress and no saved career
- **THEN** the export control is disabled

### Requirement: A career can be imported from a file
The system SHALL let the player choose a previously exported file and resume the career in it, applying the same version migrations and removal of unknown content as a normal load.

#### Scenario: Round trip
- **WHEN** a player exports a career, clears their browser data and imports the file
- **THEN** the career resumes at the desk with the same name, post and progress, and a notice confirms the import

#### Scenario: Older save version
- **WHEN** the imported file was written by an earlier supported save version
- **THEN** it is migrated forward and loads

### Requirement: Importing replaces a career in progress only after confirmation
If a career is in progress and not yet ended, the system SHALL ask for confirmation before an import replaces it.

#### Scenario: Declined
- **WHEN** the player starts an import during a live career and declines the confirmation
- **THEN** the current career is unchanged

### Requirement: Invalid files are refused without harm
The system SHALL reject any file that is not a readable career, including text that is not JSON, JSON of the wrong shape, and a save from an incompatible version. A rejected import SHALL leave the current state unchanged and SHALL tell the player the file could not be read.

#### Scenario: Not a save
- **WHEN** the player imports a file containing `{"hello": "world"}`
- **THEN** a notice says the file could not be read and no career is replaced or started

#### Scenario: Missing collections
- **WHEN** a file is valid JSON but lacks any collection the game iterates on every screen (such as staff, offers, log or scheduled events)
- **THEN** it is rejected rather than loaded
