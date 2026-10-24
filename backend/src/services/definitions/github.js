const { registerService } = require('../widgetRegistry');
const catalog = require('../github/catalog');

registerService('github', catalog);
