@BEH-ZS-151 @REQ-ZS-133 @mvp
Feature: Fee schedules and fee lines
# Ticket #55 (Finance capability #54) scope only: typed fee lines, per-(year,
# level, track) uniqueness, and the mandatory-line justification requirement.
# VAT/tax classification (BEH-ZS-158) and the Article 49 fee-disclosure export
# are V1 (spec/behaviors/07-finance-billing-collections.md) and out of scope
# here — REQ-ZS-133 is only partially covered by this feature until that V1
# work lands.

  Scenario: A director defines a fee schedule with typed fee lines for a level
    Given a school with a level and no fee schedule yet
    When the director creates a fee schedule for that level and adds tuition and registration lines
    Then the fee schedule holds both fee lines with their amounts

  Scenario: Marking a uniform line mandatory without a justification is refused
    Given a school with a fee schedule for a level
    When the director tries to add a mandatory uniform line with no justification
    Then the fee line is refused for missing the legal justification

  Scenario: Marking a uniform line mandatory with a traced justification succeeds
    Given a school with a fee schedule for a level
    When the director adds a mandatory uniform line with a traced justification
    Then the fee line is created and carries the justification

  Scenario: A second fee schedule for the same year, level, and track is refused
    Given a school with a fee schedule for a level
    When the director tries to create another fee schedule for the same year and level
    Then the second fee schedule is refused as a duplicate
