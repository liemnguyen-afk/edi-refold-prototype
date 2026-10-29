# EDI 855 Order Confirmations via Refold — clickable HTML prototype

A static, clickable prototype of the **EDI Integration** flow: admins create supplier-specific mappings that turn EDI 855 (PO Acknowledgment) files into Coupa order confirmations, test them, and manage them.

Design source: Figma page [🟢 EDI Flow (10-28-2026)](https://www.figma.com/design/bY5gXB45SnlXQjqclWsMwr/EDI_-Onboarding--Copy-?node-id=2082-25031). Requirements: Confluence [Supporting EDI-855 Integrations with Refold](https://coupadev.atlassian.net/wiki/spaces/PM/pages/17408065648).

**▶ View the live prototype: https://liemnguyen-afk.github.io/edi-refold-prototype/**

To run it locally, open [`index.html`](index.html). No build step: plain HTML, CSS and JavaScript. It opens on the classic **Setup** page.

## Flow

| Screen | Route | What you can do |
| --- | --- | --- |
| A0 · Setup › Integrations | `#/setup` | Classic Setup page. **EDI Mappings** (under Integrations, outlined) opens the full-screen EDI Integration page. Other links are not part of this flow. |
| A1 · EDI Mappings — zero state | `#/mappings` | Shown when there are no mappings. **Create mapping** starts the wizard. |
| Create Mapping · Details and Upload | `#/create/details` | Mapping Policy Name and the EDI file upload are both required (Next shows an inline error under each one that's missing). **Supplier** is a searchable multi-select (checkbox list; the field reads *Search Suppliers* while open); chips can be removed; empty means *Any*. **Upload File** (or drag and drop, or *use a sample file*) shows the uploaded-file row with delete. Pick a mapping template. |
| Mapping — parsing | `#/create/connecting` | “Parsing the EDI file...” loader; moves on after ~1.5 s. |
| Field Mappings | `#/create/fields` | OrderConfirmation mappings table. Row actions **Flag for review** (toggles), **Edit mapping** (source field, data type, transformation), **Delete mapping** (with Undo). **Add mapping** adds a row. **Save as Draft** saves and returns to the list. **Test Mapping** shows a spinner, then the result. |
| Tested Mappings | `#/create/tested` | By default the first test **fails** (Errors found table → **Back to Field Mappings**) and the next one **succeeds** (summary with **Download CSV**, which downloads a real sample CSV → **Save and Activate**). Change this in the Prototype menu. Each wizard test is also logged in Test Transformations. |
| A5 · EDI Mappings — list | `#/mappings` | Success banner after publishing. Search; **Filter** by status; **EDI document type** (855 only). Row actions with tooltips: **Edit Mapping** (opens the wizard at Field Mappings), **Active / Inactive Mapping** toggle (updates Status), **Delete Mapping** (confirmation, warns if the mapping is active, Undo), **Test Mapping** (opens New test with that policy). The Mapping Policy ID link also edits. |
| B2 · Test Transformations | `#/tests` | Zero state when there are no runs: with no mappings yet it says *create a mapping before running a test* and **Create Mapping** opens the wizard (Figma `2082:56469`); once mappings exist it offers **New Test**. **New test** → upload (or sample) + pick a mapping policy → **Run test**; the row goes Queued → Transforming → Succeeded (file names containing *bad* or *fail* fail). Search, status filter, **View run** (details, error reason when failed), **Download CSV** (succeeded runs only). |

## Prototype menu

The **Prototype ▾** button (bottom left) is a reviewer tool, not product UI:

- Jump to any screen or state (zero states, sample-data lists, each wizard step, errors vs. success).
- **Test Mapping result**: *Fail first, then pass* (default), *Always pass*, *Always fail*.
- **Reset prototype (empty tenant)** clears everything saved in `localStorage` (`edi.state`).

## Files

| File | Contents |
| --- | --- |
| `index.html` | Page shell |
| `css/clarity-tokens.css` | Clarity tokens (Clarity MCP registry + 200-Tokens-DLS-C2L Core collection) |
| `css/styles.css` | Styles; every colour, spacing and radius uses a token. The classic Setup page and Coupa global header keep their legacy literals, scoped to `.classic` / `--hdr-*`. |
| `js/data.js` | Sample suppliers, mappings, test runs, field mappings, Setup links |
| `js/app.js` | Router, state, views and actions |

## Not built

Pagination (single page of sample data), the EDI document type switcher (only 855 exists), real Refold/SFTP calls, and the Activity Log / SCC screens from the earlier concept page.
