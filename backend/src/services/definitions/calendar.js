const { registerService } = require('../widgetRegistry');
const catalog = require('../calendar/catalog');

registerService('calendar', catalog);
