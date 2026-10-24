const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const aboutRoutes = require('./routes/about.route');
const authRoutes = require('./routes/auth.route');
const dashboardRoutes = require('./routes/dashboard.route');
const servicesRoutes = require('./routes/services.route');
const adminRoutes = require('./routes/admin.route');
const publicRoutes = require('./routes/public.route');
const placesRoutes = require('./routes/places.route');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { nodeEnv, frontendUrl } = require('./config/env');
const { loadServiceDefinitions } = require('./services/loadDefinitions');

loadServiceDefinitions();

const app = express();

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
if (nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/', routes);
app.use('/', aboutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/places', placesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
