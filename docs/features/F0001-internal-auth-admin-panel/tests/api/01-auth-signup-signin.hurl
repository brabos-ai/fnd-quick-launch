# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 01-auth-signup-signin.hurl
# Purpose: Test signup, signin, and account lockout
# ===========================================

# -------------------------------------------
# TEST 1: Sign Up New User
# -------------------------------------------
# Sign up with valid credentials
POST {{API_URL}}/auth/signup
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}",
  "name": "{{TEST_NAME}}",
  "workspaceName": "{{TEST_WORKSPACE}}"
}

HTTP 201
[Captures]
userId: jsonpath "$.user.id"
accountId: jsonpath "$.user.accountId"
accessToken: jsonpath "$.accessToken"
refreshToken: jsonpath "$.refreshToken"

[Asserts]
jsonpath "$.user.id" isString
jsonpath "$.user.email" == "{{TEST_EMAIL}}"
jsonpath "$.user.fullName" == "{{TEST_NAME}}"
jsonpath "$.user.accountId" isString
jsonpath "$.accessToken" isString
jsonpath "$.refreshToken" isString

# -------------------------------------------
# TEST 2: Sign Up - Duplicate Email (should fail)
# -------------------------------------------
# Attempt sign up with duplicate email
POST {{API_URL}}/auth/signup
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}",
  "name": "Another User",
  "workspaceName": "Another Workspace"
}

HTTP 409
[Asserts]
jsonpath "$.message" contains "already exists"

# -------------------------------------------
# TEST 3: Sign Up - Invalid Email Format (should fail)
# -------------------------------------------
# Sign up with invalid email
POST {{API_URL}}/auth/signup
Content-Type: application/json
{
  "email": "invalid-email",
  "password": "{{TEST_PASSWORD}}",
  "name": "{{TEST_NAME}}",
  "workspaceName": "{{TEST_WORKSPACE}}"
}

HTTP 400
[Asserts]
jsonpath "$.message[0]" contains "email"

# -------------------------------------------
# TEST 4: Sign Up - Weak Password (should fail)
# -------------------------------------------
# Sign up with weak password
POST {{API_URL}}/auth/signup
Content-Type: application/json
{
  "email": "weak@example.com",
  "password": "weak",
  "name": "{{TEST_NAME}}",
  "workspaceName": "{{TEST_WORKSPACE}}"
}

HTTP 400
[Asserts]
jsonpath "$.message[0]" contains "password"

# -------------------------------------------
# TEST 5: Sign In - Invalid Password (should fail)
# -------------------------------------------
# Sign in with wrong password (single attempt to avoid lockout)
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}",
  "password": "WrongPassword123!"
}

HTTP 401
[Asserts]
jsonpath "$.message" contains "Invalid"

# -------------------------------------------
# TEST 6: Sign In - Valid Credentials
# -------------------------------------------
# Sign in with valid credentials (should work after failed attempt)
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

HTTP 200
[Captures]
accessToken: jsonpath "$.accessToken"
refreshToken: jsonpath "$.refreshToken"
sessionId: jsonpath "$.session.id"

[Asserts]
jsonpath "$.accessToken" isString
jsonpath "$.refreshToken" isString
jsonpath "$.user.id" == "{{userId}}"
jsonpath "$.user.email" == "{{TEST_EMAIL}}"
jsonpath "$.session.id" isString
jsonpath "$.session.expiresAt" isString
duration < 2000

# NOTE: Lockout tests (5 failed attempts) are disabled to avoid blocking
# subsequent tests. To test lockout, run a separate test file with:
# - 5 failed login attempts
# - Verify HTTP 429 with lockedUntil timestamp
# - Wait for lockout to expire or manually reset in database

# -------------------------------------------
# TEST 7: Sign In - Non-Existent User (should fail)
# -------------------------------------------
# Sign in with non-existent email
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "nonexistent@example.com",
  "password": "{{TEST_PASSWORD}}"
}

HTTP 401
[Asserts]
jsonpath "$.message" contains "Invalid"

# -------------------------------------------
# TEST 8: Get Current User Profile
# -------------------------------------------
# Get current user profile (authenticated)
GET {{API_URL}}/auth/me
Authorization: Bearer {{accessToken}}

HTTP 200
[Asserts]
jsonpath "$.user.id" == "{{userId}}"
jsonpath "$.user.email" == "{{TEST_EMAIL}}"
jsonpath "$.user.fullName" == "{{TEST_NAME}}"
jsonpath "$.user.accountId" == "{{accountId}}"

# -------------------------------------------
# TEST 9: Get Current User - Unauthorized (should fail)
# -------------------------------------------
# Get current user without token
GET {{API_URL}}/auth/me

HTTP 401

# Get current user with invalid token
GET {{API_URL}}/auth/me
Authorization: Bearer invalid-token-12345

HTTP 401

# -------------------------------------------
# NOTES
# -------------------------------------------
# Prerequisites:
# 1. Database must be clean (no existing test@example.com user)
# 2. Email worker should be running to process verification emails
# 3. Lockout configuration should be set appropriately for testing
#
# Note: Tests 8 (Sign In After Lockout) was removed due to $sleep limitation
# To test lockout expiration, configure short lockout period or run separately
#
# Manual cleanup (if needed):
# DELETE FROM users WHERE email = 'test@example.com';
# DELETE FROM login_attempts WHERE email = 'test@example.com';
