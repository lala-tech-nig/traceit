import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const FROM = `"${process.env.EMAIL_FROM_NAME || 'TraceIt Platform'}" <${process.env.EMAIL_USER}>`;
const APP_URL = process.env.APP_URL || 'https://traceit.com.ng';

// ─── Shared layout wrapper ────────────────────────────────────────────────────
const wrap = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TraceIt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0d0f14; font-family: 'Inter', Arial, sans-serif; color: #e2e8f0; }
    a { text-decoration: none; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f14; padding: 40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; border-radius:20px; overflow:hidden; border:1px solid #1e2535;">

        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 40px; text-align:center; border-bottom: 1px solid #334155;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <div style="display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:14px; padding:12px 22px;">
                    <span style="font-size:22px; font-weight:800; color:#fff; letter-spacing:1px;">🔒 TraceIt</span>
                  </div>
                  <p style="color:#94a3b8; font-size:13px; margin-top:10px; letter-spacing:0.5px;">Protect. Track. Recover.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#111827; padding: 40px 40px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d0f14; padding:28px 40px; border-top:1px solid #1e2535; text-align:center;">
            <p style="color:#4b5563; font-size:12px; line-height:1.7;">
              You received this email because you signed up on TraceIt.<br/>
              © ${new Date().getFullYear()} TraceIt · <a href="${APP_URL}" style="color:#6366f1;">traceit.com.ng</a> ·
              <a href="${APP_URL}/dashboard" style="color:#6366f1;">Go to Dashboard</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Helper: CTA Button ───────────────────────────────────────────────────────
const btn = (text, url, color = '#6366f1') =>
  `<a href="${url}" style="display:inline-block; background:${color}; color:#fff; font-weight:700;
   font-size:15px; padding:14px 32px; border-radius:10px; margin-top:8px; letter-spacing:0.3px;">${text}</a>`;

// ─── Helper: Feature Card ─────────────────────────────────────────────────────
const card = (emoji, title, desc) =>
  `<td width="50%" style="padding:8px; vertical-align:top;">
    <div style="background:#1e293b; border-radius:12px; padding:18px; border:1px solid #334155;">
      <div style="font-size:26px; margin-bottom:8px;">${emoji}</div>
      <p style="color:#e2e8f0; font-weight:700; font-size:14px; margin-bottom:6px;">${title}</p>
      <p style="color:#94a3b8; font-size:13px; line-height:1.6;">${desc}</p>
    </div>
  </td>`;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. WELCOME EMAIL — sent immediately after registration
// ═══════════════════════════════════════════════════════════════════════════════
export const sendWelcomeEmail = async (user) => {
    const html = wrap(`
      <!-- Greeting -->
      <h1 style="font-size:28px; font-weight:800; color:#f1f5f9; margin-bottom:10px;">
        Welcome aboard, ${user.firstName}! 🎉
      </h1>
      <p style="color:#94a3b8; font-size:15px; line-height:1.7; margin-bottom:28px;">
        You've just joined Nigeria's most powerful device protection &amp; recovery platform.
        Here's everything you need to know to get started!
      </p>

      <!-- What is TraceIt -->
      <div style="background:linear-gradient(135deg,#1e1b4b,#1e293b); border-radius:14px; padding:24px; margin-bottom:28px; border:1px solid #4338ca;">
        <p style="color:#a5b4fc; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">What is TraceIt?</p>
        <p style="color:#c7d2fe; font-size:15px; line-height:1.8;">
          TraceIt is a <strong style="color:#fff;">next-generation device security ecosystem</strong> that lets you
          register, track, and protect your phones, laptops, tablets, and gadgets — with the power
          of a nationwide network of verified agents ready to help recover them if stolen or lost.
        </p>
      </div>

      <!-- Feature grid -->
      <p style="color:#64748b; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:16px;">What you can do on TraceIt</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          ${card('🛡️', 'Protect Your Devices', 'Register all your gadgets and get a unique TraceIt ID that makes recovery possible anywhere in Nigeria.')}
          ${card('🔍', 'Search & Report Stolen Devices', 'Instantly check if any device is stolen, blacklisted, or flagged across our national database.')}
        </tr>
        <tr style="margin-top:0;">
          ${card('💰', 'Earn Real Money', 'Refer friends, become a Verificator, sell device-protection plans, or earn commission on every approval you facilitate.')}
          ${card('🌐', 'Nationwide Agent Network', 'Our growing network of verified agents across Nigeria ensures your devices are never truly lost.')}
        </tr>
      </table>

      <!-- How to earn -->
      <div style="background:#0f2213; border-radius:14px; padding:24px; margin-bottom:28px; border:1px solid #166534;">
        <p style="color:#4ade80; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px;">💸 Ways to Make Money on TraceIt</p>
        <ul style="color:#86efac; font-size:14px; line-height:2; padding-left:20px;">
          <li><strong style="color:#fff;">Referral Commissions</strong> — Earn ₦100 every time someone you referred gets approved</li>
          <li><strong style="color:#fff;">Become a Verificator</strong> — Get paid per verified user you physically confirm in your area</li>
          <li><strong style="color:#fff;">Device Recovery Rewards</strong> — Help reunite owners with their stolen devices and earn</li>
          <li><strong style="color:#fff;">Vendorship Programme</strong> — Sell TraceIt protection plans and earn recurring commission</li>
        </ul>
      </div>

      <!-- Next steps -->
      <p style="color:#64748b; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:16px;">Your next steps</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding:0 0 12px;">
            <div style="display:flex; align-items:center; background:#1e2535; border-radius:10px; padding:14px 18px; border-left:4px solid #6366f1;">
              <span style="font-size:20px; margin-right:14px;">1️⃣</span>
              <p style="color:#e2e8f0; font-size:14px; line-height:1.5;"><strong>Complete your profile</strong> — Upload your NIN &amp; photo to get fully verified</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px;">
            <div style="background:#1e2535; border-radius:10px; padding:14px 18px; border-left:4px solid #8b5cf6;">
              <span style="font-size:20px; margin-right:14px;">2️⃣</span>
              <p style="color:#e2e8f0; font-size:14px; line-height:1.5;"><strong>Register your first device</strong> — Protect your phone or laptop today</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px;">
            <div style="background:#1e2535; border-radius:10px; padding:14px 18px; border-left:4px solid #06b6d4;">
              <span style="font-size:20px; margin-right:14px;">3️⃣</span>
              <p style="color:#e2e8f0; font-size:14px; line-height:1.5;"><strong>Share your referral link</strong> — Start earning from day one</p>
            </div>
          </td>
        </tr>
      </table>

      <div style="text-align:center; margin-top:8px;">
        ${btn('🚀 Go to My Dashboard', `${APP_URL}/dashboard`)}
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `Welcome to TraceIt, ${user.firstName}! 🎉 Start Protecting Your Devices Today`,
        html,
    });
    console.log(`[EMAIL] Welcome email sent → ${user.email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ACTIVATION REMINDER — sent 24h after registration if still not approved
// ═══════════════════════════════════════════════════════════════════════════════
export const sendActivationReminderEmail = async (user) => {
    const html = wrap(`
      <!-- Greeting -->
      <div style="text-align:center; margin-bottom:32px;">
        <div style="font-size:52px; margin-bottom:12px;">⏳</div>
        <h1 style="font-size:26px; font-weight:800; color:#f1f5f9; margin-bottom:10px;">
          Hey ${user.firstName}, your account is pending activation!
        </h1>
        <p style="color:#94a3b8; font-size:15px; line-height:1.7; max-width:440px; margin:0 auto;">
          You registered on TraceIt over 24 hours ago but your platform is not yet active.
          You're one step away from protecting your devices and unlocking your earning potential!
        </p>
      </div>

      <!-- Status Banner -->
      <div style="background:linear-gradient(135deg,#451a03,#1c1917); border-radius:14px; padding:22px 24px; margin-bottom:28px; border:1px solid #92400e; text-align:center;">
        <p style="color:#fde68a; font-size:13px; font-weight:700; letter-spacing:0.5px; margin-bottom:6px;">⚠️ ACTION REQUIRED</p>
        <p style="color:#fef3c7; font-size:15px; line-height:1.7;">
          ${!user.hasPaid
            ? 'You have not yet completed your <strong>platform activation payment</strong>. This is what keeps your account active and your devices protected.'
            : 'Your payment was received! Our team is currently <strong>reviewing your account</strong>. Make sure your NIN and profile details are complete to speed up approval.'}
        </p>
      </div>

      <!-- What you're missing -->
      <p style="color:#64748b; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:16px;">What you're missing out on</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          ${card('🛡️', 'Device Protection', 'You can\'t register or protect your devices without an active account.')}
          ${card('💰', 'Referral Earnings', 'Your referral commissions are locked until you activate.')}
        </tr>
        <tr>
          ${card('🔍', 'Search Access', 'Full access to the national device database requires activation.')}
          ${card('📋', 'Verificator Programme', 'You can\'t apply to become a paid verificator without approval.')}
        </tr>
      </table>

      <!-- Steps to activate -->
      <div style="background:#0c1a2e; border-radius:14px; padding:24px; margin-bottom:28px; border:1px solid #1e40af;">
        <p style="color:#60a5fa; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:14px;">How to activate your account</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 0 10px;">
            <div style="background:#1e2535; border-radius:8px; padding:12px 16px; border-left:3px solid #6366f1;">
              <p style="color:#e2e8f0; font-size:14px;"><strong style="color:#a5b4fc;">Step 1:</strong> Log in to your TraceIt dashboard</p>
            </div>
          </td></tr>
          <tr><td style="padding:0 0 10px;">
            <div style="background:#1e2535; border-radius:8px; padding:12px 16px; border-left:3px solid #8b5cf6;">
              <p style="color:#e2e8f0; font-size:14px;"><strong style="color:#a5b4fc;">Step 2:</strong> Submit your NIN if you haven't already</p>
            </div>
          </td></tr>
          <tr><td>
            <div style="background:#1e2535; border-radius:8px; padding:12px 16px; border-left:3px solid #06b6d4;">
              <p style="color:#e2e8f0; font-size:14px;"><strong style="color:#a5b4fc;">Step 3:</strong> Complete your one-time activation payment to go live</p>
            </div>
          </td></tr>
        </table>
      </div>

      <div style="text-align:center;">
        ${btn('✅ Activate My Account Now', `${APP_URL}/dashboard`, '#f59e0b')}
        <p style="color:#4b5563; font-size:12px; margin-top:14px;">
          Need help? Reply to this email or contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#6366f1;">${process.env.EMAIL_USER}</a>
        </p>
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `⏳ ${user.firstName}, your TraceIt account needs activation — complete it today!`,
        html,
    });
    console.log(`[EMAIL] Activation reminder sent → ${user.email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. RE-ENGAGEMENT EMAIL — sent to users who haven't logged in for 2+ weeks
// ═══════════════════════════════════════════════════════════════════════════════
export const sendReEngagementEmail = async (user) => {
    const html = wrap(`
      <!-- Hero Section -->
      <div style="text-align:center; margin-bottom:32px;">
        <div style="font-size:58px; margin-bottom:14px;">😔</div>
        <h1 style="font-size:28px; font-weight:800; color:#f1f5f9; margin-bottom:12px; line-height:1.3;">
          We miss you, ${user.firstName}!
        </h1>
        <p style="color:#94a3b8; font-size:15px; line-height:1.8; max-width:460px; margin:0 auto;">
          It's been a while since we last saw you on TraceIt. Your devices haven't forgotten you —
          and neither have we. 💙
        </p>
      </div>

      <!-- Warm message -->
      <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a); border-radius:16px; padding:28px; margin-bottom:28px; border:1px solid #4338ca; text-align:center;">
        <p style="color:#c7d2fe; font-size:16px; line-height:1.9; font-style:italic;">
          "Every day you're away, your devices are unguarded. The TraceIt network is stronger than ever —
          with more agents, more features, and more ways for you to earn. Come back and reclaim your security."
        </p>
        <p style="color:#6366f1; font-weight:700; font-size:14px; margin-top:14px;">— The TraceIt Team</p>
      </div>

      <!-- What's new / waiting for them -->
      <p style="color:#64748b; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:16px;">Here's what's waiting for you</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          ${card('📱', 'Your Devices', 'Log back in to check the status and protection level of all your registered devices.')}
          ${card('💳', 'Pending Rewards', 'You may have unclaimed referral commissions or reward points waiting in your wallet.')}
        </tr>
        <tr>
          ${card('🆕', 'New Features', 'We\'ve added new tools for device tracking, NIN verification and more since your last visit.')}
          ${card('🤝', 'Grow Your Network', 'Your referral link is still active — share it and earn ₦100 per approved member.')}
        </tr>
      </table>

      <!-- Earn reminder -->
      <div style="background:#0f2213; border-radius:14px; padding:22px 24px; margin-bottom:28px; border:1px solid #166534;">
        <p style="color:#4ade80; font-size:13px; font-weight:700; letter-spacing:0.5px; margin-bottom:10px;">💰 Don't leave money on the table!</p>
        <p style="color:#86efac; font-size:14px; line-height:1.8;">
          TraceIt members are actively earning through referrals, device plans, and the Verificator Programme.
          The longer you stay away, the more earning opportunities pass you by. Come back and start
          <strong style="color:#fff;">building an income stream</strong> around device security today.
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center; padding:8px 0 4px;">
        ${btn('🔑 Log Back In Now', `${APP_URL}/login`, '#6366f1')}
        <p style="color:#4b5563; font-size:13px; margin-top:18px; line-height:1.7;">
          Have questions or need help? We're always here.<br/>
          <a href="mailto:${process.env.EMAIL_USER}" style="color:#6366f1;">${process.env.EMAIL_USER}</a>
        </p>
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `We miss you, ${user.firstName}! 😔 Your TraceIt account is waiting for you`,
        html,
    });
    console.log(`[EMAIL] Re-engagement email sent → ${user.email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CUSTOM EMAIL — admin-drafted message sent to any user
// ═══════════════════════════════════════════════════════════════════════════════
export const sendCustomEmail = async (user, subject, bodyHtml) => {
    const html = wrap(`
      <h1 style="font-size:24px; font-weight:800; color:#f1f5f9; margin-bottom:20px;">
        Hi ${user.firstName},
      </h1>
      <div style="color:#cbd5e1; font-size:15px; line-height:1.85;">
        ${bodyHtml}
      </div>
      <div style="margin-top:32px; text-align:center;">
        ${btn('🔑 Visit Your Dashboard', `${APP_URL}/dashboard`)}
        <p style="color:#4b5563; font-size:12px; margin-top:16px;">
          Questions? Email us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#6366f1;">${process.env.EMAIL_USER}</a>
        </p>
      </div>
    `);

    await transporter.sendMail({ from: FROM, to: user.email, subject, html });
    console.log(`[EMAIL] Custom email sent → ${user.email}`);
};
