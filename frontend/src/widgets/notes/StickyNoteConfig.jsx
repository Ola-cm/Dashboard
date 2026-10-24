export default function StickyNoteConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="sticky_note-title" className="block text-sm text-brown-600 mb-1">
          Title
        </label>
        <input
          id="sticky_note-title"
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="e.g. Reminders"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="sticky_note-content" className="block text-sm text-brown-600 mb-1">
          Note
        </label>
        <textarea
          id="sticky_note-content"
          rows={4}
          value={value.content || ''}
          onChange={(e) => onChange({ ...value, content: e.target.value })}
          placeholder="Write your note here..."
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
