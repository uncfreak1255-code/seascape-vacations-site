const fs = require("fs");
const path = require("path");

function read(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function expectContains(file, needle) {
  const contents = read(file);
  if (!contents.includes(needle)) {
    throw new Error(`Missing expected content in ${file}: ${needle}`);
  }
}

module.exports = { read, expectContains };
