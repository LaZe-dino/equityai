import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'EquityAI <onboarding@resend.dev>';

export async function sendWelcomeEmail(to: string, name: string, role: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to EquityAI!',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
          <h1 style="color: #111;">Welcome to EquityAI, ${name}!</h1>
          <p style="color: #555; line-height: 1.6;">
            ${role === 'founder'
              ? "You're all set to start raising capital. Create your company profile and submit your first offering to get in front of investors."
              : "You're ready to discover promising startups. Browse live offerings and express your interest to connect with founders."
            }
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://equityai.vercel.app'}/dashboard"
            style="display: inline-block; background: linear-gradient(135deg, #f97316, #ef4444); color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; margin-top: 16px;">
            Go to Dashboard
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">
            — The EquityAI Team
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Failed to send welcome email:', e);
  }
}

export async function sendInterestNotification(
  founderEmail: string,
  founderName: string,
  investorName: string,
  offeringTitle: string,
  amount: number | null,
  offeringId: string
) {
  if (!resend) return;
  try {
    const amountStr = amount ? `$${(amount / 100).toLocaleString()}` : 'an undisclosed amount';
    await resend.emails.send({
      from: FROM_EMAIL,
      to: founderEmail,
      subject: `New Interest in "${offeringTitle}"`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
          <h1 style="color: #111;">New Investor Interest!</h1>
          <p style="color: #555; line-height: 1.6;">
            <strong>${investorName}</strong> has expressed interest in your offering
            "<strong>${offeringTitle}</strong>" for ${amountStr}.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://equityai.vercel.app'}/dashboard/interests"
            style="display: inline-block; background: linear-gradient(135deg, #f97316, #ef4444); color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; margin-top: 16px;">
            View Interest
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">
            — The EquityAI Team
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Failed to send interest notification:', e);
  }
}

export async function sendInterestStatusEmail(
  investorEmail: string,
  investorName: string,
  offeringTitle: string,
  status: 'accepted' | 'declined',
  offeringId: string
) {
  if (!resend) return;
  try {
    const isAccepted = status === 'accepted';
    await resend.emails.send({
      from: FROM_EMAIL,
      to: investorEmail,
      subject: `Your interest in "${offeringTitle}" was ${status}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
          <h1 style="color: #111;">${isAccepted ? '🎉 Great news!' : 'Interest Update'}</h1>
          <p style="color: #555; line-height: 1.6;">
            Hi ${investorName}, your interest in "<strong>${offeringTitle}</strong>" has been
            <strong style="color: ${isAccepted ? '#16a34a' : '#dc2626'};">${status}</strong>
            by the founder.
          </p>
          ${isAccepted ? `
            <p style="color: #555; line-height: 1.6;">
              The founder will be in touch with next steps.
            </p>
          ` : `
            <p style="color: #555; line-height: 1.6;">
              Don't worry — there are plenty of other opportunities on EquityAI.
            </p>
          `}
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://equityai.vercel.app'}/offerings"
            style="display: inline-block; background: linear-gradient(135deg, #f97316, #ef4444); color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; margin-top: 16px;">
            ${isAccepted ? 'View Offering' : 'Browse More Offerings'}
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">
            — The EquityAI Team
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Failed to send interest status email:', e);
  }
}
