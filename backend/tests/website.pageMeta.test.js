const { parsePageMeta, decodeEntities } = require('../src/services/website/pageMeta');

describe('website pageMeta', () => {
  it('reads Open Graph data first, resolving relative URLs', () => {
    const html = `<!doctype html><html lang="fr"><head>
      <title>Plain title</title>
      <meta name="description" content="Plain description">
      <meta property="og:site_name" content="Example">
      <meta property="og:title" content="OG title">
      <meta content="OG description" property="og:description">
      <meta property='og:image' content='/img/share.png'>
      <link rel="icon" href="/favicon-16.png" sizes="16x16">
      <link rel="icon" href="/favicon-64.png" sizes="64x64">
    </head><body><meta property="og:title" content="ignored, outside head"></body></html>`;

    expect(parsePageMeta(html, 'https://example.com/page')).toEqual({
      siteName: 'Example',
      title: 'OG title',
      description: 'OG description',
      imageUrl: 'https://example.com/img/share.png',
      iconUrl: 'https://example.com/favicon-64.png',
      language: 'fr',
    });
  });

  it('falls back to the standard tags and to /favicon.ico', () => {
    const html = '<html><head><title>  Just   a title </title><meta name="description" content="Desc"></head></html>';

    expect(parsePageMeta(html, 'https://example.org/')).toMatchObject({
      siteName: null,
      title: 'Just a title',
      description: 'Desc',
      imageUrl: null,
      iconUrl: 'https://example.org/favicon.ico',
    });
  });

  it('decodes HTML entities', () => {
    expect(decodeEntities('Tom &amp; Jerry &#8212; l&#x27;&eacute;cole &laquo;ok&raquo; &Eacute;t&eacute;')).toBe(
      'Tom & Jerry — l\'école «ok» Été',
    );
  });

  it('ignores image URLs with a non-http scheme', () => {
    const html = '<head><meta property="og:image" content="javascript:alert(1)"></head>';

    expect(parsePageMeta(html, 'https://example.com/').imageUrl).toBeNull();
  });
});
