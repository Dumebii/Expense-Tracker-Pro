import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getOrCreateSupabaseUser } from '@/lib/get-user';
import { generateInvoiceHTML } from '@/lib/invoice';
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
    const { emails, billedToName, billedToEmail, billedToAddress, paymentDetails, paymentTerms, notes } = body as {
      emails: string[];
      billedToName?: string;
      billedToEmail?: string;
      billedToAddress?: string;
      paymentDetails?: string;
      paymentTerms?: string;
      notes?: string;
    };

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'At least one email address is required.' }, { status: 400 });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json(
        {
          error:
            'Email is not configured. Add EMAIL_USER and EMAIL_APP_PASSWORD to your environment variables. ' +
            'For Gmail: enable 2-Step Verification, then create an App Password at myaccount.google.com/apppasswords.',
        },
        { status: 503 }
      );
    }

    const supabase = createSupabaseServerClient();
    const userData = await getOrCreateSupabaseUser(userId);
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.id)
      .single();

    if (!income) return NextResponse.json({ error: 'Income entry not found' }, { status: 404 });

    const clerkUser = await currentUser();
    const invoiceNumber = `INV-${income.date.replace(/-/g, '')}-${id.slice(0, 6).toUpperCase()}`;

    const html = generateInvoiceHTML({
      invoiceNumber,
      generatedAt: new Date().toISOString(),
      income: {
        id: income.id,
        title: income.title,
        amount: income.amount,
        currency: income.currency || 'USD',
        category: income.category,
        date: income.date,
        frequency: income.frequency,
        description: income.description,
      },
      user: {
        email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
      },
      billedToName: billedToName || null,
      billedToEmail: billedToEmail || null,
      billedToAddress: billedToAddress || null,
      paymentDetails: paymentDetails || null,
      paymentTerms: paymentTerms || null,
      notes: notes || null,
    });

    const fromEmail = process.env.EMAIL_USER!;
    const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
    const userName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ');
    const fromName = userName ? `${userName} | Nchiko` : 'Nchiko';

    const sendResults = await Promise.allSettled(
      emails.map((to) =>
        transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          replyTo: clerkEmail || undefined,
          to,
          subject: `Invoice #${invoiceNumber} — ${income.title}`,
          html,
        })
      )
    );

    const succeeded = sendResults.filter((r) => r.status === 'fulfilled').length;
    const failed = sendResults.length - succeeded;

    return NextResponse.json({ success: true, sent: succeeded, failed, invoiceNumber });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
