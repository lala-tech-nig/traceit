
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Fingerprint, 
    ShieldCheck,
    Search,
    Loader2,
    RefreshCw,
    TrendingUp,
    CreditCard,
    ArrowLeftRight,
    Activity,
    ChevronRight,
    SearchCode,
    Smartphone,
    ArrowUpDown,
    Filter,
    Download,
    Megaphone,
    ShieldAlert,
    PlusCircle,
    Edit3,
    ImageIcon,
    Trash,
    BarChart2,
    Globe,
    MousePointerClick,
    Timer,
    LayoutDashboard,
    Radio,
    ChevronLeft,
    Mail,
    Send,
    Users2,
    UserCheck,
    UserX,
    AlertTriangle,
    CheckCheck,
    Eye,
    Zap,
    Building2,
    Sparkles,
    HelpCircle,
    Star,
    Plus,
    FolderPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Admin() {
    const { user, API_URL } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [recentTransfers, setRecentTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [processLoading, setProcessLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [backupLoading, setBackupLoading] = useState(false);
    const [showBackupDropdown, setShowBackupDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, accounts, logs, reports, ads, verificators
    const [verificators, setVerificators] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [verifLoading, setVerifLoading] = useState(false);

    // Withdrawals
    const [withdrawals, setWithdrawals] = useState([]);
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
    
    // Ads and Reports State
    const [adsLoading, setAdsLoading] = useState(false);
    const [adsList, setAdsList] = useState([]);
    const [showAdModal, setShowAdModal] = useState(false);
    const [editingAdId, setEditingAdId] = useState(null);
    const [adForm, setAdForm] = useState({ 
        title: '', description: '', type: 'dashboard_banner', 
        targetRoles: ['all'], actionType: 'whatsapp', actionUrl: '', 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
        media: null,
        mediaPreview: null
    });

    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsMonth, setAnalyticsMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [analyticsIPSort, setAnalyticsIPSort] = useState('visits'); // 'visits' | 'lastSeen'

    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [userDetailsLoading, setUserDetailsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // â”€â”€ Merchants Management State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [merchantsList, setMerchantsList] = useState([]);
    const [merchantsLoading, setMerchantsLoading] = useState(false);
    const [showMerchantModal, setShowMerchantModal] = useState(false);
    const [editingMerchantId, setEditingMerchantId] = useState(null);
    const [merchantForm, setMerchantForm] = useState({
        name: '', logoUrl: '', location: 'Computer Village, Ikeja, Lagos', category: 'Mobile Retailer & Authorized Dealer',
        starRating: 5, dateJoined: new Date().toISOString().split('T')[0], phone: '', email: '', website: '', description: '', logoFile: null
    });

    // â”€â”€ Influencers Management State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [influencersList, setInfluencersList] = useState([]);
    const [influencersLoading, setInfluencersLoading] = useState(false);
    const [showInfluencerModal, setShowInfluencerModal] = useState(false);
    const [editingInfluencerId, setEditingInfluencerId] = useState(null);
    const [influencerForm, setInfluencerForm] = useState({
        name: '', photoUrl: '', role: 'Brand Ambassador', handle: '@traceit_ng', platform: 'Instagram', socialUrl: '', quote: '', starRating: 5, dateJoined: new Date().toISOString().split('T')[0], photoFile: null
    });

    // â”€â”€ FAQ Directory Management State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [faqsList, setFaqsList] = useState([]);
    const [faqsLoading, setFaqsLoading] = useState(false);
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [editingFaqId, setEditingFaqId] = useState(null);
    const [faqForm, setFaqForm] = useState({
        question: '', answer: '', category: 'General', order: 0, isPublished: true
    });

    // â”€â”€ Platform Content Overview State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [contentList, setContentList] = useState({ features: [], howItWorks: [], forWho: [] });
    const [contentLoading, setContentLoading] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [editingContentId, setEditingContentId] = useState(null);
    const [contentForm, setContentForm] = useState({
        section: 'features', title: '', subtitle: '', icon: 'ShieldCheck', description: '', badge: '', order: 0
    });

    // â”€â”€ Unverifiable NIN Reach-Out Modal State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [showNinUnverifiableModal, setShowNinUnverifiableModal] = useState(false);
    const [ninUnverifiableUserId, setNinUnverifiableUserId] = useState(null);
    const [ninUnverifiableReason, setNinUnverifiableReason] = useState('');

    // â”€â”€ Email Centre State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [emailTarget, setEmailTarget]           = useState('pending');
    const [emailMode, setEmailMode]               = useState('template'); // 'template' | 'custom'
    const [emailMsgType, setEmailMsgType]         = useState('activation');
    const [emailSubject, setEmailSubject]         = useState('');
    const [emailBody, setEmailBody]               = useState('');
    const [emailSending, setEmailSending]         = useState(false);
    const [emailResults, setEmailResults]         = useState(null);
    const [emailPreview, setEmailPreview]         = useState(false);

    const handleViewUserDetails = async (id) => {
        setUserDetailsLoading(true);
        setShowUserModal(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/admin/users/${id}`, config);
            setSelectedUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
            setMessage({ type: 'error', text: 'Failed to load user info.' });
            setShowUserModal(false);
        } finally {
            setUserDetailsLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [statsRes, pendingRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, config),
                axios.get(`${API_URL}/admin/pending`, config)
            ]);
            
            setStats(statsRes.data.stats);
            setRecentSearches(statsRes.data.recentSearches);
            setRecentTransfers(statsRes.data.recentTransfers);
            setPendingUsers(pendingRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setUsersLoading(true);
        setIsSearching(false);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${user.token}` },
                params: { 
                    sort: `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`,
                    role: filterRole,
                    isVerified: filterStatus === 'verified' ? true : filterStatus === 'not_verified' ? false : undefined
                }
            };
            const res = await axios.get(`${API_URL}/admin/users`, config);
            setAllUsers(res.data);
            setSearchQuery('');
        } catch (error) {
            console.error("Failed to fetch all users", error);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleSearchUsers = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) {
            fetchAllUsers();
            return;
        }
        setUsersLoading(true);
        setIsSearching(true);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${user.token}` },
                params: { query: searchQuery }
            };
            const res = await axios.get(`${API_URL}/admin/users/search`, config);
            setAllUsers(res.data);
        } catch (error) {
            console.error("Search failed", error);
            setMessage({ type: 'error', text: 'Search failed.' });
        } finally {
            setUsersLoading(false);
        }
    };

    const handleDownloadBackup = async (type = 'both') => {
        setBackupLoading(true);
        setShowBackupDropdown(false);
        try {
            const response = await fetch(`${API_URL}/admin/backup?type=${type}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (!response.ok) throw new Error('Backup failed');
            
            // Get filename from header if possible, else generate one
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `traceit-${type}-backup-${new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19)}.zip`;
            
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const match = contentDisposition.match(/filename="?([^";]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setMessage({ type: 'success', text: `${type.toUpperCase()} Backup started!` });
        } catch (error) {
            setMessage({ type: 'error', text: 'Backup failed: ' + (error.message || 'Unknown error') });
        } finally {
            setBackupLoading(false);
        }
    };

    const handleToggleSuspension = async (userId, isCurrentlySuspended) => {
        const action = isCurrentlySuspended ? 'restore' : 'restrict';
        const reason = !isCurrentlySuspended ? window.prompt("Enter reason for restriction (optional):", "Policy violation") : "";
        
        if (!isCurrentlySuspended && reason === null) return; // Cancelled

        setProcessLoading(userId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/admin/users/${userId}/suspend`, {
                isSuspended: !isCurrentlySuspended,
                suspensionReason: reason
            }, config);
            
            setMessage({ type: 'success', text: `User account ${action}ed successfully!` });
            
            // Refresh current view
            if (isSearching) {
                handleSearchUsers();
            } else {
                fetchAllUsers();
            }
            
            // Update selected user if modal is open
            if (selectedUser && selectedUser.user?._id === userId) {
                handleViewUserDetails(userId);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || `Failed to ${action} user` });
        } finally {
            setProcessLoading(null);
        }
    };

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        if (user) fetchData();
    }, [user]);

    const fetchReports = async () => {
        setReportsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/reports`, config);
            setReports(res.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setReportsLoading(false);
        }
    };

    const fetchAds = async () => {
        setAdsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/ads`, config);
            setAdsList(res.data);
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setAdsLoading(false);
        }
    };

    const fetchVerificators = async () => {
        setVerifLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [vRes, jobsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/verificators`, config),
                axios.get(`${API_URL}/admin/verificators/jobs`, config)
            ]);
            setVerificators(vRes.data);
            setVerifications(jobsRes.data);
        } catch (error) {
            console.error("Failed to fetch verificators", error);
        } finally {
            setVerifLoading(false);
        }
    };

    const handleManageVerificator = async (id, status) => {
        if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/admin/verificators/${id}/status`, { status }, config);
            setMessage({ type: 'success', text: `Verificator status updated to ${status}!` });
            fetchVerificators();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update user' });
        } finally {
            setProcessLoading(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'accounts' && user) fetchAllUsers();
        if (activeTab === 'reports' && user) fetchReports();
        if (activeTab === 'ads' && user) fetchAds();
        if (activeTab === 'analytics' && user) fetchAnalytics();
        if (activeTab === 'verificators' && user) fetchVerificators();
        if (activeTab === 'withdrawals' && user) fetchWithdrawals();
        if (activeTab === 'merchants' && user) fetchAdminMerchants();
        if (activeTab === 'influencers' && user) fetchAdminInfluencers();
        if (activeTab === 'faqs' && user) fetchAdminFAQs();
        if (activeTab === 'content' && user) fetchAdminContent();
    }, [activeTab, sortConfig, filterRole, filterStatus]);

    const fetchWithdrawals = async () => {
        setWithdrawalsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/admin/withdrawals`, config);
            setWithdrawals(res.data);
        } catch (error) {
            console.error("Failed to fetch withdrawals", error);
        } finally {
            setWithdrawalsLoading(false);
        }
    };

    const handleProcessWithdrawal = async (id, status) => {
        const note = status === 'rejected' ? window.prompt("Enter reason for rejection (optional):") : '';
        if (status === 'rejected' && note === null) return; // cancelled

        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/admin/withdrawals/${id}`, { status, adminNote: note }, config);
            setMessage({ type: 'success', text: `Withdrawal request ${status} successfully!` });
            fetchWithdrawals();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process withdrawal' });
        } finally {
            setProcessLoading(null);
        }
    };

    // â”€â”€ Merchants Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchAdminMerchants = async () => {
        setMerchantsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/merchants`);
            setMerchantsList(res.data);
        } catch (err) {
            console.error('Failed to fetch merchants:', err);
        } finally {
            setMerchantsLoading(false);
        }
    };

    const handleSaveMerchant = async (e) => {
        e.preventDefault();
        setProcessLoading('save_merchant');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
            const formData = new FormData();
            formData.append('name', merchantForm.name);
            formData.append('dateJoined', merchantForm.dateJoined);
            formData.append('starRating', merchantForm.starRating);
            formData.append('location', merchantForm.location);
            formData.append('category', merchantForm.category);
            formData.append('phone', merchantForm.phone);
            formData.append('email', merchantForm.email);
            formData.append('website', merchantForm.website);
            formData.append('description', merchantForm.description);
            if (merchantForm.logoFile) {
                formData.append('logo', merchantForm.logoFile);
            } else if (merchantForm.logoUrl) {
                formData.append('logoUrl', merchantForm.logoUrl);
            }

            if (editingMerchantId) {
                await axios.put(`${API_URL}/merchants/${editingMerchantId}`, formData, config);
                setMessage({ type: 'success', text: 'Merchant details updated successfully!' });
            } else {
                await axios.post(`${API_URL}/merchants`, formData, config);
                setMessage({ type: 'success', text: 'Merchant created successfully!' });
            }
            setShowMerchantModal(false);
            fetchAdminMerchants();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save merchant' });
        } finally {
            setProcessLoading(null);
        }
    };

    const handleDeleteMerchant = async (id) => {
        if (!window.confirm('Delete this merchant listing?')) return;
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/merchants/${id}`, config);
            setMessage({ type: 'success', text: 'Merchant deleted' });
            fetchAdminMerchants();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
        } finally {
            setProcessLoading(null);
        }
    };

    // â”€â”€ Influencers Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchAdminInfluencers = async () => {
        setInfluencersLoading(true);
        try {
            const res = await axios.get(`${API_URL}/influencers`);
            setInfluencersList(res.data);
        } catch (err) {
            console.error('Failed to fetch influencers:', err);
        } finally {
            setInfluencersLoading(false);
        }
    };

    const handleSaveInfluencer = async (e) => {
        e.preventDefault();
        setProcessLoading('save_influencer');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
            const formData = new FormData();
            formData.append('name', influencerForm.name);
            formData.append('role', influencerForm.role);
            formData.append('handle', influencerForm.handle);
            formData.append('platform', influencerForm.platform);
            formData.append('socialUrl', influencerForm.socialUrl);
            formData.append('quote', influencerForm.quote);
            formData.append('starRating', influencerForm.starRating);
            formData.append('dateJoined', influencerForm.dateJoined);
            if (influencerForm.photoFile) {
                formData.append('photo', influencerForm.photoFile);
            } else if (influencerForm.photoUrl) {
                formData.append('photoUrl', influencerForm.photoUrl);
            }

            if (editingInfluencerId) {
                await axios.put(`${API_URL}/influencers/${editingInfluencerId}`, formData, config);
                setMessage({ type: 'success', text: 'Influencer details updated successfully!' });
            } else {
                await axios.post(`${API_URL}/influencers`, formData, config);
                setMessage({ type: 'success', text: 'Influencer created successfully!' });
            }
            setShowInfluencerModal(false);
            fetchAdminInfluencers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save influencer' });
        } finally {
            setProcessLoading(null);
        }
    };

    const handleDeleteInfluencer = async (id) => {
        if (!window.confirm('Delete this brand ambassador?')) return;
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/influencers/${id}`, config);
            setMessage({ type: 'success', text: 'Influencer deleted' });
            fetchAdminInfluencers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
        } finally {
            setProcessLoading(null);
        }
    };

    // â”€â”€ FAQ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchAdminFAQs = async () => {
        setFaqsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/faqs/admin/all`, config);
            setFaqsList(res.data);
        } catch (err) {
            console.error('Failed to fetch FAQs:', err);
        } finally {
            setFaqsLoading(false);
        }
    };

    const handleSaveFAQ = async (e) => {
        e.preventDefault();
        setProcessLoading('save_faq');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (editingFaqId) {
                await axios.put(`${API_URL}/faqs/${editingFaqId}`, faqForm, config);
                setMessage({ type: 'success', text: 'FAQ item updated!' });
            } else {
                await axios.post(`${API_URL}/faqs`, faqForm, config);
                setMessage({ type: 'success', text: 'FAQ item created!' });
            }
            setShowFaqModal(false);
            fetchAdminFAQs();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save FAQ' });
        } finally {
            setProcessLoading(null);
        }
    };

    const handleDeleteFAQ = async (id) => {
        if (!window.confirm('Delete this FAQ item?')) return;
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/faqs/${id}`, config);
            setMessage({ type: 'success', text: 'FAQ deleted' });
            fetchAdminFAQs();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
        } finally {
            setProcessLoading(null);
        }
    };

    // â”€â”€ Content Overview Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchAdminContent = async () => {
        setContentLoading(true);
        try {
            const res = await axios.get(`${API_URL}/content/overview`);
            setContentList(res.data);
        } catch (err) {
            console.error('Failed to fetch content overview:', err);
        } finally {
            setContentLoading(false);
        }
    };

    const handleSaveContent = async (e) => {
        e.preventDefault();
        setProcessLoading('save_content');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (editingContentId) {
                await axios.put(`${API_URL}/content/overview/${editingContentId}`, contentForm, config);
                setMessage({ type: 'success', text: 'Overview item updated!' });
            } else {
                await axios.post(`${API_URL}/content/overview`, contentForm, config);
                setMessage({ type: 'success', text: 'Overview item created!' });
            }
            setShowContentModal(false);
            fetchAdminContent();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save content item' });
        } finally {
            setProcessLoading(null);
        }
    };

    const handleDeleteContent = async (id) => {
        if (!window.confirm('Delete this content item?')) return;
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/content/overview/${id}`, config);
            setMessage({ type: 'success', text: 'Item deleted' });
            fetchAdminContent();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
        } finally {
            setProcessLoading(null);
        }
    };

    const handleApproveUser = async (id) => {
        setProcessLoading(id);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/admin/approve/${id}`, {}, config);
            setMessage({ type: 'success', text: 'User approved and NIN verified!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Approval failed' });
        } finally {
            setProcessLoading(null);
        }
    };

    const handleReachOutUnverifiable = async (e) => {
        e.preventDefault();
        setProcessLoading('unverifiable_nin');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(`${API_URL}/admin/users/${ninUnverifiableUserId}/nin-unverifiable`, {
                reasonNotes: ninUnverifiableReason
            }, config);
            setMessage({ type: 'success', text: res.data.message });
            setShowNinUnverifiableModal(false);
            setNinUnverifiableReason('');
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send notification email' });
        } finally {
            setProcessLoading(null);
        }
    };

    const fetchAnalytics = async (month, sortBy) => {
        setAnalyticsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { month: month || analyticsMonth, sortBy: sortBy || analyticsIPSort }
            };
            const res = await axios.get(`${API_URL}/analytics/admin`, config);
            setAnalyticsData(res.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const resetAdForm = () => {
        setAdForm({ 
            title: '', description: '', type: 'dashboard_banner', 
            targetRoles: ['all'], actionType: 'whatsapp', actionUrl: '', 
            startDate: new Date().toISOString().split('T')[0], 
            endDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
            media: null,
            mediaPreview: null
        });
        setEditingAdId(null);
    };

    const handleOpenAdModal = (ad = null) => {
        if (ad) {
            setAdForm({
                title: ad.title, description: ad.description, type: ad.type || 'dashboard_banner',
                targetRoles: ad.targetRoles, actionType: ad.actionType, actionUrl: ad.actionUrl,
                startDate: new Date(ad.startDate).toISOString().split('T')[0],
                endDate: new Date(ad.endDate).toISOString().split('T')[0],
                media: null,
                mediaPreview: ad.mediaUrl || null
            });
            setEditingAdId(ad._id);
        } else {
            resetAdForm();
        }
        setShowAdModal(true);
    };

    const handleSaveAd = async (e) => {
        e.preventDefault();
        setAdsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
            const formData = new FormData();
            formData.append('title', adForm.title);
            formData.append('description', adForm.description);
            formData.append('type', adForm.type);
            formData.append('actionType', adForm.actionType);
            formData.append('actionUrl', adForm.actionUrl);
            formData.append('startDate', adForm.startDate);
            formData.append('endDate', adForm.endDate);
            formData.append('targetRoles', JSON.stringify(adForm.targetRoles));
            if (adForm.media) formData.append('mediaUrl', adForm.media);

            if (editingAdId) {
                await axios.put(`${API_URL}/ads/${editingAdId}`, formData, config);
                setMessage({ type: 'success', text: 'Ad Campaign updated successfully!' });
            } else {
                await axios.post(`${API_URL}/ads`, formData, config);
                setMessage({ type: 'success', text: 'Ad Campaign launched successfully!' });
            }
            
            setShowAdModal(false);
            resetAdForm();
            fetchAds();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to broadcast ad.' });
        } finally {
            setAdsLoading(false);
        }
    };

    const handleDeleteAd = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this ad campaign?")) return;
        setAdsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/ads/${id}`, config);
            fetchAds();
        } catch (error) {
            console.error(error);
            alert("Failed to delete ad");
            setAdsLoading(false);
        }
    };

    const toggleAd = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`${API_URL}/ads/${id}`, {}, config);
            fetchAds();
        } catch (err) {
            console.error(err);
        }
    };

    // handleApprove unified into handleApproveUser above



    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    // â”€â”€ Email Centre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSendBulkEmail = async (e) => {
        e.preventDefault();
        
        const typeToSend = emailMode === 'custom' ? 'custom' : emailMsgType;
        const confirmMsg = emailMode === 'custom' 
            ? `Send custom broadcast to all "${emailTarget}" users?` 
            : `Send "${emailMsgType}" template to all "${emailTarget}" users?`;

        if (!window.confirm(`${confirmMsg} This cannot be undone.`)) return;
        
        setEmailSending(true);
        setEmailResults(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                target: emailTarget,
                messageType: typeToSend,
                ...(typeToSend === 'custom' ? { customSubject: emailSubject, customBody: emailBody } : {})
            };
            const res = await axios.post(`${API_URL}/admin/email/send`, payload, config);
            setEmailResults(res.data);
            setMessage({ type: 'success', text: res.data.message });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Email send failed' });
            setEmailResults(null);
        } finally {
            setEmailSending(false);
        }
    };

    if (loading && !stats) {
        return <div className="flex items-center justify-center min-h-screen bg-neutral-50"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    const navItems = [
        { id: 'overview',   label: 'Platform Overview',     icon: LayoutDashboard },
        { id: 'accounts',   label: 'All Accounts',          icon: Users },
        { id: 'approvals',  label: `Approvals (${pendingUsers.length})`, icon: Clock },
        { id: 'merchants',  label: 'Registered Merchants',  icon: Building2 },
        { id: 'influencers',label: 'Influencers & Ambassadors', icon: Sparkles },
        { id: 'faqs',       label: 'FAQ Directory',         icon: HelpCircle },
        { id: 'content',    label: 'Overview Content',      icon: Zap },
        { id: 'reports',    label: 'Device Reports',        icon: ShieldAlert },
        { id: 'verificators',label: 'Field Agents / Verificators', icon: CheckCircle },
        { id: 'withdrawals',label: 'Withdrawal Requests',   icon: ArrowLeftRight },
        { id: 'ads',        label: 'Broadcast Ads',         icon: Radio },
        { id: 'email',      label: 'Email Centre',          icon: Mail },
        { id: 'logs',       label: 'Activity Logs',         icon: SearchCode },
        { id: 'analytics',  label: 'Platform Analytics',    icon: BarChart2 },
    ];

    return (
        <div className="flex min-h-screen bg-neutral-100 font-[family-name:var(--font-geist-sans)]">

            {/* â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <aside className="w-64 shrink-0 bg-[#0f0f11] text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
                {/* Logo */}
                <div className="px-7 pt-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="TraceIt Logo" className="w-8 h-8 object-contain" />
                        <span className="text-lg font-black tracking-tight">Trace<span className="text-primary">It</span> <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Admin</span></span>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-6 space-y-0.5">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                activeTab === item.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <item.icon className="w-4.5 h-4.5 shrink-0" style={{width:'1.1rem',height:'1.1rem'}} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-3 pb-6 border-t border-white/10 pt-4 space-y-1">
                    <Link to="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold text-sm transition-all">
                        <ChevronLeft className="w-4 h-4" /> Back to Platform
                    </Link>
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-sm">
                            {user?.firstName?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-white truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

                {/* Sticky Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200/70 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-foreground">{navItems.find(n=>n.id===activeTab)?.label || 'Super Admin'}</h1>
                        <p className="text-xs font-medium text-neutral-400 mt-0.5">TraceIt Super Admin Control Panel</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {message.text && (
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${ message.type==='success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' }`}>{message.text}</span>
                        )}
                        <button 
                            onClick={handleDownloadBackup}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all text-xs shadow-md shadow-amber-500/20"
                        >
                            <Download className="w-3.5 h-3.5" /> Backup
                        </button>
                        <button 
                            onClick={() => activeTab === 'accounts' ? fetchAllUsers() : activeTab === 'analytics' ? fetchAnalytics() : activeTab === 'verificators' ? fetchVerificators() : activeTab === 'withdrawals' ? fetchWithdrawals() : fetchData()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-all text-xs"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading||usersLoading||analyticsLoading||verifLoading||withdrawalsLoading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Pane */}
                <main className="flex-1 overflow-y-auto p-8 space-y-8">

            {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                    {/* Primary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Users} label="Total Accounts" value={stats?.totalUsers} trend={`${stats?.newAccountsToday} today`} color="blue" />
                        <StatCard icon={Smartphone} label="Registered Devices" value={stats?.totalDevices} trend={`${stats?.devicesToday} today`} color="indigo" />
                        <StatCard icon={Fingerprint} label="Verified Identity" value={stats?.verifiedAccounts} trend="NIN Verified" color="purple" />
                        <StatCard icon={CreditCard} label="Revenue Today" value={`â‚¦${stats?.dailyRevenue.toLocaleString()}`} trend={`â‚¦${stats?.weeklyRevenue.toLocaleString()} this week`} color="amber" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Device Category Breakdown */}
                        <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                            <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground">Device Distribution</h3>
                                <Activity className="w-5 h-5 text-neutral-300" />
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
                                {stats?.categoryBreakdown?.map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm font-black text-foreground capitalize">{item.category}</p>
                                            <p className="text-xs font-bold text-neutral-400">{item.count} units</p>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary rounded-full" 
                                                style={{ width: `${(item.count / stats.totalDevices) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0) && (
                                    <p className="text-center text-neutral-400 font-medium py-10">No device data available</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Searches */}
                        <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm lg:col-span-1">
                            <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground">Search Activity</h3>
                                <Search className="w-5 h-5 text-neutral-300" />
                            </div>
                            <div className="divide-y divide-neutral-50 max-h-[350px] overflow-y-auto">
                                {recentSearches.map((log, i) => (
                                    <div key={i} className="p-5 hover:bg-neutral-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.found ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                <Search className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground truncate max-w-[120px]">Q: {log.query}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">By {log.user?.firstName || 'User'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${log.found ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.found ? 'FOUND' : 'MISSING'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transfers */}
                        <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm lg:col-span-1">
                            <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-foreground">Global Transfers</h3>
                                <ArrowLeftRight className="w-5 h-5 text-neutral-300" />
                            </div>
                            <div className="divide-y divide-neutral-50 max-h-[350px] overflow-y-auto">
                                {recentTransfers.map((transfer, i) => (
                                    <div key={i} className="p-5 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                                                <Smartphone className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{transfer.device?.name || 'Device'}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">{transfer.initiator?.firstName || 'User'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[8px] font-black uppercase tracking-widest ${transfer.status === 'accepted' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {transfer.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'accounts' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground">All Registered Accounts</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Monitor and manage all user accounts on the platform.</p>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <form onSubmit={handleSearchUsers} className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search email, name..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary transition-all shadow-sm"
                                    />
                                    {isSearching && (
                                        <button 
                                            type="button"
                                            onClick={fetchAllUsers}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-red-500 transition-colors"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </form>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <select 
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="verified">Verified</option>
                                        <option value="not_verified">Not Verified</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <select 
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="basic">Basic Users</option>
                                        <option value="technician">Technicians</option>
                                        <option value="vendor">Vendors</option>
                                        <option value="substore">Sub-Stores</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowBackupDropdown(!showBackupDropdown)}
                                        disabled={backupLoading}
                                        title="Download database or image backup"
                                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-md disabled:opacity-50"
                                    >
                                        {backupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        {backupLoading ? 'Backing up...' : 'Backup System'}
                                    </button>

                                    {showBackupDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                            <button 
                                                onClick={() => handleDownloadBackup('mongodb')}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-neutral-50 flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <BarChart2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-foreground">Database Only</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">MongoDB Collections</p>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadBackup('cloudinary')}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-neutral-50 flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-foreground">Images Only</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">Cloudinary Gallery</p>
                                                </div>
                                            </button>
                                            <div className="my-1 border-t border-neutral-100"></div>
                                            <button 
                                                onClick={() => handleDownloadBackup('both')}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-neutral-100 flex items-center gap-3 bg-neutral-50/50"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-foreground">Full Backup</p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">Database + Images</p>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('firstName')}>
                                            <div className="flex items-center gap-2">Name <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('role')}>
                                            <div className="flex items-center gap-2">Role <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('createdAt')}>
                                            <div className="flex items-center gap-2">Joined <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-8 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('amountPaid')}>
                                            <div className="flex items-center gap-2">Total Paid <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {usersLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                                            </td>
                                        </tr>
                                    ) : allUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <p className="text-neutral-400 font-bold">No accounts match your criteria.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        allUsers.map((u, i) => (
                                            <tr key={u._id || `user-${i}`} className="hover:bg-neutral-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-neutral-100 text-neutral-500 flex items-center justify-center rounded-full font-black text-xs">
                                                            {u.firstName?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground text-sm">{u.firstName || 'User'} {u.lastName || ''}</p>
                                                            <p className="text-xs text-neutral-500 font-medium">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                        u.role === 'admin' ? 'bg-red-50 text-red-600' :
                                                        u.role === 'vendor' ? 'bg-blue-50 text-blue-600' :
                                                        u.role === 'technician' ? 'bg-purple-50 text-purple-600' :
                                                        'bg-neutral-50 text-neutral-600'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-medium text-neutral-600">
                                                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-foreground">
                                                    â‚¦{(u.amountPaid || 0).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        {u.isApproved ? (
                                                            <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase"><CheckCircle className="w-3 h-3" /> Approved</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase"><Clock className="w-3 h-3" /> Pending</span>
                                                        )}
                                                        {u.ninVerified && (
                                                            <span className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase"><Fingerprint className="w-3 h-3" /> Verified</span>
                                                       )}
                                                       {u.isSuspended && (
                                                            <span className="flex items-center gap-1 text-red-600 text-[10px] font-black uppercase"><ShieldAlert className="w-3 h-3" /> Restricted</span>
                                                       )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button 
                                                        onClick={() => handleViewUserDetails(u._id)}
                                                        className="text-neutral-400 hover:text-primary font-bold text-xs transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100">
                            <h3 className="text-xl font-black text-foreground">Awaiting Validation</h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">NIN and Payment verified accounts requiring approval.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">User Details</th>
                                        <th className="px-8 py-4">NIN Information</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {pendingUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <ShieldCheck className="w-12 h-12 text-neutral-100 mb-4" />
                                                    <p className="text-neutral-400 font-bold">No accounts pending approval at this time.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-full font-black">
                                                            {u.firstName?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{u.firstName || 'User'} {u.lastName || ''}</p>
                                                            <p className="text-xs text-neutral-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-primary font-mono font-bold">
                                                        <Fingerprint className="w-4 h-4" />
                                                        <span>{u.nin || 'UNAVAILABLE'}</span>
                                                    </div>
                                                </td>
                                                 <td className="px-8 py-6">
                                                     <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 italic">
                                                         Pending Admin
                                                     </span>
                                                 </td>
                                                 <td className="px-8 py-6 text-right space-x-2">
                                                     <button 
                                                         disabled={processLoading === u._id}
                                                         onClick={() => handleApproveUser(u._id)}
                                                         className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md text-xs shadow-primary/20 disabled:opacity-50"
                                                     >
                                                         {processLoading === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve Access'}
                                                     </button>
                                                     <button 
                                                         disabled={processLoading === u._id}
                                                         onClick={() => { setNinUnverifiableUserId(u._id); setShowNinUnverifiableModal(true); }}
                                                         className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl font-bold hover:bg-red-100 transition-all text-xs"
                                                     >
                                                         Reach Out / Reject NIN
                                                     </button>
                                                 </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* â”€â”€ Registered Merchants Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'merchants' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" /> Registered Merchants Directory
                            </h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Manage verified vendor store logos, names, star ratings, and directory details.</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingMerchantId(null);
                                setMerchantForm({
                                    name: '', logoUrl: '', location: 'Computer Village, Ikeja, Lagos', category: 'Mobile Retailer & Authorized Dealer',
                                    starRating: 5, dateJoined: new Date().toISOString().split('T')[0], phone: '', email: '', website: '', description: '', logoFile: null
                                });
                                setShowMerchantModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-xs shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" /> Add New Merchant
                        </button>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        {merchantsLoading ? (
                            <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></div>
                        ) : merchantsList.length === 0 ? (
                            <div className="p-20 text-center font-bold text-neutral-400">No merchants in directory. Click Add New Merchant to create one.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">Logo &amp; Store Name</th>
                                        <th className="px-8 py-4">Category</th>
                                        <th className="px-8 py-4">Location</th>
                                        <th className="px-8 py-4">Rating</th>
                                        <th className="px-8 py-4">Date Joined</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {merchantsList.map(m => (
                                        <tr key={m._id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-8 py-4 flex items-center gap-3">
                                                <img src={m.logoUrl} alt={m.name} className="w-10 h-10 rounded-xl object-cover border border-neutral-200" />
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">{m.name}</p>
                                                    <p className="text-xs text-neutral-400">{m.email || m.phone || 'No direct contact'}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-semibold text-neutral-600">{m.category}</td>
                                            <td className="px-8 py-4 text-xs text-neutral-500">{m.location}</td>
                                            <td className="px-8 py-4 text-xs font-bold text-amber-500">â˜… {m.starRating}</td>
                                            <td className="px-8 py-4 text-xs text-neutral-500">{new Date(m.dateJoined).toLocaleDateString()}</td>
                                            <td className="px-8 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingMerchantId(m._id);
                                                        setMerchantForm({
                                                            name: m.name, logoUrl: m.logoUrl, location: m.location, category: m.category,
                                                            starRating: m.starRating, dateJoined: new Date(m.dateJoined).toISOString().split('T')[0],
                                                            phone: m.phone || '', email: m.email || '', website: m.website || '', description: m.description || '', logoFile: null
                                                        });
                                                        setShowMerchantModal(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-bold text-neutral-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMerchant(m._id)}
                                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* â”€â”€ Brand Influencers & Ambassadors Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'influencers' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" /> Brand Ambassadors & Influencers
                            </h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Manage public tech creators, quotes, handles, and ambassador profiles.</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingInfluencerId(null);
                                setInfluencerForm({
                                    name: '', photoUrl: '', role: 'Brand Ambassador', handle: '@traceit_ng', platform: 'Instagram', socialUrl: '', quote: '', starRating: 5, dateJoined: new Date().toISOString().split('T')[0], photoFile: null
                                });
                                setShowInfluencerModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-xs shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" /> Add Ambassador
                        </button>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        {influencersLoading ? (
                            <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></div>
                        ) : influencersList.length === 0 ? (
                            <div className="p-20 text-center font-bold text-neutral-400">No brand ambassadors added yet.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">Ambassador</th>
                                        <th className="px-8 py-4">Role &amp; Handle</th>
                                        <th className="px-8 py-4">Platform</th>
                                        <th className="px-8 py-4">Quote</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {influencersList.map(inf => (
                                        <tr key={inf._id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-8 py-4 flex items-center gap-3">
                                                <img src={inf.photoUrl} alt={inf.name} className="w-10 h-10 rounded-xl object-cover border border-neutral-200" />
                                                <span className="font-bold text-foreground text-sm">{inf.name}</span>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-semibold text-neutral-600">
                                                <p className="text-foreground">{inf.role}</p>
                                                <p className="text-neutral-400 font-mono">{inf.handle}</p>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-primary">{inf.platform}</td>
                                            <td className="px-8 py-4 text-xs text-neutral-500 max-w-xs truncate">{inf.quote}</td>
                                            <td className="px-8 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingInfluencerId(inf._id);
                                                        setInfluencerForm({
                                                            name: inf.name, photoUrl: inf.photoUrl, role: inf.role, handle: inf.handle, platform: inf.platform,
                                                            socialUrl: inf.socialUrl || '', quote: inf.quote, starRating: inf.starRating,
                                                            dateJoined: new Date(inf.dateJoined).toISOString().split('T')[0], photoFile: null
                                                        });
                                                        setShowInfluencerModal(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-bold text-neutral-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteInfluencer(inf._id)}
                                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* â”€â”€ FAQ Directory Management Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'faqs' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-primary" /> Dynamic FAQ Directory
                            </h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Manage public frequently asked questions and category answers dynamically.</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingFaqId(null);
                                setFaqForm({ question: '', answer: '', category: 'General', order: 0, isPublished: true });
                                setShowFaqModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-xs shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" /> Add FAQ Item
                        </button>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        {faqsLoading ? (
                            <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></div>
                        ) : faqsList.length === 0 ? (
                            <div className="p-20 text-center font-bold text-neutral-400">No FAQs created yet.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">Category</th>
                                        <th className="px-8 py-4">Question</th>
                                        <th className="px-8 py-4">Answer Preview</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {faqsList.map(f => (
                                        <tr key={f._id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-8 py-4 text-xs font-bold text-primary">{f.category}</td>
                                            <td className="px-8 py-4 text-xs font-bold text-foreground">{f.question}</td>
                                            <td className="px-8 py-4 text-xs text-neutral-500 max-w-sm truncate">{f.answer}</td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${f.isPublished ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>
                                                    {f.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingFaqId(f._id);
                                                        setFaqForm({ question: f.question, answer: f.answer, category: f.category, order: f.order || 0, isPublished: f.isPublished });
                                                        setShowFaqModal(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-bold text-neutral-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFAQ(f._id)}
                                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* â”€â”€ Platform Overview Content Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'content' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" /> Platform Overview Content
                            </h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Manage Features, How-It-Works steps, and For-Who audience sections.</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingContentId(null);
                                setContentForm({ section: 'features', title: '', subtitle: '', icon: 'ShieldCheck', description: '', badge: '', order: 0 });
                                setShowContentModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-xs shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" /> Add Overview Item
                        </button>
                    </div>

                    {/* Features, How-It-Works & For-Who Tables */}
                    {['features', 'how_it_works', 'for_who'].map(sec => (
                        <div key={sec} className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm p-6">
                            <h4 className="text-base font-black text-foreground uppercase tracking-wider mb-4 border-b border-neutral-100 pb-3">
                                Section: <span className="text-primary">{sec.replace('_', ' ')}</span>
                            </h4>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Icon</th>
                                        <th className="px-6 py-3">Badge</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {(contentList[sec === 'how_it_works' ? 'howItWorks' : sec === 'for_who' ? 'forWho' : 'features'] || []).map(item => (
                                        <tr key={item._id} className="hover:bg-neutral-50/50">
                                            <td className="px-6 py-4 font-bold text-foreground text-xs">{item.title}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-primary">{item.icon}</td>
                                            <td className="px-6 py-4 text-xs text-neutral-500">{item.badge || 'â€”'}</td>
                                            <td className="px-6 py-4 text-xs text-neutral-500 max-w-sm truncate">{item.description}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingContentId(item._id);
                                                        setContentForm({
                                                            section: item.section, title: item.title, subtitle: item.subtitle || '',
                                                            icon: item.icon, description: item.description, badge: item.badge || '', order: item.order || 0
                                                        });
                                                        setShowContentModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs font-bold text-neutral-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContent(item._id)}
                                                    className="px-3 py-1 bg-red-50 hover:bg-red-100 rounded text-xs font-bold text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            {/* â”€â”€ Merchant Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {showMerchantModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative border border-neutral-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowMerchantModal(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-foreground">âœ•</button>
                        <h3 className="text-xl font-black text-foreground mb-4">{editingMerchantId ? 'Edit Merchant' : 'Add New Registered Merchant'}</h3>
                        <form onSubmit={handleSaveMerchant} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-neutral-700">Store Name *</label>
                                <input type="text" required value={merchantForm.name} onChange={e => setMerchantForm({...merchantForm, name: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-foreground" />
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Logo Image Upload *</label>
                                <input type="file" accept="image/*" onChange={e => setMerchantForm({...merchantForm, logoFile: e.target.files[0]})} className="w-full mt-1 p-2 bg-neutral-50 border border-neutral-200 rounded-xl" />
                                {merchantForm.logoUrl && <p className="text-[10px] text-neutral-400 mt-1 truncate">Current logo: {merchantForm.logoUrl}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-neutral-700">Category</label>
                                    <input type="text" value={merchantForm.category} onChange={e => setMerchantForm({...merchantForm, category: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold" />
                                </div>
                                <div>
                                    <label className="font-bold text-neutral-700">Star Rating (1 - 5)</label>
                                    <input type="number" min="1" max="5" step="0.1" value={merchantForm.starRating} onChange={e => setMerchantForm({...merchantForm, starRating: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Location</label>
                                <input type="text" value={merchantForm.location} onChange={e => setMerchantForm({...merchantForm, location: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-neutral-700">Phone</label>
                                    <input type="text" value={merchantForm.phone} onChange={e => setMerchantForm({...merchantForm, phone: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="font-bold text-neutral-700">Email</label>
                                    <input type="email" value={merchantForm.email} onChange={e => setMerchantForm({...merchantForm, email: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Description</label>
                                <textarea rows="2" value={merchantForm.description} onChange={e => setMerchantForm({...merchantForm, description: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                            </div>
                            <button type="submit" disabled={processLoading === 'save_merchant'} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md">
                                {processLoading === 'save_merchant' ? 'Saving...' : 'Save Merchant Details'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* â”€â”€ Influencer Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {showInfluencerModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative border border-neutral-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowInfluencerModal(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-foreground">âœ•</button>
                        <h3 className="text-xl font-black text-foreground mb-4">{editingInfluencerId ? 'Edit Ambassador' : 'Add Brand Ambassador'}</h3>
                        <form onSubmit={handleSaveInfluencer} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-neutral-700">Name *</label>
                                <input type="text" required value={influencerForm.name} onChange={e => setInfluencerForm({...influencerForm, name: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold" />
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Photo Upload *</label>
                                <input type="file" accept="image/*" onChange={e => setInfluencerForm({...influencerForm, photoFile: e.target.files[0]})} className="w-full mt-1 p-2 bg-neutral-50 border border-neutral-200 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-neutral-700">Role</label>
                                    <input type="text" value={influencerForm.role} onChange={e => setInfluencerForm({...influencerForm, role: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="font-bold text-neutral-700">Handle</label>
                                    <input type="text" value={influencerForm.handle} onChange={e => setInfluencerForm({...influencerForm, handle: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Quote / Endorsement</label>
                                <textarea rows="3" required value={influencerForm.quote} onChange={e => setInfluencerForm({...influencerForm, quote: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                            </div>
                            <button type="submit" disabled={processLoading === 'save_influencer'} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md">
                                {processLoading === 'save_influencer' ? 'Saving...' : 'Save Ambassador Details'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* â”€â”€ FAQ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {showFaqModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative border border-neutral-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowFaqModal(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-foreground">âœ•</button>
                        <h3 className="text-xl font-black text-foreground mb-4">{editingFaqId ? 'Edit FAQ Item' : 'Create FAQ Item'}</h3>
                        <form onSubmit={handleSaveFAQ} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-neutral-700">Category</label>
                                <select value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold">
                                    <option value="General">General</option>
                                    <option value="Registration">Registration</option>
                                    <option value="Verification">Verification</option>
                                    <option value="Transfers">Transfers</option>
                                    <option value="Security">Security</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Question *</label>
                                <input type="text" required value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold" />
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Answer *</label>
                                <textarea rows="4" required value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                            </div>
                            <button type="submit" disabled={processLoading === 'save_faq'} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md">
                                {processLoading === 'save_faq' ? 'Saving...' : 'Save FAQ Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* â”€â”€ Content Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {showContentModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative border border-neutral-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowContentModal(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-foreground">âœ•</button>
                        <h3 className="text-xl font-black text-foreground mb-4">{editingContentId ? 'Edit Overview Item' : 'Add Overview Item'}</h3>
                        <form onSubmit={handleSaveContent} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-neutral-700">Section *</label>
                                <select value={contentForm.section} onChange={e => setContentForm({...contentForm, section: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold">
                                    <option value="features">Features</option>
                                    <option value="how_it_works">How It Works</option>
                                    <option value="for_who">For Who</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Title *</label>
                                <input type="text" required value={contentForm.title} onChange={e => setContentForm({...contentForm, title: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold" />
                            </div>
                            <div>
                                <label className="font-bold text-neutral-700">Description *</label>
                                <textarea rows="3" required value={contentForm.description} onChange={e => setContentForm({...contentForm, description: e.target.value})} className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
                            </div>
                            <button type="submit" disabled={processLoading === 'save_content'} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md">
                                {processLoading === 'save_content' ? 'Saving...' : 'Save Overview Content'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* â”€â”€ Reach Out for Unverifiable NIN Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {showNinUnverifiableModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative border border-neutral-200">
                        <button onClick={() => setShowNinUnverifiableModal(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-foreground">âœ•</button>
                        <h3 className="text-xl font-black text-red-600 mb-2">Unverifiable NIN Notification</h3>
                        <p className="text-xs text-neutral-500 mb-4">
                            Send a direct notification email to the user explaining why their NIN could not be verified and what steps to take.
                        </p>
                        <form onSubmit={handleReachOutUnverifiable} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-neutral-700">Reason / Instructions for User *</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={ninUnverifiableReason}
                                    onChange={e => setNinUnverifiableReason(e.target.value)}
                                    placeholder="e.g., Name on NIN slip does not match registered account name. Please verify spelling or update details..."
                                    className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processLoading === 'unverifiable_nin'}
                                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs shadow-md hover:bg-red-700 transition-colors"
                            >
                                {processLoading === 'unverifiable_nin' ? 'Sending Email...' : 'Send Unverifiable NIN Email'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'verificators' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground">Field Agents & Applications</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Manage user applications to become field verificators.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">User</th>
                                        <th className="px-8 py-4">Focus Area</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {verifLoading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : verificators.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-10 text-center text-neutral-400 font-bold">No verificator applications found.</td></tr>
                                    ) : (
                                        verificators.map(v => (
                                            <tr key={v._id} className="hover:bg-neutral-50/50">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground">{v.firstName} {v.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{v.email}</p>
                                                </td>
                                                <td className="px-8 py-5 font-bold text-neutral-600">{v.verificatorAreaOfFocus || 'N/A'}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${v.verificatorStatus === 'approved' ? 'bg-green-50 text-green-700' : v.verificatorStatus === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{v.verificatorStatus}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                    {v.verificatorStatus === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleManageVerificator(v._id, 'approved')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Approve</button>
                                                            <button onClick={() => handleManageVerificator(v._id, 'rejected')} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Reject</button>
                                                        </>
                                                    )}
                                                    {v.verificatorStatus === 'approved' && (
                                                        <button onClick={() => handleManageVerificator(v._id, 'suspended')} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Suspend</button>
                                                    )}
                                                    {['suspended', 'rejected'].includes(v.verificatorStatus) && (
                                                        <button onClick={() => handleManageVerificator(v._id, 'approved')} className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Re-Approve</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground">Verification Jobs History</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Monitor all physical address verification jobs assigned to field agents.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">Target User</th>
                                        <th className="px-8 py-4">Assigned Agent</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {verifLoading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : verifications.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-10 text-center text-neutral-400 font-bold">No verification jobs found.</td></tr>
                                    ) : (
                                        verifications.map(job => (
                                            <tr key={job._id} className="hover:bg-neutral-50/50">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground">{job.targetUser?.firstName} {job.targetUser?.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{job.targetUser?.homeAddress || 'No Address'}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground">{job.verificator?.firstName} {job.verificator?.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{job.verificator?.email}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${job.status === 'verified' ? 'bg-green-50 text-green-700' : ['declined_user', 'declined_job'].includes(job.status) ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{job.status.replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-medium text-sm text-neutral-500">
                                                    {new Date(job.assignedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'withdrawals' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100">
                            <h3 className="text-xl font-black text-foreground">Withdrawal Requests</h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Review and process user earning withdrawal requests.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">User</th>
                                        <th className="px-8 py-4">Amount</th>
                                        <th className="px-8 py-4">Bank Details</th>
                                        <th className="px-8 py-4">Date & Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {withdrawalsLoading ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : withdrawals.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center text-neutral-400 font-bold">No withdrawal requests found.</td></tr>
                                    ) : (
                                        withdrawals.map(req => (
                                            <tr key={req._id} className="hover:bg-neutral-50/50">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-foreground text-sm">{req.user?.firstName} {req.user?.lastName}</p>
                                                    <p className="text-xs text-neutral-500">{req.user?.email}</p>
                                                    <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mt-0.5">{req.user?.phoneNumber}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-black text-foreground text-lg">â‚¦{req.amount?.toLocaleString()}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-bold text-foreground">{req.bankName}</p>
                                                    <p className="text-xs font-mono text-neutral-600 mt-0.5">{req.accountNumber}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{req.accountName}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-xs font-medium text-neutral-600 mb-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                        req.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                        req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                    {req.adminNote && (
                                                        <p className="text-[10px] font-medium text-neutral-400 mt-2 max-w-[150px] truncate" title={req.adminNote}>
                                                            Note: {req.adminNote}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-right whitespace-nowrap">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                disabled={processLoading === req._id}
                                                                onClick={() => handleProcessWithdrawal(req._id, 'approved')}
                                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                {processLoading === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                                                            </button>
                                                            <button 
                                                                disabled={processLoading === req._id}
                                                                onClick={() => handleProcessWithdrawal(req._id, 'rejected')}
                                                                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-neutral-300">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 text-center py-20">
                         <SearchCode className="w-16 h-16 text-neutral-100 mx-auto mb-4" />
                         <h2 className="text-2xl font-black text-foreground">Advanced Logs</h2>
                         <p className="text-neutral-500 font-medium">Comprehensive platform auditing and historical data coming soon.</p>
                         <button onClick={() => setActiveTab('overview')} className="mt-6 text-primary font-bold hover:underline">Back to Overview</button>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100">
                            <h3 className="text-xl font-black text-foreground">Device Discrepancy Reports</h3>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Review flagged devices reported by users during searches.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">Reporter</th>
                                        <th className="px-8 py-4">Device</th>
                                        <th className="px-8 py-4">Details</th>
                                        <th className="px-8 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {reportsLoading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : reports.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><p className="text-neutral-400 font-bold">No device reports submitted.</p></td></tr>
                                    ) : reports.map(r => (
                                        <tr key={r._id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-foreground text-sm">{r.reporter?.firstName} {r.reporter?.lastName}</p>
                                                <p className="text-xs text-neutral-500">{r.reporter?.phoneNumber || r.reporter?.email}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-foreground text-sm">{r.device?.name || 'Unknown Device'}</p>
                                                <p className="text-xs font-mono text-neutral-500">{r.device?.serialNumber}</p>
                                            </td>
                                            <td className="px-8 py-5 max-w-sm">
                                                <p className="text-xs font-bold text-foreground"><span className="text-neutral-400 uppercase tracking-widest text-[10px]">LOC:</span> {r.address}</p>
                                                <p className="text-xs text-neutral-600 mt-1 line-clamp-2"><span className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">DESC:</span> {r.sellerDescription}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600">
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ads' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground">Global Ad Campaigns</h3>
                                <p className="text-sm font-medium text-neutral-500 mt-1">Manage scheduled ads, popups, and banners across the platform.</p>
                            </div>
                            <button 
                                onClick={() => handleOpenAdModal()}
                                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 shrink-0"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Create Campaign
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                        <th className="px-8 py-4">Campaign</th>
                                        <th className="px-8 py-4">Type & Targeting</th>
                                        <th className="px-8 py-4">Duration</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {adsLoading && adsList.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></td></tr>
                                    ) : adsList.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center"><p className="text-neutral-400 font-bold">No ad campaigns found.</p></td></tr>
                                    ) : adsList.map(ad => (
                                        <tr key={ad._id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    {ad.mediaUrl ? (
                                                        <img src={ad.mediaUrl} alt="Ad media" className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-foreground text-sm max-w-[200px] truncate">{ad.title}</p>
                                                        <p className="text-[10px] font-medium text-neutral-500 uppercase flex items-center gap-1 mt-0.5">
                                                            {ad.actionType === 'whatsapp' ? 'WhatsApp' : 'Website'} Link
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">
                                                    {(ad.type || 'dashboard_banner').replace('_', ' ')}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {ad.targetRoles.map((r, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-[9px] font-black uppercase">{r}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 min-w-[120px]">
                                                <p className="text-xs font-bold text-neutral-700">{new Date(ad.startDate).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-neutral-400 font-bold mt-0.5">to {new Date(ad.endDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <button 
                                                    onClick={() => toggleAd(ad._id)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                                                        ad.isActive ? 'bg-green-50 text-green-600 border-green-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                                                    }`}
                                                >
                                                    {ad.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Start)'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-5 text-right whitespace-nowrap">
                                                <button onClick={() => handleOpenAdModal(ad)} className="p-2 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg inline-flex mr-1">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteAd(ad._id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg inline-flex">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {showAdModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                        {/* Left Side: Media Upload Preview */}
                        <div className="md:w-5/12 bg-neutral-50/50 border-r border-neutral-100 p-8 flex flex-col relative overflow-y-auto hidden md:flex">
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-foreground">Media Assets</h3>
                                <p className="text-xs font-medium text-neutral-500 mt-1 pb-4 border-b border-neutral-200/60">Upload the visual component for banners or popups.</p>
                            </div>

                            <label className="flex-1 min-h-[250px] border-2 border-dashed border-neutral-300 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-center p-6 relative overflow-hidden group">
                                {adForm.mediaPreview ? (
                                    <img src={adForm.mediaPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                                ) : (
                                    <div className="flex flex-col items-center text-neutral-400 group-hover:text-primary transition-colors">
                                        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-neutral-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Click to Upload Media</span>
                                        <span className="text-[10px] font-semibold opacity-60 mt-1 uppercase tracking-wider">PNG, JPG (Max 10MB)</span>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*,video/*" 
                                    className="hidden" 
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setAdForm({...adForm, media: file, mediaPreview: URL.createObjectURL(file)});
                                        }
                                    }} 
                                />
                                {adForm.mediaPreview && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-white text-black font-bold text-xs px-4 py-2 rounded-full shadow-lg">Change Media</span>
                                    </div>
                                )}
                            </label>

                            {adForm.type === 'text_slider' && (
                                <div className="absolute inset-0 bg-neutral-100/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center pt-20">
                                    <div className="w-20 h-20 bg-white shadow-sm text-neutral-400 rounded-full flex items-center justify-center mb-4">
                                        <Megaphone className="w-10 h-10" />
                                    </div>
                                    <p className="font-black text-lg text-foreground">Media Disabled</p>
                                    <p className="text-xs font-medium text-neutral-500 mt-2 max-w-[200px]">Text Sliders are pure text broadcasts running across the top bar.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Form Configuration */}
                        <div className="md:w-7/12 p-8 md:p-10 flex flex-col bg-white overflow-y-auto relative">
                            <button onClick={() => setShowAdModal(false)} className="absolute top-8 right-8 p-2 bg-neutral-50 border border-neutral-100 text-neutral-400 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all z-10">
                                <XCircle className="w-5 h-5" />
                            </button>
                            
                            <div className="mb-8 pr-12">
                                <h3 className="text-3xl font-black text-foreground tracking-tight">{editingAdId ? 'Edit Campaign' : 'Launch Campaign'}</h3>
                                <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-widest">Configure details, targeting & links</p>
                            </div>

                            <form onSubmit={handleSaveAd} className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-6 flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Campaign Type</label>
                                            <div className="relative">
                                                <select value={adForm.type} onChange={e => setAdForm({...adForm, type: e.target.value})} className="w-full pl-4 pr-10 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer appearance-none">
                                                    <option value="dashboard_banner">Dashboard Banner (Carousel)</option>
                                                    <option value="text_slider">Top Notice Bar (Text Marquee)</option>
                                                    <option value="popup_modal">Session Popup Modal (Center)</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Target Audience</label>
                                            <div className="relative">
                                                <select value={adForm.targetRoles[0] || 'all'} onChange={e => setAdForm({...adForm, targetRoles: [e.target.value]})} className="w-full pl-4 pr-10 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer appearance-none">
                                                    <option value="all">Everyone (Global)</option>
                                                    <option value="basic">Basic Users</option>
                                                    <option value="technician">Technicians</option>
                                                    <option value="vendor">Vendors</option>
                                                    <option value="substore">Sub-Stores</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Campaign Headline</label>
                                        <input required type="text" value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} placeholder="Main attractive title..." className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-neutral-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Sub-description</label>
                                        <textarea required rows={2} value={adForm.description} onChange={e => setAdForm({...adForm, description: e.target.value})} placeholder="Catchy details..." className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-medium text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none placeholder:text-neutral-300" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Action Type</label>
                                            <div className="relative">
                                                <select value={adForm.actionType} onChange={e => setAdForm({...adForm, actionType: e.target.value})} className="w-full pl-4 pr-10 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer appearance-none">
                                                    <option value="whatsapp">WhatsApp Directed</option>
                                                    <option value="website">External Link</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Action URL</label>
                                            <input required type="url" value={adForm.actionUrl} onChange={e => setAdForm({...adForm, actionUrl: e.target.value})} placeholder={adForm.actionType === 'whatsapp' ? 'https://wa.me/...' : 'https://...'} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Schedule Start Date</label>
                                            <input required type="date" value={adForm.startDate} onChange={e => setAdForm({...adForm, startDate: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm text-neutral-700 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Schedule End Date</label>
                                            <input required type="date" value={adForm.endDate} min={adForm.startDate} onChange={e => setAdForm({...adForm, endDate: e.target.value})} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm text-neutral-700 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* Mobile Only: Simple Media Input (if screen is small) */}
                                    {adForm.type !== 'text_slider' && (
                                        <div className="md:hidden pt-4 border-t border-neutral-100">
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Media Upload (Banner/Popup)</label>
                                            <input type="file" accept="image/*,video/*" onChange={e => setAdForm({...adForm, media: e.target.files[0]})} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/60 rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-black file:bg-primary/10 file:text-primary" />
                                        </div>
                                    )}
                                </div>

                                <button 
                                    disabled={adsLoading}
                                    type="submit"
                                    className="w-full mt-8 bg-neutral-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50 text-[15px] hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    {adsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingAdId ? 'Update Campaign Details' : 'Launch New Campaign'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
                    {activeTab === 'analytics' && (
                        <div className="animate-in fade-in duration-500 space-y-6">

                            {/* Filter Bar */}
                            <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-4 flex flex-wrap items-center gap-4 shadow-sm">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Month</label>
                                    <input
                                        type="month"
                                        value={analyticsMonth}
                                        onChange={e => {
                                            setAnalyticsMonth(e.target.value);
                                            fetchAnalytics(e.target.value, analyticsIPSort);
                                        }}
                                        className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Sort IPs By</label>
                                    <div className="flex rounded-xl overflow-hidden border border-neutral-200 text-xs font-black">
                                        {[['visits','Total Visits'],['lastSeen','Last Seen']].map(([val, label]) => (
                                            <button
                                                key={val}
                                                onClick={() => { setAnalyticsIPSort(val); fetchAnalytics(analyticsMonth, val); }}
                                                className={`px-4 py-2 transition-all ${analyticsIPSort === val ? 'bg-primary text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
                                            >{label}</button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => fetchAnalytics(analyticsMonth, analyticsIPSort)}
                                    className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                                    Reload Data
                                </button>
                            </div>

                            {analyticsLoading ? (
                                <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                            ) : !analyticsData ? (
                                <div className="bg-white rounded-3xl p-16 text-center border border-neutral-200">
                                    <BarChart2 className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                    <p className="font-bold text-neutral-500">No analytics data yet. Users must visit the platform first.</p>
                                    <button onClick={() => fetchAnalytics(analyticsMonth, analyticsIPSort)} className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">Load Analytics</button>
                                </div>
                            ) : (
                                <>
                                    {/* KPI Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                        <StatCard icon={Activity}  label="Active Now"      value={analyticsData.activeNow}     trend="in the last 5 min"   color="green"  />
                                        <StatCard icon={Globe}     label="This Month"      value={analyticsData.monthSessions} trend={analyticsMonth}       color="blue"   />
                                        <StatCard icon={Users}     label="Unique IPs (Month)" value={analyticsData.uniqueIPsMonth} trend={`${analyticsData.uniqueIPsAll} all time`} color="indigo" />
                                        <StatCard icon={Timer}     label="Avg. Session"    value={`${Math.floor(analyticsData.avgTimeSpent/60)}m ${analyticsData.avgTimeSpent%60}s`} trend="per visit" color="purple" />
                                    </div>

                                    {/* Charts Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Daily Activity Chart */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-1">Sessions â€” Last 7 Days</h3>
                                            <p className="text-xs text-neutral-400 font-medium mb-5">Daily visitor count</p>
                                            <div className="flex items-end gap-2 h-36">
                                                {analyticsData.dailyActivity.length === 0 ? (
                                                    <p className="text-neutral-300 font-bold text-sm m-auto">No data yet</p>
                                                ) : analyticsData.dailyActivity.map((d, i) => {
                                                    const max = Math.max(...analyticsData.dailyActivity.map(x => x.sessions), 1);
                                                    const pct = Math.max((d.sessions / max) * 100, 4);
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                            <span className="hidden group-hover:block text-[9px] font-black text-primary">{d.sessions}</span>
                                                            <div title={`${d.sessions} sessions`} className="w-full bg-primary rounded-t-lg transition-all duration-500 hover:bg-primary/80" style={{ height: `${pct}%`, minHeight: '6px', maxHeight: '130px' }} />
                                                            <span className="text-[9px] text-neutral-400 font-bold">{d._id?.slice(5)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Monthly Breakdown Chart */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-1">Monthly Sessions</h3>
                                            <p className="text-xs text-neutral-400 font-medium mb-5">Last 12 months comparison</p>
                                            <div className="flex items-end gap-2 h-36">
                                                {analyticsData.monthlyBreakdown.length === 0 ? (
                                                    <p className="text-neutral-300 font-bold text-sm m-auto">No data yet</p>
                                                ) : [...analyticsData.monthlyBreakdown].reverse().map((m, i) => {
                                                    const max = Math.max(...analyticsData.monthlyBreakdown.map(x => x.sessions), 1);
                                                    const pct = Math.max((m.sessions / max) * 100, 4);
                                                    const isSelected = m._id === analyticsMonth;
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => { setAnalyticsMonth(m._id); fetchAnalytics(m._id, analyticsIPSort); }}>
                                                            <span className="hidden group-hover:block text-[9px] font-black text-indigo-500">{m.sessions}</span>
                                                            <div title={`${m.sessions} sessions in ${m._id}`} className={`w-full rounded-t-lg transition-all duration-500 ${isSelected ? 'bg-primary' : 'bg-indigo-300 hover:bg-indigo-500'}`} style={{ height: `${pct}%`, minHeight: '6px', maxHeight: '130px' }} />
                                                            <span className={`text-[9px] font-bold ${isSelected ? 'text-primary' : 'text-neutral-400'}`}>{m._id?.slice(5)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Top Pages */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-neutral-300" /> Most Visited Pages</h3>
                                            <div className="space-y-3">
                                                {analyticsData.topPages.map((p, i) => {
                                                    const max = Math.max(...analyticsData.topPages.map(x => x.count), 1);
                                                    return (
                                                        <div key={i}>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-xs font-bold text-neutral-700 truncate max-w-[160px]">{p._id}</span>
                                                                <span className="text-xs font-black text-neutral-400">{p.count}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full" style={{ width: `${(p.count / max) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {analyticsData.topPages.length === 0 && <p className="text-neutral-400 text-sm font-medium">No page data yet.</p>}
                                            </div>
                                        </div>

                                        {/* Top Clicks */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-neutral-300" /> Top Button Clicks</h3>
                                            <div className="space-y-3">
                                                {analyticsData.topEvents.map((ev, i) => (
                                                    <div key={i} className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-bold text-neutral-700 truncate max-w-[160px]">{ev._id || 'unknown'}</span>
                                                        <span className="text-xs font-black px-2 py-0.5 bg-primary/10 text-primary rounded-lg shrink-0">{ev.count}Ã—</span>
                                                    </div>
                                                ))}
                                                {analyticsData.topEvents.length === 0 && <p className="text-neutral-400 text-sm font-medium">No click data yet.</p>}
                                            </div>
                                        </div>

                                        {/* Hourly activity small chart */}
                                        <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm">
                                            <h3 className="text-base font-black text-foreground mb-1">Last 24 Hours</h3>
                                            <p className="text-xs text-neutral-400 font-medium mb-5">Hourly sessions</p>
                                            <div className="flex items-end gap-0.5 h-28">
                                                {analyticsData.hourlyActivity.length === 0 ? (
                                                    <p className="text-neutral-300 font-bold text-sm m-auto">No data</p>
                                                ) : analyticsData.hourlyActivity.map((h, i) => {
                                                    const max = Math.max(...analyticsData.hourlyActivity.map(x => x.sessions), 1);
                                                    const pct = Math.max((h.sessions / max) * 100, 4);
                                                    return (
                                                        <div key={i} className="flex-1 group" title={`${h.sessions} at ${h._id?.slice(11)}`}>
                                                            <div className="w-full bg-indigo-400 rounded-t-sm hover:bg-indigo-600 transition-all" style={{ height: `${pct}%`, minHeight: '3px', maxHeight: '108px' }} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* IP Address Table â€” sortable, with monthly visit count & user identity */}
                                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                                        <div className="p-7 border-b border-neutral-100 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base font-black text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-neutral-300" /> IP Address Report</h3>
                                                <p className="text-xs text-neutral-400 font-medium mt-1">All visitors â€” sortable by frequency or recency. Click column headers to re-sort.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setAnalyticsIPSort('visits'); fetchAnalytics(analyticsMonth, 'visits'); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${analyticsIPSort === 'visits' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                                                    By Visits
                                                </button>
                                                <button onClick={() => { setAnalyticsIPSort('lastSeen'); fetchAnalytics(analyticsMonth, 'lastSeen'); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${analyticsIPSort === 'lastSeen' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                                                    By Recent
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                                        <th className="px-7 py-3">#</th>
                                                        <th className="px-7 py-3">IP Address</th>
                                                        <th className="px-7 py-3">Associated User</th>
                                                        <th className="px-7 py-3 cursor-pointer hover:text-primary" onClick={() => { setAnalyticsIPSort('visits'); fetchAnalytics(analyticsMonth, 'visits'); }}>Total Visits â†•</th>
                                                        <th className="px-7 py-3">This Month</th>
                                                        <th className="px-7 py-3">First Seen</th>
                                                        <th className="px-7 py-3 cursor-pointer hover:text-primary" onClick={() => { setAnalyticsIPSort('lastSeen'); fetchAnalytics(analyticsMonth, 'lastSeen'); }}>Last Active â†•</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {analyticsData.topIPs.length === 0 ? (
                                                        <tr><td colSpan="7" className="px-7 py-16 text-center text-neutral-400 font-bold">No IP data recorded yet.</td></tr>
                                                    ) : analyticsData.topIPs.map((ip, i) => (
                                                        <tr key={`ip-${i}`} className="hover:bg-neutral-50/60 transition-colors">
                                                            <td className="px-7 py-4 text-xs font-black text-neutral-300">{i + 1}</td>
                                                            <td className="px-7 py-4 font-mono text-xs font-bold text-neutral-800">{ip._id || 'unknown'}</td>
                                                            <td className="px-7 py-4">
                                                                {ip.userId ? (
                                                                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">Logged In</span>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-neutral-400">Guest</span>
                                                                )}
                                                            </td>
                                                            <td className="px-7 py-4">
                                                                <span className="text-sm font-black text-foreground">{ip.totalVisits}</span>
                                                            </td>
                                                            <td className="px-7 py-4">
                                                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${ip.monthVisits > 0 ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-400'}`}>
                                                                    {ip.monthVisits}
                                                                </span>
                                                            </td>
                                                            <td className="px-7 py-4 text-xs text-neutral-400 font-medium">
                                                                {ip.firstSeen ? new Date(ip.firstSeen).toLocaleDateString() : 'â€”'}
                                                            </td>
                                                            <td className="px-7 py-4 text-xs text-neutral-500 font-medium">
                                                                {ip.lastSeen ? new Date(ip.lastSeen).toLocaleString() : 'â€”'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Recent Sessions Table */}
                                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                                        <div className="p-7 border-b border-neutral-100">
                                            <h3 className="text-base font-black text-foreground">Recent Sessions</h3>
                                            <p className="text-xs text-neutral-400 font-medium mt-1">Individual visitor sessions for {analyticsMonth} â€” guests and logged-in users.</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                                        <th className="px-7 py-3">IP Address</th>
                                                        <th className="px-7 py-3">User</th>
                                                        <th className="px-7 py-3">Pages Visited</th>
                                                        <th className="px-7 py-3">Time Spent</th>
                                                        <th className="px-7 py-3">Last Active</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {analyticsData.recentSessions.length === 0 ? (
                                                        <tr><td colSpan="5" className="px-7 py-16 text-center text-neutral-400 font-bold">No sessions recorded for this period.</td></tr>
                                                    ) : analyticsData.recentSessions.map((s) => (
                                                        <tr key={s.sessionId || s._id} className="hover:bg-neutral-50/50 transition-colors">
                                                            <td className="px-7 py-4 font-mono text-xs font-bold text-neutral-700">{s.ipAddress}</td>
                                                            <td className="px-7 py-4">
                                                                {s.userId ? (
                                                                    <div>
                                                                        <p className="text-xs font-bold text-foreground">{s.userId.firstName} {s.userId.lastName}</p>
                                                                        <p className="text-[10px] text-neutral-400 font-medium">{s.userId.role}</p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-neutral-400 italic">Guest</span>
                                                                )}
                                                            </td>
                                                            <td className="px-7 py-4">
                                                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                                    {s.pagesVisited.slice(0, 3).map((pg, j) => (
                                                                        <span key={`pg-${j}`} className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md truncate max-w-[120px]">{pg}</span>
                                                                    ))}
                                                                    {s.pagesVisited.length > 3 && <span key="overflow" className="text-[10px] font-bold text-primary">+{s.pagesVisited.length - 3}</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-7 py-4 text-xs font-bold text-neutral-700">
                                                                {Math.floor(s.timeSpentSeconds / 60)}m {s.timeSpentSeconds % 60}s
                                                            </td>
                                                            <td className="px-7 py-4 text-xs text-neutral-400 font-medium">
                                                                {new Date(s.lastActive).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}


                {/* User Details Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" /> User Details
                                </h3>
                                <button onClick={() => setShowUserModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-foreground transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-neutral-50/50">
                                {userDetailsLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                                ) : selectedUser ? (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4 bg-white p-6 rounded-[1.5rem] border border-neutral-200 shadow-sm">
                                            <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl font-black text-xl">
                                                {selectedUser.user?.firstName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg text-foreground">{selectedUser.user?.firstName} {selectedUser.user?.lastName}</h4>
                                                <p className="text-sm font-medium text-neutral-500">{selectedUser.user?.email}</p>
                                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">{selectedUser.user?.role}</p>
                                            </div>
                                        </div>

                                        {/* Header Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Total Paid</p>
                                                <p className="text-xl font-black text-primary">â‚¦{(selectedUser.totalPaid || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Sub Days Left</p>
                                                <p className="text-xl font-black text-amber-500">{selectedUser.subscriptionDaysRemaining || 0}</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Transfer Count</p>
                                                <p className="text-xl font-black text-indigo-500">{selectedUser.user?.transferCount || 0}</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-[1.5rem] border border-neutral-200 shadow-sm text-center">
                                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1 tracking-widest">Verified</p>
                                                <div className="mt-1 flex justify-center">
                                                    {selectedUser.user?.ninVerified ? <CheckCircle className="w-6 h-6 text-green-500"/> : <XCircle className="w-6 h-6 text-red-500"/>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suspension Control Section */}
                                        <div className={`p-6 rounded-[1.5rem] border ${selectedUser.user?.isSuspended ? 'bg-red-50 border-red-100' : 'bg-white border-neutral-200'} shadow-sm flex items-center justify-between`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedUser.user?.isSuspended ? 'bg-red-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                                    <ShieldAlert className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className={`font-black ${selectedUser.user?.isSuspended ? 'text-red-700' : 'text-foreground'}`}>
                                                        {selectedUser.user?.isSuspended ? 'Account Restricted' : 'Account Active'}
                                                    </h4>
                                                    <p className="text-xs font-medium text-neutral-500">
                                                        {selectedUser.user?.isSuspended 
                                                            ? `Reason: ${selectedUser.user?.suspensionReason || 'No reason provided'}` 
                                                            : 'Standard user access is currently active for this account.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                disabled={processLoading === selectedUser.user?._id || selectedUser.user?.role === 'admin'}
                                                onClick={() => handleToggleSuspension(selectedUser.user?._id, selectedUser.user?.isSuspended)}
                                                className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 ${
                                                    selectedUser.user?.isSuspended 
                                                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20' 
                                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'
                                                }`}
                                            >
                                                {processLoading === selectedUser.user?._id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                                ) : (
                                                    selectedUser.user?.isSuspended ? 'Restore Access' : 'Restrict Access'
                                                )}
                                            </button>
                                        </div>

                                        {/* Recent Payments Table */}
                                        <div className="bg-white rounded-[2rem] border border-neutral-200 overflow-hidden shadow-sm">
                                            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                                                <h4 className="text-sm font-black text-foreground">Payment History</h4>
                                                <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">{selectedUser.payments?.length || 0} Records</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100">
                                                            <th className="px-6 py-4">Date</th>
                                                            <th className="px-6 py-4">Reference</th>
                                                            <th className="px-6 py-4">Amount</th>
                                                            <th className="px-6 py-4">Type</th>
                                                            <th className="px-6 py-4">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-50">
                                                        {(!selectedUser.payments || selectedUser.payments.length === 0) ? (
                                                            <tr><td colSpan="5" className="px-6 py-10 text-center text-neutral-400 font-bold text-xs">No payments found.</td></tr>
                                                        ) : selectedUser.payments.map((p, i) => (
                                                            <tr key={i} className="hover:bg-neutral-50/50">
                                                                <td className="px-6 py-4 text-xs font-medium text-neutral-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                                <td className="px-6 py-4 text-xs font-mono font-bold text-neutral-800">{p.reference}</td>
                                                                <td className="px-6 py-4 text-xs font-black text-foreground">â‚¦{(p.amount || 0).toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-wider">{p.type}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${p.status === 'success' ? 'bg-green-50 text-green-600' : p.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{p.status}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-center py-20 text-neutral-400 font-bold">User data missing.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                </main>
            </div>

            {/* â”€â”€ Email Centre Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'email' && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-50/30">
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Header & Mode Switcher */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Mail className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tight">Email Centre</h2>
                                    <p className="text-sm font-medium text-neutral-500">Automated workflows and custom campaigns.</p>
                                </div>
                            </div>

                            {/* Mode Toggle */}
                            <div className="bg-white p-1.5 rounded-2xl border border-neutral-200 flex shadow-sm">
                                {[
                                    { id: 'template', label: 'âš¡ Smart Templates', icon: Smartphone },
                                    { id: 'custom',   label: 'ðŸŽ¨ Custom Broadcast',  icon: Edit3 }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setEmailMode(m.id)}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                                            emailMode === m.id 
                                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                                : 'text-neutral-400 hover:text-foreground hover:bg-neutral-50'
                                        }`}
                                    >
                                        <m.icon className="w-3.5 h-3.5" />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSendBulkEmail} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Left Column: Target & Template Selection */}
                            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                                
                                {/* Target Audience */}
                                <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
                                        <h3 className="text-lg font-black text-foreground">Target Audience</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { id: 'pending', label: 'Pending', desc: 'Awaiting Approval', icon: Clock, color: 'amber' },
                                            { id: 'absent',  label: 'Inactive', desc: 'Absent 2+ Weeks',  icon: UserX, color: 'orange' },
                                            { id: 'active',  label: 'Active',   desc: 'Approved Users',    icon: UserCheck, color: 'green' },
                                            { id: 'all',     label: 'Everyone', desc: 'Full Database',    icon: Users2, color: 'indigo' },
                                        ].map(t => {
                                            const colors = {
                                                amber: 'bg-amber-50 text-amber-600',
                                                orange: 'bg-orange-50 text-orange-600',
                                                green: 'bg-green-50 text-green-600',
                                                indigo: 'bg-indigo-50 text-indigo-600'
                                            };
                                            const isSelected = emailTarget === t.id;
                                            return (
                                                <button type="button" key={t.id} onClick={() => setEmailTarget(t.id)}
                                                    className={`group p-5 rounded-3xl border-2 text-left transition-all ${
                                                        isSelected 
                                                            ? 'border-primary bg-primary/[0.02] shadow-xl shadow-primary/5' 
                                                            : 'border-neutral-100 bg-white hover:border-neutral-200'
                                                    }`}>
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colors[t.color]}`}>
                                                        <t.icon className="w-5 h-5" />
                                                    </div>
                                                    <p className="font-black text-base text-foreground">{t.label}</p>
                                                    <p className="text-xs text-neutral-400 font-bold mt-1">{t.desc}</p>
                                                    {isSelected && <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase text-primary tracking-widest animate-in fade-in zoom-in-95 duration-300"><CheckCheck className="w-3.5 h-3.5" /> Selected</div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quick Template Selection (Only in Template Mode) */}
                                {emailMode === 'template' && (
                                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
                                            <h3 className="text-lg font-black text-foreground">Template Gallery</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { id: 'welcome',      label: 'Welcome Onboard',   icon: Megaphone, color: 'blue' },
                                                { id: 'activation',   label: 'Daily Approval Reminder', icon: Smartphone, color: 'purple' },
                                                { id: 'reengagement', label: 'Miss You Message',  icon: Radio, color: 'pink' },
                                            ].map(m => {
                                                const isSelected = emailMsgType === m.id;
                                                return (
                                                    <button type="button" key={m.id} onClick={() => setEmailMsgType(m.id)}
                                                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                                                            isSelected ? 'border-primary bg-primary/5' : 'border-neutral-50 bg-neutral-50/50 hover:bg-white hover:border-neutral-100'
                                                        }`}>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-white text-neutral-400 border border-neutral-100'}`}>
                                                                <m.icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-foreground'}`}>{m.label}</p>
                                                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">System Default</p>
                                                            </div>
                                                        </div>
                                                        {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Content Editor / Preview */}
                            <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                                
                                {emailMode === 'template' ? (
                                    <div className="bg-[#0f0f11] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-500">
                                        {/* Abstract background elements */}
                                        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/20 blur-[100px] rounded-full" />
                                        <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-500/10 blur-[100px] rounded-full" />
                                        
                                        <div className="relative z-10 max-w-sm">
                                            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                                <Zap className="w-10 h-10 text-primary animate-pulse" />
                                            </div>
                                            <h4 className="text-2xl font-black text-white mb-4">Smart Template Active</h4>
                                            <p className="text-sm text-white/40 font-medium leading-relaxed">
                                                You are using a optimized, TraceIt-branded system template. The layout, colors, and links are pre-configured for maximum engagement.
                                            </p>
                                            
                                            <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">Safe Send Enabled</p>
                                                    <p className="text-[11px] text-white/30 font-bold">Dynamic user data like first names will be injected automatically.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 shadow-sm space-y-8 animate-in mt-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
                                                <h3 className="text-lg font-black text-foreground">Composer</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Editor Active</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2.5 ml-1">Campaign Subject</label>
                                                <input 
                                                    type="text" required value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                                                    placeholder="Enter subject line..."
                                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all shadow-inner" 
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-2.5 ml-1">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Message Body</label>
                                                    <span className="text-[10px] font-bold text-neutral-300">HTML Supported</span>
                                                </div>
                                                <textarea 
                                                    required rows={12} value={emailBody} onChange={e => setEmailBody(e.target.value)}
                                                    placeholder="Write your broadcast message..."
                                                    className="w-full px-6 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-medium outline-none focus:border-primary transition-all shadow-inner resize-none font-mono leading-relaxed" 
                                                />
                                            </div>

                                            {/* Advanced Preview Toggle */}
                                            {emailBody && (
                                                <div className="pt-4">
                                                    <button type="button" onClick={() => setEmailPreview(!emailPreview)}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-black text-xs transition-all ${
                                                            emailPreview ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
                                                        }`}>
                                                        <Eye className="w-3.5 h-3.5" /> 
                                                        {emailPreview ? 'Hide Live Preview' : 'Show Live Preview'}
                                                    </button>
                                                    
                                                    {emailPreview && (
                                                        <div className="mt-5 border border-neutral-200 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                                                            <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between">
                                                                <div className="flex gap-1.5">
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                                                </div>
                                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Dark Reader Rendering</span>
                                                            </div>
                                                            <div className="bg-[#0f172a] p-8 text-[#94a3b8] text-sm leading-relaxed"
                                                                dangerouslySetInnerHTML={{ __html: `<h1 style="color:#f8fafc; font-size:20px; font-weight:800; margin-bottom:16px;">Hi John,</h1>${emailBody.replace(/\n/g, '<br/>')}` }} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Floating Action Bar */}
                                <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-6 shadow-xl shadow-neutral-200/50 flex flex-col sm:flex-row items-center justify-between gap-6 sticky bottom-8 z-20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-foreground">Launch Campaign</p>
                                            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                                                Target: <span className="text-primary">{emailTarget}</span> â€¢ Mode: <span className="text-primary">{emailMode}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={emailSending}
                                        className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-[1.25rem] font-black text-sm hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {emailSending ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Broadcasting...</span>
                                            </div>
                                        ) : (
                                            "Send Broadcast Now"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Results Panel */}
                        {emailResults && (
                            <div className="bg-white border border-neutral-200 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="p-10 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground tracking-tight">Campaign Report</h3>
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-[0.2rem] mt-1.5">Delivery Status Breakdown</p>
                                    </div>
                                    <button onClick={() => setEmailResults(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-100 transition-all">
                                        <ArrowUpDown className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3">
                                    <div className="p-10 text-center border-b md:border-b-0 md:border-r border-neutral-100 group">
                                        <div className="text-5xl font-black text-foreground mb-3 group-hover:scale-110 transition-transform">{emailResults.total}</div>
                                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Users Targeted</div>
                                    </div>
                                    <div className="p-10 text-center border-b md:border-b-0 md:border-r border-neutral-100 group">
                                        <div className="text-5xl font-black text-green-500 mb-3 group-hover:scale-110 transition-transform">{emailResults.sent}</div>
                                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Delivered Successfully</div>
                                    </div>
                                    <div className="p-10 text-center group">
                                        <div className="text-5xl font-black text-red-500 mb-3 group-hover:scale-110 transition-transform">{emailResults.failed}</div>
                                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Failed Attempts</div>
                                    </div>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto bg-neutral-50/30">
                                    <div className="px-10 py-6 sticky top-0 bg-neutral-100/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Recipient Details</span>
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</span>
                                    </div>
                                    <div className="divide-y divide-neutral-100">
                                        {emailResults.results?.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between px-10 py-5 hover:bg-white transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${r.status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        {r.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-foreground">{r.name}</p>
                                                        <p className="text-xs text-neutral-400 font-medium">{r.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg inline-block ${r.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {r.status === 'sent' ? 'âœ“ Delivered' : 'âœ— Failed'}
                                                    </div>
                                                    {r.error && <p className="text-[9px] text-red-400 font-medium mt-1">{r.error}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


function StatCard({ icon: Icon, label, value, trend, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600'
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm relative overflow-hidden group">
            <div className={`w-14 h-14 ${colors[color]} flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-foreground mb-2">{value}</p>
            <p className="text-xs font-bold text-neutral-400">{trend}</p>
        </div>
    );
}
