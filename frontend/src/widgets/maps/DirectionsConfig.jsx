import LocationAutocomplete from '../../components/LocationAutocomplete';

export default function DirectionsConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="directions-origin" className="block text-sm text-brown-600 mb-1">
          Origin
        </label>
        <LocationAutocomplete
          id="directions-origin"
          value={value.origin || ''}
          onChange={(origin) => onChange({ ...value, origin })}
          placeholder="e.g. Paris"
        />
      </div>
      <div>
        <label htmlFor="directions-destination" className="block text-sm text-brown-600 mb-1">
          Destination
        </label>
        <LocationAutocomplete
          id="directions-destination"
          value={value.destination || ''}
          onChange={(destination) => onChange({ ...value, destination })}
          placeholder="e.g. Lyon"
        />
      </div>
    </div>
  );
}
