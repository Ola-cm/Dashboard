export default function UserRepositoriesConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="user_repositories-handle" className="block text-sm text-brown-600 mb-1">
        User or organization
      </label>
      <input
        id="user_repositories-handle"
        type="text"
        value={value.handle || ''}
        onChange={(e) => onChange({ ...value, handle: e.target.value })}
        placeholder="e.g. octocat"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
    </div>
  );
}
