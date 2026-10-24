export default function RepoIssuesConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="repo_issues-repo" className="block text-sm text-brown-600 mb-1">
        Repository
      </label>
      <input
        id="repo_issues-repo"
        type="text"
        value={value.repo || ''}
        onChange={(e) => onChange({ ...value, repo: e.target.value })}
        placeholder="owner/repo"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
    </div>
  );
}
