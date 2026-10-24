import { SUGGESTED_FEEDS } from './suggestedFeeds';

// A native <datalist> is enough here: it gives free keyboard/mouse navigation and doesn't stop
// the field from accepting any feed URL that isn't in the list — the suggestions are just a
// head start, not a restriction.
export default function FeedUrlField({ id, value, onChange }) {
  const listId = `${id}-suggestions`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-brown-600 mb-1">
        Feed URL
      </label>
      <input
        id={id}
        type="text"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/feed.xml"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
      <datalist id={listId}>
        {SUGGESTED_FEEDS.map((feed) => (
          <option key={feed.url} value={feed.url}>
            {feed.label}
          </option>
        ))}
      </datalist>
      <p className="mt-1 text-xs text-brown-400">Pick a suggestion or paste any feed URL.</p>
    </div>
  );
}
