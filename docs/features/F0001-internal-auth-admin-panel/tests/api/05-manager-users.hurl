# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 05-manager-users.hurl
# Purpose: Test manager user management endpoints
# ===========================================

# -------------------------------------------
# SETUP: Requires super admin token from 00-setup.hurl
# -------------------------------------------

# -------------------------------------------
# TEST 1: List All Users (Super Admin)
# -------------------------------------------
# Get all users (returns array directly)
GET {{API_URL}}/manager/users
Authorization: Bearer {{superAdminAccessToken}}

HTTP 200
[Asserts]
jsonpath "$" isCollection
jsonpath "$" count > 0
jsonpath "$[0].id" isString
jsonpath "$[0].email" isString

# -------------------------------------------
# TEST 2: List Users with Pagination
# -------------------------------------------
# Get users with limit (returns array directly)
GET {{API_URL}}/manager/users?limit=5
Authorization: Bearer {{superAdminAccessToken}}

HTTP 200
[Asserts]
jsonpath "$" isCollection
jsonpath "$" count <= 5

# -------------------------------------------
# TEST 3: List Users with Filters
# -------------------------------------------
# Filter by status (returns array directly)
GET {{API_URL}}/manager/users?status=active
Authorization: Bearer {{superAdminAccessToken}}

HTTP 200
[Asserts]
jsonpath "$" isCollection

# Filter by email
GET {{API_URL}}/manager/users?search={{TEST_EMAIL}}
Authorization: Bearer {{superAdminAccessToken}}

HTTP 200

# -------------------------------------------
# TEST 4: Get User Details (Super Admin)
# -------------------------------------------
# Get specific user by ID
GET {{API_URL}}/manager/users/{{userId}}
Authorization: Bearer {{superAdminAccessToken}}

HTTP 200
[Asserts]
jsonpath "$.id" == "{{userId}}"
jsonpath "$.email" == "{{TEST_EMAIL}}"
jsonpath "$.name" == "{{TEST_NAME}}"
jsonpath "$.status" isString
jsonpath "$.emailVerified" isBoolean
jsonpath "$.workspaces" isCollection

# -------------------------------------------
# TEST 5: Update User Status (Super Admin)
# -------------------------------------------
# Suspend user (returns 204 No Content)
PATCH {{API_URL}}/manager/users/{{userId}}/status
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "status": "inactive"
}

HTTP 204

# Reactivate user (returns 204 No Content)
PATCH {{API_URL}}/manager/users/{{userId}}/status
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "status": "active"
}

HTTP 204

# -------------------------------------------
# TEST 6: Update User Status - Invalid Status
# -------------------------------------------
PATCH {{API_URL}}/manager/users/{{userId}}/status
Authorization: Bearer {{superAdminAccessToken}}
Content-Type: application/json
{
  "status": "invalid-status"
}

HTTP 400

# -------------------------------------------
# TEST 7: Manager Endpoints - Regular User (should fail)
# -------------------------------------------
# Try to list users with regular user token
GET {{API_URL}}/manager/users
Authorization: Bearer {{accessToken}}

HTTP 403

# Try to update user status with regular user token
PATCH {{API_URL}}/manager/users/{{userId}}/status
Authorization: Bearer {{accessToken}}
Content-Type: application/json
{
  "status": "inactive"
}

HTTP 403

# -------------------------------------------
# TEST 8: Manager Endpoints - No Auth (should fail)
# -------------------------------------------
# Try to list users without token
GET {{API_URL}}/manager/users

HTTP 401

# -------------------------------------------
# NOTES
# -------------------------------------------
# Manager User Management:
# - List all users across all accounts (super admin only)
# - Search and filter users
# - View user details
# - Update user status (active/inactive/deleted)
# - Multi-tenancy: Regular users can't access manager endpoints
#
# Authorization:
# - Requires super admin token (email in SUPER_ADMIN_EMAIL env var)
# - Regular users get 403 Forbidden
