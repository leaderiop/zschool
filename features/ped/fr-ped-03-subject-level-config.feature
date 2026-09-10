@REQ-ZS-055 @BEH-ZS-053 @mvp
Feature: Configuring a subject by level and track

  Scenario: The same subject carries independent configurations per track
    Given a school instantiating the national template for school year 2026-2027
    When the director changes Mathematics' coefficient for (2nd Bac, Mathematical Sciences A) to 8
    Then the configuration for (2nd Bac, Mathematical Sciences A) reflects the new coefficient
    And the configuration for (2nd Bac, Economics) stays independent and unchanged

  Scenario: A duplicate configuration is refused
    Given a school instantiating the national template for school year 2026-2027
    When the director attempts to create a second configuration for Mathematics at (2nd Bac, Mathematical Sciences A)
    Then the creation is refused with an explicit error
    And the existing configuration is preserved

  Scenario: A newly added subject can be configured per level and track
    Given a school instantiating the national template for school year 2026-2027
    When the director adds the subject "Robotique" to the catalog
    And configures it for (2nd Bac, Science and Technology) with coefficient 3 and teaching language French
    Then the new subject's configuration is specific to that level-track pair

  Scenario: Editing a configuration is scoped to the current year's snapshot only
    Given two academic years for the same school, each instantiated from the national template
    When the director changes Mathematics' coefficient for 1AP in the 2026-2027 year
    Then the 2027-2028 year's own Mathematics configuration for 1AP is unaffected
