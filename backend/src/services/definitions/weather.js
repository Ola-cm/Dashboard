const { registerService } = require('../widgetRegistry');
const catalog = require('../weather/catalog');

registerService('weather', catalog);
