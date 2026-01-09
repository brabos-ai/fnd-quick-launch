# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 06-manager-impersonate.hurl
# Purpose: Test admin impersonation functionality
# ===========================================

# -------------------------------------------
# SETUP: Requires super admin token from 00-setup.hurl
# -------------------------------------------

# -------------------------------------------
# TEST 1: Start Impersonation
# -------------------------------------------
# Impersonate user (requires targetUserId and reason)
POST {{API_URL}}/manager/impersonate
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "targetUserId": "{{userId}}",
  "reason": "Testing impersonation feature for QA purposes"
}

HTTP 200
[Captures]
impersonateToken: jsonpath "$.accessToken"
impersonateSessionId: jsonpath "$.sessionId"

[Asserts]
jsonpath "$.accessToken" isString
jsonpath "$.sessionId" isString
jsonpath "$.expiresAt" exists
jsonpath "$.targetUser.id" == "{{userId}}"
jsonpath "$.targetUser.email" isString

# -------------------------------------------
# TEST 2: Use Impersonated Token
# -------------------------------------------
# Get user profile with impersonated token
GET {{API_URL}}/auth/me
Authorization: Bearer {{impersonateToken}}

HTTP 200
[Asserts]
jsonpath "$.user.id" == "{{userId}}"
jsonpath "$.user.email" == "{{TEST_EMAIL}}"

# -------------------------------------------
# TEST 3: Verify Impersonation Context
# -------------------------------------------
# Check if we're in impersonation mode
# (depends on API implementation - may include impersonation info in response)
GET {{API_URL}}/auth/me
Authorization: Bearer {{impersonateToken}}

HTTP 200

# -------------------------------------------
# TEST 4: End Impersonation
# -------------------------------------------
# End impersonation session (requires sessionId in body, returns 204 No Content)
DELETE {{API_URL}}/manager/impersonate
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "sessionId": "{{impersonateSessionId}}"
}

HTTP 204

# -------------------------------------------
# TEST 5: Impersonated Token No Longer Works
# -------------------------------------------
# Try using impersonated token after ending
GET {{API_URL}}/auth/me
Authorization: Bearer {{impersonateToken}}

HTTP 401

# -------------------------------------------
# TEST 6: Impersonate Non-Existent User (should fail)
# -------------------------------------------
POST {{API_URL}}/manager/impersonate
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "targetUserId": "99999999-9999-9999-9999-999999999999",
  "reason": "Testing non-existent user impersonation"
}

HTTP 404

# -------------------------------------------
# TEST 7: Impersonate - Regular User (should fail)
# -------------------------------------------
# Regular user tries to impersonate
POST {{API_URL}}/manager/impersonate
Authorization: Bearer {{accessToken}}
Content-Type: application/json
{
  "targetUserId": "{{userId}}",
  "reason": "Regular user trying to impersonate"
}

HTTP 403

# -------------------------------------------
# TEST 8: Multiple Impersonation Sessions (should fail)
# -------------------------------------------
# Start first impersonation
POST {{API_URL}}/manager/impersonate
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "targetUserId": "{{userId}}",
  "reason": "First impersonation session for testing"
}

HTTP 200
[Captures]
impersonateToken1: jsonpath "$.accessToken"
impersonateSessionId1: jsonpath "$.sessionId"

# Try to start second impersonation without ending first
POST {{API_URL}}/manager/impersonate
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "targetUserId": "{{userId}}",
  "reason": "Second impersonation attempt"
}

HTTP 400
[Asserts]
jsonpath "$.message" contains "already impersonat"

# End impersonation (requires sessionId in body)
DELETE {{API_URL}}/manager/impersonate
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "sessionId": "{{impersonateSessionId1}}"
}

HTTP 204

# -------------------------------------------
# NOTES
# -------------------------------------------
# Impersonation Features:
# - Super admin can impersonate any user
# - Creates temporary session with user's permissions
# - All actions logged with impersonation context
# - Only one active impersonation per admin
# - Must explicitly end impersonation
#
# Security:
# - Only super admins can impersonate
# - All impersonation actions are audited
# - Impersonated sessions have shorter expiration
# - Cannot impersonate other super admins (optional restriction)
#
# Use Cases:
# - Customer support (troubleshoot user issues)
# - Testing user-specific functionality
# - Account recovery assistance
