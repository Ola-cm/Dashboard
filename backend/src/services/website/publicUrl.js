// The site_overview widget makes *this server* fetch a URL chosen by a user. Left unchecked, that
// is a server-side request forgery (SSRF) hole: a user could point it at the database or any other
// container on the Docker network, at localhost, or at a cloud metadata endpoint
// (169.254.169.254), and read the response through the widget. Every address the request
// connects to — including after redirects — must therefore be a public one.
const dns = require('dns');
const net = require('net');

const blocked = new net.BlockList();
[
  ['0.0.0.0', 8], // "this network"
  ['10.0.0.0', 8], // private
  ['100.64.0.0', 10], // carrier-grade NAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, cloud metadata
  ['172.16.0.0', 12], // private (includes Docker's default networks)
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.168.0.0', 16], // private
  ['198.18.0.0', 15], // benchmarking
  ['224.0.0.0', 3], // multicast and reserved (224.0.0.0 - 255.255.255.255)
].forEach(([address, prefix]) => blocked.addSubnet(address, prefix, 'ipv4'));
[
  ['::', 128], // unspecified
  ['::1', 128], // loopback
  ['fc00::', 7], // unique local
  ['fe80::', 10], // link-local
].forEach(([address, prefix]) => blocked.addSubnet(address, prefix, 'ipv6'));

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return blocked.check(address, 'ipv4');
  if (family === 6) {
    // IPv4-mapped IPv6 (::ffff:10.0.0.1) must be judged as the IPv4 address it wraps.
    const mapped = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? blocked.check(mapped[1], 'ipv4') : blocked.check(address, 'ipv6');
  }
  return true;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// Accepts "example.com", "https://example.com/page", ... and returns a normalized http(s) URL.
function normalizeUrl(input) {
  const raw = String(input || '').trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    throw badRequest(`"${raw}" is not a valid URL`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw badRequest('Only http and https URLs are supported');
  }
  return url;
}

// Hostnames given as IP literals never go through DNS, so they are checked here directly — on the
// initial URL and on every redirect target.
function assertPublicUrl(url) {
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isPrivateAddress(host)) {
    throw badRequest('This address points to a private network and cannot be fetched');
  }
}

// Drop-in replacement for dns.lookup, handed to the HTTP client: it runs at connection time, so it
// also covers redirects and a DNS answer that changes between a check and the actual request.
function guardedLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
      return callback(badRequest('This address points to a private network and cannot be fetched'));
    }
    if (options && options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

module.exports = { normalizeUrl, assertPublicUrl, guardedLookup, isPrivateAddress };
