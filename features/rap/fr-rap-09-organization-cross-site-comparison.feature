@REQ-ZS-219 @BEH-ZS-249 @mvp
Feature: Cross-site comparison at the organization level

  Scenario: Consolidating three schools without merging data (consolidated read view)
    Given an organization grouping schools A (900 students), B (600 students), and C (300 students)
    And a group administrator authorized only at the organization level
    And a today's attendance rate of 96.2% at A, 94.8% at B, and 97.1% at C
    When the administrator opens today's consolidated view
    Then each indicator is shown per school with the group total
    And the consolidated attendance rate is the headcount-weighted average, i.e. 95.9% (rounded to one decimal)
    And the detail of absent students at a given school is not accessible from the consolidated view
    And each row offers a link to the school's dashboard for accounts authorized within that tenant

  Scenario: A financial indicator without group permission
    Given a group administrator with no financial permission at the group level
    When they open the consolidated view
    Then the unpaid-balance column is neither shown nor derivable from any other indicator
