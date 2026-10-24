const AVATAR_SIZES = [32, 64, 128, 256, 512];

export default function ProfileConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="profile-avatar_size" className="block text-sm text-brown-600 mb-1">
        Avatar size (px)
      </label>
      <select
        id="profile-avatar_size"
        value={value.avatar_size || ''}
        onChange={(e) => onChange({ ...value, avatar_size: Number(e.target.value) })}
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      >
        <option value="" disabled>
          Choose a size
        </option>
        {AVATAR_SIZES.map((px) => (
          <option key={px} value={px}>
            {px}
          </option>
        ))}
      </select>
    </div>
  );
}
