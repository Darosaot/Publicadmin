# Spec Delta

## Purpose

Keeps the initial download small by shipping only the default language up front and fetching other languages on demand, without ever showing a half-translated or broken screen.

## ADDED Requirements

### Requirement: Only the default language is in the initial download
The system SHALL include English in the initial download and SHALL NOT download any other language's dictionary until that language is chosen or was previously chosen on this device.

#### Scenario: An English reader never fetches Spanish
- **WHEN** a player with no stored language preference opens the game
- **THEN** no Spanish dictionary is requested over the network

#### Scenario: Choosing Spanish fetches it once
- **WHEN** the player selects Spanish on the title screen
- **THEN** the Spanish dictionary is requested exactly once and the screen switches to Spanish

### Requirement: A returning reader sees their language on first paint
The system SHALL finish loading the stored language before the first screen is rendered, so a returning Spanish reader never sees English flash first.

#### Scenario: Reload in Spanish
- **WHEN** a player who chose Spanish reloads the page
- **THEN** the first rendered title screen is in Spanish

### Requirement: Switching language is a single step
When the player chooses a language that is not yet loaded, the system SHALL change the displayed language only once its dictionary has arrived.

#### Scenario: No half-English screen
- **WHEN** the player selects Spanish while the dictionary is still downloading
- **THEN** the screen stays in the previous language until Spanish is ready, then changes all at once

### Requirement: Untranslated text falls back to English
While a language's dictionary is not available, or for any key it lacks, the system SHALL display the English text and SHALL NOT display a raw key or raise an error.

#### Scenario: Lookup before the dictionary is loaded
- **WHEN** Spanish text is requested before the Spanish dictionary has loaded
- **THEN** the English text is returned
