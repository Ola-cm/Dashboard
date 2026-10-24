const { Router } = require('express');
const { getAbout } = require('../controllers/about.controller');

const router = Router();

router.get('/about.json', getAbout);

module.exports = router;
