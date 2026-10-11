# shop-b: Saleor Dashboard on House

A bounded port of Saleor Dashboard at `8b0e4c9875779dd5395c243f50ab31abb0616c84`. It uses the actual Saleor sidebar, list/detail composition, cards, product tiles, forms, savebar and EditorJS renderer, adapted to the existing fictional poster Shop Room. Release 1 intentionally substitutes Saleor's native HTML Table for the original Glide Datagrid. Master authorized publishing this bounded first version on 2026-10-11 at 19:26 UTC; Glide Datagrid, ColumnPicker and fuller list workflows are follow-on work for this same App.

## Current workflows and limits

- Existing products: search, category filter, sort, pagination, table/tile views, scoped verified attachment thumbnails, product detail, durable native create/edit drafts for catalog fields and rich descriptions.
- Existing customers: search, sort, pagination, contacts/address detail, linked orders, native create/edit drafts.
- Existing orders: search/list/detail, customer and product links, stored line quantities and totals, draft changes to existing synthetic order status. No live payment, fulfillment or communication is connected.
- Categories: list/detail and native name drafts. Invoices: stored list/detail only. Reviews remain unchanged in the Room and available in Shop-a.
- Saleor variants, channels, warehouses, fulfillment groups, payments, discounts, extensions and translations are absent. Historic line prices and addresses are not invented. Product media is read-only. No full Saleor parity claim.

The shared Room is `r_19.z` (`/rooms/shop-port`), with its original 2,005 documents, 379 attachments and 496 image fields. This source contains no seed operation. The same manifest, schema, types and write slot `shop` are reused additively as a second App binding. No original document is rewritten by publication.

## Runtime and persistence

`src/house.ts` is the SDK-only House Runtime boundary; `src/store.ts` observes the complete typed local replica once. Route changes do not query an HTTP endpoint. House navigation uses memory history and bridge addresses. Business edits are structured native RoomDraft parts with exact opened bases and revision/CAS checks. Typing writes the draft. Explicit Save prepares that exact draft revision and locally queues a mutation. A save result is labeled queued; saved requires a later queue observation where that batch left the queue and no returned draft exists. Partial input, conflicts and returned drafts remain visible. Write-halted mode is a real queued state, not a fabricated successful remote write.

Room image reads verify scope, declared attachment bytes/hash and supported raster signature before creating a blob URL. Stored values are never directly assigned as external URLs. The production bundle has no REST client, analytics, external image/font source, browser storage dependency, service worker or route-lazy code.

## Source, attribution and theme

`vendor/saleor/` preserves exact original source files; `reports/donor-source-manifest.json` verifies their hashes against the pinned donor. Modified source is under `src/donor`. Copyright notices and full BSD-3-Clause, Macaw CC-BY-4.0 and contributing dependency licenses ship in `THIRD_PARTY_NOTICES.txt` and `LICENSE.txt`. The original react-admin MIT dataset/provider notices are retained. No endorsement is implied. Macaw styling is explicitly light, with paired foreground/background corrections and local system fonts; OS dark preference does not independently recolor text.

## Checks

Use Node 24.21 and the shared `../../porting-heavy-build.lock` for heavy gates. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run release:check`, and `npm run test:startup`. Dependency install uses the existing pinned lock and `--legacy-peer-deps` for the donor's React Intl 5/TypeScript peer mismatch; it is not a security exception.

The startup gate executes the real production bundle with the official House SDK test host, denial-throwing opaque-origin storage, both OS light/dark preferences and no network APIs. It verifies one observed replica, local SPA navigation and native draft typing/reopen. These checks do not establish hosted browser acceptance. Root owns actual browser QA; acceptance remains unclaimed until that separate check.
