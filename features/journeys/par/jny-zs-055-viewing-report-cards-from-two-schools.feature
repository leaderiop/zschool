@REQ-ZS-340 @JNY-ZS-055 @mvp @v1
Feature: Viewing report cards from two schools

  Scenario: Publication then multi-school viewing (MVP)
    Given Youssef's first-semester report card published by School A
    And Adam's period summary published by School B
    When Ahmed opens the publication notification then views both documents in turn
    Then the same gestures (a child tab, opening the period's document, PDF download) apply to both schools
    And each document shown is the current published version, marked "superseded" where applicable
    And no unpublished data (grades still being entered, deliberations) appears
