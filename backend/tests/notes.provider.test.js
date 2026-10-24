const provider = require('../src/services/notes/provider');

describe('notes provider', () => {
  it('passes a sticky note through as-is', async () => {
    const result = await provider.fetchWidgetData('sticky_note', {
      title: 'Groceries',
      content: 'Milk, eggs, bread',
    });

    expect(result.data).toEqual({ title: 'Groceries', content: 'Milk, eggs, bread' });
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('splits a checklist into trimmed items, one per line', async () => {
    const result = await provider.fetchWidgetData('checklist', {
      title: 'Packing',
      items: 'Passport\n  Charger  \n\nTickets',
    });

    expect(result.data).toEqual({
      title: 'Packing',
      items: ['Passport', 'Charger', 'Tickets'],
    });
  });

  it('also splits a checklist on commas', async () => {
    const result = await provider.fetchWidgetData('checklist', {
      title: 'Shopping',
      items: 'Milk, Eggs,Bread',
    });

    expect(result.data.items).toEqual(['Milk', 'Eggs', 'Bread']);
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {})).rejects.toThrow(
      /Unknown notes widget/,
    );
  });
});
