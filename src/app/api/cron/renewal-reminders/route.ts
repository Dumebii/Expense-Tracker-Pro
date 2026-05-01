/**
 * Renewal Reminder Cron Job
 * Runs daily at 9 AM UTC (configured in vercel.json).
 * Sends email reminders for subscriptions/expenses renewing in 5 days.
 */

import { createSupabaseServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function getNextRenewalDate(dateStr: string, frequency: string): Date | null {
  if (frequency === 'one_time') return null;

  const start = new Date(dateStr + 'T12:00:00Z');
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  const next = new Date(start);

  if (frequency === 'monthly') {
    while (next <= now) {
      next.setUTCMonth(next.getUTCMonth() + 1);
    }
  } else if (frequency === 'annually') {
    while (next <= now) {
      next.setUTCFullYear(next.getUTCFullYear() + 1);
    }
  } else {
    return null;
  }

  return next;
}

function daysFromNow(date: Date): number {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setUTCHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAmount(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', NGN: '₦', INR: '₹', JPY: '¥', AUD: 'A$',
  };
  const symbol = symbols[currency] ?? currency + ' ';
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user, pass },
  });
}

function buildReminderEmail(expense: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  frequency: string;
  renewalDate: Date;
  daysUntil: number;
}, userName: string): string {
  const renewalStr = expense.renewalDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const freqLabel = expense.frequency === 'monthly' ? 'Monthly' : 'Annual';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Upcoming Renewal Reminder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
    .card { background: #fff; border-radius: 12px; max-width: 560px; margin: 0 auto; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #0f172a; padding: 28px 32px; color: white; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 28px 32px; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .amount { font-size: 32px; font-weight: 800; color: #ef4444; margin: 4px 0 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; }
    .detail-value { font-weight: 600; color: #0f172a; }
    .footer { background: #f8fafc; padding: 16px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .cta { display: inline-block; margin-top: 20px; background: #0f172a; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Nchiko · Renewal Reminder</h1>
      <p>Hi ${userName}, you have an upcoming renewal</p>
    </div>
    <div class="body">
      <div class="badge">⏰ Renews in ${expense.daysUntil} day${expense.daysUntil !== 1 ? 's' : ''}</div>
      <h2 style="margin:0;font-size:22px;color:#0f172a">${expense.title}</h2>
      <p class="amount">${formatAmount(expense.amount, expense.currency)}</p>
      <div style="margin-top:24px">
        <div class="detail-row">
          <span class="detail-label">Renewal Date</span>
          <span class="detail-value">${renewalStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category</span>
          <span class="detail-value">${expense.category}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Frequency</span>
          <span class="detail-value">${freqLabel}</span>
        </div>
      </div>
      <p style="margin-top:20px;font-size:14px;color:#64748b">
        This is an automated reminder from Nchiko. You can manage this subscription from your Money Out page.
      </p>
    </div>
    <div class="footer">Nchiko Expense Tracker · You are receiving this because you track recurring expenses.</div>
  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transporter = createTransporter();
  if (!transporter) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 });
  }

  try {
    const supabase = createSupabaseServerClient();

    // Fetch all active recurring expenses
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('id, title, amount, currency, category, date, frequency, user_id')
      .eq('status', 'active')
      .in('frequency', ['monthly', 'annually']);

    if (error) throw error;

    const REMINDER_DAYS = 5;
    let sent = 0;
    let skipped = 0;

    // Cache user lookups to avoid duplicate queries per user
    const userCache: Record<string, { email: string; first_name: string | null; last_name: string | null } | null> = {};

    for (const expense of expenses || []) {
      const nextRenewal = getNextRenewalDate(expense.date, expense.frequency);
      if (!nextRenewal) { skipped++; continue; }

      const days = daysFromNow(nextRenewal);
      if (days !== REMINDER_DAYS) { skipped++; continue; }

      // Fetch user (with cache to avoid N+1 per user)
      if (!(expense.user_id in userCache)) {
        const { data } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', expense.user_id)
          .single();
        userCache[expense.user_id] = data;
      }
      const user = userCache[expense.user_id];
      if (!user?.email) { skipped++; continue; }

      const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'there';

      const html = buildReminderEmail(
        {
          title: expense.title,
          amount: expense.amount,
          currency: expense.currency || 'USD',
          category: expense.category,
          frequency: expense.frequency,
          renewalDate: nextRenewal,
          daysUntil: REMINDER_DAYS,
        },
        userName
      );

      try {
        await transporter.sendMail({
          from: `"Nchiko" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `⏰ Reminder: ${expense.title} renews in ${REMINDER_DAYS} days`,
          html,
        });
        sent++;
      } catch (emailError) {
        console.error(`Failed to send reminder for expense ${expense.id}:`, emailError);
        skipped++;
      }
    }

    console.log(`Renewal reminders: ${sent} sent, ${skipped} skipped`);
    return NextResponse.json({ success: true, sent, skipped });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
