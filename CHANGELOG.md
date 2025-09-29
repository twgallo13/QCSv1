# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [QCSv1.rel.v1.24.1] - 2025-09-29

### Added
- CONTRIBUTING.md with PR template reference, docs-only fast lane, and branch hygiene ([#9](https://github.com/twgallo13/QCSv1/pull/9)).

### Changed
- Enhanced Lisa process guardrails; added comprehensive PR template with process hygiene checklist.
- Reconciled `context/branches.md` statuses (mark `feat/api-cents-boundary` merged; correct `fix/docs-and-port-check` row).

### Fixed
- API default port changed from 3000 → 4000; Web proxy updated to target API :4000.

## [QCSv1.rel.v1.24.0] - 2025-09-28

### Added
- Money normalization helpers and schema utilities
- DTO validation with manual runtime validators
- API endpoints for rate cards and quote preview/management
- Web quotes list and detail pages
- Integration tests for API endpoints
- Comprehensive project documentation structure

### Changed
- API architecture with cents-based money handling
- Request boundary normalization for monetary values
- Development workflow with enhanced process documentation

### Fixed
- TypeScript configuration for API workspace
- VS Code diagnostics and editor settings

### Infrastructure
- Added workspace configuration and build scripts
- Enhanced development runner with port management
- Comprehensive CI/CD setup with GitHub Actions

## [QCSv1.ops.v1.20.0-reconcile-20250927070129] - 2025-09-27

### Infrastructure
- Operational reconciliation and system stabilization
- Repository structure optimization

---

## Legend

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Fixed**: Bug fixes
- **Removed**: Removed features
- **Deprecated**: Soon-to-be removed features
- **Security**: Vulnerability fixes

## PR References

- [#1](https://github.com/twgallo13/QCSv1/pull/1) - feat(api): normalize money to cents at request boundary + tests
- [#5](https://github.com/twgallo13/QCSv1/pull/5) - docs: register fix/api-port branch and log PR
- [#6](https://github.com/twgallo13/QCSv1/pull/6) - fix(api): default API to port 4000 for dev
- [#7](https://github.com/twgallo13/QCSv1/pull/7) - docs(api): align README to API :4000 and verify code default
- [#8](https://github.com/twgallo13/QCSv1/pull/8) - fix: change API default port from 3000 to 4000
- [#9](https://github.com/twgallo13/QCSv1/pull/9) - docs: add CONTRIBUTING.md placeholder

## Active Branches

- `feat/api-cents-boundary` - Money normalization and API enhancements (Open)
