export default function RecentCommitsConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="recent_commits-repo" className="block text-sm text-brown-600 mb-1">
          Repository
        </label>
        <input
          id="recent_commits-repo"
          type="text"
          value={value.repo || ''}
          onChange={(e) => onChange({ ...value, repo: e.target.value })}
          placeholder="owner/repo"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="recent_commits-count" className="block text-sm text-brown-600 mb-1">
          Number of commits
        </label>
        <input
          id="recent_commits-count"
          type="number"
          min="1"
          max="20"
          value={value.count || ''}
          onChange={(e) => onChange({ ...value, count: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
