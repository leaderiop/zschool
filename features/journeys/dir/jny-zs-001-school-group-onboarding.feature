@REQ-ZS-275 @JNY-ZS-001 @mvp
Feature: School group onboarding

  Scenario: Instantiating the structure from the national model (MVP)
    Given a school whose legal record is complete
    When the general director selects the national structure model for the qualifying cycle and applies it
    Then the cycles, levels, tracks, and subjects of the model are instantiated for the chosen year
    And coefficients and languages of instruction are carried by level and track, never globally
    And the structure stays editable as long as no enrollment is linked to it

  Scenario: Excel import with duplicate detection (MVP)
    Given an Excel file of 1,800 students, some rows already existing on the platform
    When the secretary starts the bulk import
    Then an error report lists the rejected rows with their reason
    And matches by Massar code are suggested as a strong match without being imposed
    And probable duplicates (first name, last name, date of birth, a guardian's phone number) are flagged without automatic linking
    And no profile merge happens without an audited ZSchool support operation
    And guardians carrying an already-known mobile number are offered for linking, never recreated

  Scenario: Bringing a second group site into production (MVP)
    Given an organization grouping one active school
    When the general director creates the second school and links it to the organization
    Then the second school is an isolated tenant with its own data
    And the group dashboard shows both schools in read-only without merging their data
    And each school keeps its own count of active students (organization-level billing: V1)

  Scenario: Mid-year resumption with partially settled payment schedules (MVP)
    Given a group site joining ZSchool on 01/02/2027 with five monthly payments already collected per student
    When the secretariat imports the payment schedules with the amounts paid, the cheques in hand, and the first-semester grades
    Then each enrollment is activated via import activation with the logged reason "data resumption"
    And each student's payment schedule shows the five paid installments and the five still due with no undue reminder
    And the imported cheques appear in the wallet with their due date
    And acceptance of the internal rules is requested from each guardian when they claim their account
