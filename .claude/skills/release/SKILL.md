---
name: release
description: Prepare a release of the project (version bump, footer version, README, checks, pull request). Use when asked to release, publish or bump the version.
---

# Release

Follow `docs/runbooks/release.md`:

1. Ask which bump (patch, minor, major) if not given; default to patch.
2. Run `npm test` and `npm run build`; stop if either fails.
3. `npm version <bump> --no-git-tag-version`.
4. Update `VERSION` in `lib/site.ts`; the footer and `softwareVersion` in `lib/seo.ts` read it. Keep the Beta label while the project is in beta.
5. Update README badges and Technology Stack versions if dependencies changed.
6. Commit `Release vX.Y.Z` on a `release/vX.Y.Z` branch with a short changelog table in the body (Change | Area) and open a pull request to `main`.
7. After the deploy, verify production: both themes, both languages, `/robots.txt`, `/sitemap.xml`, `/llms.txt`.
