FROM node:24.14.0-bookworm-slim

# Cursor checks out the repo at the requested commit. Do not COPY the project.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git make python3 g++ \
  && rm -rf /var/lib/apt/lists/*
