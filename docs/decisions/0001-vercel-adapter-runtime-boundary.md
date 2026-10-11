# Decision 0001. Pin the Vercel adapter to 11.0.12

Date: 2026-10-11
Branch: `chore/vercel-adapter-11-0-12`
Status: Accepted. Local tests, review, and Vercel preview pass. The user approved the production release.

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

## Preview result

Plannotator approved the change with no further requests after we simplified this note. Commit `58c3ef6` removes the patch and pins the adapter.

The Linux-built preview is https://shelf-3hoymdsqw-handshous-projects.vercel.app. Its homepage, blog, projects, travels, Hanoi, Jordan, and admin return HTTP 200. Uploads without login return HTTP 401. Chrome checks pass for page and admin startup and the back button after it loads. The checked runtime logs contain no errors.

The first upload failed with `Not authorized` despite read access to the project. Renewing the CLI login allowed the same source to deploy. This did not change production.

The preview uses TinaCloud `main`. No content, schema, or production settings changed. After these checks passed, the user approved merging this branch and releasing adapter 11.0.12.

## Rollback

If the 11.0.12 release fails, revert this change to restore the working 11.0.13 patch from `9239a78`. Check the resulting deployment. The Tina content and schema need no rollback because this change does not touch them.

## References

- [Astro's includeFiles setting](https://docs.astro.build/en/guides/integrations-guide/vercel/#includefiles)
- [Vercel's explanation of file tracing](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions)
- [Tina's build order and environment settings](https://tina.io/docs/tinacloud/deployment-options/vercel)
- [Shelf's upgrade and patch history](../dependency-security-upgrade.md)
