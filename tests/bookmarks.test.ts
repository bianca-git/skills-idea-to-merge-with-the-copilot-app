import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  parseStored,
  formatBookmark,
  addBookmark,
  generateSlug,
} from '../src/lib/bookmarks.ts';

test('URL with and without https:// normalises to the same value', () => {
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com');
  assert.equal(normalizeUrl('https://www.example.com'), normalizeUrl('www.example.com'));
  assert.equal(normalizeUrl('  https://www.example.com/  '), 'https://www.example.com');
});

test('invalid URLs are rejected', () => {
  for (const bad of ['', '   ', 'not a url', 'javascript:alert(1)', 'ftp://x.com', null, 5]) {
    assert.equal(normalizeUrl(bad), null);
  }
});

test('parseStored recovers from empty, corrupted, legacy and non-array values', () => {
  assert.deepEqual(parseStored(null), []);
  assert.deepEqual(parseStored(''), []);
  assert.deepEqual(parseStored('{not json'), []);
  assert.deepEqual(parseStored('{"url":"a.com","slug":"mona-1"}'), []);
  assert.deepEqual(parseStored('"hello"'), []);
  assert.deepEqual(parseStored('null'), []);
  assert.deepEqual(parseStored('["a.com","b.com"]'), []);
  assert.deepEqual(parseStored('[null, 1, {"url":1,"slug":"mona-ab"}, {"url":"a.com"}]'), []);
});

test('parseStored keeps valid entries and drops malformed ones', () => {
  const raw = JSON.stringify([
    { url: 'example.com', slug: 'mona-7fk2' },
    { url: 'javascript:alert(1)', slug: 'mona-aaaa' },
    { url: 'b.com', slug: 'bad-slug' },
    { url: 'c.com', slug: 'mona-7fk2' },
  ]);
  assert.deepEqual(parseStored(raw), [{ url: 'https://example.com', slug: 'mona-7fk2' }]);
});

test('bookmark formats as "<url> :: <slug>"', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});

test('addBookmark generates unique mona- base62 slugs', () => {
  let list: ReturnType<typeof parseStored> = [];
  for (let i = 0; i < 50; i++) list = addBookmark(list, `site${i}.com`)!;
  assert.equal(new Set(list.map((b) => b.slug)).size, 50);
  assert.match(generateSlug(), /^mona-[0-9a-zA-Z]{4}$/);
  assert.equal(addBookmark(list, 'nope nope'), null);
});
