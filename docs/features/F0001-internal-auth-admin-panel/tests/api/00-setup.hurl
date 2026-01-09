# ===========================================
# Feature: F0001 - Internal Auth + Admin Panel
# File: 00-setup.hurl
# Purpose: Health check, setup, and authentication
# ===========================================

# -------------------------------------------
# TEST 1: Health Check
# -------------------------------------------
# Check API is running
GET {{API_URL}}/

HTTP 200
[Asserts]
jsonpath "$.status" == "healthy"
jsonpath "$.timestamp" exists

# -------------------------------------------
# TEST 2: Super Admin Authentication
# -------------------------------------------
# Super Admin Login
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "{{SUPER_ADMIN_EMAIL}}",
  "password": "{{SUPER_ADMIN_PASSWORD}}"
}

HTTP 200
[Captures]
superAdminAccessToken: jsonpath "$.accessToken"
superAdminRefreshToken: jsonpath "$.refreshToken"
superAdminUserId: jsonpath "$.user.id"

[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.refreshToken" exists
jsonpath "$.user.email" == "{{SUPER_ADMIN_EMAIL}}"
jsonpath "$.user.id" exists

# -------------------------------------------
# NOTES
# -------------------------------------------
# This file should be run first to:
# 1. Verify API is running
# 2. Authenticate super admin for manager tests
#
# Variables captured here (superAdminAccessToken, etc.) are
# automatically available in subsequent .hurl files when
# executed in the same hurl invocation.
