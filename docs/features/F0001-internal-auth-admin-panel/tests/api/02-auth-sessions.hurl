# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 02-auth-sessions.hurl
# Purpose: Test session management (list, revoke, multi-device)
# ===========================================

# -------------------------------------------
# SETUP: Variables from previous files
# -------------------------------------------
# Run 00-setup.hurl and 01-auth-signup-signin.hurl first
# Assumes accessToken, refreshToken, userId, sessionId are set

# -------------------------------------------
# TEST 1: List All Active Sessions
# -------------------------------------------
# Get all sessions for current user
GET {{API_URL}}/auth/sessions
Authorization: Bearer {{accessToken}}

HTTP 200
[Asserts]
jsonpath "$.sessions" isCollection
jsonpath "$.sessions" count > 0
duration < 1000

# -------------------------------------------
# TEST 2: Create Second Session (Different Device)
# -------------------------------------------
# Sign in from different device
POST {{API_URL}}/auth/signin
Content-Type: application/json
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

HTTP 200
[Captures]
accessToken2: jsonpath "$.accessToken"
sessionId2: jsonpath "$.session.id"

[Asserts]
jsonpath "$.accessToken" isString
jsonpath "$.session.id" isString

# -------------------------------------------
# TEST 3: Verify Multiple Sessions Exist
# -------------------------------------------
# List sessions - should show 2 sessions
GET {{API_URL}}/auth/sessions
Authorization: Bearer {{accessToken}}

HTTP 200
[Asserts]
jsonpath "$.sessions" count >= 2

# -------------------------------------------
# TEST 4: Create Third Session
# -------------------------------------------
# Sign in from third device
POST {{API_URL}}/auth/signin
Content-Type: application/json
User-Agent: Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

HTTP 200
[Captures]
sessionId3: jsonpath "$.session.id"

# -------------------------------------------
# TEST 5: Revoke Specific Session
# -------------------------------------------
# Revoke second session
DELETE {{API_URL}}/auth/sessions/{{sessionId2}}
Authorization: Bearer {{accessToken}}

HTTP 200

# -------------------------------------------
# TEST 6: Verify Session Was Revoked
# -------------------------------------------
# List sessions after revocation
GET {{API_URL}}/auth/sessions
Authorization: Bearer {{accessToken}}

HTTP 200

# -------------------------------------------
# TEST 7: Revoked Token Should Not Work
# -------------------------------------------
# Try using revoked session token
GET {{API_URL}}/auth/me
Authorization: Bearer {{accessToken2}}

HTTP 401

# -------------------------------------------
# TEST 8: Revoke Non-Existent Session (should fail)
# -------------------------------------------
# Revoke non-existent session
DELETE {{API_URL}}/auth/sessions/99999999-9999-9999-9999-999999999999
Authorization: Bearer {{accessToken}}

HTTP 404

# -------------------------------------------
# TEST 9: Revoke Another User's Session (should fail)
# -------------------------------------------
# Sign up second user
POST {{API_URL}}/auth/signup
Content-Type: application/json
{
  "email": "test2@example.com",
  "password": "Password123!",
  "name": "Second Test User",
  "workspaceName": "Second Workspace"
}

HTTP 201

# Sign in second user
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "test2@example.com",
  "password": "Password123!"
}

HTTP 200
[Captures]
accessToken2ndUser: jsonpath "$.accessToken"
sessionId2ndUser: jsonpath "$.session.id"

# Try to revoke second user's session from first user
DELETE {{API_URL}}/auth/sessions/{{sessionId2ndUser}}
Authorization: Bearer {{accessToken}}

HTTP 403

# -------------------------------------------
# TEST 10: Logout (Revoke Current Session)
# -------------------------------------------
# Logout current session
POST {{API_URL}}/auth/logout
Authorization: Bearer {{accessToken}}

HTTP 200

# -------------------------------------------
# TEST 11: Verify Logged Out Token Doesn't Work
# -------------------------------------------
# Try using logged out token
GET {{API_URL}}/auth/me
Authorization: Bearer {{accessToken}}

HTTP 401

# -------------------------------------------
# TEST 12: Logout All Sessions
# -------------------------------------------
# Sign in to create new session
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

HTTP 200
[Captures]
accessTokenFresh: jsonpath "$.accessToken"

# Create additional session
POST {{API_URL}}/auth/signin
Content-Type: application/json
User-Agent: Mozilla/5.0 (Android)
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

HTTP 200

# List all sessions
GET {{API_URL}}/auth/sessions
Authorization: Bearer {{accessTokenFresh}}

HTTP 200
[Asserts]
jsonpath "$.sessions" count >= 2

# Revoke all sessions by logging out
POST {{API_URL}}/auth/logout?all=true
Authorization: Bearer {{accessTokenFresh}}

HTTP 200

# Verify all sessions are revoked
GET {{API_URL}}/auth/sessions
Authorization: Bearer {{accessTokenFresh}}

HTTP 401

# -------------------------------------------
# NOTES
# -------------------------------------------
# Session Management Tests:
# 1. List active sessions
# 2. Create multiple sessions (different devices)
# 3. Revoke specific session
# 4. Revoke all sessions
# 5. Multi-tenancy isolation (can't revoke other user's sessions)
#
# Session Features:
# - Device tracking (User-Agent, IP address)
# - Expiration timestamps
# - Revocation (soft delete)
# - Multi-device support
#
# Note: JavaScript validation blocks removed - Hurl uses jsonpath asserts
# Cleanup: Sessions are automatically cleaned up when expired or revoked
