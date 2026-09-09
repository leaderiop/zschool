@REQ-ZS-055 @BEH-ZS-053 @mvp
Feature: Configuring a subject by level and track

  Scenario: The same subject carries distinct configurations
    Given a national section and a bilingual section coexisting at the school
    And the subject "Mathematics" already in the school's catalog
    When the director configures math for (2nd Bac, Mathematical Sciences A)
    Then the entered coefficient and teaching language are specific to this level-track pair
    And the configuration for (2nd Bac, Economics) stays independent and unchanged

  Scenario: A duplicate configuration is refused
    Given an existing configuration for (1AC, no track)
    When the director attempts to create a second configuration for the same subject-level-track combination
    Then the creation is refused with an explicit error message
    And the existing configuration is preserved
