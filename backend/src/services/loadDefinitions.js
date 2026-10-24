const fs = require('fs');
const path = require('path');

const DEFINITIONS_DIR = path.join(__dirname, 'definitions');

// Each file in ./definitions registers its own service as a side effect of being required —
// dropping a new file there is enough, nobody has to edit a shared list.
function loadServiceDefinitions() {
  fs.readdirSync(DEFINITIONS_DIR)
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => require(path.join(DEFINITIONS_DIR, file)));
}

module.exports = { loadServiceDefinitions };
