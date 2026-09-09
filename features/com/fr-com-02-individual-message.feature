@REQ-ZS-164 @BEH-ZS-182 @mvp
Feature: Individual message (MVP)

  Scenario: The head supervisor writes to the father from the student's file
    Given Rachid, head supervisor, on the file of a 2AC student within his scope
    When he sends a message to the legal guardian from the file
    Then the message is linked to the enrollment, timestamped and logged
    And it joins the existing thread with this guardian, if one exists
    And the number used is the one on file, with no free-text entry

  Scenario: Teacher outside their scope
    Given a teacher with no course in a student's class
    When she attempts to write to that student's guardian
    Then the send is refused (INV-ZS-091) and the attempt is logged
