import { useEffect, useState } from 'react';

// Tailwind's `lg` breakpoint: the desktop layout (fixed sidebar, free-form widget canvas) starts
// here; below it the sidebar becomes a drawer and widgets stack in a flowing grid.
export const DESKTOP_QUERY = '(min-width: 1024px)';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
