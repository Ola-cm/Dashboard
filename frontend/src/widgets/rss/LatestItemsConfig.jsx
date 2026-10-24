import FeedUrlField from './FeedUrlField';

export default function LatestItemsConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <FeedUrlField
        id="article_list-link"
        value={value.link || ''}
        onChange={(link) => onChange({ ...value, link })}
      />
      <div>
        <label htmlFor="article_list-number" className="block text-sm text-brown-600 mb-1">
          Number of articles
        </label>
        <input
          id="article_list-number"
          type="number"
          min="1"
          max="20"
          value={value.number || ''}
          onChange={(e) => onChange({ ...value, number: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
