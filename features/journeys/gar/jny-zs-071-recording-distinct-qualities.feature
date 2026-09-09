@REQ-ZS-356 @JNY-ZS-071 @mvp
Feature: Recording a parent-student relationship's qualities

  Scenario: Custody to the mother by legal default with no supporting document
    Given a "mother-student" relationship being created with a declared separation
    When the secretariat records the mother's "holder of custody" quality with no attachment
    Then the quality is active immediately under the article 171 legal default
    And the mother carries the rights attached to this quality

  Scenario: Custody attributed to the father, outside the legal order, with no supporting document
    Given a "father-student" relationship being created
    When the secretariat records the father's "holder of custody" quality with no ruling attached
    Then the quality is recorded "awaiting a supporting document"
    And the relationship does not carry the extended rights attached to this quality until a document is attached
    And a reminder appears on the school's incomplete-files table

  Scenario: A configuration matching the legal defaults
    Given a student enrolled with both father and mother registered
    And no court ruling submitted to the school
    When the relationship is activated
    Then both parents carry the legal-guardian quality and receive notifications by default
    And the father carries the legal-tutor designation with no document required
    And every quality-creation operation is logged with author and timestamp
