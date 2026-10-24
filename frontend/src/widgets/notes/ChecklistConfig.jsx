export default function ChecklistConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="checklist-title" className="block text-sm text-brown-600 mb-1">
          Title
        </label>
        <input
          id="checklist-title"
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="e.g. Packing list"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="checklist-items" className="block text-sm text-brown-600 mb-1">
          Items (one per line)
        </label>
        <textarea
          id="checklist-items"
          rows={4}
          value={value.items || ''}
          onChange={(e) => onChange({ ...value, items: e.target.value })}
          placeholder={'Passport\nCharger\nTickets'}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
