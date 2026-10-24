const { registerService } = require('../widgetRegistry');
const catalog = require('../clock/catalog');

registerService('clock', catalog);
