import LocationAutocomplete from '../../components/LocationAutocomplete';

export default function PrecipitationForecastConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="precipitation_forecast-city" className="block text-sm text-brown-600 mb-1">
          City
        </label>
        <LocationAutocomplete
          id="precipitation_forecast-city"
          value={value.city || ''}
          onChange={(city) => onChange({ ...value, city })}
          placeholder="e.g. Cotonou"
        />
      </div>
      <div>
        <label htmlFor="precipitation_forecast-days" className="block text-sm text-brown-600 mb-1">
          Days
        </label>
        <input
          id="precipitation_forecast-days"
          type="number"
          min="1"
          max="5"
          value={value.days || ''}
          onChange={(e) => onChange({ ...value, days: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
