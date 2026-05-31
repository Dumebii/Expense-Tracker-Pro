import { CURRENCY_SYMBOLS } from './currency';

export interface ReceiptData {
  receiptNumber: string;
  generatedAt: string;
  /** showPrintBar: true for in-browser view, false for emailed receipts */
  showPrintBar?: boolean;
  expense: {
    id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    frequency: string;
    description?: string | null;
    billed_to_name?: string | null;
    billed_to_email?: string | null;
  };
  /** The Nchiko user who owns the entry — shown as "Issued By" */
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

function formatFrequency(freq: string): string {
  return freq.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatAmount(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  return `${symbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateReceiptHTML(data: ReceiptData): string {
  const { receiptNumber, generatedAt, expense, user, showPrintBar = false } = data;

  const issuedByName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;
  const billedToName  = expense.billed_to_name?.trim()  || null;
  const billedToEmail = expense.billed_to_email?.trim() || null;
  const hasBilledTo   = !!(billedToName || billedToEmail);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt #${receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #f8fafc;
      padding: 40px 20px;
      color: #1e293b;
    }
    .receipt {
      max-width: 560px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.09);
    }
    .receipt-header {
      background: #0f172a;
      color: white;
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-dot { color: #10b981; }
    .receipt-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .receipt-body { padding: 32px; }
    .receipt-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .receipt-number { font-size: 12px; color: #64748b; margin-bottom: 28px; }
    .amount-block {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #86efac;
      border-radius: 10px;
      padding: 22px;
      text-align: center;
      margin-bottom: 28px;
    }
    .amount-label {
      font-size: 11px;
      color: #16a34a;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
    }
    .amount-value { font-size: 38px; font-weight: 800; color: #15803d; }
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      gap: 16px;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 13px; color: #64748b; flex-shrink: 0; }
    .detail-value { font-size: 13px; color: #1e293b; font-weight: 600; text-align: right; word-break: break-word; }
    .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
    .receipt-footer {
      padding: 16px 32px;
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
    .status-badge {
      background: #dcfce7;
      color: #16a34a;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }
    .print-bar {
      max-width: 560px;
      margin: 0 auto 16px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    .btn {
      padding: 9px 18px;
      border-radius: 7px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    .btn-print { background: #0f172a; color: white; }
    .btn-close { background: #f1f5f9; color: #475569; }
    @media print {
      body { background: white; padding: 0; }
      .print-bar { display: none; }
      .receipt { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>

  ${showPrintBar ? `
  <div class="print-bar">
    <button class="btn btn-close" onclick="window.close()">Close</button>
    <button class="btn btn-print" onclick="window.print()">Save as PDF / Print</button>
  </div>` : ''}

  <div class="receipt">
    <div class="receipt-header">
      <div>
        <div class="logo">Nchiko<span class="logo-dot">.</span></div>
        <div class="receipt-label">Financial Command Center</div>
      </div>
      <span class="status-badge">Paid</span>
    </div>

    <div class="receipt-body">
      <div class="receipt-title">Expense Receipt</div>
      <div class="receipt-number">Receipt #${receiptNumber}</div>

      <div class="amount-block">
        <div class="amount-label">Amount</div>
        <div class="amount-value">${formatAmount(expense.amount, expense.currency)}</div>
      </div>

      <div class="section-label">Transaction Details</div>
      <div class="detail-row">
        <span class="detail-label">Description</span>
        <span class="detail-value">${expense.title}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Category</span>
        <span class="detail-value">${expense.category}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${formatDate(expense.date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Frequency</span>
        <span class="detail-value">${formatFrequency(expense.frequency)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Currency</span>
        <span class="detail-value">${expense.currency}</span>
      </div>
      ${expense.description ? `
      <div class="detail-row">
        <span class="detail-label">Notes</span>
        <span class="detail-value">${expense.description}</span>
      </div>` : ''}

      <div class="divider"></div>

      <div class="section-label">Billed To</div>
      ${hasBilledTo ? `
      ${billedToName ? `
      <div class="detail-row">
        <span class="detail-label">Name</span>
        <span class="detail-value">${billedToName}</span>
      </div>` : ''}
      ${billedToEmail ? `
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${billedToEmail}</span>
      </div>` : ''}` : `
      <div class="detail-row">
        <span class="detail-label">Name</span>
        <span class="detail-value">${issuedByName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${user.email}</span>
      </div>`}
      <div class="detail-row">
        <span class="detail-label">Generated</span>
        <span class="detail-value">${formatDate(generatedAt)}</span>
      </div>
    </div>

    <div class="receipt-footer">
      <div class="footer-top">
        <span>Generated by Nchiko &bull; ${new Date(generatedAt).getFullYear()}</span>
        <span>#${receiptNumber}</span>
      </div>
      <div class="footer-brand">
        Powered by <a href="https://ozigi.app" target="_blank" rel="noopener noreferrer">Ozigi GTM</a> &mdash; the all-in-one GTM suite for teams that want to make an impact. &middot; <a href="https://nchiko.ozigi.app/sign-up" target="_blank" rel="noopener noreferrer">Try Nchiko free</a>
      </div>
    </div>
  </div>

</body>
</html>`;
}
