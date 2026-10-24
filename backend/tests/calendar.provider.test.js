const provider = require('../src/services/calendar/provider');

describe('calendar provider', () => {
  it('builds a month grid with the right number of days', async () => {
    const result = await provider.fetchWidgetData('month_view', { month: 2, year: 2024 });

    expect(result.data.monthName).toBe('February');
    // 2024 is a leap year: Feb has 29 days.
    const allDays = result.data.weeks.flat().filter((d) => d !== null);
    expect(allDays).toHaveLength(29);
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('pads the first and last week with nulls around the month boundaries', async () => {
    const result = await provider.fetchWidgetData('month_view', { month: 1, year: 2024 });

    expect(result.data.weeks[0]).toHaveLength(7);
    expect(result.data.weeks[result.data.weeks.length - 1]).toHaveLength(7);
  });

  it('computes the days remaining until a future target date', async () => {
    const target = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const result = await provider.fetchWidgetData('countdown', {
      label: 'Launch day',
      target_date: target,
    });

    expect(result.data.label).toBe('Launch day');
    expect(result.data.daysRemaining).toBeGreaterThanOrEqual(4);
    expect(result.data.daysRemaining).toBeLessThanOrEqual(5);
  });

  it('rejects an invalid target date', async () => {
    await expect(
      provider.fetchWidgetData('countdown', { label: 'x', target_date: 'not-a-date' }),
    ).rejects.toThrow(/Invalid target_date/);
  });

  it('computes the days elapsed since a past start date', async () => {
    const start = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const result = await provider.fetchWidgetData('days_since', {
      label: 'Sober since',
      start_date: start,
    });

    expect(result.data.label).toBe('Sober since');
    expect(result.data.daysElapsed).toBeGreaterThanOrEqual(4);
    expect(result.data.daysElapsed).toBeLessThanOrEqual(5);
  });

  it('rejects an invalid start date', async () => {
    await expect(
      provider.fetchWidgetData('days_since', { label: 'x', start_date: 'not-a-date' }),
    ).rejects.toThrow(/Invalid start_date/);
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {})).rejects.toThrow(
      /Unknown calendar widget/,
    );
  });
});
