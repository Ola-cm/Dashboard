const { registerService } = require('../widgetRegistry');
const catalog = require('../maps/catalog');

registerService('maps', catalog);
