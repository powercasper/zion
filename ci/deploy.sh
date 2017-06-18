#!/usr/bin/env bash

set -e

export IMAGE=`gzr image get nark --latest`
gzr deployments -n integration update nark nark ${IMAGE}
echo "Deployed ${IMAGE} to integration"

curl -X POST 'https://api.newrelic.com/v2/applications/63426399/deployments.json' \
     -H "X-Api-Key:${API_KEY}" -i \
     -H 'Content-Type: application/json' \
     -d "{
    \"deployment\": {
    \"revision\": \"${IMAGE##*:}\",
    \"description\": \"deployed\",
    \"user\": \"jenkins\"
  }
}"
