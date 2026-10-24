import FeedUrlField from './FeedUrlField';

export default function KeywordFilterConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <FeedUrlField
        id="keyword_filter-link"
        value={value.link || ''}
        onChange={(link) => onChange({ ...value, link })}
      />
      <div>
        <label htmlFor="keyword_filter-keyword" className="block text-sm text-brown-600 mb-1">
          Keyword
        </label>
        <input
          id="keyword_filter-keyword"
          type="text"
          value={value.keyword || ''}
          onChange={(e) => onChange({ ...value, keyword: e.target.value })}
          placeholder="e.g. France"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
