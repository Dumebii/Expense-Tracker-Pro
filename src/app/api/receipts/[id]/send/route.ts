import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { generateReceiptHTML } from '@/lib/receipt';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { emails } = body as { emails: string[] };

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'At least one email is required' }, { status: 400 });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json(
        {
          error:
            'Email not configured. Add EMAIL_USER and EMAIL_APP_PASSWORD to your environment variables. ' +
            'For Gmail: enable 2-Step Verification, then create an App Password at myaccount.google.com/apppasswords.',
        },
        { status: 503 }
      );
    }

    const supabase = createSupabaseClient();

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: expense } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.id)
      .single();

    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

    const clerkUser = await currentUser();
    const receiptNumber = `RCP-${expense.date.replace(/-/g, '')}-${id.slice(0, 6).toUpperCase()}`;

    const html = generateReceiptHTML({
      receiptNumber,
      generatedAt: new Date().toISOString(),
      expense: {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency || 'USD',
        category: expense.category,
        date: expense.date,
        frequency: expense.frequency,
        description: expense.description,
      },
      user: {
        email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
      },
    });

    const fromEmail = process.env.EMAIL_USER!;
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
    const userName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ');
    const fromName = userName ? `${userName} | Ledger` : 'Ledger';

    const sendResults = await Promise.allSettled(
      emails.map((to) =>
        transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          replyTo: userEmail || undefined,
          to,
          subject: `Receipt for ${expense.title} — #${receiptNumber}`,
          html,
        })
      )
    );

    const succeeded = sendResults.filter((r) => r.status === 'fulfilled').length;
    const failed = sendResults.length - succeeded;

    return NextResponse.json({ success: true, sent: succeeded, failed, receiptNumber });
  } catch (error) {
    console.error('Error sending receipt:', error);
    return NextResponse.json({ error: 'Failed to send receipt' }, { status: 500 });
  }
}
