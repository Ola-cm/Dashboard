import LocationAutocomplete from '../../components/LocationAutocomplete';

export default function CityTemperatureConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="city_temperature-city" className="block text-sm text-brown-600 mb-1">
        City
      </label>
      <LocationAutocomplete
        id="city_temperature-city"
        value={value.city || ''}
        onChange={(city) => onChange({ ...value, city })}
        placeholder="e.g. Cotonou"
      />
    </div>
  );
}
