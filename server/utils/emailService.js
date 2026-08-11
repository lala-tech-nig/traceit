import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'mail.traceit.com.ng',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE !== 'false', // true for port 465 (SSL)
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
    const whatsappLink = `https://wa.me/2348121444306?text=Hello%20TraceIt%20Support%2C%20I%20just%20registered%20and%20need%20help%20getting%20started.`;

    const stepBlock = (num, color, title, body) =>
      `<div style="margin-bottom:14px;background:#111827;padding:16px 20px;border-radius:12px;border-left:5px solid ${color}">
        <p style="color:#fff;font-size:14px;font-weight:800;margin-bottom:6px;">${num}. ${title}</p>
        <p style="color:#94a3b8;font-size:13px;line-height:1.8;margin:0;">${body}</p>
      </div>`;

    const tipBlock = (emoji, label, text) =>
      `<div style="background:#1a2744;border-radius:10px;padding:12px 16px;margin-bottom:10px;border:1px solid #2d3f66">
        <p style="color:#93c5fd;font-size:13px;font-weight:800;margin-bottom:4px;">${emoji} ${label}</p>
        <p style="color:#bfdbfe;font-size:13px;line-height:1.7;margin:0;">${text}</p>
      </div>`;

    const html = wrap(`
      <h1 style="font-size:28px;font-weight:800;color:#f1f5f9;margin-bottom:10px;">Welcome to TraceIt, ${user.firstName}! 🎉</h1>
      <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin-bottom:28px;">
        You've just joined Nigeria's most powerful device protection &amp; recovery platform.
        This email contains <strong style="color:#fff;">everything you need</strong> to get started — please read it carefully.
      </p>

      <!-- What is TraceIt -->
      <div style="background:linear-gradient(135deg,#1e1b4b,#1e293b);border-radius:14px;padding:24px;margin-bottom:28px;border:1px solid #4338ca">
        <p style="color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">What is TraceIt?</p>
        <p style="color:#c7d2fe;font-size:15px;line-height:1.8">
          TraceIt is Nigeria's <strong style="color:#fff">National Gadget Registry &amp; Anti-Theft Platform</strong>.
          Every device you register gets a permanent, tamper-proof ownership record tied to your verified NIN identity.
          If stolen, it gets flagged across our network — protecting you legally and helping you recover it.
        </p>
      </div>

      <!-- Step 1: Verify NIN -->
      <p style="color:#f97316;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">🔐 Step 1 — Verify Your Identity (NIN)</p>
      ${stepBlock('1.1','#f97316','Pay Your NIN Verification Fee','Log into your dashboard and pay the one-time ₦500 NIN verification fee. This is a mandatory platform security requirement — it keeps fraudsters off the registry and protects every honest user.')}
      ${stepBlock('1.2','#f97316','Submit Your 11-Digit NIN Number','Enter your National Identification Number (NIN) exactly as it appears on your NIMC card or NIN slip. Your first and last name on TraceIt MUST match your NIN records exactly.')}
      ${stepBlock('1.3','#f97316','Wait for Admin Approval','Our security team will verify your identity, usually within a few hours. You will receive an email confirmation once approved, giving you full access to add and manage your devices.')}

      <!-- Step 2: Find IMEI / Serial -->
      <p style="color:#22c55e;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;margin-top:24px">📱 Step 2 — How to Find Your Device IMEI or Serial Number</p>

      <div style="background:#0d1f0f;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #166534">
        <p style="color:#4ade80;font-size:13px;font-weight:800;margin-bottom:10px">📱 ANDROID PHONES — Getting Your IMEI</p>
        ${tipBlock('①','Dial *#06# (Fastest)','Open your Phone Dialer app and dial <strong style="color:#fff">*#06#</strong> — your IMEI number will appear on screen immediately. Write it down or screenshot it.')}
        ${tipBlock('②','Settings → About Phone','Go to <strong style="color:#fff">Settings → About Phone → Status → IMEI Information</strong>. Dual-SIM phones have two IMEIs — use IMEI 1.')}
        ${tipBlock('③','Phone Retail Box','Your IMEI is printed on the original retail box label on the side or back of the box.')}
        ${tipBlock('④','Under Battery (Older Phones)','On removable-battery phones: turn off the device, remove back cover and battery — the IMEI sticker is on the inside.')}
      </div>

      <div style="background:#0d1f0f;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #166534">
        <p style="color:#4ade80;font-size:13px;font-weight:800;margin-bottom:10px">🍎 iPHONE — Getting Your IMEI</p>
        ${tipBlock('①','Dial *#06#','Open the Phone app → tap Keypad → dial <strong style="color:#fff">*#06#</strong>. Your IMEI displays immediately.')}
        ${tipBlock('②','Settings → General → About','Scroll down to find the IMEI field in Settings.')}
        ${tipBlock('③','SIM Card Tray (Older iPhones)','On iPhone 6s and earlier, the IMEI is engraved on the SIM card tray itself.')}
        ${tipBlock('④','iCloud','Log into <strong style="color:#fff">icloud.com/find</strong>, select your iPhone, click the (i) info button to view the IMEI.')}
      </div>

      <div style="background:#0a1929;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #1e3a5f">
        <p style="color:#60a5fa;font-size:13px;font-weight:800;margin-bottom:10px">💻 MacBook / Apple Laptops — Serial Number</p>
        ${tipBlock('①','Apple Menu','Click the <strong style="color:#fff">🍎 Apple logo</strong> in the top-left → select <strong style="color:#fff">About This Mac</strong>. Your Serial Number is shown directly.')}
        ${tipBlock('②','Bottom of the MacBook','The serial number is engraved in small text on the underside of your MacBook near the regulatory text.')}
        ${tipBlock('③','Original Apple Box','The serial number barcode is on a label on the side or bottom of the retail box.')}
      </div>

      <div style="background:#0a1929;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #1e3a5f">
        <p style="color:#60a5fa;font-size:13px;font-weight:800;margin-bottom:10px">🖥️ Windows Laptops (HP, Dell, Lenovo, Asus, Acer etc.) — Serial Number</p>
        ${tipBlock('①','Sticker on the Base','Flip your laptop over — there is a sticker on the bottom showing the <strong style="color:#fff">Serial Number (S/N)</strong>.')}
        ${tipBlock('②','Command Prompt','Press <strong style="color:#fff">Windows Key + R</strong> → type <strong style="color:#fff">cmd</strong> → press Enter → type: <strong style="color:#fff">wmic bios get serialnumber</strong> → press Enter.')}
        ${tipBlock('③','System Information','Press <strong style="color:#fff">Windows Key + R</strong> → type <strong style="color:#fff">msinfo32</strong> → press Enter. Look for <strong style="color:#fff">System Serial Number</strong>.')}
        ${tipBlock('④','BIOS Screen','Restart the laptop and press F2, F10, or Delete (varies by brand) to enter BIOS — the serial number is listed under System Information.')}
      </div>

      <div style="background:#1a0a2e;border-radius:14px;padding:20px 22px;margin-bottom:20px;border:1px solid #5b21b6">
        <p style="color:#c4b5fd;font-size:13px;font-weight:800;margin-bottom:10px">📷 Digital Cameras — Serial Number</p>
        ${tipBlock('①','Camera Bottom/Side Panel','Look on the bottom or side panel of the camera body for a sticker or engraved serial number.')}
        ${tipBlock('②','Battery Compartment','Open the battery compartment door — the serial number label is often printed inside or on the interior wall.')}
        ${tipBlock('③','Camera Menu','Turn on the camera → go to <strong style="color:#fff">Menu → Setup/Wrench Icon → Firmware Version or Device Info</strong>. Varies by brand (Canon, Nikon, Sony, Fujifilm).')}
        ${tipBlock('④','Original Retail Box','The serial number barcode is always on the retail box label on the side or back.')}
      </div>

      <!-- Step 3: Register Device -->
      <p style="color:#f97316;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;margin-top:4px">🛡️ Step 3 — Register Your Device on TraceIt</p>
      ${stepBlock('3.1','#f97316','Log In to Your Dashboard','Visit <a href="' + APP_URL + '/dashboard" style="color:#f97316">' + APP_URL + '/dashboard</a> and log in with your email and password.')}
      ${stepBlock('3.2','#f97316','Go to the "Devices" Tab','Click on <strong style="color:#fff">Devices</strong> in the left sidebar menu of your dashboard.')}
      ${stepBlock('3.3','#f97316','Click "Register New Device"','Press the Register New Device button at the top of the Devices page.')}
      ${stepBlock('3.4','#f97316','Fill In All Device Details','Enter: Device Type (Phone/Laptop/Tablet/Camera), Brand, Model Name, IMEI or Serial Number, Condition (New or Used), and Purchase Date.')}
      ${stepBlock('3.5','#f97316','Upload Your Proof of Purchase','Upload a clear photo of your purchase receipt, invoice, or original box label. This is your legal proof of ownership stored permanently.')}
      ${stepBlock('3.6','#22c55e','Save — Your Device is Now Protected!','Click Save. Your device is now on the national registry. You will receive a digital Proof of Ownership Certificate you can share with anyone who wants to verify your ownership.')}

      <!-- Step 4: Search Before Buying -->
      <p style="color:#06b6d4;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;margin-top:24px">🔍 Step 4 — Always Search a Device Before Buying</p>
      <div style="background:#061a22;border-radius:14px;padding:18px 20px;margin-bottom:16px;border:1px solid #0e7490">
        <p style="color:#e2e8f0;font-size:14px;line-height:1.8;margin-bottom:12px">
          <strong style="color:#22d3ee">⚠️ IMPORTANT: Never pay for a second-hand phone, laptop, or gadget without checking its IMEI or serial number on TraceIt first.</strong>
          Buying a stolen device could get you in trouble with law enforcement — even if you were unaware it was stolen.
        </p>
        ${tipBlock('①','Log In → Find "Check/Search Device"','Log into your dashboard and look for the Search Device or Check Device option in the menu.')}
        ${tipBlock('②','Ask the Seller for the IMEI/Serial','For phones: ask the seller to dial <strong style="color:#fff">*#06#</strong> in front of you to show the IMEI. For laptops: check the sticker on the base.')}
        ${tipBlock('③','Enter the IMEI or Serial Number','Type it into the search box and submit.')}
        ${tipBlock('④','Read the Result','<strong style="color:#4ade80">GREEN / CLEAN</strong> = Safe to buy. <strong style="color:#f87171">RED / STOLEN</strong> = Do NOT buy. <strong style="color:#fbbf24">YELLOW / DISPUTED</strong> = Ask for documentation. If in doubt, walk away.')}
      </div>

      <!-- Step 5: How Transfer Works -->
      <p style="color:#f59e0b;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;margin-top:4px">🤝 Step 5 — How Device Transfer Works (Buying from a Vendor)</p>
      <div style="background:#1a1400;border-radius:14px;padding:18px 20px;margin-bottom:20px;border:1px solid #92400e">
        <p style="color:#fde68a;font-size:14px;line-height:1.8;margin-bottom:14px">
          Any vendor or seller on TraceIt with a registered device must <strong style="color:#fff">transfer ownership to you before you pay</strong>. Here is how that works:
        </p>
        ${tipBlock('①','Give the Seller Your TraceIt Email','Tell the vendor your TraceIt registered email address so they can initiate the transfer.')}
        ${tipBlock('②','Vendor Sends Transfer Request','The seller logs into their TraceIt dashboard → finds the device → clicks <strong style="color:#fff">Transfer Ownership</strong> → enters your email and submits.')}
        ${tipBlock('③','You Get a Transfer Notification','Log into your dashboard → go to <strong style="color:#fff">Transfers</strong> section → you will see the pending transfer request waiting for you.')}
        ${tipBlock('④','Check IMEI Matches the Physical Device','Before accepting, compare the IMEI or serial number shown in the transfer request with the physical device in front of you. They must match exactly.')}
        ${tipBlock('⑤','Accept the Transfer','Click <strong style="color:#fff">Accept Transfer</strong>. The device ownership is now moved to your account with a permanent digital receipt generated for both parties.')}
        ${tipBlock('⑥','NOW Make Your Payment','<strong style="color:#4ade80">Only after accepting the transfer</strong> should you hand over payment. You now own the device on the national registry and are fully legally protected.')}
      </div>

      <!-- WhatsApp Support -->
      <div style="background:#064e3b;border-radius:14px;padding:20px;text-align:center;margin-bottom:28px;border:1px solid #059669">
        <p style="color:#a7f3d0;font-size:14px;font-weight:700;margin-bottom:6px">💬 Need Help Getting Started?</p>
        <p style="color:#6ee7b7;font-size:13px;margin-bottom:14px">Our support team is on WhatsApp. They will walk you through every step at no cost to you.</p>
        <a href="${whatsappLink}" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;font-weight:800;font-size:14px;padding:12px 28px;border-radius:30px;text-decoration:none">
          💬 Chat on WhatsApp — +234 812 144 4306
        </a>
      </div>

      <div style="text-align:center;margin-top:8px">
        ${btn('🚀 Go to My Dashboard', APP_URL + '/dashboard')}
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `Welcome to TraceIt, ${user.firstName}! 🎉 Your Complete Getting Started Guide`,
        html,
    });
    console.log(`[EMAIL] Welcome email sent → ${user.email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ACTIVATION REMINDER — sent 24h after registration if still not approved
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Returns a natural, exact elapsed-time string since the user registered.
 * - Under 48h  → "27 hours ago"
 * - 2+ days    → "3 days ago"
 */
const timeSinceRegistration = (createdAt) => {
    if (!createdAt) return 'over 24 hours ago';
    const diffMs   = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs  = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60)  return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHrs  < 48)  return `${diffHrs} hour${diffHrs  !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

export const sendActivationReminderEmail = async (user) => {
    const elapsed = timeSinceRegistration(user.createdAt);

    const html = wrap(`
      <!-- Greeting -->
      <div style="text-align:center; margin-bottom:32px;">
        <div style="font-size:52px; margin-bottom:16px;">⏳</div>
        <h1 style="font-size:26px; font-weight:800; color:#f1f5f9; margin-bottom:12px; line-height:1.3;">
          Still waiting to get started, ${user.firstName}?
        </h1>
        <p style="color:#94a3b8; font-size:15px; line-height:1.8; max-width:460px; margin:0 auto;">
          You signed up on TraceIt <strong style="color:#e2e8f0;">${elapsed}</strong> and your account still isn't active.
          It only takes a couple of minutes — let's get you sorted.
        </p>
      </div>

      <!-- Status Banner -->
      <div style="background:linear-gradient(135deg,#3b1a00,#1c1412); border-radius:16px; padding:24px 28px; margin-bottom:28px; border:1px solid #92400e;">
        <p style="color:#fbbf24; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">⚠️ Your account needs attention</p>
        <p style="color:#fef3c7; font-size:15px; line-height:1.8;">
          ${!user.hasPaid
            ? 'It looks like your <strong style="color:#fff;">activation payment</strong> hasn\'t come through yet. That\'s the one thing standing between you and full access — once done, we\'ll review your account right away.'
            : 'Great news — your payment is confirmed! We\'re just waiting on your <strong style="color:#fff;">NIN verification</strong> to wrap things up. Log in and make sure everything is complete.'}
        </p>
      </div>

      <!-- What you're missing -->
      <p style="color:#475569; font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:14px;">Here's what's waiting for you</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          ${card('🛡️', 'Device Protection', 'Register and protect all your gadgets once your account is live.')}
          ${card('💰', 'Referral Earnings', 'Referral commissions are on hold until your account is approved.')}
        </tr>
        <tr>
          ${card('🔍', 'Search Access', 'Look up any device on our national database — available after activation.')}
          ${card('📋', 'Verificator Role', 'Earn money verifying users in your area. Requires an active account first.')}
        </tr>
      </table>

      <!-- Steps to activate -->
      <div style="background:#0b1929; border-radius:16px; padding:26px 28px; margin-bottom:28px; border:1px solid #1e3a5f;">
        <p style="color:#60a5fa; font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:16px;">3 quick steps to activate</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 0 10px;">
            <div style="background:#111f35; border-radius:10px; padding:14px 18px; border-left:3px solid #6366f1; display:flex; align-items:center;">
              <p style="color:#e2e8f0; font-size:14px; line-height:1.6; margin:0;">
                <strong style="color:#818cf8;">1 &nbsp;→&nbsp;</strong> Log in to your TraceIt dashboard
              </p>
            </div>
          </td></tr>
          <tr><td style="padding:0 0 10px;">
            <div style="background:#111f35; border-radius:10px; padding:14px 18px; border-left:3px solid #a78bfa;">
              <p style="color:#e2e8f0; font-size:14px; line-height:1.6; margin:0;">
                <strong style="color:#c4b5fd;">2 &nbsp;→&nbsp;</strong> Upload your NIN if you haven't already
              </p>
            </div>
          </td></tr>
          <tr><td>
            <div style="background:#111f35; border-radius:10px; padding:14px 18px; border-left:3px solid #22d3ee;">
              <p style="color:#e2e8f0; font-size:14px; line-height:1.6; margin:0;">
                <strong style="color:#67e8f9;">3 &nbsp;→&nbsp;</strong> Complete your one-time activation payment and you're live
              </p>
            </div>
          </td></tr>
        </table>
      </div>

      <div style="text-align:center; padding-bottom:4px;">
        ${btn('✅ Complete My Activation', `${APP_URL}/dashboard`, '#f59e0b')}
        <p style="color:#4b5563; font-size:12px; margin-top:16px; line-height:1.8;">
          Got questions? Just reply to this email — we're real people and we'll get back to you.<br/>
          Or reach us directly at <a href="mailto:${process.env.EMAIL_USER}" style="color:#6366f1;">${process.env.EMAIL_USER}</a>
        </p>
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `${user.firstName}, you signed up ${elapsed} — let's finish your activation`,
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

// ═══════════════════════════════════════════════════════════════════════════════
// 5. OTP EMAIL — sent during account creation for verification
// ═══════════════════════════════════════════════════════════════════════════════
export const sendOtpEmail = async (email, otp, firstName) => {
    const html = wrap(`
      <div style="text-align:center; margin-bottom:32px;">
        <div style="font-size:52px; margin-bottom:12px;">🔐</div>
        <h1 style="font-size:26px; font-weight:800; color:#f1f5f9; margin-bottom:10px;">
          Verify your email address
        </h1>
        <p style="color:#94a3b8; font-size:15px; line-height:1.7; max-width:440px; margin:0 auto;">
          Hi ${firstName || 'there'}, you're almost done creating your TraceIt account! Please use the code below to verify your email.
        </p>
      </div>

      <div style="background:#1e2535; border-radius:14px; padding:32px; margin-bottom:28px; border:1px solid #334155; text-align:center;">
        <p style="color:#94a3b8; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px;">Your Verification Code</p>
        <div style="font-size:42px; font-weight:800; color:#6366f1; letter-spacing:8px; margin:0 auto; padding:16px; background:#0f172a; border-radius:12px; display:inline-block; border:1px dashed #4338ca;">
          ${otp}
        </div>
        <p style="color:#64748b; font-size:13px; margin-top:16px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>

      <div style="text-align:center;">
        <p style="color:#4b5563; font-size:12px; margin-top:14px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `Your TraceIt Verification Code: ${otp}`,
        html,
    });
    console.log(`[EMAIL] OTP email sent → ${email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ADMIN ALERT EMAIL — sent to platform owner for key platform events
// ═══════════════════════════════════════════════════════════════════════════════
const ADMIN_EMAIL = 'lalatechnigltd@gmail.com';

export const sendAdminAlert = async (subject, details) => {
    const now = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'medium' });

    const rows = Object.entries(details)
        .map(([key, val]) => `
          <tr>
            <td style="padding:10px 16px; font-size:13px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; border-bottom:1px solid #1e2535;">${key}</td>
            <td style="padding:10px 16px; font-size:14px; color:#e2e8f0; border-bottom:1px solid #1e2535; word-break:break-word;">${val ?? '—'}</td>
          </tr>`)
        .join('');

    const html = wrap(`
      <div style="text-align:center; margin-bottom:28px;">
        <div style="font-size:48px; margin-bottom:12px;">🔔</div>
        <h1 style="font-size:22px; font-weight:800; color:#f1f5f9; margin-bottom:8px;">Admin Alert</h1>
        <p style="color:#94a3b8; font-size:14px;">${now}</p>
      </div>

      <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a); border-radius:14px; padding:18px 22px; margin-bottom:24px; border:1px solid #4338ca;">
        <p style="color:#a5b4fc; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">Event</p>
        <p style="color:#e2e8f0; font-size:16px; font-weight:800;">${subject}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px; overflow:hidden; border:1px solid #1e2535; margin-bottom:24px;">
        <tbody>${rows}</tbody>
      </table>

      <div style="text-align:center; padding-top:8px;">
        ${btn('🔑 Open Admin Panel', `${APP_URL}/admin`, '#6366f1')}
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `[TraceIt Alert] ${subject}`,
        html,
    });
    console.log(`[EMAIL] Admin alert sent → ${ADMIN_EMAIL} | ${subject}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. NIN VERIFIED EMAIL — sent when user NIN is verified
// ═══════════════════════════════════════════════════════════════════════════════
export const sendNinVerifiedEmail = async (user) => {
    const whatsappLink = `https://wa.me/2348121444306?text=Hello%20TraceIt%20Support%2C%20my%20NIN%20has%20been%20verified%20and%20I%20need%20help.`;

    const stepBlock = (num, color, title, body) =>
      `<div style="margin-bottom:12px;background:#0d1f0f;padding:14px 18px;border-radius:12px;border-left:5px solid ${color}">
        <p style="color:#fff;font-size:14px;font-weight:800;margin-bottom:5px;">${num}. ${title}</p>
        <p style="color:#86efac;font-size:13px;line-height:1.8;margin:0;">${body}</p>
      </div>`;

    const tipBlock = (emoji, label, text) =>
      `<div style="background:#0a1f0a;border-radius:10px;padding:12px 16px;margin-bottom:10px;border:1px solid #166534">
        <p style="color:#4ade80;font-size:13px;font-weight:800;margin-bottom:4px;">${emoji} ${label}</p>
        <p style="color:#86efac;font-size:13px;line-height:1.7;margin:0;">${text}</p>
      </div>`;

    const html = wrap(`
      <div style="text-align:center;margin-bottom:28px">
        <div style="font-size:52px;margin-bottom:12px">🎉</div>
        <h1 style="font-size:26px;font-weight:800;color:#22c55e;margin-bottom:8px">
          Congratulations, ${user.firstName}! Your Identity is Now Verified!
        </h1>
        <p style="color:#94a3b8;font-size:15px;margin-top:8px;line-height:1.7;max-width:480px;margin-left:auto;margin-right:auto">
          Your NIN has been officially confirmed on the TraceIt National Gadget Registry.
          You now have <strong style="color:#fff">full access</strong> to register, protect, search, transfer, and manage all your electronic devices.
          Read this complete guide — it covers everything you need to know.
        </p>
      </div>

      <!-- PART 1: HOW TO FIND IMEI / SERIAL -->
      <p style="color:#22c55e;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">📱 Part 1 — How to Get Your Device IMEI or Serial Number</p>

      <div style="background:#0d1a0d;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #166534">
        <p style="color:#4ade80;font-size:13px;font-weight:800;margin-bottom:10px">📱 ANDROID PHONES — IMEI</p>
        ${tipBlock('①','Dial *#06# (Fastest)','Open your Phone Dialer and dial <strong style="color:#fff">*#06#</strong> — your IMEI appears on screen immediately.')}
        ${tipBlock('②','Settings Path','Go to <strong style="color:#fff">Settings → About Phone → Status → IMEI Information</strong>. Dual-SIM: use IMEI 1.')}
        ${tipBlock('③','Original Box','IMEI is printed on the retail box barcode label.')}
        ${tipBlock('④','Under Battery','On older removable-battery phones: remove back cover and battery — IMEI sticker is inside.')}
      </div>

      <div style="background:#0d1a0d;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #166534">
        <p style="color:#4ade80;font-size:13px;font-weight:800;margin-bottom:10px">🍎 iPHONE — IMEI</p>
        ${tipBlock('①','Dial *#06#','Phone app → Keypad → dial <strong style="color:#fff">*#06#</strong>.')}
        ${tipBlock('②','Settings → General → About','Scroll to find IMEI.')}
        ${tipBlock('③','SIM Tray (iPhone 6s &amp; earlier)','IMEI is engraved on the SIM card tray.')}
        ${tipBlock('④','iCloud','Log into <strong style="color:#fff">icloud.com/find</strong> → select device → click (i) info.')}
      </div>

      <div style="background:#0a1929;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #1e3a5f">
        <p style="color:#60a5fa;font-size:13px;font-weight:800;margin-bottom:10px">💻 MacBook / Apple Laptop — Serial Number</p>
        ${tipBlock('①','Apple Menu','🍎 Apple logo → <strong style="color:#fff">About This Mac</strong> → Serial Number is shown.')}
        ${tipBlock('②','Underside of MacBook','Engraved in small text near the regulatory text on the bottom.')}
        ${tipBlock('③','Original Box','Barcode label on side or bottom of the retail box.')}
      </div>

      <div style="background:#0a1929;border-radius:14px;padding:20px 22px;margin-bottom:14px;border:1px solid #1e3a5f">
        <p style="color:#60a5fa;font-size:13px;font-weight:800;margin-bottom:10px">🖥️ Windows Laptops — HP, Dell, Lenovo, Asus, Acer — Serial Number</p>
        ${tipBlock('①','Base Sticker','Flip over laptop — look for a sticker showing <strong style="color:#fff">S/N (Serial Number)</strong>.')}
        ${tipBlock('②','Command Prompt','Win + R → type <strong style="color:#fff">cmd</strong> → Enter → type: <strong style="color:#fff">wmic bios get serialnumber</strong> → Enter.')}
        ${tipBlock('③','System Info','Win + R → type <strong style="color:#fff">msinfo32</strong> → look for System Serial Number.')}
        ${tipBlock('④','BIOS','Restart → press F2/F10/Delete to enter BIOS → check System Information tab.')}
      </div>

      <div style="background:#1a0a2e;border-radius:14px;padding:20px 22px;margin-bottom:20px;border:1px solid #5b21b6">
        <p style="color:#c4b5fd;font-size:13px;font-weight:800;margin-bottom:10px">📷 Digital Cameras — Serial Number</p>
        ${tipBlock('①','Camera Body','Look on the bottom or side panel for a sticker or engraved serial number.')}
        ${tipBlock('②','Battery Compartment','Open battery door — serial number label is often inside.')}
        ${tipBlock('③','Camera Menu','Menu → Setup/Wrench → Firmware Version or Device Info (varies by brand).')}
        ${tipBlock('④','Original Box','Barcode label on the side or back of the retail box.')}
      </div>

      <!-- PART 2: REGISTER YOUR DEVICE -->
      <p style="color:#f97316;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">🛡️ Part 2 — How to Register Your Device</p>
      ${stepBlock('1','#f97316','Log In to Your Dashboard','Visit <a href="' + APP_URL + '/dashboard" style="color:#f97316">' + APP_URL + '/dashboard</a> and sign in with your email and password.')}
      ${stepBlock('2','#f97316','Click "Devices" in the Sidebar','Find the Devices tab in the left sidebar of your dashboard.')}
      ${stepBlock('3','#f97316','Click "Register New Device"','Press the Register New Device button at the top of the Devices page.')}
      ${stepBlock('4','#f97316','Fill In Device Details','Enter: Device Type (Phone/Laptop/Tablet/Camera), Brand, Model Name, IMEI or Serial Number, Condition, and Purchase Date.')}
      ${stepBlock('5','#f97316','Upload Proof of Purchase','Upload a clear photo of your receipt, invoice, or box label. This is your permanent legal proof of ownership.')}
      ${stepBlock('6','#22c55e','Save — Device is Now Protected!','Click Save. Your device is permanently on the national registry. Download your Proof of Ownership Certificate.')}

      <!-- PART 3: SEARCH BEFORE BUYING -->
      <p style="color:#06b6d4;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;margin-top:8px">🔍 Part 3 — How to Search a Device Before Buying</p>
      <div style="background:#061a22;border-radius:14px;padding:18px 20px;margin-bottom:16px;border:1px solid #0e7490">
        <p style="color:#e2e8f0;font-size:14px;line-height:1.8;margin-bottom:12px">
          <strong style="color:#22d3ee">⚠️ ALWAYS check a device IMEI or serial before paying for it.</strong>
          Buying a stolen registered device — even unknowingly — can create legal problems for you.
        </p>
        ${tipBlock('①','Log In → Search Device','Log into <a href="' + APP_URL + '/dashboard" style="color:#22d3ee">' + APP_URL + '/dashboard</a> → find Search Device in the menu.')}
        ${tipBlock('②','Get the IMEI/Serial from the Seller','For phones: ask seller to dial <strong style="color:#fff">*#06#</strong> in front of you. For laptops: check the bottom sticker.')}
        ${tipBlock('③','Enter and Search','Type the IMEI or serial number in the search box and press Search.')}
        ${tipBlock('④','Read the Result','<strong style="color:#4ade80">GREEN = CLEAN</strong> — safe to buy. <strong style="color:#f87171">RED = STOLEN</strong> — do NOT buy and report the seller. <strong style="color:#fbbf24">YELLOW = DISPUTED</strong> — ask for documentation before proceeding.')}
      </div>

      <!-- PART 4: HOW TRANSFER WORKS -->
      <p style="color:#f59e0b;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;margin-top:8px">🤝 Part 4 — How Ownership Transfer Works When Buying from a Vendor</p>
      <div style="background:#1a1400;border-radius:14px;padding:18px 20px;margin-bottom:20px;border:1px solid #92400e">
        <p style="color:#fde68a;font-size:14px;line-height:1.8;margin-bottom:14px">
          When a vendor on TraceIt sells you a registered device, they must transfer ownership to you <strong style="color:#fff">before you make payment</strong>. This is how it works:
        </p>
        ${tipBlock('①','Give Vendor Your TraceIt Email','Tell the seller your TraceIt registered email address.')}
        ${tipBlock('②','Vendor Sends a Transfer Request','Seller logs into their TraceIt dashboard → selects the device → clicks <strong style="color:#fff">Transfer Ownership</strong> → enters your email → submits.')}
        ${tipBlock('③','You Receive a Transfer Notification','Log into your dashboard → go to the <strong style="color:#fff">Transfers</strong> section → you will see the pending transfer request.')}
        ${tipBlock('④','Verify IMEI/Serial Matches the Physical Device','Compare the IMEI or serial number in the transfer request with the actual device in front of you. They must match exactly.')}
        ${tipBlock('⑤','Accept the Transfer','Click <strong style="color:#fff">Accept Transfer</strong>. The device ownership is now moved to your account. A digital transfer receipt is generated for both parties.')}
        ${tipBlock('⑥','THEN Make Payment — You Are Protected','<strong style="color:#4ade80">Only pay AFTER accepting the transfer.</strong> The device is now registered in your name on the national registry. You have full legal protection.')}
      </div>

      <!-- WhatsApp Support -->
      <div style="background:#064e3b;border-radius:14px;padding:20px;text-align:center;margin-bottom:28px;border:1px solid #059669">
        <p style="color:#a7f3d0;font-size:14px;font-weight:700;margin-bottom:8px">💬 Need Help? We Are Here For You!</p>
        <p style="color:#6ee7b7;font-size:13px;margin-bottom:14px">Our support team is available on WhatsApp to guide you through any step at no cost to you.</p>
        <a href="${whatsappLink}" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;font-weight:800;font-size:14px;padding:12px 28px;border-radius:30px;text-decoration:none">
          💬 Chat on WhatsApp — +234 812 144 4306
        </a>
      </div>

      <div style="text-align:center">
        ${btn('🚀 Start Adding Your Gadgets Now', APP_URL + '/dashboard/devices', '#22c55e')}
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `🎉 ${user.firstName}, Your NIN is Verified! Here Is Your Complete TraceIt Platform Guide`,
        html,
    });
    console.log(`[EMAIL] NIN verified approval email sent → ${user.email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. NIN SUBMITTED / PAYMENT EMAIL — sent when user pays/submits NIN
// ═══════════════════════════════════════════════════════════════════════════════
export const sendNinSubmittedPaymentEmail = async (user) => {
    const html = wrap(`
      <div style="text-align:center; margin-bottom:28px;">
        <div style="font-size:52px; margin-bottom:12px;">🛡️</div>
        <h1 style="font-size:24px; font-weight:800; color:#f1f5f9; margin-bottom:8px;">
          NIN Verification Received
        </h1>
        <p style="color:#94a3b8; font-size:15px; max-width:480px; margin:0 auto; line-height:1.7;">
          Hello ${user.firstName}, thank you for completing your verification payment.
        </p>
      </div>

      <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a); border-radius:16px; padding:24px 28px; margin-bottom:28px; border:1px solid #f97316;">
        <p style="color:#f97316; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
          🔍 Security Check in Progress
        </p>
        <p style="color:#e2e8f0; font-size:15px; line-height:1.8;">
          Our security & identity team is currently conducting an official identity check on your NIN submission to keep the TraceIt platform safe from fraudsters and unverified accounts.
        </p>
      </div>

      <p style="color:#94a3b8; font-size:14px; line-height:1.7; margin-bottom:24px;">
        This review is typically processed rapidly. Once verified, you will receive an immediate confirmation email and full access to upload, verify, and manage your electronic gadgets.
      </p>

      <div style="text-align:center;">
        ${btn('📊 View Verification Status', `${APP_URL}/dashboard`, '#f97316')}
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `🛡️ Identity Check in Progress for your TraceIt Account`,
        html,
    });
    console.log(`[EMAIL] NIN submitted payment email sent → ${user.email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. UNVERIFIABLE NIN EMAIL — super admin outreach to user
// ═══════════════════════════════════════════════════════════════════════════════
export const sendNinUnverifiableEmail = async (user, reasonNotes) => {
    const whatsappLink = "https://wa.me/2348121444306?text=Hello%20TraceIt%20Support%2C%20I%20received%20an%20unverifiable%20NIN%20notification.";

    const html = wrap(`
      <div style="text-align:center; margin-bottom:28px;">
        <div style="font-size:52px; margin-bottom:12px;">⚠️</div>
        <h1 style="font-size:24px; font-weight:800; color:#ef4444; margin-bottom:8px;">
          NIN Verification Action Required
        </h1>
        <p style="color:#94a3b8; font-size:15px;">
          Hello ${user.firstName}, our team could not verify your NIN details.
        </p>
      </div>

      <div style="background:#270b0b; border-radius:16px; padding:24px; margin-bottom:28px; border:1px solid #7f1d1d;">
        <p style="color:#f87171; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
          Reason from Super Admin Verification Team:
        </p>
        <p style="color:#fecaca; font-size:15px; line-height:1.7; font-weight:600;">
          "${reasonNotes || 'The provided NIN or name details did not match official identity records or required clearer verification.'}"
        </p>
      </div>

      <div style="background:#111827; border-radius:14px; padding:20px; margin-bottom:28px; border:1px solid #374151;">
        <p style="color:#fff; font-size:14px; font-weight:700; margin-bottom:10px;">Steps to resolve:</p>
        <ol style="color:#94a3b8; font-size:14px; line-height:1.8; padding-left:20px;">
          <li>Log in to your TraceIt account and verify that your registered First & Last name match your official NIN slip.</li>
          <li>Ensure your 11-digit NIN number is entered correctly without typos.</li>
          <li>Reach out directly to our Super Admin Support line on WhatsApp for immediate manual review.</li>
        </ol>
      </div>

      <div style="text-align:center; margin-bottom:24px;">
        <a href="${whatsappLink}" target="_blank" style="display:inline-block; background:#25D366; color:#ffffff; font-weight:800; font-size:14px; padding:12px 26px; border-radius:30px; text-decoration:none;">
          💬 Contact Support on WhatsApp
        </a>
      </div>

      <div style="text-align:center;">
        ${btn('✏️ Update Profile & NIN', `${APP_URL}/dashboard`, '#ef4444')}
      </div>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `⚠️ Important: Update Required for Your TraceIt NIN Verification`,
        html,
    });
    console.log(`[EMAIL] NIN unverifiable reach-out email sent → ${user.email}`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. LOGIN ALERT EMAIL — sent to User & Admin on every user login
// ═══════════════════════════════════════════════════════════════════════════════
export const sendLoginAlertEmail = async (user, loginMeta = {}) => {
    const timeStr = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'medium' });
    const ip = loginMeta.ip || 'Unknown IP';
    const userAgent = loginMeta.userAgent || 'Web Browser';

    // 1. Send alert to User
    const userHtml = wrap(`
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:48px; margin-bottom:10px;">🔐</div>
        <h1 style="font-size:22px; font-weight:800; color:#f1f5f9; margin-bottom:6px;">New Login Alert</h1>
        <p style="color:#94a3b8; font-size:14px;">Hi ${user.firstName}, a successful login to your TraceIt account was detected.</p>
      </div>

      <div style="background:#111827; border-radius:14px; padding:20px; margin-bottom:24px; border:1px solid #374151;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Date &amp; Time:</td>
            <td style="padding:6px 0; color:#fff; font-size:14px; font-weight:700; text-align:right;">${timeStr}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8; font-size:13px;">IP Address:</td>
            <td style="padding:6px 0; color:#fff; font-size:14px; font-weight:700; text-align:right;">${ip}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Device / Browser:</td>
            <td style="padding:6px 0; color:#fff; font-size:14px; font-weight:700; text-align:right;">${userAgent}</td>
          </tr>
        </table>
      </div>

      <p style="color:#64748b; font-size:12px; text-align:center;">
        If this was you, no action is needed. If you did not log in, please change your password immediately or contact support.
      </p>
    `);

    await transporter.sendMail({
        from: FROM,
        to: user.email,
        subject: `🔐 New Login to your TraceIt Account (${timeStr})`,
        html: userHtml,
    }).catch(err => console.error('[EMAIL] User login alert failed:', err.message));

    // 2. Send notification to Admin
    sendAdminAlert('User Login Event', {
        'User': `${user.firstName} ${user.lastName} (${user.email})`,
        'Role': user.role,
        'IP Address': ip,
        'Device Info': userAgent,
        'Time': timeStr
    }).catch(err => console.error('[EMAIL] Admin login alert failed:', err.message));
};


