import LocationAutocomplete from '../../components/LocationAutocomplete';

export default function CyclingRouteConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="cycling_route-origin" className="block text-sm text-brown-600 mb-1">
          Origin
        </label>
        <LocationAutocomplete
          id="cycling_route-origin"
          value={value.origin || ''}
          onChange={(origin) => onChange({ ...value, origin })}
          placeholder="e.g. Paris"
        />
      </div>
      <div>
        <label htmlFor="cycling_route-destination" className="block text-sm text-brown-600 mb-1">
          Destination
        </label>
        <LocationAutocomplete
          id="cycling_route-destination"
          value={value.destination || ''}
          onChange={(destination) => onChange({ ...value, destination })}
          placeholder="e.g. Versailles"
        />
      </div>
    </div>
  );
}
