jest.mock('../src/services/clock/client');

const client = require('../src/services/clock/client');
const provider = require('../src/services/clock/provider');

describe('clock provider', () => {
  afterEach(() => jest.resetAllMocks());

  it('reads the current time in a given timezone for the digital clock', async () => {
    client.getTimeParts.mockResolvedValue({
      timezone: 'UTC',
      hours: 14,
      minutes: 5,
      seconds: 9,
      weekday: 'Thursday',
      date: 'October 8, 2026',
    });

    const result = await provider.fetchWidgetData('digital_clock', { timezone: 'UTC' });

    expect(client.getTimeParts).toHaveBeenCalledWith('UTC');
    expect(result.data.hours).toBe(14);
    expect(result.data.weekday).toBe('Thursday');
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('reads the same shape of data for the analog clock', async () => {
    client.getTimeParts.mockResolvedValue({ timezone: 'Europe/Paris', seconds: 30 });

    const result = await provider.fetchWidgetData('analog_clock', { timezone: 'Europe/Paris' });

    expect(client.getTimeParts).toHaveBeenCalledWith('Europe/Paris');
    expect(result.data.seconds).toBe(30);
  });

  it('propagates an unknown timezone error from the time service', async () => {
    client.getTimeParts.mockRejectedValue(
      Object.assign(new Error('Unknown timezone "Not/A_Timezone"'), { status: 400 }),
    );

    await expect(
      provider.fetchWidgetData('digital_clock', { timezone: 'Not/A_Timezone' }),
    ).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/Unknown timezone/) });
  });

  it('turns the timer duration into seconds', async () => {
    const result = await provider.fetchWidgetData('timer', {
      label: 'Pasta',
      minutes: 9,
      seconds: 30,
    });

    expect(result.data).toEqual({ label: 'Pasta', durationSeconds: 570 });
  });

  it.each([
    [{ minutes: 0, seconds: 0 }, /longer than 0 seconds/],
    [{ minutes: 5, seconds: 60 }, /seconds between 0 and 59/],
    [{ minutes: -1, seconds: 10 }, /minutes must be between/],
    [{ minutes: 24 * 60 + 1, seconds: 0 }, /minutes must be between/],
  ])('rejects an invalid timer duration %o', async (duration, message) => {
    await expect(
      provider.fetchWidgetData('timer', { label: 'Tea', ...duration }),
    ).rejects.toMatchObject({ status: 400, message: expect.stringMatching(message) });
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {})).rejects.toThrow(
      /Unknown clock widget/,
    );
  });
});
