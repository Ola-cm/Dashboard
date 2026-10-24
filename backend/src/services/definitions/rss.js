const { registerService } = require('../widgetRegistry');
const catalog = require('../rss/catalog');

registerService('rss', catalog);
