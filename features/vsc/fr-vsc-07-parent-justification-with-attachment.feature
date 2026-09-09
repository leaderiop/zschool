@REQ-ZS-080 @BEH-ZS-087 @mvp
Feature: A parent justifying an absence

  Scenario: Submitting a justification with an attachment
    Given a parent notified of their child's absence on the morning of September 21
    And active parent access for this student
    When the parent submits a justification with reason "medical certificate" and a photo of the document
    Then the justification is created with status "submitted" and tied to the absence record
    And the attachment is stored within the school's scope
    And the justification appears in student life's processing queue
    And the parent sees the status "submitted" on the justification
