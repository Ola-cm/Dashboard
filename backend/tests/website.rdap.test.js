jest.mock('axios');

const axios = require('axios');
const {
  getDomainInfo,
  parseRdap,
  candidateDomains,
  toHostname,
} = require('../src/services/website/rdap');

const RDAP_GITHUB = {
  ldhName: 'GITHUB.COM',
  events: [
    { eventAction: 'registration', eventDate: '2007-10-09T18:20:50Z' },
    { eventAction: 'expiration', eventDate: '2099-10-09T18:20:50Z' },
    { eventAction: 'last changed', eventDate: '2026-09-07T09:22:52Z' },
  ],
  entities: [
    { roles: ['registrar'], vcardArray: ['vcard', [['version', {}, 'text', '4.0'], ['fn', {}, 'text', 'MarkMonitor Inc.']]] },
  ],
  nameservers: [{ ldhName: 'DNS1.P08.NSONE.NET' }, { ldhName: 'DNS2.P08.NSONE.NET' }],
  status: ['client delete prohibited'],
};

describe('website domain info (RDAP)', () => {
  afterEach(() => jest.resetAllMocks());

  it('normalizes what users type into a hostname', () => {
    expect(toHostname('https://www.GitHub.com/about?x=1')).toBe('github.com');
    expect(() => toHostname('not a domain')).toThrow(/not a valid domain/);
  });

  it('tries the full name, then its parent domains', () => {
    expect(candidateDomains('docs.github.com')).toEqual(['docs.github.com', 'github.com']);
    expect(candidateDomains('github.com')).toEqual(['github.com']);
  });

  it('extracts dates, registrar, name servers and status', () => {
    const info = parseRdap(RDAP_GITHUB);

    expect(info).toMatchObject({
      domain: 'github.com',
      registeredAt: '2007-10-09T18:20:50Z',
      expiresAt: '2099-10-09T18:20:50Z',
      registrar: 'MarkMonitor Inc.',
      nameservers: ['dns1.p08.nsone.net', 'dns2.p08.nsone.net'],
      status: ['client delete prohibited'],
    });
    expect(info.ageYears).toBeGreaterThanOrEqual(18);
    expect(info.daysUntilExpiry).toBeGreaterThan(0);
  });

  it('falls back to the parent domain when a subdomain has no record', async () => {
    axios.get.mockImplementation((url) =>
      url.endsWith('/docs.github.com')
        ? Promise.reject(Object.assign(new Error('nf'), { response: { status: 404 } }))
        : Promise.resolve({ data: RDAP_GITHUB }),
    );

    const info = await getDomainInfo('docs.github.com');

    expect(info.domain).toBe('github.com');
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('answers 404 with an explanation when no registry publishes data', async () => {
    axios.get.mockRejectedValue(Object.assign(new Error('nf'), { response: { status: 404 } }));

    await expect(getDomainInfo('epitech.eu')).rejects.toMatchObject({
      status: 404,
      message: expect.stringMatching(/doesn't publish RDAP data/),
    });
  });

  it('answers 424 when the registration service is down', async () => {
    axios.get.mockRejectedValue(Object.assign(new Error('down'), { response: { status: 503 } }));

    await expect(getDomainInfo('github.com')).rejects.toMatchObject({ status: 424 });
  });
});
