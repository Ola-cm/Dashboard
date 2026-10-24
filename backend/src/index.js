const dns = require('dns');

// The Docker network this backend runs in has no IPv6 route. Node's default DNS ordering can
// still put an AAAA record first, so outbound calls to dual-stack hosts (Open-Meteo, GitHub, ...)
// intermittently fail with ETIMEDOUT/ENETUNREACH before falling back to the working IPv4 address.
dns.setDefaultResultOrder('ipv4first');

const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
