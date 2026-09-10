@REQ-ZS-054 @BEH-ZS-052 @mvp
Feature: Academic tree

  Scenario: Creating a class with a capacity
    Given a 2AC level instantiated in the national section
    When the director creates the class "2AC-3" with a capacity of 32
    Then the class appears under level 2AC with an enrollment of 0 out of 32
    And level 2AC's capacity is recalculated as the sum of its classes' capacities

  @skip
  Scenario: Deletion refused for an occupied class
    # Skipped: needs Enrollment (ticket #9, spec #13) to attach active
    # enrollments to a class. deleteClass's active-enrollments guard
    # (packages/domain/src/AcademicTree.ts) is written to this contract
    # already — only its check is a stand-in until Enrollment exists.
    Given a class attached to 28 active enrollments
    When the director attempts to delete it
    Then the deletion is refused and the system offers to first move the students or to deactivate the class

  Scenario: An empty class can be deleted or deactivated
    Given a 2AC level instantiated in the national section
    And an empty class "2AC-4" with a capacity of 30
    When the director deletes the class
    Then the class no longer appears under level 2AC
    And level 2AC's capacity no longer counts it

  Scenario: Creating groups within a class
    Given a class "1BAC-2" under level 1BAC
    When the director creates a "language" group named "English track" within it
    And the director creates a "lab" group named "Physics lab" within it
    Then both groups appear under the class

  Scenario: Renaming a level, track, or class never breaks existing links
    Given a 2AC level instantiated in the national section
    And a class "2AC-1" already created under it
    When the director renames level "2AC" to "Collège — 2ème année"
    Then the class still resolves to the renamed level by id
    And the rename is recorded in the structure audit log
