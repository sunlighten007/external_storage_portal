#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Set default values if not provided
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:54322/postgres}"
export AUTH_SECRET="${AUTH_SECRET:-test-secret-key}"
export USE_LOCAL_S3="${USE_LOCAL_S3:-true}"
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
export AWS_REGION="${AWS_REGION:-us-east-1}"
export AWS_S3_BUCKET="${AWS_S3_BUCKET:-test-bucket}"
export S3_ENDPOINT="${S3_ENDPOINT:-http://localhost:4566}"

# Run the test with the environment variables
npx playwright test "$@"
