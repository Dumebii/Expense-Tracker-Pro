import { CURRENCY_SYMBOLS } from './currency';

export interface InvoiceData {
  invoiceNumber: string;
  generatedAt: string;
  /** showPrintBar: true for in-browser view, false for emailed invoices */
  showPrintBar?: boolean;
  income: {
    id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    frequency: string;
    description?: string | null;
  };
  /** The Nchiko user issuing the invoice — "From" / "Issued By" */
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  /** Optional client / recipient details */
  billedToName?: string | null;
  billedToEmail?: string | null;
  billedToAddress?: string | null;
  /** Optional free-text payment instructions (bank details, PayPal, etc.) */
  paymentDetails?: string | null;
  /** Optional payment terms e.g. "Net 30", "Due on receipt" */
  paymentTerms?: string | null;
  /** Optional additional notes */
  notes?: string | null;
}

function formatAmount(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  return `${symbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatFrequency(freq: string): string {
  return freq.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const {
    invoiceNumber,
    generatedAt,
    income,
    user,
    showPrintBar = false,
    billedToName,
    billedToEmail,
    billedToAddress,
    paymentDetails,
    paymentTerms,
    notes,
  } = data;

  const issuedByName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;

  const hasBilledTo = !!(billedToName || billedToEmail || billedToAddress);
  const hasPaymentDetails = !!paymentDetails?.trim();
  const hasTerms = !!paymentTerms?.trim();
  const hasNotes = !!notes?.trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice #${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #f8fafc;
      padding: 40px 20px;
      color: #1e293b;
    }
    .invoice {
      max-width: 620px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.09);
    }
    /* ── Header ── */
    .invoice-header {
      background: #0f172a;
      color: white;
      padding: 28px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-dot { color: #10b981; }
    .invoice-type {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #94a3b8;
    }
    /* ── Meta bar ── */
    .meta-bar {
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      padding: 16px 36px;
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; }
    .meta-value { font-size: 13px; font-weight: 600; color: #1e293b; }
    /* ── Body ── */
    .invoice-body { padding: 36px; }
    /* ── Party row ── */
    .party-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .party-block {}
    .party-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .party-name { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 3px; }
    .party-detail { font-size: 12px; color: #64748b; line-height: 1.6; }
    /* ── Line items table ── */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table thead tr { background: #0f172a; color: white; }
    .items-table thead th {
      padding: 11px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .items-table thead th:last-child { text-align: right; }
    .items-table tbody tr { border-bottom: 1px solid #f1f5f9; }
    .items-table tbody td { padding: 14px; font-size: 13px; color: #1e293b; vertical-align: top; }
    .items-table tbody td:last-child { text-align: right; font-weight: 700; }
    .item-desc { font-weight: 600; margin-bottom: 2px; }
    .item-sub { font-size: 11px; color: #94a3b8; }
    /* ── Total ── */
    .total-block {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .total-inner {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #86efac;
      border-radius: 10px;
      padding: 18px 24px;
      min-width: 220px;
      text-align: right;
    }
    .total-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #16a34a; margin-bottom: 4px; }
    .total-value { font-size: 32px; font-weight: 800; color: #15803d; }
    /* ── Info sections ── */
    .info-section { margin-bottom: 24px; }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #94a3b8;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-text { font-size: 13px; color: #475569; line-height: 1.7; white-space: pre-line; }
    /* ── Footer ── */
    .invoice-footer {
      padding: 16px 36px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .footer-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .footer-brand {
      text-align: center;
      font-size: 10px;
      color: #cbd5e1;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }
    .footer-brand a {
      color: #94a3b8;
      text-decoration: none;
    }
    .footer-brand a:hover {
      text-decoration: underline;
    }
    /* ── Print bar ── */
    .print-bar {
      max-width: 620px;
      margin: 0 auto 16px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    .btn { padding: 9px 18px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
    .btn-print { background: #0f172a; color: white; }
    .btn-close { background: #f1f5f9; color: #475569; }
    @media print {
      body { background: white; padding: 0; }
      .print-bar { display: none; }
      .invoice { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>

  ${showPrintBar ? `
  <div class="print-bar">
    <button class="btn btn-close" onclick="window.close()">Close</button>
    <button class="btn btn-print" onclick="window.print()">Save as PDF / Print</button>
  </div>` : ''}

  <div class="invoice">

    <!-- Header -->
    <div class="invoice-header">
      <div>
        <div class="logo">Nchiko<span class="logo-dot">.</span></div>
      </div>
      <div class="invoice-type">Invoice</div>
    </div>

    <!-- Meta bar -->
    <div class="meta-bar">
      <div class="meta-item">
        <span class="meta-label">Invoice #</span>
        <span class="meta-value">${invoiceNumber}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Issue Date</span>
        <span class="meta-value">${formatDate(income.date)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Terms</span>
        <span class="meta-value">${paymentTerms?.trim() || 'Due on receipt'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Frequency</span>
        <span class="meta-value">${formatFrequency(income.frequency)}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="invoice-body">

      <!-- From / To -->
      <div class="party-row">
        <div class="party-block">
          <div class="party-label">From</div>
          <div class="party-name">${issuedByName}</div>
          <div class="party-detail">${user.email}</div>
        </div>
        <div class="party-block">
          <div class="party-label">Bill To</div>
          ${hasBilledTo ? `
          ${billedToName ? `<div class="party-name">${billedToName}</div>` : ''}
          <div class="party-detail">
            ${billedToEmail ? billedToEmail : ''}
            ${billedToAddress ? `<br/>${billedToAddress.replace(/\n/g, '<br/>')}` : ''}
          </div>` : `
          <div class="party-detail" style="color:#cbd5e1;font-style:italic;">Not specified</div>`}
        </div>
      </div>

      <!-- Line items -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-desc">${income.title}</div>
              ${income.description ? `<div class="item-sub">${income.description}</div>` : ''}
            </td>
            <td>${income.category}</td>
            <td>${formatAmount(income.amount, income.currency)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Total -->
      <div class="total-block">
        <div class="total-inner">
          <div class="total-label">Total Due</div>
          <div class="total-value">${formatAmount(income.amount, income.currency)}</div>
        </div>
      </div>

      ${hasPaymentDetails ? `
      <!-- Payment Details -->
      <div class="info-section">
        <div class="section-title">Payment Details</div>
        <div class="info-text">${paymentDetails!.trim().replace(/\n/g, '<br/>')}</div>
      </div>` : ''}

      ${hasNotes ? `
      <!-- Notes -->
      <div class="info-section">
        <div class="section-title">Notes</div>
        <div class="info-text">${notes!.trim().replace(/\n/g, '<br/>')}</div>
      </div>` : ''}

    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <div class="footer-top">
        <span>Generated by Nchiko &bull; ${new Date(generatedAt).getFullYear()}</span>
        <span>#${invoiceNumber}</span>
      </div>
      <div class="footer-brand">
        Powered by <a href="https://ozigi.app" target="_blank" rel="noopener noreferrer">Ozigi GTM</a> &mdash; the all-in-one GTM suite for teams that want to make an impact. &middot; <a href="https://nchiko.ozigi.app/sign-up" target="_blank" rel="noopener noreferrer">Try Nchiko free</a>
      </div>
    </div>

  </div>

</body>
</html>`;
}
