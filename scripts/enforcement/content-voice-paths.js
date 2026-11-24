"use strict";

const path = require("path");

const PUBLIC_CONTENT_PATTERNS = [
  /^src\/guides\/.+\.(html|njk)$/i,
  /^src\/research\/.+\.njk$/i,
  /^src\/property-management\/.+\.njk$/i,
  /^src\/stays\/.+\.njk$/i,
  /^src\/index\.njk$/i,
  /^src\/reviews\/.+\.njk$/i
];

const ALWAYS_SCANNED_PUBLIC_COPY_PATH_PATTERNS = [
  ...PUBLIC_CONTENT_PATTERNS,
  /^src\/properties\/.+\.njk$/i
];

const ALWAYS_SCANNED_PUBLIC_COPY_DATA_FILES = [path.join("src", "_data", "seoPages.json")];

const OWNER_CONTENT_PATTERNS = [
  /^src\/property-management\/.+\.njk$/i,
  /^src\/research\/owner-.+\.njk$/i,
  /^src\/research\/.+owner.+\.njk$/i
];

module.exports = {
  ALWAYS_SCANNED_PUBLIC_COPY_DATA_FILES,
  ALWAYS_SCANNED_PUBLIC_COPY_PATH_PATTERNS,
  OWNER_CONTENT_PATTERNS,
  PUBLIC_CONTENT_PATTERNS
};
