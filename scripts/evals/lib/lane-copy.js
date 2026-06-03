"use strict";

const path = require("node:path");

const { extractReaderCopy } = require("./extract-copy.js");

function collectLaneCopies(lane, relPath, raw) {
  const dataSource = findDataSource(lane, relPath);
  if (!dataSource) {
    return [
      {
        label: relPath,
        copy: extractReaderCopy(raw, { type: path.extname(relPath).slice(1) }),
      },
    ];
  }

  const parsed = JSON.parse(raw);
  const entries = getPath(parsed, dataSource.arrayPath);
  if (!Array.isArray(entries)) {
    throw new Error(
      `data source ${dataSource.path} expected array at ${dataSource.arrayPath}`
    );
  }

  const allowedSlugs = new Set(dataSource.onlySlugs || []);
  const ignoredKeys = new Set(dataSource.ignoreKeys || [
    "slug",
    "destination",
    "proofAssetKey",
    "relatedPages",
    "datePublished",
  ]);

  return entries
    .filter((entry) => {
      if (allowedSlugs.size === 0) return true;
      return allowedSlugs.has(entry[dataSource.labelKey]);
    })
    .map((entry) => {
      const labelValue = entry[dataSource.labelKey] || "entry";
      return {
        label: `${relPath}#${labelValue}`,
        copy: extractReaderCopy(collectStrings(entry, ignoredKeys).join(" "), { type: "html" }),
      };
    });
}

function findDataSource(lane, relPath) {
  return (lane.dataSources || []).find((source) => source.path === relPath);
}

function getPath(value, dottedPath) {
  return String(dottedPath || "")
    .split(".")
    .filter(Boolean)
    .reduce((current, key) => (current == null ? undefined : current[key]), value);
}

function collectStrings(value, ignoredKeys = new Set()) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item, ignoredKeys));
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => !ignoredKeys.has(key))
      .flatMap(([, entryValue]) => collectStrings(entryValue, ignoredKeys));
  }
  return [];
}

module.exports = { collectLaneCopies };
