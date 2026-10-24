import FeedUrlField from './FeedUrlField';

export default function FeedDigestConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <FeedUrlField
        id="feed_digest-link"
        value={value.link || ''}
        onChange={(link) => onChange({ ...value, link })}
      />
      <div>
        <label htmlFor="feed_digest-max_length" className="block text-sm text-brown-600 mb-1">
          Number of items
        </label>
        <input
          id="feed_digest-max_length"
          type="number"
          min="1"
          max="20"
          value={value.max_length || ''}
          onChange={(e) => onChange({ ...value, max_length: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
