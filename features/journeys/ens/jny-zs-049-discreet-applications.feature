@REQ-ZS-327 @JNY-ZS-049 @v2
Feature: Discreet applications on the teacher network

  Scenario: Searching for a recruiting school with no notification to the employer (V2)
    Given Khadija "open to opportunities" with active affiliations at Schools A and B
    When a recruiting school views her shared profile
    Then the "open to opportunities" status is not visible to Schools A and B
    And no notification of the views is sent to Schools A and B
    When Khadija applies to the recruiting school
    Then only the application is transmitted to the recruiter
    And Schools A and B are not informed of it
