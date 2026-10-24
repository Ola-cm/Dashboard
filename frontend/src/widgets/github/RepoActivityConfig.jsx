export default function RepoActivityConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="repo_activity-repo" className="block text-sm text-brown-600 mb-1">
          Repository
        </label>
        <input
          id="repo_activity-repo"
          type="text"
          value={value.repo || ''}
          onChange={(e) => onChange({ ...value, repo: e.target.value })}
          placeholder="owner/repo"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="repo_activity-days" className="block text-sm text-brown-600 mb-1">
          Days
        </label>
        <input
          id="repo_activity-days"
          type="number"
          min="1"
          max="30"
          value={value.days || ''}
          onChange={(e) => onChange({ ...value, days: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
