# Spec Delta

## Purpose

Gives the game's largest moments the whole screen, so a nine-year achievement or a ministry does not look like any other line in a report.

## ADDED Requirements

### Requirement: Four kinds of moment earn a ceremony
The system SHALL present a full-screen ceremony for: a promotion to a higher tier, a long initiative being completed, the departure of a long-serving member of the player's unit, and the career ending as Minister. No other event SHALL produce one.

#### Scenario: Promotion
- **WHEN** the player accepts a post at a higher tier
- **THEN** a ceremony shows the new post title and organisation and a line suited to that tier

#### Scenario: Sideways or downward move
- **WHEN** the player's post changes to one at the same or a lower tier
- **THEN** no ceremony is shown

### Requirement: Only long initiatives qualify
An initiative completion SHALL receive a ceremony only if the initiative can take at least seven cycles at the fastest. Shorter ones SHALL appear only in the month report.

#### Scenario: Short initiative
- **WHEN** a short initiative completes
- **THEN** it is listed in the month report with no ceremony

### Requirement: Only long service qualifies for a farewell
A departure SHALL receive a ceremony only if the person had served at least 36 cycles in the player's unit. When several qualifying people leave in one cycle, the system SHALL show one ceremony, for the longest-serving. The ceremony SHALL say whether they left or were promoted away.

#### Scenario: Newcomer leaves
- **WHEN** someone with only a few cycles of service leaves
- **THEN** no ceremony is shown

#### Scenario: Two long-serving people leave
- **WHEN** two qualifying people leave in the same cycle
- **THEN** one ceremony is shown, for the one with longer service

### Requirement: The ministry ceremony precedes the ending screen's content
When a career ends as Minister, the ceremony SHALL cover the ending screen until the player continues. Other endings SHALL NOT have a ceremony.

#### Scenario: Burnout
- **WHEN** a career ends in burnout
- **THEN** the ending screen is shown directly

### Requirement: Ceremonies are not replayed
A ceremony SHALL appear only when the moment happens during play. Reloading, resuming a saved career, or importing a file SHALL NOT replay one.

#### Scenario: Reload after a promotion
- **WHEN** the player is promoted, dismisses the ceremony, and reloads
- **THEN** no ceremony appears

### Requirement: Ceremonies are dismissed by the player and respect motion preferences
A ceremony SHALL remain until the player presses Continue, and queued ceremonies SHALL appear one at a time in order. When the player prefers reduced motion, all ceremony animation SHALL be disabled and the text SHALL appear immediately.

#### Scenario: Reduced motion
- **WHEN** the system requests reduced motion
- **THEN** the ceremony text and button are visible at once with no animation

### Requirement: Ceremonies do not alter the game
A ceremony SHALL be presentation only. Whether it was seen SHALL NOT be stored in a save or affect any game rule.

#### Scenario: Same state with or without
- **WHEN** a ceremony is dismissed
- **THEN** the game state is identical to what it was before it appeared
