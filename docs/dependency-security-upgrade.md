# Dependency security upgrade

Branch: `chore/dependency-security`
Merge-base: `b65be64d8a83fae363705f20c2c7a4844fe8fbbf`

## Changes

- Astro 6.4.8 to 7.3.8, with matching React, MDX, and Vercel integrations.
- TinaCMS 3.10.0 to 3.14.3 and Tina CLI 2.5.3 to 4.0.1.
- Tina auth 1.1.3 to 1.1.5 and Cloudinary media adapter 27.0.0 to 27.0.5.
- Sharp 0.33.5 to 0.35.5 and current Tailwind/Sass patches.
- Remove the old Vite overrides. Astro uses Vite 8; Tina CLI uses Vite 7. Vite 4 is gone.
- Scope same-major security overrides to Multer 2.4 under the Cloudinary adapter and path-to-regexp 6.3 under Vercel routing utilities.
- Align supported Node versions with Astro and Tina CLI: Node 22.12+ or Node 24. Validation used Node 24; `.nvmrc` selects Node 24.
- Keep Astro's previous HTML whitespace behavior explicitly.
- Correct malformed and nested document markup exposed by Astro 7's stricter compiler.
- Keep the supervised Astro dev process in the foreground so Tina's local GraphQL server remains alive under agent execution.

No photo-metadata features were added. The stashed travel-gallery ideas remain separate.

## Audit outcome

Before: 70 vulnerable package entries, including 6 critical.
After: 29 vulnerable package entries: 0 critical, 16 high, 10 moderate, 3 low.

These counts include dependency propagation and are not counts of distinct exploitable vulnerabilities. Remaining advisories need upstream fixes or separate compatibility work. No forced audit fixes, React-major overrides, or blanket suppression were used. Tina's React Final Form 6 dependency still declares a React 18 peer range; the root application remains on React 19.

## Validation

- Biome lint and Astro typecheck pass.
- All 17 unit tests pass, including serialized Tina configuration preservation.
- All 17 Chrome browser tests pass, including local-admin initialization. Firefox and WebKit were not revalidated in this pass.
- The existing pinned navigation benchmark passes without changing its baseline.
- Full production builds pass against both the temporary content schema branch and TinaCloud `main`, with cloud checks enabled.
- Generated application JavaScript gzip total is 395,855 bytes, compared with 724,545 bytes from a clean Node 24 build of the merge-base: approximately 45% smaller. This is an asset-size comparison, not a browser latency measurement.

## TinaCloud schema migration

The initial production build was correctly blocked because the new CLI generated GraphQL 3.0.0 while TinaCloud indexed 2.4.7. The new schema introduces the `RichText` scalar and uses it for existing rich-text fields.

The content repository's deployed schema was verified to match the previous public-code schema. Only `tina/tina-lock.json` was updated in `handshou/shelf-private`; collection definitions, editor configuration, and documents were unchanged.

The migration was first pushed to `chore/graphql-3-schema` and validated through a complete production build. Existing document and rich-text reads passed through both the legacy Tina 2.4 API and the Tina 3.0 API. The schema was then promoted to the content repository's `main` in commit `881bede` and a full production build against TinaCloud `main` passed. Existing public travel pages continued returning HTTP 200 during migration.

Cloud checks and performance baselines were not disabled or weakened. The full cloud-validated build retained the same 395,855-byte application JavaScript gzip total.

## Next steps

1. Release the reviewed code upgrade and verify the Vercel production deployment.
2. Smoke-test public pages, admin delivery, and unauthenticated upload rejection.
3. Investigate remaining transitive advisories without incompatible blanket overrides.
