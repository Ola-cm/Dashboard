import LocationAutocomplete from '../../components/LocationAutocomplete';

export default function PlaceLookupConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="place_lookup-query" className="block text-sm text-brown-600 mb-1">
        City or town
      </label>
      <LocationAutocomplete
        id="place_lookup-query"
        value={value.query || ''}
        onChange={(query) => onChange({ ...value, query })}
        placeholder="e.g. Cotonou"
      />
    </div>
  );
}
