@REQ-ZS-277 @JNY-ZS-003 @mvp @v1
Feature: Consolidated cross-site steering

  Scenario: Consolidated morning review (MVP)
    Given three active schools linked to the group's organization
    And morning roll calls already validated at two sites
    When the general director opens the group's consolidated dashboard
    Then each site's headcount, attendance rate, and outstanding arrears are shown on a single view
    And every indicator carries the timestamp of its last update
    And no data is visible outside the director's rights scope

  Scenario: Drilling down from a consolidated indicator to the detail (MVP)
    Given an 86% attendance rate shown for Site B
    When the general director drills from group to site, then to level, then to class
    Then each drill-down level shows the same indicator recalculated for the selected scope
    And the final named list is accessible within the role's scope
    And the consolidation has merged no data across tenants

  Scenario: Weekly cross-site comparison (V1)
    Given the three sites' indicators for the past week
    When the general director opens the cross-site comparison
    Then the indicators are shown side by side with identical definitions across sites
    And gaps above the configured threshold are flagged
    And an Excel and PDF export of the comparison is generated
