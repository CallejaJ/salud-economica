# Release Runbook

| Step | Command or action |
|---|---|
| 1. Check | `npm test && npm run build` |
| 2. Bump version | `npm version patch|minor|major --no-git-tag-version` |
| 3. Version | Update `VERSION` in `lib/site.ts`; the footer and `softwareVersion` in `lib/seo.ts` read it |
| 4. README | Update badges, stack versions and features if they changed |
| 5. Commit | `Release vX.Y.Z` |
| 6. Pull request | Push a `release/vX.Y.Z` branch, open a pull request to `main` and wait for CI |
| 7. Deploy | After Jorge merges, Vercel deploys `main` automatically |
| 8. Verify | Open the production URL in both themes and both languages; check `/robots.txt`, `/sitemap.xml`, `/llms.txt` |
