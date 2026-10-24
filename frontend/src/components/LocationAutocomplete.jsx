import { useEffect, useRef, useState } from 'react';
import { autocompletePlaces } from '../api/places';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

// A plain text field that suggests real place names as the user types, backed by the same
// key-less geocoding service the weather/maps widgets already resolve cities through server-side.
// Suggestions are only a head start: the field still accepts anything typed or pasted, since the
// server-side geocoder is happy to resolve a name it never suggested here.
export default function LocationAutocomplete({ id, value, onChange, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      autocompletePlaces(query)
        .then((results) => {
          if (!cancelled) setSuggestions(results);
        })
        .catch(() => {
          // Autocomplete is a convenience, not a requirement — a failed lookup just means no
          // suggestions this time, the field itself keeps working.
          if (!cancelled) setSuggestions([]);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-brown-200 bg-white shadow-lg">
          {suggestions.map((place) => (
            <li key={`${place.lat},${place.lon}`}>
              <button
                type="button"
                onClick={() => {
                  onChange(place.label);
                  setSuggestions([]);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-brown-700 hover:bg-brown-600/10"
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
