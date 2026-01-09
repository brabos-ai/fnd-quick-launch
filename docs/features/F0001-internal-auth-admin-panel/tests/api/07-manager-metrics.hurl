# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 07-manager-metrics.hurl
# Purpose: Test admin metrics dashboard endpoint
# ===========================================

# -------------------------------------------
# SETUP: Requires super admin token from 00-setup.hurl
# -------------------------------------------

# -------------------------------------------
# TEST 1: Get All Auth Metrics (Super Admin)
# -------------------------------------------
# Get all metrics (returns: totalUsers, activeUsers, lockedAccounts, recentSignups, recentLogins)
GET {{API_URL}}/manager/metrics
Authorization: Bearer {{superAdminAccessToken}}

HTTP 200
[Asserts]
jsonpath "$.totalUsers" isInteger
jsonpath "$.activeUsers" isInteger
jsonpath "$.lockedAccounts" isInteger
jsonpath "$.recentSignups" isInteger
jsonpath "$.recentLogins" isInteger
duration < 2000

# -------------------------------------------
# TEST 2: Get Metrics - Regular User (should fail)
# -------------------------------------------
# Try to get metrics with regular user token
GET {{API_URL}}/manager/metrics
Authorization: Bearer {{accessToken}}

HTTP 403

# -------------------------------------------
# TEST 3: Get Metrics - No Auth (should fail)
# -------------------------------------------
# Try to get metrics without token
GET {{API_URL}}/manager/metrics

HTTP 401

# -------------------------------------------
# NOTES
# -------------------------------------------
# Current Metrics Endpoint:
# GET /manager/metrics returns:
# - totalUsers: Total number of users
# - activeUsers: Users with status = 'active'
# - lockedAccounts: Users with status = 'inactive'
# - recentSignups: Signups in last 7 days
# - recentLogins: Active sessions in last 24 hours
#
# Authorization:
# - Requires super admin token
# - Regular users get 403 Forbidden
#
# Future Endpoints (not yet implemented):
# - GET /manager/metrics/failed-logins
# - GET /manager/metrics/active-sessions
# - GET /manager/metrics/user-growth
# - GET /manager/metrics/accounts/:id
# - GET /manager/metrics/realtime/active-users
# - GET /manager/metrics/export
