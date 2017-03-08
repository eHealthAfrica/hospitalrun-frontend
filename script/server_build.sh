#!/usr/bin/env bash
body='{
"request": {
  "branch":"${TRAVIS_BRANCH}"
}}'

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token ${BUILD_TRIGGER_TOKEN}" \
  -d "$body" \
  https://api.travis-ci.org/repo/eHealthAfrica%2Fhospitalrun-server/requests
