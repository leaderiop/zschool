@REQ-ZS-062 @BEH-ZS-062 @v1
Feature: Conflict detection while building a timetable

  Scenario: Teacher conflict detected at placement
    Given a draft timetable for class 2AC-3 for year 2026-2027
    And teacher Khadija assigned to math for 2AC-3 and 2AC-1
    And a slot already placed: Tuesday 8am, 2AC-1, math, Khadija
    When the director places the Tuesday 8am slot for 2AC-3, math, Khadija
    Then the placement is flagged as a blocking conflict "teacher already booked in this slot"
    And the slot is not saved as-is
    And the system offers the free slots common to Khadija and to 2AC-3

  Scenario: Room conflict blocking publication
    Given a complete draft timetable
    And two classes placed in room S-12 on Monday 10am
    When the director runs the global check before publication
    Then the check report lists the room conflict as blocking
    And publication is refused while the conflict remains
