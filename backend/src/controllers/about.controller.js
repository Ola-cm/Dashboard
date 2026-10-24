const { getServices } = require('../services/widgetRegistry');

// The brief's own minimum ("3 × team size" widgets overall) is comfortably met in aggregate, but
// a service with only one or two widgets isn't really a full service in its own right — /about.json
// only advertises services that stand on their own with at least 3. This doesn't touch the actual
// registry: a thinner service still works normally everywhere else in the app (Services page,
// dashboard widgets, ...), it's just left out of this one public listing.
const MIN_WIDGETS_PER_SERVICE = 3;

function getClientHost(req) {
  const address = req.ip || req.socket.remoteAddress || '';
  return address.replace(/^::ffff:/, '');
}

function getAbout(req, res) {
  const services = getServices().filter((service) => service.widgets.length >= MIN_WIDGETS_PER_SERVICE);
  res.json({
    client: {
      host: getClientHost(req),
    },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services,
    },
  });
}

module.exports = { getAbout };
