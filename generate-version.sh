#!/bin/bash
set -Eeuo pipefail

export BRANCH="${1}"
export BUILD_NUMBER="${2}"
export GIT_HASH="${3}"

jq '. + {
  "branch": env.BRANCH,
  "build_number": env.BUILD_NUMBER,
  "git_hash": env.GIT_HASH
} | . + {
"semver": (.major + "." + .minor + "." + .build_number)
} ' version.json  > ~/workspace/version.json

cp ~/workspace/version.json src/version.json



