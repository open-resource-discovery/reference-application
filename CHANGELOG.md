# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.1] - 2026-09-12

### Changed

- Update runtime and development dependencies to compatible current versions.
- Move the minimum supported runtime to Node.js 26.
- Replace Jest, ESLint, and Prettier with the Node.js test runner and Biome.
- Update the CI workflow to current GitHub Actions with read-only permissions.
- Align the example ORD, OpenAPI, and AsyncAPI metadata with the `sap:core:v1` ruleset.

### Fixed

- Allow `PUBLIC_URL` to target a local instance so crawls do not mix local and deployed resource definitions.

## [1.0.0]

### Added

- Initial release
