export default function MyServersConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="my_servers-count" className="block text-sm text-brown-600 mb-1">
        Number of servers
      </label>
      <input
        id="my_servers-count"
        type="number"
        min="1"
        max="25"
        value={value.count || ''}
        onChange={(e) => onChange({ ...value, count: Number(e.target.value) })}
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
    </div>
  );
}
