#!/bin/bash
# Copy this case's fixed sample inputs into the eval working directory.
set -euo pipefail
cp -R "$(dirname "$0")/fixtures/." .
