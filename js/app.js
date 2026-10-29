/* EDI 855 via Refold — clickable prototype.
 * Single page, hash-routed. Every screen maps to a frame on the Figma page
 * "🟢 EDI Flow (10-28-2026)" (file bY5gXB45SnlXQjqclWsMwr, node 2082:25031). */

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const $app = document.getElementById('app');

/* ---------------------------------------------------------------- Icons (Clarity 201-Icons, outline set) */
const svg = (d, s = 20, extra = '') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const I = {
  close: s => svg('<path d="M6 6l12 12M18 6L6 18"/>', s),
  plusCircle: s => svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>', s),
  plus: s => svg('<path d="M12 5v14M5 12h14"/>', s),
  search: s => svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>', s),
  filter: s => svg('<path d="M4 7h16M7 12h10M10 17h4"/>', s),
  caret: s => svg('<path d="M7 10l5 5 5-5"/>', s),
  edit: s => svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>', s),
  trash: s => svg('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13M10 11v6M14 11v6"/>', s),
  flask: s => svg('<path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 001.3 2h11.4A1.5 1.5 0 0019 19l-5-10V3"/><path d="M7.5 15h9"/>', s),
  toggleOn: s => svg('<rect x="2.5" y="7" width="19" height="10" rx="5" fill="currentColor"/><circle cx="16.5" cy="12" r="3" fill="#fff" stroke="none"/>', s),
  toggleOff: s => svg('<rect x="2.5" y="7" width="19" height="10" rx="5"/><circle cx="7.5" cy="12" r="2.5"/>', s),
  flag: s => svg('<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>', s),
  eye: s => svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>', s),
  download: s => svg('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>', s),
  upload: s => svg('<path d="M12 16V4M7.5 8.5L12 4l4.5 4.5M5 19h14"/>', s),
  fileAdd: s => svg('<path d="M14 3H6.5A1.5 1.5 0 005 4.5v15A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5V8z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>', s),
  file: s => svg('<path d="M14 3H6.5A1.5 1.5 0 005 4.5v15A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h5"/>', s),
  check: s => svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', s, 'stroke-width="2.4"'),
  checkCircle: s => svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.8"/>', s),
  alert: s => svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>', s),
  database: s => svg('<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>', s),
  mapping: s => svg('<rect x="2.5" y="7" width="19" height="10" rx="5"/><circle cx="16.5" cy="12" r="2.5" fill="currentColor"/>', s),
  clipboard: s => svg('<rect x="5" y="4.5" width="14" height="16" rx="1.5"/><path d="M9 4.5V3h6v1.5M8.5 13l2.5 2.5 4.5-5"/>', s),
  first: s => svg('<path d="M7 6v12M17 6l-6 6 6 6"/>', s),
  prev: s => svg('<path d="M15 6l-6 6 6 6"/>', s),
  next: s => svg('<path d="M9 6l6 6-6 6"/>', s),
  last: s => svg('<path d="M17 6v12M7 6l6 6-6 6"/>', s),
};

/* ---------------------------------------------------------------- State
 * Persisted under localStorage "edi.*" so a reviewer can reload mid-flow. */
const STORE_KEY = 'edi.state';
const today = () => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`; };
const nowTime = () => { const d = new Date(); return `Today ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

const freshWizard = () => ({ mode: 'create', editId: null, name: '', suppliers: [], file: null, template: 'default',
  fields: clone(FIELD_MAPPINGS), testAttempts: 0, result: null, testRun: null, nameError: false });

function defaultState() {
  return { mappings: [], tests: [], wizard: freshWizard(), testBehavior: 'fail-then-pass' };
}
let S = (() => { try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORE_KEY)) }; } catch { return defaultState(); } })();
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(S));

// Ephemeral UI state (not persisted)
const U = { supPop: null, search: '', statusFilter: [], filterOpen: false, testSearch: '', testFilter: [], testFilterOpen: false,
  msOpen: false, msQuery: '', drag: false, testing: false, toast: null, modal: null };

let toastTimer;
function toast(msg, kind = 'positive', undo = null) {
  U.toast = { msg, kind, undo };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { U.toast = null; render(); }, 7000);
}

