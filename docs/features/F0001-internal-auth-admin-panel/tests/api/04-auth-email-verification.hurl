# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 04-auth-email-verification.hurl
# Purpose: Test email verification flow
# ===========================================

# -------------------------------------------
# TEST 1: Sign Up New User (triggers verification email)
# -------------------------------------------
# Sign up creates unverified user
POST {{API_URL}}/auth/signup
Content-Type: application/json
{
  "email": "verify@example.com",
  "password": "Password123!",
  "name": "Verify User",
  "workspaceName": "Verify Workspace"
}

HTTP 201
[Captures]
verifyUserId: jsonpath "$.user.id"

[Asserts]
jsonpath "$.user.id" isString
jsonpath "$.user.email" == "verify@example.com"
jsonpath "$.user.emailVerified" == false

# -------------------------------------------
# MANUAL STEP: Get Verification Token from Database
# -------------------------------------------
# Run this SQL to get the token:
# SELECT token FROM auth_tokens
# WHERE type = 'email_verification'
# AND user_id = (SELECT id FROM users WHERE email = 'verify@example.com')
# AND used_at IS NULL
# ORDER BY created_at DESC LIMIT 1;
#
# Then manually set VERIFY_TOKEN variable

# -------------------------------------------
# TEST 2: Verify Email with Valid Token
# -------------------------------------------
# Note: Replace TOKEN_FROM_DATABASE with actual token
# POST {{API_URL}}/auth/verify-email
# Content-Type: application/json
# {
#   "token": "TOKEN_FROM_DATABASE"
# }
# HTTP 200

# -------------------------------------------
# TEST 3: Verify Email with Invalid Token
# -------------------------------------------
POST {{API_URL}}/auth/verify-email
Content-Type: application/json
{
  "token": "invalid-token-12345"
}

HTTP 400

# -------------------------------------------
# TEST 4: Resend Verification Email
# -------------------------------------------
POST {{API_URL}}/auth/resend-verification
Content-Type: application/json
{
  "email": "verify@example.com"
}

HTTP 200
[Asserts]
jsonpath "$.message" contains "sent"

# -------------------------------------------
# TEST 5: Resend Verification - Already Verified User
# -------------------------------------------
# POST {{API_URL}}/auth/resend-verification
# Content-Type: application/json
# {
#   "email": "{{TEST_EMAIL}}"
# }
# HTTP 400
# [Asserts]
# jsonpath "$.message" contains "already verified"

# -------------------------------------------
# TEST 6: Resend Verification - Non-existent Email
# -------------------------------------------
POST {{API_URL}}/auth/resend-verification
Content-Type: application/json
{
  "email": "nonexistent@example.com"
}

# Note: API returns 200 with generic message to prevent email enumeration (security best practice)
HTTP 200
[Asserts]
jsonpath "$.message" exists

# -------------------------------------------
# NOTES
# -------------------------------------------
# Email Verification Flow:
# 1. User signs up → verification email sent
# 2. Token stored in auth_tokens table
# 3. User clicks link with token
# 4. Backend marks email as verified
#
# Limitations:
# - Full test requires email worker or manual token extraction
# - Tests 2, 5 are commented out (need manual token/verified user)
# - Consider adding test API endpoint to get tokens in test environment
