import { useEffect } from 'react';

const LANGUAGES = [
  ['en', 'English'],
  ['fr', 'Français'],
  ['es', 'Español'],
  ['de', 'Deutsch'],
];

export default function KnowledgePanelConfig({ value, onChange }) {
  useEffect(() => {
    if (!value.language) {
      onChange({ ...value, language: 'en' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="knowledge_panel-query" className="block text-sm text-brown-600 mb-1">
          Site, company or organization
        </label>
        <input
          id="knowledge_panel-query"
          type="text"
          value={value.query || ''}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="e.g. github.com or Epitech"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="knowledge_panel-language" className="block text-sm text-brown-600 mb-1">
          Language
        </label>
        <select
          id="knowledge_panel-language"
          value={value.language || 'en'}
          onChange={(e) => onChange({ ...value, language: e.target.value })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        >
          {LANGUAGES.map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
