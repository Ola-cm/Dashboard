// Pulls the "who is this site" information out of a page's HTML — the same tags search engines and
// link previews read (Open Graph, Twitter cards, standard <meta>, favicons). Only the <head> matters
// and the tags are simple, so a small tolerant parser avoids a full HTML parser dependency.

// The named entities that actually show up in titles and descriptions (accents in French pages,
// typographic quotes and dashes); numeric entities are decoded generically below.
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â', aacute: 'á',
  ccedil: 'ç', icirc: 'î', iuml: 'ï', iacute: 'í', ocirc: 'ô', oacute: 'ó', ouml: 'ö',
  ugrave: 'ù', ucirc: 'û', uuml: 'ü', uacute: 'ú', ntilde: 'ñ', szlig: 'ß',
  Eacute: 'É', Egrave: 'È', Agrave: 'À', Ccedil: 'Ç',
  rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', laquo: '«', raquo: '»',
  ndash: '\u2013', mdash: '\u2014', hellip: '\u2026', copy: '©', reg: '®', trade: '™',
};

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return ENTITIES[code] ?? ENTITIES[code.toLowerCase()] ?? match;
  });
}

function clean(text) {
  return text ? decodeEntities(text).replace(/\s+/g, ' ').trim() : null;
}

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match;
  while ((match = pattern.exec(tag)) !== null) {
    attributes[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? '';
  }
  return attributes;
}

function tags(html, name) {
  return (html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || []).map(parseAttributes);
}

function absolute(href, baseUrl) {
  if (!href) return null;
  try {
    const url = new URL(href, baseUrl);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function parsePageMeta(html, baseUrl) {
  const head = (html.match(/<head\b[\s\S]*?<\/head>/i) || [html])[0];

  const meta = {};
  for (const attrs of tags(head, 'meta')) {
    const key = (attrs.property || attrs.name || attrs.itemprop || '').toLowerCase();
    if (key && attrs.content !== undefined && meta[key] === undefined) {
      meta[key] = attrs.content;
    }
  }

  const icons = tags(head, 'link').filter((attrs) =>
    (attrs.rel || '').toLowerCase().split(/\s+/).some((rel) => rel === 'icon' || rel === 'apple-touch-icon'),
  );
  // Prefer the largest declared icon; fall back to the conventional /favicon.ico.
  const bestIcon = icons.sort((a, b) => parseInt(b.sizes, 10) - parseInt(a.sizes, 10) || 0)[0];

  const title = (head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const lang = ((html.match(/<html\b[^>]*>/i) || [''])[0].match(/\blang\s*=\s*["']?([a-zA-Z-]+)/) || [])[1];

  return {
    siteName: clean(meta['og:site_name'] || meta['application-name']),
    title: clean(meta['og:title'] || meta['twitter:title'] || title),
    description: clean(meta['og:description'] || meta.description || meta['twitter:description']),
    imageUrl: absolute(meta['og:image'] || meta['twitter:image'], baseUrl),
    iconUrl: absolute(bestIcon?.href, baseUrl) || absolute('/favicon.ico', baseUrl),
    language: lang || meta['og:locale'] || null,
  };
}

module.exports = { parsePageMeta, decodeEntities };
