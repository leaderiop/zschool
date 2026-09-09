@REQ-ZS-061 @BEH-ZS-060 @BEH-ZS-042 @mvp
Feature: Class change from the structure browser

  Scenario: Moving into a full class
    Given the target class 2AC-1 at its maximum capacity
    When the front office moves a student from 2AC-3 to 2AC-1 from the class list
    Then the class-change operation is triggered only after the director's documented approval
    And the headcounts of both classes are updated and the history entry is created
