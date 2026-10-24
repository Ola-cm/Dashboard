const places = require('../services/places');

async function autocomplete(req, res, next) {
  try {
    const suggestions = await places.autocomplete(req.query.query);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
}

module.exports = { autocomplete };
