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
- Astro's production asset build passes against the local Tina schema.
- Generated application JavaScript gzip total is 395,855 bytes, compared with 724,545 bytes from a clean Node 24 build of the merge-base: approximately 45% smaller. This is an asset-size comparison, not a browser latency measurement.

The application asset build is diagnostic validation only, not approval to deploy. It does not replace the full TinaCloud build gate.

## Production blocker

The complete `npm run build` fails TinaCloud's schema check:

- Local GraphQL version: 3.0.0.
- Indexed TinaCloud GraphQL version: 2.4.7.
- Reported difference: non-breaking addition of the `RichText` type.

The public code repository and TinaCloud's content repository are separate. The matching generated Tina schema must be coordinated with the content project and indexed before this upgrade can be deployed. Do not skip cloud checks or change the content branch merely to make the build pass. No production push has been made from this branch.

## Next steps

1. Coordinate the GraphQL schema upgrade with the TinaCloud content repository.
2. Rerun the complete production build with cloud checks enabled.
3. Rerun browser checks and performance budgets before release.
4. Investigate remaining transitive advisories without incompatible blanket overrides.
