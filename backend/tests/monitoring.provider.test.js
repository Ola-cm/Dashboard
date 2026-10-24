jest.mock('../src/services/monitoring/client');

const client = require('../src/services/monitoring/client');
const provider = require('../src/services/monitoring/provider');

describe('monitoring provider', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches the uptime status of a url', async () => {
    client.getUptimeStatus.mockResolvedValue({ url: 'https://example.com', up: true, statusCode: 200, responseTimeMs: 42 });

    const result = await provider.fetchWidgetData('uptime_check', { url: 'https://example.com' });

    expect(client.getUptimeStatus).toHaveBeenCalledWith('https://example.com');
    expect(result.data).toEqual({ url: 'https://example.com', up: true, statusCode: 200, responseTimeMs: 42 });
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('fetches response time stats over several samples', async () => {
    client.getResponseTimeStats.mockResolvedValue({
      url: 'https://example.com',
      samples: 3,
      upCount: 3,
      avgMs: 50,
      minMs: 40,
      maxMs: 60,
    });

    const result = await provider.fetchWidgetData('response_time', {
      url: 'https://example.com',
      samples: 3,
    });

    expect(client.getResponseTimeStats).toHaveBeenCalledWith('https://example.com', 3);
    expect(result.data.avgMs).toBe(50);
  });

  it('fetches the error rate for an endpoint over a time range', async () => {
    client.getErrorRate.mockResolvedValue({
      url: 'https://example.com',
      timeRange: '1h',
      samples: 6,
      errorCount: 1,
      errorRatePercent: 16.7,
    });

    const result = await provider.fetchWidgetData('error_rate', {
      endpoint_url: 'https://example.com',
      time_range: '1h',
    });

    expect(client.getErrorRate).toHaveBeenCalledWith('https://example.com', '1h');
    expect(result.data.errorRatePercent).toBe(16.7);
  });

  it('fetches the latency trend for an endpoint', async () => {
    client.getLatencyTrend.mockResolvedValue({
      url: 'https://example.com',
      samples: [
        { index: 0, responseTimeMs: 40 },
        { index: 1, responseTimeMs: 55 },
      ],
      lastMs: 55,
    });

    const result = await provider.fetchWidgetData('latency_tracker', {
      endpoint_url: 'https://example.com',
      sample_count: 2,
    });

    expect(client.getLatencyTrend).toHaveBeenCalledWith('https://example.com', 2);
    expect(result.data.lastMs).toBe(55);
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {})).rejects.toThrow(
      /Unknown monitoring widget/,
    );
  });
});
