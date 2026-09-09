@REQ-ZS-336 @JNY-ZS-051 @mvp
Feature: Activating a parent account by phone

  Scenario: Standard activation with OTP (MVP)
    Given a valid SMS invitation sent to Ahmed's number by School A
    And no existing parent account for this number
    When Ahmed opens the link, enters the OTP received by SMS, and sets his secret
    Then his account is active on the platform
    And his primary contact identifier is his mobile number, with no e-mail required
    And the event is logged with author, context, and timestamp

  Scenario: Expired OTP (MVP)
    Given an OTP displayed beyond its validity period
    When Ahmed enters it
    Then verification is refused with a clear bilingual message
    And Ahmed can request a new code up to the allowed resend limit
