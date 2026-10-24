const { registerService } = require('../widgetRegistry');
const catalog = require('../notes/catalog');

registerService('notes', catalog);