/* ---------------------------------------------------------------- Router */
const ROUTES = ['setup', 'mappings', 'create/details', 'create/connecting', 'create/fields', 'create/tested', 'tests'];
const route = () => { const r = location.hash.replace(/^#\/?/, ''); return ROUTES.includes(r) ? r : 'setup'; };
const go = r => { if (location.hash === '#/' + r) render(); else location.hash = '#/' + r; };
window.addEventListener('hashchange', () => { U.msOpen = false; U.filterOpen = false; U.testFilterOpen = false; render(); window.scrollTo(0, 0); });

/* ---------------------------------------------------------------- Shared pieces */
const CHIP_KIND = { Active: 'positive', Inactive: 'warning', Draft: '', Succeeded: 'positive', Failed: 'critical', Transforming: 'info', Queued: '',
  datetime: 'info', string: 'info', integer: 'info', decimal: 'info', boolean: 'info', 'Unmapped': '', 'Direct copy': 'primary', 'Date arithmetic': 'primary', 'Lookup table': 'primary', 'Concatenate': 'primary' };
const chip = (label, kind = CHIP_KIND[label] ?? '') => `<span class="chip ${kind}">${esc(label)}</span>`;
const iconBtn = (act, icon, tip, data = '', cls = '') => `<button type="button" class="icon-btn ${cls}" data-act="${act}" ${data} data-tip="${esc(tip)}" aria-label="${esc(tip)}">${icon}</button>`;

function topbar(title) {
  return `<header class="topbar">
    <img class="logo" src="assets/coupa-logo-blue.svg" alt="Coupa">
    <span class="title">${esc(title)}</span>
    <button class="close" data-act="close-shell" aria-label="Close">${I.close(22)}</button>
  </header>`;
}

function shell(active, body) {
  const item = (key, href, icon, label) => `<a href="#/${href}" class="${active === key ? 'active' : ''}" ${active === key ? 'aria-current="page"' : ''}>${icon}${label}</a>`;
  return `<div class="shell">
    ${topbar('EDI Integration')}
    <aside class="sidenav"><nav aria-label="EDI Integration">
      ${item('mappings', 'mappings', I.mapping(20), 'EDI Mappings')}
      ${item('tests', 'tests', I.clipboard(20), 'Test Transformations')}
    </nav></aside>
    <main class="main">${body}</main>
  </div>`;
}

function wizardShell(stepIdx, body, narrow) {
  const w = S.wizard;
  const labels = ['Details and Upload', 'Mapping', 'Save and Activate'];
  const steps = labels.map((l, i) => {
    const st = i < stepIdx ? 'done' : i === stepIdx ? 'current' : '';
    return `<div class="step ${st}" ${st === 'current' ? 'aria-current="step"' : ''}><span class="num">${i < stepIdx ? I.check(16) : i + 1}</span>${l}</div>`;
  }).join('');
  return `<div class="shell wizard">
    ${topbar(w.mode === 'edit' ? 'Edit Mapping' : 'Create Mapping')}
    <aside><div class="steps" aria-label="Progress">${steps}</div></aside>
    <main class="main"><div class="content ${narrow ? 'narrow' : ''}">${body}</div></main>
  </div>`;
}

function toastHtml() {
  if (!U.toast) return '';
  const t = U.toast;
  return `<div class="toast ${t.kind === 'neutral' ? 'neutral' : ''}" role="status">
    ${t.kind === 'positive' ? I.checkCircle(20) : ''}<span class="msg">${t.msg}</span>
    ${t.undo ? `<button type="button" class="btn btn-sm btn-outline" style="width:auto" data-act="undo">Undo</button>` : ''}
    <button type="button" data-act="dismiss-toast" aria-label="Dismiss">${I.close(18)}</button>
  </div>`;
}

const pagination = () => `<div class="pagination" aria-label="Pagination">
  <button class="pg" disabled aria-label="First page">${I.first(18)}</button><button class="pg" disabled aria-label="Previous page">${I.prev(18)}</button>
  <span>Page</span><span class="num">1</span><span>of 1</span>
  <button class="pg" disabled aria-label="Next page">${I.next(18)}</button><button class="pg" disabled aria-label="Last page">${I.last(18)}</button>
</div>`;

function filterPopover(open, act, values, selected) {
  if (!open) return '';
  return `<div class="filter-pop" data-pop>
    <h4>Status</h4>
    ${values.map(v => `<label><input type="checkbox" data-act="${act}" value="${esc(v)}" ${selected.includes(v) ? 'checked' : ''}> ${esc(v)}</label>`).join('')}
  </div>`;
}

/* ---------------------------------------------------------------- A0 · Setup › Integrations (classic) */
function viewSetup() {
  const nav = ['Travel & Expenses', 'Requests', 'Orders', 'Invoices', 'Community', 'Inventory', 'Sourcing', 'Suppliers', 'Items', 'Reports', 'Quality', 'Setup'];
  const sub = ['All Setup Items', 'Company Info', 'Accounts', 'Users', 'Approvals', 'Budget Periods', 'Budget Lines'];
  const box = ([title, links]) => `<section class="box"><h2>${esc(title)}</h2><ul>${links.map(l => l === 'EDI Mappings'
    ? `<li><a href="#/mappings" class="target">EDI Mappings</a></li>`
    : `<li><a href="#" data-stub>${esc(l)}</a></li>`).join('')}</ul></section>`;
  return `<div class="classic-page">
    <header class="gh">
      <div class="gh-top">
        <label class="gh-search"><input placeholder="What do you need?" aria-label="Search"><img src="assets/magnifying-glass.svg" width="18" height="18" alt=""></label>
        <div class="gh-right">
          <span class="gh-avatar">LN</span>
          <button class="gh-circle" data-stub aria-label="Notifications"><img src="assets/bell.svg" alt=""></button>
          <button class="gh-circle" data-stub aria-label="Cart"><img src="assets/cart.svg" alt=""><span class="badge">0</span></button>
        </div>
      </div>
      <nav class="gh-nav"><a class="home" href="#" data-stub aria-label="Home"><img src="assets/home.svg" alt=""></a>
        ${nav.map(l => `<a href="#" data-stub class="${l === 'Setup' ? 'selected' : ''}">${esc(l)}</a>`).join('')}</nav>
      <nav class="gh-subnav">${sub.map(l => `<a href="#" data-stub class="${l === 'All Setup Items' ? 'selected' : ''}">${esc(l)}</a>`).join('')}</nav>
    </header>
    <div class="classic">
      <h1>Setup</h1>
      <div class="finder">Find it fast! Use the Instant Filter <input aria-label="Instant filter"></div>
      <div class="cols">${SETUP_COLUMNS.map(col => `<div class="col">${col.map(box).join('')}</div>`).join('')}</div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- A1 / A5 · EDI Mappings */
function supplierLabel(ids) {
  if (!ids.length) return 'Any supplier';
  const s = SUPPLIERS.find(x => x.id === ids[0]);
  return `${s.name} (${s.id})${ids.length > 1 ? ` +${ids.length - 1}` : ''}`;
}

// All suppliers on a mapping as "Name (ID)" strings. Wizard-created mappings carry supplierIds;
// sample mappings carry `more` (merged from the seed so older saved data still shows it).
function mappingSuppliers(m) {
  if (m.supplierIds?.length) return m.supplierIds.map(id => SUPPLIERS.find(s => s.id === id)).filter(Boolean).map(s => `${s.name} (${s.id})`);
  const more = m.more || SEED_MAPPINGS.find(x => x.id === m.id)?.more || [];
  return [m.supplier, ...more];
}

function supplierCell(m) {
  const all = mappingSuppliers(m);
  if (all.length < 2) return esc(all[0] || 'Any supplier');
  const rest = all.slice(1), open = U.supPop === m.id;
  return `<span class="sup-cell">${esc(all[0])}
    <span class="sup-more">
      <button type="button" class="more-link" data-act="show-suppliers" data-id="${m.id}" aria-expanded="${open}" aria-haspopup="dialog"
        aria-label="Show ${rest.length} more supplier${rest.length > 1 ? 's' : ''}">+${rest.length}</button>
      ${open ? `<div class="sup-pop" role="dialog" aria-label="Other suppliers on ${esc(m.name)}">
        <div class="sup-pop-head">${rest.length} more supplier${rest.length > 1 ? 's' : ''}</div>
        <ul>${rest.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>` : ''}
    </span></span>`;
}

function viewMappings() {
  const docType = `<div class="field" style="width:300px">
      <label for="doc-type">EDI document type</label>
      <select id="doc-type" class="select"><option>EDI 855 — PO Acknowledgment</option><option disabled>EDI 856 — Advance Ship Notice (coming soon)</option></select>
    </div>`;

  if (!S.mappings.length) {
    return shell('mappings', `<div class="content">
      ${toastHtml()}
      <div>
        <h1 class="page-title">EDI Mappings</h1>
        <p class="page-desc">Mappings that transform supplier EDI 855 files into Coupa order confirmations.</p>
      </div>
      ${docType.replace('width:300px', 'width:420px')}
      <section class="card empty">
        ${I.fileAdd(48)}
        <h3>No EDI 855 mappings yet</h3>
        <p>To begin, click on “Create Mapping Policy” to create mapping for your Suppliers</p>
        <button class="btn btn-primary" data-act="create">${I.plusCircle(20)} Create mapping</button>
      </section>
    </div>`);
  }

  const q = U.search.trim().toLowerCase();
  const rows = S.mappings.filter(m => (!q || [m.id, ...mappingSuppliers(m), m.name, m.created, m.status].join(' ').toLowerCase().includes(q))
    && (!U.statusFilter.length || U.statusFilter.includes(m.status)));
  const body = rows.length ? rows.map(m => `<tr>
      <td><a href="#" data-act="edit-mapping" data-id="${m.id}">${m.id}</a></td>
      <td>${supplierCell(m)}</td>
      <td>${esc(m.name)}</td>
      <td>${esc(m.created)}</td>
      <td>${chip(m.status)}</td>
      <td><div class="actions">
        ${iconBtn('edit-mapping', I.edit(18), 'Edit Mapping', `data-id="${m.id}"`)}
        ${m.status === 'Active'
          ? iconBtn('toggle-mapping', I.toggleOn(20), 'Active Mapping', `data-id="${m.id}"`)
          : iconBtn('toggle-mapping', I.toggleOff(20), 'Inactive Mapping', `data-id="${m.id}"`)}
        ${iconBtn('delete-mapping', I.trash(18), 'Delete Mapping', `data-id="${m.id}"`)}
        ${iconBtn('test-mapping', I.flask(18), 'Test Mapping', `data-id="${m.id}"`)}
      </div></td>
    </tr>`).join('') : `<tr class="empty-row"><td colspan="6">No mappings match your search or filters.</td></tr>`;

  return shell('mappings', `<div class="content">
    ${toastHtml()}
    <div class="header-row">
      <div>
        <h1 class="page-title">EDI Mappings</h1>
        <p class="page-desc">All supplier mapping policies for the selected EDI document type.</p>
      </div>
      ${docType}
    </div>
    <div class="toolbar">
      <button class="btn btn-outline" data-act="create">${I.plusCircle(20)} Create mapping</button>
      <label class="search"><span class="sr-only">Search mappings</span>${I.search(20)}<input id="map-search" class="input" placeholder="Search" value="${esc(U.search)}" data-input="search"></label>
      <div class="filter-wrap">
        <button class="btn btn-outline filter" data-act="toggle-filter" aria-expanded="${U.filterOpen}">${I.filter(20)} Filter${U.statusFilter.length ? ` (${U.statusFilter.length})` : ''}</button>
        ${filterPopover(U.filterOpen, 'status-filter', ['Active', 'Inactive', 'Draft'], U.statusFilter)}
      </div>
    </div>
    <div class="table-card"><table class="grid">
      <thead><tr><th style="width:150px">Mapping Policy ID</th><th>Supplier</th><th>Mapping Policy Name</th><th style="width:120px">Created Date</th><th style="width:100px">Status</th><th style="width:138px">Actions</th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>
    ${pagination()}
  </div>`);
}

/* ---------------------------------------------------------------- Create Mapping · Details and Upload */
function viewDetails() {
  const w = S.wizard;
  const chosen = w.suppliers.map(id => SUPPLIERS.find(s => s.id === id)).filter(Boolean);
  const q = U.msQuery.trim().toLowerCase();
  const opts = SUPPLIERS.filter(s => !q || `${s.name} ${s.id}`.toLowerCase().includes(q));
  const templateHelp = w.template === 'default'
    ? 'The default transformation mapping uses generic interpretation of EDI documents. You can customize and save supplier specific mappings if the EDI payload has customer segments or ERP specific fields.'
    : 'Starts from an existing mapping policy. Field mappings are copied and can be edited in the next step.';

  const upload = w.file
    ? `<div class="field"><span class="label">Uploaded EDI file <span class="req">*</span></span>
        <div class="file-item">
          <span class="thumb">${I.file(22)}</span>
          <div class="grow"><div class="name">${esc(w.file.name)}</div><div class="meta">Uploaded · ${w.file.segments} segments detected</div></div>
          ${iconBtn('remove-file', I.trash(20), 'Remove file')}
        </div></div>`
    : `<div class="field"><span class="label" id="file-label">Upload your file to create Mapping <span class="req">*</span></span>
        <div class="dropzone ${U.drag ? 'drag' : ''} ${w.fileError ? 'error' : ''}" data-dropzone role="group" aria-labelledby="file-label" ${w.fileError ? 'aria-describedby="file-err"' : ''}>
          ${I.upload(32)}
          <div class="t">Upload EDI file</div>
          <div class="c">.edi, .x12 or .txt · max 10 MB</div>
          <button type="button" class="btn btn-primary" id="upload-btn" data-act="pick-file">Upload File</button>
          <a href="#" class="sample" data-act="sample-file">or use a sample file (acme_po_4471_855.edi)</a>
        </div>
        ${w.fileError ? `<span class="help error" id="file-err">Upload an EDI file to create the mapping.</span>` : ''}
        <input type="file" id="file-input" accept=".edi,.x12,.txt" hidden></div>`;

  return wizardShell(0, `
    <h1 class="page-title">Details and Upload</h1>
    <div class="form">
      <div class="field">
        <label for="policy-name">Mapping Policy Name <span class="req">*</span></label>
        <input id="policy-name" class="input ${w.nameError ? 'error' : ''}" placeholder="Assign a name to the mapping policy" value="${esc(w.name)}" data-input="name" aria-required="true" ${w.nameError ? 'aria-invalid="true" aria-describedby="name-err"' : ''}>
        ${w.nameError ? `<span class="help error" id="name-err">Enter a mapping policy name.</span>` : ''}
      </div>
      <div class="field ms" data-ms>
        <span class="label" id="sup-label">Supplier</span>
        <div class="ms-anchor">
        <div class="ms-control ${U.msOpen ? 'open' : ''}" data-act="toggle-ms" role="combobox" aria-expanded="${U.msOpen}" aria-labelledby="sup-label" tabindex="0">
          ${chosen.length ? chosen.map(s => `<span class="chip lg">${esc(s.name)} • ${s.id}<button type="button" class="x" data-act="remove-supplier" data-id="${s.id}" aria-label="Remove ${esc(s.name)}">${I.close(12)}</button></span>`).join('') : '<span class="placeholder">Any</span>'}
          <span class="caret">${I.caret(18)}</span>
        </div>
        ${U.msOpen ? `<div class="ms-pop" data-pop>
          <label class="search"><span class="sr-only">Search suppliers</span>${I.search(18)}<input id="ms-search" class="input" placeholder="Search" value="${esc(U.msQuery)}" data-input="msQuery"></label>
          <div class="ms-list" role="listbox" aria-multiselectable="true">
            ${opts.length ? opts.map(s => `<label class="ms-item"><input type="checkbox" data-act="pick-supplier" value="${s.id}" ${w.suppliers.includes(s.id) ? 'checked' : ''}> ${esc(s.name)} • ${s.id}</label>`).join('') : `<div class="ms-empty">No suppliers found</div>`}
          </div></div>` : ''}
        </div>
        <span class="help">Leave as “Any” to apply this mapping to every supplier without a specific mapping.</span>
      </div>
      ${upload}
      <div class="field">
        <label for="template">Choose a mapping template</label>
        <select id="template" class="select" data-input="template">${TEMPLATES.map(([v, l]) => `<option value="${v}" ${w.template === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <span class="help">${templateHelp}</span>
      </div>
    </div>
    <div class="wizard-footer"><button class="btn btn-primary btn-pill" style="width:552px" data-act="next">Next</button></div>
  `, true);
}

/* ---------------------------------------------------------------- Create Mapping · Mapping (connecting → field mappings → tested) */
function viewConnecting() {
  return wizardShell(1, `<section class="card connecting" role="status">
      <div class="spinner"></div>
      <b>Connecting to the mapping workspace…</b>
      <p>Securely signing you in (READY → token → INIT).<br>This usually takes a few seconds.</p>
    </section>`);
}

function titleRow(title) {
  return `<div class="title-row"><h1 class="page-title">${title}</h1>${chip('EDI 855', 'info')}${chip(S.wizard.mode === 'edit' && S.wizard.status === 'Active' ? 'Active' : 'Draft')}</div>`;
}

function viewFields() {
  const w = S.wizard;
  const count = 67 + w.fields.length;
  const rows = w.fields.map((f, i) => `<tr>
      <td class="tf"><b>${esc(f.target)}</b><small>OPTIONAL · STANDARD</small></td>
      <td>${f.source ? esc(f.source) : '—'}</td>
      <td>${chip(f.type)}</td>
      <td>${chip(f.transform)}</td>
      <td>${chip(f.confidence, 'positive')}</td>
      <td><div class="actions">
        ${iconBtn('flag-field', I.flag(18), f.flagged ? 'Flagged for review' : 'Flag for review', `data-i="${i}"`, f.flagged ? 'flagged' : '')}
        ${iconBtn('edit-field', I.edit(18), 'Edit mapping', `data-i="${i}"`)}
        ${iconBtn('delete-field', I.trash(18), 'Delete mapping', `data-i="${i}"`)}
      </div></td>
    </tr>`).join('');
  return wizardShell(1, `
    ${toastHtml()}
    ${titleRow('Field Mappings')}
    <div class="table-card"><table class="grid fields">
      <thead><tr><th>Target field</th><th>Source field</th><th>Data type</th><th>Transformation</th><th>Confidence</th><th style="width:110px">Actions</th></tr></thead>
      <tbody>
        <tr class="group"><td colspan="6"><div class="g">${I.database(18)}<b>OrderConfirmation</b><span>${count} mappings</span>
          <button class="btn btn-text" data-act="add-field">${I.plus(16)} Add mapping</button></div></td></tr>
        ${rows}
      </tbody>
    </table></div>
    <div class="wizard-footer">
      <button class="btn btn-outline btn-pill" data-act="save-draft">Save as Draft</button>
      <button class="btn btn-primary btn-pill" data-act="run-test" ${U.testing ? 'disabled aria-busy="true"' : ''}>${U.testing ? '<span class="spinner" aria-label="Testing"></span>' : 'Test Mapping'}</button>
    </div>`);
}

function viewTested() {
  const w = S.wizard;
  if (!w.result) { go('create/fields'); return ''; }
  const mapped = w.fields.filter(f => f.source).length + 15;
  const body = w.result === 'errors'
    ? `<div class="alert critical" role="alert">${I.alert(20)}<div><div class="a-title">Errors found</div>
        <div class="a-desc">Restart the process to resolve these errors. Review the details below to ensure the information is correct before restarting.</div></div></div>
      <section class="card errors-card"><table class="plain">
        <thead><tr><th>Value</th><th>Row</th><th>Field</th><th>Description</th></tr></thead>
        <tbody>${TEST_ERRORS.map(e => `<tr><td>${e.value}</td><td>${e.row}</td><td>${e.field}</td><td>${e.desc}</td></tr>`).join('')}</tbody>
      </table></section>`
    : `<div class="alert positive" role="status">${I.checkCircle(20)}<div><div class="a-title">Test mappings succeeded</div>
        <div class="a-desc">All mapped fields transformed without errors. No confirmations were created. Save and activate to go live.</div></div></div>
      <section class="card summary">
        <div><div class="k">Test file</div><div class="v">${esc(w.testRun.file)}</div></div>
        <div><div class="k">Test run</div><div class="v">${w.testRun.id} · ${w.testRun.started.replace('Today ', 'Today ')}</div></div>
        <div><div class="k">Lines tested</div><div class="v">4</div></div>
        <div><div class="k">Fields passed</div><div class="v">${mapped} of ${mapped} mapped</div></div>
        <div><div class="k">Confirmations</div><div class="v">1 (test only)</div></div>
        <button class="btn btn-outline blue" data-act="download-csv" data-id="${w.testRun.id}">Download CSV</button>
      </section>`;
  // Figma 2082:45979 — once the test passes, Mapping is done and Save and Activate is the current step
  return wizardShell(w.result === 'success' ? 2 : 1, `
    ${titleRow('Tested Mappings')}
    ${body}
    <div class="wizard-footer">
      <button class="btn btn-outline btn-pill" data-act="save-draft">Save as Draft</button>
      ${w.result === 'errors'
        ? `<button class="btn btn-primary btn-pill" data-act="back-to-fields">Back to Field Mappings</button>`
        : `<button class="btn btn-primary btn-pill" data-act="save-activate">Save and Activate</button>`}
    </div>`);
}

/* ---------------------------------------------------------------- B2 · Test Transformations */
function viewTests() {
  if (!S.tests.length) {
    return shell('tests', `<div class="content">
      ${toastHtml()}
      <div><h1 class="page-title">Test Transformations</h1><p class="page-desc">Recent test runs. Output CSVs are kept for 30 days.</p></div>
      <section class="card empty">
        ${I.fileAdd(48)}
        <h3>No test transformations yet</h3>
        ${S.mappings.length
          ? `<p>To begin, click on “New test” to perform test mappings for your Suppliers</p>
        <button class="btn btn-primary btn-lg" data-act="new-test">${I.plusCircle(20)} New Test</button>`
          : `<p>To begin, create a mapping before running a test.</p>
        <button class="btn btn-primary btn-lg" data-act="create">${I.plusCircle(20)} Create Mapping</button>`}
      </section>
    </div>`);
  }
  const q = U.testSearch.trim().toLowerCase();
  const rows = S.tests.filter(t => (!q || [t.id, t.file, t.supplier, t.policy, t.status].join(' ').toLowerCase().includes(q))
    && (!U.testFilter.length || U.testFilter.includes(t.status)));
  const body = rows.length ? rows.map(t => `<tr>
      <td><a href="#" data-act="view-test" data-id="${t.id}">${t.id}</a></td>
      <td>${esc(t.file)}</td><td>${esc(t.supplier)}</td><td>${esc(t.policy)}</td><td>${esc(t.started)}</td>
      <td>${chip(t.status)}</td>
      <td><div class="actions">
        ${iconBtn('view-test', I.eye(18), 'View run', `data-id="${t.id}"`)}
        ${iconBtn('download-csv', I.download(18), t.status === 'Succeeded' ? 'Download CSV' : 'Output not available', `data-id="${t.id}"`)}
      </div></td>
    </tr>`).join('') : `<tr class="empty-row"><td colspan="7">No test runs match your search or filters.</td></tr>`;
  return shell('tests', `<div class="content">
    ${toastHtml()}
    <div><h1 class="page-title">Test Transformations</h1><p class="page-desc">Recent test runs. Output CSVs are kept for 30 days.</p></div>
    <div class="toolbar">
      <button class="btn btn-outline" data-act="new-test">${I.plusCircle(20)} New test</button>
      <label class="search"><span class="sr-only">Search test runs</span>${I.search(20)}<input id="test-search" class="input" placeholder="Search" value="${esc(U.testSearch)}" data-input="testSearch"></label>
      <div class="filter-wrap">
        <button class="btn btn-outline filter" data-act="toggle-test-filter" aria-expanded="${U.testFilterOpen}">${I.filter(20)} Filter${U.testFilter.length ? ` (${U.testFilter.length})` : ''}</button>
        ${filterPopover(U.testFilterOpen, 'test-filter', ['Queued', 'Transforming', 'Succeeded', 'Failed'], U.testFilter)}
      </div>
    </div>
    <div class="table-card"><table class="grid">
      <thead><tr><th style="width:90px">Run</th><th>File</th><th>Supplier</th><th>Mapping policy</th><th style="width:120px">Started</th><th style="width:130px">Status</th><th style="width:100px">Actions</th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>
    ${pagination()}
  </div>`);
}

/* ---------------------------------------------------------------- Modals */
function modalHtml() {
  const m = U.modal;
  if (!m) return '';
  const frame = (title, body, footer) => `<div class="overlay" data-act="overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
    <header><h2 id="m-title">${title}</h2><button class="icon-btn" data-act="close-modal" aria-label="Close">${I.close(20)}</button></header>
    <div class="body">${body}</div><footer>${footer}</footer></div></div>`;
  const sel = (id, label, options, value) => `<div class="field"><label for="${id}">${label}</label><select id="${id}" class="select">${options.map(o => `<option ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;

  if (m.type === 'delete-mapping') {
    const map = S.mappings.find(x => x.id === m.id);
    return frame(`Delete “${esc(map.name)}”?`,
      `<p>This removes ${map.id} from Refold. It can’t be undone. Past test runs stay in Test Transformations.</p>
       ${map.status === 'Active' ? `<div class="alert critical">${I.alert(20)}<div><div class="a-title">This mapping is active</div><div class="a-desc">New EDI 855 files from ${esc(map.supplier)} will fail with “No active mapping” until another mapping is activated.</div></div></div>` : ''}`,
      `<button class="btn btn-outline" data-act="close-modal">Cancel</button><button class="btn btn-critical" data-act="confirm-delete" data-id="${map.id}">Delete mapping</button>`);
  }
  if (m.type === 'field') {
    const f = m.index != null ? S.wizard.fields[m.index] : { target: '', source: '', type: 'string', transform: 'Direct copy' };
    return frame(m.index != null ? `Edit mapping · ${esc(f.target)}` : 'Add mapping',
      `${m.index != null ? '' : `<div class="field"><label for="f-target">Target field <span class="req">*</span></label><input id="f-target" class="input" placeholder="e.g. supplier-comment"></div>`}
       ${sel('f-source', 'Source field', ['—', ...SOURCE_FIELDS], f.source || '—')}
       ${sel('f-type', 'Data type', DATA_TYPES, f.type)}
       ${sel('f-transform', 'Transformation', TRANSFORMS, f.transform)}`,
      `<button class="btn btn-outline" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="save-field">${m.index != null ? 'Save' : 'Add mapping'}</button>`);
  }
  if (m.type === 'leave') {
    return frame('Leave without saving?', `<p>Your mapping details and field changes will be lost. Save as draft to keep them.</p>`,
      `<button class="btn btn-outline" data-act="close-modal">Keep editing</button><button class="btn btn-outline" data-act="save-draft">Save as Draft</button><button class="btn btn-critical" data-act="confirm-leave">Discard</button>`);
  }
  if (m.type === 'new-test') {
    const policies = S.mappings;
    return frame('New test', policies.length
      ? `<p>Run a supplier EDI file through a mapping and check the CSV output. No order confirmations are created.</p>
         ${m.file
           ? `<div class="file-item"><span class="thumb">${I.file(22)}</span><div class="grow"><div class="name">${esc(m.file.name)}</div><div class="meta">Uploaded · ${m.file.segments} segments detected</div></div>${iconBtn('test-remove-file', I.trash(20), 'Remove file')}</div>`
           : `<div class="dropzone ${U.drag ? 'drag' : ''}" data-dropzone="test">${I.upload(28)}<div class="t">Upload EDI file</div><div class="c">.edi, .x12 or .txt · max 10 MB</div>
              <button type="button" class="btn btn-primary btn-sm" data-act="pick-file">Upload File</button><a href="#" class="sample" data-act="test-sample-file">or use a sample file</a></div>
              <input type="file" id="file-input" accept=".edi,.x12,.txt" hidden>`}
         <div class="field"><label for="t-policy">Mapping policy</label><select id="t-policy" class="select">${policies.map(p => `<option value="${p.id}" ${p.id === m.policyId ? 'selected' : ''}>${p.id} · ${esc(p.name)} (${p.status})</option>`).join('')}</select></div>`
      : `<p>Create a mapping before running a test.</p>`,
      policies.length
        ? `<button class="btn btn-outline" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="run-new-test" ${m.file ? '' : 'disabled'}>Run test</button>`
        : `<button class="btn btn-outline" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="modal-create">Create mapping</button>`);
  }
  if (m.type === 'view-test') {
    const t = S.tests.find(x => x.id === m.id);
    const kv = (k, v) => `<div style="display:flex;gap:var(--cui-space-lg)"><span style="width:120px;color:var(--cui-color-text-t2)">${k}</span><span style="color:var(--cui-color-text-t1)">${v}</span></div>`;
    return frame(`${t.id} · ${esc(t.file)}`,
      `<div>${chip(t.status)}</div>
       <div style="display:flex;flex-direction:column;gap:var(--cui-space-sm)">${kv('Supplier', esc(t.supplier))}${kv('Mapping policy', esc(t.policy))}${kv('Started', esc(t.started))}${kv('Lines', t.status === 'Succeeded' ? '4 lines → 1 confirmation (test only)' : '—')}</div>
       ${t.status === 'Failed' ? `<div class="alert critical">${I.alert(20)}<div><div class="a-title">Transformation failed</div><div class="a-desc">Line 14, segment PO1: element PO104 “12,50” is not a valid number.</div></div></div>` : ''}
       ${t.status === 'Queued' || t.status === 'Transforming' ? `<p>This run is still in progress. Status updates automatically.</p>` : ''}`,
      `<button class="btn btn-outline" data-act="close-modal">Close</button>${t.status === 'Succeeded' ? `<button class="btn btn-primary" data-act="download-csv" data-id="${t.id}">Download CSV</button>` : ''}`);
  }
  return '';
}

/* ---------------------------------------------------------------- Render */
let connectTimer;
function render() {
  const r = route();
  const active = document.activeElement;
  const focusId = active && active.id ? active.id : null;
  const sel = focusId && 'selectionStart' in active ? [active.selectionStart, active.selectionEnd] : null;

  const view = { setup: viewSetup, mappings: viewMappings, 'create/details': viewDetails, 'create/connecting': viewConnecting,
    'create/fields': viewFields, 'create/tested': viewTested, tests: viewTests }[r];
  $app.innerHTML = view() + modalHtml();
  document.title = { setup: 'Setup', mappings: 'EDI Mappings', tests: 'Test Transformations' }[r] || (S.wizard.mode === 'edit' ? 'Edit Mapping' : 'Create Mapping');
  document.title += ' · Coupa';

  if (focusId) {
    const el = document.getElementById(focusId);
    if (el) { el.focus(); if (sel && el.setSelectionRange) try { el.setSelectionRange(...sel); } catch {} }
  }
  if (U.modal && !document.querySelector('.modal')?.contains(document.activeElement)) document.querySelector('.modal select, .modal input, .modal .btn-primary')?.focus();

  clearTimeout(connectTimer);
  if (r === 'create/connecting') connectTimer = setTimeout(() => { if (route() === 'create/connecting') go('create/fields'); }, 1600);
  renderProtoNav(r);
}

/* ---------------------------------------------------------------- Actions */
const nextMapId = () => 'MAP-' + String(Math.max(98, ...S.mappings.map(m => +m.id.slice(4))) + 1).padStart(4, '0');
const nextTestId = () => 'TR-' + (Math.max(1046, ...S.tests.map(t => +t.id.slice(3))) + 1);
const sampleFile = () => ({ name: 'acme_po_4471_855.edi', segments: 14 });

function startCreate() { S.wizard = freshWizard(); save(); U.msOpen = false; U.msQuery = ''; go('create/details'); }

function startEdit(id) {
  const m = S.mappings.find(x => x.id === id);
  S.wizard = { ...freshWizard(), mode: 'edit', editId: id, name: m.name, status: m.status, suppliers: m.supplierIds || [], file: m.file || sampleFile() };
  save(); go('create/connecting');
}

function persistMapping(status) {
  const w = S.wizard;
  const supplier = w.suppliers.length ? supplierLabel(w.suppliers) : 'Any supplier';
  if (w.mode === 'edit') {
    const m = S.mappings.find(x => x.id === w.editId);
    Object.assign(m, { name: w.name, supplier: w.suppliers.length ? supplier : m.supplier, supplierIds: w.suppliers.length ? w.suppliers : m.supplierIds, status });
  } else {
    S.mappings.unshift({ id: nextMapId(), supplier, supplierIds: w.suppliers, name: w.name, created: today(), status, file: w.file });
  }
  const name = w.name;
  S.wizard = freshWizard(); save();
  toast(status === 'Active' ? `“${esc(name)}” published and set as active.` : `“${esc(name)}” saved as draft.`);
  go('mappings');
}

function runWizardTest() {
  U.testing = true; render();
  setTimeout(() => {
    U.testing = false;
    const w = S.wizard;
    w.testAttempts += 1;
    const b = S.testBehavior;
    w.result = b === 'always-pass' ? 'success' : b === 'always-fail' ? 'errors' : (w.testAttempts === 1 ? 'errors' : 'success');
    const run = { id: nextTestId(), file: (w.file || { name: 'default_template_sample.edi' }).name, supplier: w.suppliers.length ? SUPPLIERS.find(s => s.id === w.suppliers[0]).name : 'Any supplier',
      policy: w.name || 'Untitled mapping', started: nowTime(), status: w.result === 'success' ? 'Succeeded' : 'Failed' };
    S.tests.unshift(run);
    w.testRun = run; save();
    go('create/tested');
  }, 1800);
}

function scheduleTest(id) {
  setTimeout(() => { const t = S.tests.find(x => x.id === id); if (!t) return; t.status = 'Transforming'; save(); render(); }, 1200);
  setTimeout(() => { const t = S.tests.find(x => x.id === id); if (!t) return; t.status = /bad|fail/i.test(t.file) ? 'Failed' : 'Succeeded'; save();
    toast(`${t.id} ${t.status === 'Succeeded' ? 'succeeded — output CSV is ready.' : 'failed — open the run to see why.'}`, t.status === 'Succeeded' ? 'positive' : 'neutral'); render(); }, 3600);
}

function downloadCsv(id) {
  const t = S.tests.find(x => x.id === id) || S.wizard.testRun;
  if (!t || t.status !== 'Succeeded') { toast('No output — this run did not succeed.', 'neutral'); render(); return; }
  const rows = [['PO Number', 'Line Number', 'Confirmation Action', 'Confirmed Quantity', 'Confirmed Price', 'Promised Date', 'Channel'],
    ['4471', '1', 'accept', '10', '12.50', '2026-10-30', 'EDI'], ['4471', '2', 'accept', '5', '40.00', '2026-10-30', 'EDI'],
    ['4471', '3', 'change', '8', '15.00', '2026-11-04', 'EDI'], ['4471', '4', 'reject', '0', '', '', 'EDI']];
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${t.id}_${t.file.replace(/\.\w+$/, '')}.csv` });
  document.body.appendChild(a); a.click(); a.remove();
}

function onFile(file) {
  const f = { name: file.name, segments: Math.max(4, Math.min(48, Math.round(file.size / 60) || 14)) };
  if (U.modal?.type === 'new-test') U.modal.file = f; else { S.wizard.file = f; S.wizard.fileError = false; save(); }
  render();
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-stub]')) { e.preventDefault(); return; }
  const el = e.target.closest('[data-act]');
  // close popovers when clicking elsewhere
  if (!e.target.closest('[data-ms]') && U.msOpen) { U.msOpen = false; if (!el) render(); }
  if (!e.target.closest('.filter-wrap') && (U.filterOpen || U.testFilterOpen)) { U.filterOpen = U.testFilterOpen = false; if (!el) render(); }
  if (!e.target.closest('.sup-more') && U.supPop) { U.supPop = null; if (!el) render(); }
  if (!el) return;
  const act = el.dataset.act, id = el.dataset.id, i = el.dataset.i != null ? +el.dataset.i : null;
  if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault();
  const w = S.wizard;

  switch (act) {
    case 'close-shell':
      if (route().startsWith('create/') && (w.name || w.file || w.suppliers.length)) { U.modal = { type: 'leave' }; break; }
      go(route().startsWith('create/') ? 'mappings' : 'setup'); return;
    case 'confirm-leave': U.modal = null; S.wizard = freshWizard(); save(); go('mappings'); return;
    case 'overlay': if (e.target !== el) return; U.modal = null; break;
    case 'close-modal': U.modal = null; break;
    case 'dismiss-toast': U.toast = null; break;
    case 'undo': if (U.toast?.undo) U.toast.undo(); U.toast = null; break;

    // EDI Mappings
    case 'create': case 'modal-create': U.modal = null; startCreate(); return;
    case 'edit-mapping': startEdit(id); return;
    case 'toggle-mapping': {
      const m = S.mappings.find(x => x.id === id);
      m.status = m.status === 'Active' ? 'Inactive' : 'Active'; save();
      toast(`“${esc(m.name)}” is now ${m.status.toLowerCase()}.`, m.status === 'Active' ? 'positive' : 'neutral'); break;
    }
    case 'delete-mapping': U.modal = { type: 'delete-mapping', id }; break;
    case 'confirm-delete': {
      const idx = S.mappings.findIndex(x => x.id === id), [m] = S.mappings.splice(idx, 1); save(); U.modal = null;
      toast(`“${esc(m.name)}” deleted.`, 'neutral', () => { S.mappings.splice(idx, 0, m); save(); }); break;
    }
    case 'test-mapping': U.modal = { type: 'new-test', policyId: id, file: null }; go('tests'); return;
    case 'toggle-filter': U.filterOpen = !U.filterOpen; break;
    case 'show-suppliers': U.supPop = U.supPop === id ? null : id; break;
    case 'status-filter': U.statusFilter = el.checked ? [...U.statusFilter, el.value] : U.statusFilter.filter(v => v !== el.value); break;

    // Details and Upload
    case 'toggle-ms': if (e.target.closest('[data-act="remove-supplier"]')) return; U.msOpen = !U.msOpen; if (U.msOpen) setTimeout(() => document.getElementById('ms-search')?.focus()); break;
    case 'pick-supplier': w.suppliers = el.checked ? [...w.suppliers, el.value] : w.suppliers.filter(v => v !== el.value); save(); break;
    case 'remove-supplier': e.stopPropagation(); w.suppliers = w.suppliers.filter(v => v !== id); save(); break;
    case 'pick-file': document.getElementById('file-input')?.click(); return;
    case 'sample-file': w.file = sampleFile(); w.fileError = false; save(); break;
    case 'remove-file': w.file = null; save(); break;
    case 'next':
      w.nameError = !w.name.trim(); w.fileError = !w.file; save();
      if (w.nameError || w.fileError) { render(); document.getElementById(w.nameError ? 'policy-name' : 'upload-btn')?.focus(); return; }
      go('create/connecting'); return;

    // Field Mappings / Tested
    case 'flag-field': w.fields[i].flagged = !w.fields[i].flagged; save(); break;
    case 'edit-field': U.modal = { type: 'field', index: i }; break;
    case 'add-field': U.modal = { type: 'field', index: null }; break;
    case 'save-field': {
      const target = U.modal.index != null ? w.fields[U.modal.index].target : document.getElementById('f-target').value.trim();
      if (!target) { document.getElementById('f-target').classList.add('error'); document.getElementById('f-target').focus(); return; }
      const src = document.getElementById('f-source').value;
      const f = { target, source: src === '—' ? '' : src, type: document.getElementById('f-type').value,
        transform: src === '—' ? 'Unmapped' : document.getElementById('f-transform').value, confidence: '100%' };
      if (U.modal.index != null) w.fields[U.modal.index] = { ...w.fields[U.modal.index], ...f }; else w.fields.push(f);
      save(); U.modal = null; toast(`Mapping for <b>${esc(target)}</b> saved.`); break;
    }
    case 'delete-field': {
      const [f] = w.fields.splice(i, 1); save();
      toast(`Mapping for <b>${esc(f.target)}</b> removed.`, 'neutral', () => { w.fields.splice(i, 0, f); save(); }); break;
    }
    case 'run-test': if (!U.testing) runWizardTest(); return;
    case 'back-to-fields': go('create/fields'); return;
    case 'save-draft': U.modal = null; persistMapping('Draft'); return;
    case 'save-activate': persistMapping('Active'); return;
    case 'download-csv': downloadCsv(id); return;

    // Test Transformations
    case 'new-test': U.modal = { type: 'new-test', policyId: S.mappings[0]?.id, file: null }; break;
    case 'test-sample-file': U.modal.file = sampleFile(); break;
    case 'test-remove-file': U.modal.file = null; break;
    case 'run-new-test': {
      const p = S.mappings.find(x => x.id === document.getElementById('t-policy').value);
      const sup = (p.supplier || '').replace(/\s*\(.*$/, '') || 'Any supplier';
      const t = { id: nextTestId(), file: U.modal.file.name, supplier: sup, policy: p.name, started: nowTime(), status: 'Queued' };
      S.tests.unshift(t); save(); U.modal = null; scheduleTest(t.id);
      toast(`${t.id} queued — status updates in a few seconds.`, 'neutral'); break;
    }
    case 'view-test': U.modal = { type: 'view-test', id }; break;
    case 'toggle-test-filter': U.testFilterOpen = !U.testFilterOpen; break;
    case 'test-filter': U.testFilter = el.checked ? [...U.testFilter, el.value] : U.testFilter.filter(v => v !== el.value); break;
    default: return;
  }
  render();
});

document.addEventListener('input', e => {
  const k = e.target.dataset.input;
  if (!k) return;
  if (k === 'name') { S.wizard.name = e.target.value; if (S.wizard.nameError && e.target.value.trim()) { S.wizard.nameError = false; save(); render(); return; } save(); return; }
  if (k === 'template') { S.wizard.template = e.target.value; save(); render(); return; }
  U[k] = e.target.value; render();
});
document.addEventListener('change', e => {
  if (e.target.id === 'file-input' && e.target.files[0]) onFile(e.target.files[0]);
  if (e.target.dataset.input === 'template') { S.wizard.template = e.target.value; save(); render(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (U.modal) U.modal = null; const pop = U.supPop; U.msOpen = U.filterOpen = U.testFilterOpen = false; U.supPop = null; render();
    if (pop) document.querySelector(`[data-act="show-suppliers"][data-id="${pop}"]`)?.focus(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.ms-control')) { e.preventDefault(); e.target.click(); }
});
['dragover', 'dragleave', 'drop'].forEach(type => document.addEventListener(type, e => {
  const dz = e.target.closest?.('[data-dropzone]');
  if (!dz) return;
  e.preventDefault();
  const on = type === 'dragover';
  if (U.drag !== on) { U.drag = on; dz.classList.toggle('drag', on); }
  if (type === 'drop' && e.dataTransfer.files[0]) { U.drag = false; onFile(e.dataTransfer.files[0]); }
}));

/* ---------------------------------------------------------------- Prototype navigator (reviewer tool, not product UI) */
const PROTO = [
  ['Entry point', [['setup', 'A0 · Setup › Integrations › EDI Mappings']]],
  ['EDI Mappings', [['zero', 'A1 · EDI Mappings — zero state'], ['list', 'A5 · EDI Mappings — list (sample data)']]],
  ['Create Mapping', [['details', 'Details and Upload — empty'], ['details-filled', 'Details and Upload — filled'], ['connecting', 'Mapping — connecting to Refold'],
    ['fields', 'Field Mappings'], ['errors', 'Tested Mappings — errors found'], ['success', 'Tested Mappings — succeeded']]],
  ['Test Transformations', [['tests-zero', 'B2 · Test runs — zero state'], ['tests', 'B2 · Test runs — status (sample data)']]],
];
function protoGo(key) {
  const filled = () => ({ ...freshWizard(), name: 'Acme Supplier EMEA', suppliers: ['SUP-100482', 'SUP-100915'], file: sampleFile() });
  switch (key) {
    case 'setup': go('setup'); break;
    case 'zero': S.mappings = []; save(); go('mappings'); break;
    case 'list': if (!S.mappings.length) S.mappings = clone(SEED_MAPPINGS); save(); go('mappings'); break;
    case 'details': startCreate(); break;
    case 'details-filled': S.wizard = filled(); save(); go('create/details'); break;
    case 'connecting': if (!S.wizard.name) S.wizard = filled(); save(); go('create/connecting'); break;
    case 'fields': if (!S.wizard.name) S.wizard = filled(); save(); go('create/fields'); break;
    case 'errors': case 'success': {
      if (!S.wizard.name) S.wizard = filled();
      S.wizard.result = key; S.wizard.testRun = { id: 'TR-1047', file: S.wizard.file?.name || 'acme_po_4471_855.edi', supplier: 'Acme Industrial', policy: S.wizard.name, started: 'Today 15:12', status: key === 'success' ? 'Succeeded' : 'Failed' };
      save(); go('create/tested'); break;
    }
    case 'tests-zero': S.tests = []; save(); go('tests'); break;
    case 'tests': if (!S.tests.length) S.tests = clone(SEED_TESTS); if (!S.mappings.length) S.mappings = clone(SEED_MAPPINGS); save(); go('tests'); break;
  }
}
function renderProtoNav(r) {
  let root = document.querySelector('.proto-nav');
  const hereKey = { setup: 'setup', mappings: S.mappings.length ? 'list' : 'zero', 'create/details': S.wizard.name ? 'details-filled' : 'details', 'create/connecting': 'connecting',
    'create/fields': 'fields', 'create/tested': S.wizard.result === 'success' ? 'success' : 'errors', tests: S.tests.length ? 'tests' : 'tests-zero' }[r];
  const open = root?.classList.contains('open');
  root?.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="proto-nav ${open ? 'open' : ''}">
    <div class="panel" id="proto-panel" role="dialog" aria-label="Prototype navigator">
      ${PROTO.map(([g, items]) => `<h4>${g}</h4>${items.map(([k, l]) => `<a href="#" data-proto="${k}" class="${k === hereKey ? 'here' : ''}">${l}</a>`).join('')}`).join('')}
      <h4>Test Mapping result</h4>
      ${[['fail-then-pass', 'Fail first, then pass (default)'], ['always-pass', 'Always pass'], ['always-fail', 'Always fail']].map(([v, l]) =>
        `<label class="opt"><input type="radio" name="tb" value="${v}" data-proto-tb ${S.testBehavior === v ? 'checked' : ''}> ${l}</label>`).join('')}
      <h4>Data</h4>
      <button type="button" data-proto-reset>Reset prototype (empty tenant)</button>
    </div>
    <button type="button" class="proto-toggle" aria-expanded="${!!open}" aria-controls="proto-panel">Prototype ▾</button>
  </div>`);
  root = document.querySelector('.proto-nav');
  root.querySelector('.proto-toggle').addEventListener('click', ev => { ev.stopPropagation(); root.classList.toggle('open'); });
  root.querySelectorAll('[data-proto]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); root.classList.remove('open'); U.modal = null; protoGo(a.dataset.proto); }));
  root.querySelectorAll('[data-proto-tb]').forEach(x => x.addEventListener('change', () => { S.testBehavior = x.value; S.wizard.testAttempts = 0; save(); }));
  root.querySelector('[data-proto-reset]').addEventListener('click', () => { localStorage.removeItem(STORE_KEY); location.hash = '#/setup'; location.reload(); });
}
document.addEventListener('click', e => { const root = document.querySelector('.proto-nav'); if (root && !root.contains(e.target)) root.classList.remove('open'); });

render();
