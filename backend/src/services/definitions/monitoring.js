const { registerService } = require('../widgetRegistry');
const catalog = require('../monitoring/catalog');

registerService('monitoring', catalog);
