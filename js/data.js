/* Sample data for the EDI 855 via Refold prototype. Values match the Figma screens
 * (🟢 EDI Flow 10-28-2026, file bY5gXB45SnlXQjqclWsMwr). */

const SUPPLIERS = [
  { id: 'SUP-100482', name: 'Acme Industrial' },
  { id: 'SUP-101330', name: 'Acme Components' },
  { id: 'SUP-100915', name: 'Acme Corp' },
  { id: 'SUP-102478', name: 'Acme Innovations' },
  { id: 'SUP-103120', name: 'Global Traders' },
  { id: 'SUP-103377', name: 'Tech Innovators' },
  { id: 'SUP-103904', name: 'Random Supplier' },
  { id: 'SUP-104211', name: 'Northwind Parts' },
];

const TEMPLATES = [
  ['default', 'Default EDI template'],
  ['acme-emea', 'Acme Supplier EMEA (copy)'],
  ['generic-x12', 'Generic X12 4010 855'],
];

// A5 · EDI Mappings — list (newest first). `more` = additional suppliers shown behind the +N link.
const SEED_MAPPINGS = [
  { id: 'MAP-0098', supplier: 'Random Supplier (SUP-100482)', name: 'Supplier Integration', created: '10/27/2026', status: 'Active' },
  { id: 'MAP-0087', supplier: 'Tech Innovators (SUP-101330)', more: ['Acme Components (SUP-101330)', 'Northwind Parts (SUP-104211)', 'Global Traders (SUP-103120)'], name: 'Next Gen Mapping', created: '10/21/2026', status: 'Active' },
  { id: 'MAP-0076', supplier: 'Acme Supplies (SUP-102478)', name: 'Mapping Policy NA', created: '10/09/2026', status: 'Inactive' },
  { id: 'MAP-0054', supplier: 'Global Traders (SUP-100915)', name: 'International Mapping', created: '09/24/2026', status: 'Draft' },
  { id: 'MAP-0032', supplier: 'Acme Supplies (SUP-101330)', more: ['Acme Corp (SUP-100915)'], name: 'Mapping Policy EMEA', created: '09/02/2026', status: 'Active' },
  { id: 'MAP-0011', supplier: 'Acme Industrial (SUP-100482)', name: 'Acme Supplier EMEA', created: '08/14/2026', status: 'Active' },
];

// B2 · Test runs — status
const SEED_TESTS = [
  { id: 'TR-1046', file: 'acme_po_4471_855.edi', supplier: 'Acme Supplies', policy: 'Acme – APAC VAN', started: 'Today 14:02', status: 'Transforming' },
  { id: 'TR-1045', file: 'acme_po_4470_855.edi', supplier: 'Acme Supplies', policy: 'Acme – EMEA VAN', started: 'Today 13:40', status: 'Succeeded' },
  { id: 'TR-1044', file: 'gt_855_oct.x12', supplier: 'Global Traders', policy: 'Global Traders 855', started: 'Today 11:05', status: 'Failed' },
  { id: 'TR-1043', file: 'ti_855_na.edi', supplier: 'Tech Innovators', policy: 'Tech Innovators – NA', started: 'Yesterday', status: 'Succeeded' },
  { id: 'TR-1042', file: 'nw_sample.edi', supplier: 'Northwind Parts', policy: 'Northwind – default', started: 'Yesterday', status: 'Queued' },
];

// A4 · Field Mappings (OrderConfirmation, 74 mappings — sample rows)
const FIELD_MAPPINGS = [
  { target: 'acknowledged-at', source: 'ack_date', type: 'datetime', transform: 'Date arithmetic', confidence: '100%' },
  { target: 'action', source: '', type: 'string', transform: 'Unmapped', confidence: '100%' },
  { target: 'confirmation-status', source: 'ack_type', type: 'string', transform: 'Direct copy', confidence: '100%' },
  { target: 'created-at', source: 'po_date', type: 'datetime', transform: 'Date arithmetic', confidence: '100%' },
  { target: 'created-by.email', source: '', type: 'string', transform: 'Unmapped', confidence: '100%' },
  { target: 'created-by.fullname', source: '', type: 'string', transform: 'Unmapped', confidence: '100%' },
  { target: 'created-by.id', source: '', type: 'integer', transform: 'Unmapped', confidence: '100%' },
];
const SOURCE_FIELDS = ['ack_date', 'ack_type', 'po_date', 'po_number', 'line_number', 'qty_ack', 'unit_price', 'ship_date', 'contact_email', 'contact_name', 'contact_id'];
const TRANSFORMS = ['Direct copy', 'Date arithmetic', 'Lookup table', 'Concatenate', 'Unmapped'];
const DATA_TYPES = ['string', 'integer', 'decimal', 'datetime', 'boolean'];

// A4 · Tested Mappings — errors found (first test run)
const TEST_ERRORS = [
  { value: 'None', row: '8th', field: 'Date', desc: 'Dates are not matching the required format' },
  { value: 'None', row: '12th', field: 'Date', desc: 'Dates are not matching the required format' },
  { value: 'None', row: '15th', field: 'Date', desc: 'Dates are not matching the required format' },
];

// A0 · Classic Setup page — Integrations box contains the new entry point
const SETUP_COLUMNS = [
  [['Company Setup', ['Company Information', 'Adoption Dashboard', 'Company Addresses', 'Users', 'Groups', 'Projects', 'Departments', 'Categories', 'Commodities', 'Commodity Translations', 'Coupa Taxonomy', 'UNSPSC Commodity Mappings', 'Roles', 'Permissions', 'Content Groups', 'Approvals', 'Manage Delegates', 'Units of Measure', 'Inventory Warehouses', 'Inspection Codes', 'Security Controls', 'Custom Fields', 'Lookups', 'Lookup Values', 'Dashboard Controls', 'Enterprises', 'Translations']]],
  [['Procurement', ['Buying Policies', 'PO Customization', 'Featured iRequest Sites', 'Manage Requisitions', 'Manage Purchase Orders', 'Manage RFQs', 'Order Lists', 'Order List Lines', 'Price Comparisons', 'Purchasing Classification Engine', 'Requisition Line Form Responses']],
   ['Platform', ['App Marketplace', "'Ask an Expert' Categories", 'Custom Footer', 'Custom Objects', 'Export to Accounting', 'Installed Apps and Content', 'Installed Marketplace Apps', 'IFrames and Panels', 'Menu Configuration', 'Notifications', 'Process Step History', 'Presentations', 'Process Automator', 'Process Instances', 'Project Templates', 'Questionnaires']]],
  [['Suppliers', ['Business Entities', 'Supplier Instructions', 'Supplier Certificate Reminders', 'Supplier Link Requests', 'Suppliers', 'Remit-To', 'Contracts', 'Supplier Portal Directory', 'Supplier Portal Catalogs', 'Supplier Reviews', 'Supplier Review Form Response', 'Items', 'Item Access Groups', 'Item Labels', 'Punchout Sites']],
   ['Integrations', ['Integrations Control Center', 'Integrations', 'Integration Contacts', 'Integration Runs', 'Integration Errors', 'Integration Warnings', 'Integration Documentation', 'sFTP Accounts', 'EDI Transformations', 'cXML Errors', 'E-signature Accounts', 'Call Outs', 'API Filters', 'Data Mappings']]],
];
