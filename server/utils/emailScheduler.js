import cron from 'node-cron';
import User from '../models/User.js';
import {
    sendActivationReminderEmail,
    sendReEngagementEmail,
} from './emailService.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const HOURS_24      = 24 * 60 * 60 * 1000;      // 24 hours in ms
const WEEKS_2       = 14 * 24 * 60 * 60 * 1000; // 2 weeks in ms
const REMINDER_COOL = HOURS_24;                  // re-send every 24h until approved

// ─── Job 1: Activation reminder ───────────────────────────────────────────────
// Runs every hour. Finds users who:
//   • Registered > 24h ago
//   • Are NOT yet approved (isApproved = false)
//   • Have never received a reminder OR last reminder was sent > 24h ago
//   Keeps firing EVERY 24 HOURS until the account is approved, then stops.
const checkPendingActivations = async () => {
    try {
        const cutoff = new Date(Date.now() - HOURS_24);
        const cooloff = new Date(Date.now() - REMINDER_COOL);

        const users = await User.find({
            isApproved: false,
            createdAt: { $lte: cutoff },
            $or: [
                { activationReminderSentAt: null },
                { activationReminderSentAt: { $lte: cooloff } },
            ],
        }).select('firstName email hasPaid activationReminderSentAt');

        console.log(`[SCHEDULER] Activation check → ${users.length} user(s) eligible`);

        for (const user of users) {
            try {
                await sendActivationReminderEmail(user);
                user.activationReminderSentAt = new Date();
                await user.save();
            } catch (err) {
                console.error(`[SCHEDULER] Activation reminder failed for ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('[SCHEDULER] Activation check error:', err.message);
    }
};

// ─── Job 2: Re-engagement (inactive users) ────────────────────────────────────
// Runs every day at 10:00 AM. Finds users who:
//   • Last logged in > 2 weeks ago  (or never logged in but registered > 2 weeks ago)
//   • Are approved (active account)
//   • Haven't received a re-engagement email in the last 30 days
const checkInactiveUsers = async () => {
    try {
        const twoWeeksAgo   = new Date(Date.now() - WEEKS_2);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const users = await User.find({
            isApproved: true,
            $or: [
                { lastLoginAt: { $lte: twoWeeksAgo } },
                { lastLoginAt: null, createdAt: { $lte: twoWeeksAgo } },
            ],
            $or: [
                { reEngagementSentAt: null },
                { reEngagementSentAt: { $lte: thirtyDaysAgo } },
            ],
        }).select('firstName email lastLoginAt reEngagementSentAt');

        console.log(`[SCHEDULER] Re-engagement check → ${users.length} user(s) eligible`);

        for (const user of users) {
            try {
                await sendReEngagementEmail(user);
                user.reEngagementSentAt = new Date();
                await user.save();
            } catch (err) {
                console.error(`[SCHEDULER] Re-engagement failed for ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('[SCHEDULER] Re-engagement check error:', err.message);
    }
};

// ─── Start Scheduler ──────────────────────────────────────────────────────────
export const startEmailScheduler = () => {
    // Every hour — activation reminders
    cron.schedule('0 * * * *', () => {
        console.log('[SCHEDULER] Running hourly activation reminder check...');
        checkPendingActivations();
    });

    // Every day at 10:00 AM — re-engagement emails
    cron.schedule('0 10 * * *', () => {
        console.log('[SCHEDULER] Running daily re-engagement check...');
        checkInactiveUsers();
    });

    console.log('[SCHEDULER] ✅ Email scheduler started — activation (hourly) · re-engagement (daily 10AM)');
};
