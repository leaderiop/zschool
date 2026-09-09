@REQ-ZS-017 @BEH-ZS-013 @v1
Feature: School closure

  Scenario: Administrative closure mid-year
    Given a school closed by management decision or whose authorization is withdrawn
    When the closure procedure is launched with reason and date
    Then new enrollments are blocked
    And every active student receives a leaving certificate and a leaving file in bulk
    And transfers to other schools proceed on the same global identity
    And a full export is delivered, the public directory is updated
    And parents and students retain access to their published documents
