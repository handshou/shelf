# Decision 0001. Pin the Vercel adapter to 11.0.12

Date: 2026-10-11
Branch: `chore/vercel-adapter-11-0-12`
Status: Local tests pass. Review and preview approval are pending. Production remains at `9239a78`.

## Reason

Adapter 11.0.13 crashed when Shelf's server loaded Rolldown without its native file. Our patch fixed production by separating the routing constants from the build code.

[Astro issue 18328](https://github.com/withastro/astro/issues/18328) reports the same crash and says 11.0.12 works. Pinning that published version would let us delete our patch and installation script. The issue's experimental fix did not work for the reporter, so we will not use it.

The latest published version we checked was 11.0.13. We can keep our working patch while testing 11.0.12. Astro also documents `includeFiles`, but adding Rolldown's native file would leave the server loading a build tool.

## Change

Pin `@astrojs/vercel` to 11.0.12. Delete the patch file, patching script, `postinstall` command, and four tests for that script. Keep the test that starts the copied server and checks its responses.

Astro 7, Tina, Node 24, the Tina schema checks, and the security overrides stay unchanged. Any later adapter update must pass the same server and preview checks.

## Evidence

A clean install and full TinaCloud `main` build pass. The copied server starts without Rolldown, serves the homepage with HTTP 200, and rejects an upload without login with HTTP 401.

Lint, typecheck, 17 unit tests, 17 Chrome tests, and the navigation benchmark pass. Typecheck reports zero errors and warnings. The first browser attempts had launcher problems. After fixing the launcher, the unchanged tests passed in 19.1 seconds.

The audit still reports 29 entries. Both versions have zero critical, 16 high, 10 moderate, and three low. The candidate adds no advisory IDs.

Application JavaScript stays at 395,855 gzip bytes. Its limit is 724,545 bytes from `b65be64d8a83fae363705f20c2c7a4844fe8fbbf`. The navigation baseline stays at `60786be7f82b6dcebe451d136549d4dd469682ee`.

The server package grows from 35,388,934 to 35,487,470 bytes. That adds 98,536 bytes, about 0.28%. We have not measured the effect on startup time.

## Before release

Review the change in Plannotator and test a Linux-built Vercel preview. Check the public pages, admin, interactive components, and upload rejection. Ask for production approval after those checks pass.

## Rollback

Keep production at `9239a78` during the test. If we release 11.0.12 and find a problem, revert this change to restore the working 11.0.13 patch. The Tina content and schema need no rollback because this change does not touch them.

## References

- [Astro's includeFiles setting](https://docs.astro.build/en/guides/integrations-guide/vercel/#includefiles)
- [Vercel's explanation of file tracing](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions)
- [Tina's build order and environment settings](https://tina.io/docs/tinacloud/deployment-options/vercel)
- [Shelf's upgrade and patch history](../dependency-security-upgrade.md)
