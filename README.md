# Shop B

A local-first shop administration App for products, categories, customers, orders and invoices stored in a House Room. Edits use native drafts and explicit saves. No live payment, email or fulfillment service is connected.

## Build and publish

Use Node.js 24.21 or later and `npm ci`. Run `npm run verify` for type checking, lint, regression tests, build, release and startup checks. `npm run publish` requires a clean committed `main` branch and a House App HTTPS `origin`; it verifies the exact source, then atomically publishes source and a parentless release.

The tracked `.npmrc` sets `legacy-peer-deps=true`, matching the pinned donor dependency tree in `package-lock.json`. Saleor's retained Material UI 4 components declare React 16/17 peers, while this App uses React 18; its retained react-intl 5 dependencies also declare older TypeScript peers. This project-local setting makes plain `npm ci` reproducible without user/global npm configuration or changing the lockfile. Keep the full verification gate: this setting does not establish compatibility by itself. Remove it only as part of a tested donor dependency migration.

`starter/` contains one existing category, product and fictional customer. Image fields are omitted because Template starters are text-only. Missing media uses a plain placeholder. Both Shop siblings share the same schema and starter documents.

License texts and required attribution are retained in the repository and generated release notices.
