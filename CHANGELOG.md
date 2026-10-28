# Changelog

## v1.0.0

### Added

- Save bookmarks by entering a URL, with or without the `https://` scheme.
- Normalize valid HTTP(S) URLs and generate a unique, short `mona-` base62 slug for each bookmark.
- Display each saved URL with its slug, and provide a control to copy the slug.
- Persist bookmarks in browser `localStorage` and restore them when the app loads.
- Validate stored data and recover safely from empty, malformed, legacy, or non-array values.
- Clear all saved bookmarks with confirmation.
- Add unit tests for URL normalization, storage recovery, and bookmark formatting.
