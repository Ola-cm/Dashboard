const dns = require('dns');
const {
  normalizeUrl,
  assertPublicUrl,
  guardedLookup,
  isPrivateAddress,
} = require('../src/services/website/publicUrl');

describe('website publicUrl guard', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.17.0.2',
    '192.168.1.10',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    'fc00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
  ])('treats %s as private', (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each(['140.82.121.4', '8.8.8.8', '2606:4700:4700::1111'])('treats %s as public', (address) => {
    expect(isPrivateAddress(address)).toBe(false);
  });

  it('adds https:// when the scheme is missing', () => {
    expect(normalizeUrl('github.com').toString()).toBe('https://github.com/');
  });

  it('refuses non-http schemes', () => {
    expect(() => normalizeUrl('file:///etc/passwd')).toThrow(/Only http and https/);
  });

  it('refuses an unparseable URL', () => {
    expect(() => normalizeUrl('http://[unterminated')).toThrow(/not a valid URL/);
  });

  it('refuses IP literals pointing to a private network, IPv4 and IPv6', () => {
    expect(() => assertPublicUrl(new URL('http://127.0.0.1:5432'))).toThrow(/private network/);
    expect(() => assertPublicUrl(new URL('http://[::1]/'))).toThrow(/private network/);
    expect(() => assertPublicUrl(new URL('https://140.82.121.4/'))).not.toThrow();
  });

  it('fails the connection when a hostname resolves to a private address', (done) => {
    jest.spyOn(dns, 'lookup').mockImplementation((host, options, callback) =>
      callback(null, [{ address: '172.18.0.3', family: 4 }]),
    );

    guardedLookup('db', {}, (err) => {
      expect(err.status).toBe(400);
      done();
    });
  });

  it('refuses a hostname if any of its addresses is private', (done) => {
    jest.spyOn(dns, 'lookup').mockImplementation((host, options, callback) =>
      callback(null, [
        { address: '140.82.121.4', family: 4 },
        { address: '127.0.0.1', family: 4 },
      ]),
    );

    guardedLookup('mixed.example', { all: true }, (err) => {
      expect(err.status).toBe(400);
      done();
    });
  });

  it('passes public addresses through in both lookup call styles', (done) => {
    jest.spyOn(dns, 'lookup').mockImplementation((host, options, callback) =>
      callback(null, [{ address: '140.82.121.4', family: 4 }]),
    );

    guardedLookup('github.com', {}, (err, address, family) => {
      expect(err).toBeNull();
      expect([address, family]).toEqual(['140.82.121.4', 4]);
      guardedLookup('github.com', { all: true }, (err2, addresses) => {
        expect(addresses).toEqual([{ address: '140.82.121.4', family: 4 }]);
        done();
      });
    });
  });
});
