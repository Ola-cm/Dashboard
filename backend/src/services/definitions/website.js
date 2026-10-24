const { registerService } = require('../widgetRegistry');
const catalog = require('../website/catalog');

registerService('website', catalog);
