export default function TimerConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="timer-label" className="block text-sm text-brown-600 mb-1">
          Label
        </label>
        <input
          id="timer-label"
          type="text"
          value={value.label || ''}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder="e.g. Pomodoro"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="timer-minutes" className="block text-sm text-brown-600 mb-1">
            Minutes
          </label>
          <input
            id="timer-minutes"
            type="number"
            min="0"
            max="1440"
            value={value.minutes ?? ''}
            onChange={(e) => onChange({ ...value, minutes: Number(e.target.value) })}
            className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="timer-seconds" className="block text-sm text-brown-600 mb-1">
            Seconds
          </label>
          <input
            id="timer-seconds"
            type="number"
            min="0"
            max="59"
            value={value.seconds ?? ''}
            onChange={(e) => onChange({ ...value, seconds: Number(e.target.value) })}
            className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>
      </div>
      <p className="text-xs text-brown-400">Set the countdown duration, e.g. 25 minutes for a pomodoro.</p>
    </div>
  );
}
