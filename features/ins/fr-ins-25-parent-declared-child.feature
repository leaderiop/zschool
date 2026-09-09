@REQ-ZS-047 @BEH-ZS-045 @mvp
Feature: A parent declaring a child (MVP)

  Scenario: Declaration then linking to the enrollment
    Given Ahmed, an account holder, who declares his son Adam (born 03/05/2021, no Massar code) from his account
    When School B enters Adam's enrollment with Ahmed's mobile number as guardian
    Then the system offers the profile Ahmed declared via weak matching
    And after the front office confirms, the enrollment is linked to this profile and Ahmed keeps his declared qualities, with no duplicate created
