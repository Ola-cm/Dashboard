const { registerService } = require('../widgetRegistry');
const catalog = require('../youtube/catalog');

registerService('youtube', catalog);
