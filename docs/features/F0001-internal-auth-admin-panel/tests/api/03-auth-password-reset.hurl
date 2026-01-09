# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 03-auth-password-reset.hurl
# Purpose: Test password reset flow
# ===========================================

# -------------------------------------------
# TEST 1: Request Password Reset
# -------------------------------------------
# Request password reset for existing user
POST {{API_URL}}/auth/forgot-password
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}"
}

HTTP 200
[Asserts]
jsonpath "$.message" contains "email"

# -------------------------------------------
# TEST 2: Request Password Reset - Non-existent Email
# -------------------------------------------
# Should still return 200 (security - don't reveal if email exists)
POST {{API_URL}}/auth/forgot-password
Content-Type: application/json
{
  "email": "nonexistent@example.com"
}

HTTP 200

# -------------------------------------------
# TEST 3: Request Password Reset - Invalid Email Format
# -------------------------------------------
POST {{API_URL}}/auth/forgot-password
Content-Type: application/json
{
  "email": "invalid-email"
}

HTTP 400
[Asserts]
jsonpath "$.message[0]" contains "email"

# -------------------------------------------
# MANUAL STEP: Get Reset Token from Database
# -------------------------------------------
# Run this SQL to get the token:
# SELECT token FROM auth_tokens
# WHERE type = 'password_reset'
# AND user_id = (SELECT id FROM users WHERE email = '{{TEST_EMAIL}}')
# AND used_at IS NULL
# ORDER BY created_at DESC LIMIT 1;
#
# Then manually set RESET_TOKEN variable and continue tests below

# -------------------------------------------
# TEST 4: Reset Password with Valid Token
# -------------------------------------------
# Note: Replace TOKEN_FROM_DATABASE with actual token
# POST {{API_URL}}/auth/reset-password
# Content-Type: application/json
# {
#   "token": "TOKEN_FROM_DATABASE",
#   "newPassword": "NewPassword123!"
# }
# HTTP 200

# -------------------------------------------
# TEST 5: Sign In with New Password
# -------------------------------------------
# POST {{API_URL}}/auth/signin
# Content-Type: application/json
# {
#   "email": "{{TEST_EMAIL}}",
#   "password": "NewPassword123!"
# }
# HTTP 200

# -------------------------------------------
# TEST 6: Reset Password with Invalid Token
# -------------------------------------------
POST {{API_URL}}/auth/reset-password
Content-Type: application/json
{
  "token": "invalid-token-12345",
  "newPassword": "NewPassword123!"
}

HTTP 400

# -------------------------------------------
# TEST 7: Reset Password with Weak Password
# -------------------------------------------
# POST {{API_URL}}/auth/reset-password
# Content-Type: application/json
# {
#   "token": "VALID_TOKEN",
#   "newPassword": "weak"
# }
# HTTP 400

# -------------------------------------------
# NOTES
# -------------------------------------------
# Password Reset Flow:
# 1. User requests reset → email sent with token
# 2. Token stored in auth_tokens table
# 3. User clicks link with token
# 4. User submits new password with token
# 5. Token marked as used
#
# Limitations:
# - Full test requires email worker or manual token extraction
# - Tests 4, 5, 7 are commented out (need manual token)
# - Consider adding test API endpoint to get tokens in test environment
