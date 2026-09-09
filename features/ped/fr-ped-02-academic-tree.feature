@REQ-ZS-054 @BEH-ZS-052 @mvp
Feature: Academic tree

  Scenario: Creating a class with a capacity
    Given a 2AC level instantiated in the national section
    When the director creates the class "2AC-3" with a capacity of 32
    Then the class appears under level 2AC with an enrollment of 0 out of 32
    And level 2AC's capacity is recalculated as the sum of its classes' capacities

  Scenario: Deletion refused for an occupied class
    Given a class attached to 28 active enrollments
    When the director attempts to delete it
    Then the deletion is refused and the system offers to first move the students or to deactivate the class
