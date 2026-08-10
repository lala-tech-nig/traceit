import Analytics from '../models/Analytics.js';

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// ─── POST /api/analytics/track ───────────────────────────────────────────────
export const trackSession = async (req, res) => {
    try {
        const { sessionId, page, event, timeSpentSeconds, userId } = req.body;
        if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

        const ipAddress =
            (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
            req.socket?.remoteAddress ||
            req.connection?.remoteAddress ||
            'unknown';

        const userAgent = req.headers['user-agent'] || '';

        let session = await Analytics.findOne({ sessionId });

        if (!session) {
            session = new Analytics({
                sessionId,
                ipAddress,
                userAgent,
                userId:           userId || null,
                pagesVisited:     page ? [page] : [],
                events:           event ? [{ ...event, timestamp: new Date() }] : [],
                timeSpentSeconds: timeSpentSeconds || 0,
                lastActive:       new Date(),
                sessionStart:     new Date()
            });
            try {
                await session.save();
                return res.json({ ok: true });
            } catch (err) {
                // E11000 means another concurrent request created the session a microsecond ago
                if (err.code === 11000) {
                    session = await Analytics.findOne({ sessionId });
                } else {
                    throw err;
                }
            }
        } 
        
        if (session) {
            // Track new pages (avoid consecutive duplicates)
            if (page && session.pagesVisited[session.pagesVisited.length - 1] !== page) {
                session.pagesVisited.push(page);
            }
            if (event) {
                session.events.push({ type: event.type || 'click', label: event.label || '', timestamp: new Date() });
            }
            if (timeSpentSeconds != null) {
                session.timeSpentSeconds = timeSpentSeconds;
            }
            session.lastActive = new Date();
            // Upgrade guest to identified user when they log in mid-session
            if (userId && !session.userId) session.userId = userId;

            await session.save();
        }
        
        res.json({ ok: true });
    } catch (error) {
        console.error('[Analytics Track Error]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/analytics/admin ─────────────────────────────────────────────────
// Query params:
//   ?month=YYYY-MM   — filter to a specific month (default: current)
//   ?sortBy=visits|lastSeen   — sort order for IP table (default: visits)
export const getAnalyticsData = async (req, res) => {
    try {
        const now = new Date();

        // ── Date range helpers ──────────────────────────────────────────────
        const activeThreshold = new Date(now - ACTIVE_THRESHOLD_MS);
        const oneDayAgo   = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Monthly filter (default: current month)
        const monthParam = req.query.month; // e.g. "2026-03"
        let monthStart, monthEnd;
        if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
            monthStart = new Date(`${monthParam}-01T00:00:00.000Z`);
            monthEnd   = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
        } else {
            monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        const sortBy = req.query.sortBy === 'lastSeen' ? 'lastSeen' : 'visits';

        // ── Core KPIs ──────────────────────────────────────────────────────
        const [activeNow, totalSessions, todaySessions, monthSessions] = await Promise.all([
            Analytics.countDocuments({ lastActive: { $gte: activeThreshold } }),
            Analytics.countDocuments(),
            Analytics.countDocuments({ sessionStart: { $gte: oneDayAgo } }),
            Analytics.countDocuments({ sessionStart: { $gte: monthStart, $lt: monthEnd } })
        ]);

        // Avg time spent across all sessions
        const avgTimeResult = await Analytics.aggregate([
            { $group: { _id: null, avg: { $avg: '$timeSpentSeconds' } } }
        ]);
        const avgTimeSpent = Math.round(avgTimeResult[0]?.avg || 0);

        // Unique IPs (total & this month)
        const [uniqueIPsAll, uniqueIPsMonth] = await Promise.all([
            Analytics.distinct('ipAddress').then(a => a.length),
            Analytics.distinct('ipAddress', { sessionStart: { $gte: monthStart, $lt: monthEnd } }).then(a => a.length)
        ]);

        // ── IP table — with per-IP monthly visit count ──────────────────────
        const topIPsRaw = await Analytics.aggregate([
            {
                $group: {
                    _id:        '$ipAddress',
                    totalVisits: { $sum: 1 },
                    monthVisits: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $gte: ['$sessionStart', monthStart] },
                                    { $lt:  ['$sessionStart', monthEnd] }
                                ]},
                                1, 0
                            ]
                        }
                    },
                    lastSeen:   { $max: '$lastActive' },
                    firstSeen:  { $min: '$sessionStart' },
                    // Grab a sample userId if available
                    userId:     { $first: '$userId' }
                }
            },
            { $sort: sortBy === 'lastSeen' ? { lastSeen: -1 } : { totalVisits: -1 } },
            { $limit: 50 }
        ]);

        // Identify logged-in user details for IPs that have associated accounts
        const userIds = topIPsRaw.filter(ip => ip.userId).map(ip => ip.userId);

        // ── Top pages ──────────────────────────────────────────────────────
        const topPages = await Analytics.aggregate([
            { $match: { sessionStart: { $gte: monthStart, $lt: monthEnd } } },
            { $unwind: '$pagesVisited' },
            { $group: { _id: '$pagesVisited', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // ── Top click events ───────────────────────────────────────────────
        const topEvents = await Analytics.aggregate([
            { $match: { sessionStart: { $gte: monthStart, $lt: monthEnd } } },
            { $unwind: '$events' },
            { $match: { 'events.type': 'click' } },
            { $group: { _id: '$events.label', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // ── Daily sessions — last 7 days ──────────────────────────────────
        const dailyActivity = await Analytics.aggregate([
            { $match: { sessionStart: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$sessionStart' } },
                    sessions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // ── Hourly sessions — last 24 h ────────────────────────────────────
        const hourlyActivity = await Analytics.aggregate([
            { $match: { sessionStart: { $gte: oneDayAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%dT%H:00', date: '$sessionStart' } },
                    sessions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // ── Monthly visit breakdown for ALL months (for filter UI) ─────────
        const monthlyBreakdown = await Analytics.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$sessionStart' } },
                    sessions: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 12 }
        ]);

        // ── Recent sessions ────────────────────────────────────────────────
        const recentSessions = await Analytics.find({ sessionStart: { $gte: monthStart, $lt: monthEnd } })
            .sort({ lastActive: -1 })
            .limit(50)
            .populate('userId', 'firstName lastName email role');

        res.json({
            // KPIs
            activeNow,
            totalSessions,
            todaySessions,
            monthSessions,
            avgTimeSpent,
            uniqueIPsAll,
            uniqueIPsMonth,
            // Tables
            topIPs: topIPsRaw,
            topPages,
            topEvents,
            // Charts
            dailyActivity,
            hourlyActivity,
            monthlyBreakdown,
            // Sessions
            recentSessions,
            // Filter info
            currentMonth: monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        });
    } catch (error) {
        console.error('[Analytics Admin Error]', error.message);
        res.status(500).json({ message: error.message });
    }
};
