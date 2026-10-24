jest.mock('axios');

const axios = require('axios');
const client = require('../src/services/clock/client');

describe('clock client', () => {
  afterEach(() => jest.resetAllMocks());

  it('maps the time API response to time parts', async () => {
    axios.get.mockResolvedValue({
      data: {
        year: 2026, month: 10, day: 8, hour: 22, minute: 28, seconds: 36, dayOfWeek: 'Thursday',
      },
    });

    const parts = await client.getTimeParts('Europe/Paris');

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('timeapi.io'),
      expect.objectContaining({ params: { timeZone: 'Europe/Paris' } }),
    );
    expect(parts).toEqual({
      timezone: 'Europe/Paris',
      hours: 22,
      minutes: 28,
      seconds: 36,
      weekday: 'Thursday',
      date: 'October 8, 2026',
    });
  });

  it('turns a 400 from the API into an unknown timezone error', async () => {
    axios.get.mockRejectedValue({ response: { status: 400 } });

    await expect(client.getTimeParts('Nope')).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/Unknown timezone/),
    });
  });

  it('reports an unreachable time service as a 424', async () => {
    axios.get.mockRejectedValue(new Error('boom'));

    await expect(client.getTimeParts('UTC')).rejects.toMatchObject({ status: 424 });
  });
});
