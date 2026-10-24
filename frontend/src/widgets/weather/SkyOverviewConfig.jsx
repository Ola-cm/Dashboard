import LocationAutocomplete from '../../components/LocationAutocomplete';

export default function SkyOverviewConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="sky_overview-city" className="block text-sm text-brown-600 mb-1">
        City
      </label>
      <LocationAutocomplete
        id="sky_overview-city"
        value={value.city || ''}
        onChange={(city) => onChange({ ...value, city })}
        placeholder="e.g. Cotonou"
      />
    </div>
  );
}
