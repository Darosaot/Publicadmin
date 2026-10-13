# Spec Delta

## Purpose

Gives every player the same starting career on the same day or week, without a server, so results can be compared.

## ADDED Requirements

### Requirement: Daily and weekly challenges are offered at new game
The new-game screen SHALL offer Free play, Daily challenge and Weekly challenge. Free play SHALL behave as before.

#### Scenario: Default is free play
- **WHEN** the player opens the new-game screen
- **THEN** Free play is selected and any department can be chosen

### Requirement: The same date yields the same career
For a given challenge, the system SHALL derive the random seed and the department solely from the UTC calendar day (daily) or ISO 8601 week (weekly), so that all players receive an identical run regardless of time zone or device.

#### Scenario: Same UTC day
- **WHEN** two players start the daily challenge at 00:00:01 and 23:59:59 UTC on the same date
- **THEN** both receive the same seed and the same department

#### Scenario: Different days differ
- **WHEN** the daily challenge is started on two different dates
- **THEN** the seeds differ

#### Scenario: Week boundaries follow ISO 8601
- **WHEN** the weekly challenge is started on a Monday and on the following Sunday
- **THEN** both receive the same run, and the next Monday receives a different one

#### Scenario: Year boundary
- **WHEN** the weekly challenge is started on 1 January 2026 (a Thursday)
- **THEN** it is week 1 of 2026

### Requirement: A challenge fixes the department
When a challenge is selected, the system SHALL preselect the challenge's department and SHALL prevent choosing any other, so scores are comparable.

#### Scenario: Other departments locked
- **WHEN** the player selects Daily challenge
- **THEN** exactly one department can be chosen and the start button is enabled

### Requirement: The player's name does not change the run
Two players using the same challenge but different names SHALL play identical random streams and receive identical starting boards.

#### Scenario: Different names
- **WHEN** two careers are created from the same challenge with different names
- **THEN** their random state and starting task boards are equal

### Requirement: A challenge career records which challenge it is
A career started from a challenge SHALL record the challenge identifier for display only. A free-play career SHALL carry no such record. The identifier SHALL NOT affect any simulation rule.

#### Scenario: Saved with the career
- **WHEN** a daily-challenge career is exported
- **THEN** the file contains a challenge identifier in the form `daily:YYYY-MM-DD`
