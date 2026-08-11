import Merchant from '../models/Merchant.js';
import Influencer from '../models/Influencer.js';
import FAQ from '../models/FAQ.js';
import AppContent from '../models/AppContent.js';

export const seedDynamicData = async () => {
    try {
        // 1. Seed Merchants if empty
        const merchantCount = await Merchant.countDocuments();
        if (merchantCount === 0) {
            await Merchant.insertMany([
                {
                    name: 'Slot Systems Nigeria',
                    logoUrl: 'https://images.unsplash.com/photo-1556742049-0a670fc8a5d7?auto=format&fit=crop&w=400&q=80',
                    dateJoined: new Date('2024-01-15'),
                    starRating: 5,
                    location: 'Ikeja City Mall & Computer Village, Lagos',
                    category: 'Mobile Retailer & Authorized Dealer',
                    verifiedStatus: 'Verified Super Merchant',
                    phone: '+234 800 756 8647',
                    email: 'support@slot.ng',
                    website: 'https://slot.ng',
                    description: 'Nigeria leading retailer for genuine mobile phones, laptops, and consumer electronics.'
                },
                {
                    name: '3C HUB Electronics',
                    logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
                    dateJoined: new Date('2024-02-10'),
                    starRating: 5,
                    location: 'Computer Village, Ikeja, Lagos',
                    category: 'Gadgets & Smart Accessories',
                    verifiedStatus: 'Verified Merchant',
                    phone: '+234 812 345 6789',
                    email: 'info@3chub.com',
                    website: 'https://3chub.com',
                    description: 'Premier destination for authentic smartphones, accessories, and warranty repairs.'
                },
                {
                    name: 'Microstation Gadgets',
                    logoUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80',
                    dateJoined: new Date('2024-03-01'),
                    starRating: 4.8,
                    location: 'VGC & Otigba Street, Ikeja, Lagos',
                    category: 'Laptop & Apple Specialist',
                    verifiedStatus: 'Verified Merchant',
                    phone: '+234 803 111 2233',
                    email: 'sales@microstation.ng',
                    website: 'https://microstation.ng',
                    description: 'Certified dealers of MacBooks, iPhones, gaming laptops, and original accessories.'
                },
                {
                    name: 'Fouani Electronics',
                    logoUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80',
                    dateJoined: new Date('2024-04-18'),
                    starRating: 4.9,
                    location: 'Victoria Island, Lagos & Abuja',
                    category: 'Home Appliances & Smart TV Hub',
                    verifiedStatus: 'Verified Super Merchant',
                    phone: '+234 809 999 8888',
                    email: 'care@fouani.com',
                    website: 'https://fouani.com',
                    description: 'Official distributor of premium smart devices, OLED TVs, and high-end electronics.'
                }
            ]);
            console.log('[SEED] Default registered merchants created successfully');
        }

        // 2. Seed Influencers if empty
        const influencerCount = await Influencer.countDocuments();
        if (influencerCount === 0) {
            await Influencer.insertMany([
                {
                    name: 'Fisayo Fosudo',
                    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                    role: 'Lead Tech Video Creator',
                    handle: '@fisayofosudo',
                    platform: 'YouTube & X',
                    socialUrl: 'https://youtube.com',
                    quote: 'TraceIt is solving one of Nigeria biggest challenges in tech — gadget theft and unverified second-hand device sales!',
                    starRating: 5,
                    dateJoined: new Date('2024-01-01'),
                    featured: true
                },
                {
                    name: 'Kagantech',
                    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                    role: 'Tech Reviewer & Consumer Advocate',
                    handle: '@kagantech',
                    platform: 'Instagram & TikTok',
                    socialUrl: 'https://instagram.com',
                    quote: 'Before you buy any used iPhone or laptop in Nigeria, check TraceIt first. It gives total peace of mind!',
                    starRating: 5,
                    dateJoined: new Date('2024-02-15'),
                    featured: true
                },
                {
                    name: 'Miss Techy (Tobi)',
                    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
                    role: 'Digital Creator & Gadget Enthusiast',
                    handle: '@misstechy',
                    platform: 'Instagram',
                    socialUrl: 'https://instagram.com',
                    quote: 'I love how seamless it is to transfer gadget ownership on TraceIt. Every device owner should register today.',
                    starRating: 5,
                    dateJoined: new Date('2024-03-20'),
                    featured: true
                }
            ]);
            console.log('[SEED] Default brand influencers created successfully');
        }

        // 3. Seed FAQs if empty
        const faqCount = await FAQ.countDocuments();
        if (faqCount === 0) {
            await FAQ.insertMany([
                {
                    question: 'What exactly is TraceIt?',
                    answer: 'TraceIt is Nigeria first verified national gadget registry. Like a Land Registry for electronics, every phone, laptop, tablet, or device registered on TraceIt is permanently linked to its NIN-verified owner. This creates an immutable digital record of ownership.',
                    category: 'General',
                    order: 1,
                    isPublished: true
                },
                {
                    question: 'Why should I register my electronic devices on TraceIt?',
                    answer: 'Registering your device proves legal ownership without needing physical paper receipts, massively increases your device resale value, and protects against theft by flagging stolen devices across a nationwide database accessible by technicians, buyers, and law enforcement.',
                    category: 'Registration',
                    order: 2,
                    isPublished: true
                },
                {
                    question: 'How does identity verification work?',
                    answer: 'TraceIt verifies users against official National Identification Number (NIN) records. Once verified, your account receives an official verification badge, allowing full access to register gadgets, transfer ownership, and operate substores.',
                    category: 'Verification',
                    order: 3,
                    isPublished: true
                },
                {
                    question: 'How do I transfer ownership when selling my device?',
                    answer: 'To transfer ownership, log into your TraceIt dashboard, navigate to Transfers, enter the buyers registered email address, and initiate the transfer. The buyer accepts the transfer on their dashboard to complete the legal ownership handover.',
                    category: 'Transfers',
                    order: 4,
                    isPublished: true
                },
                {
                    question: 'What happens if my registered device gets stolen or lost?',
                    answer: 'Log into TraceIt immediately and toggle the status of your device to "Flagged / Stolen". This instantly alerts all phone dealers, repair engineers, and buyers nationwide whenever someone tries to sell or fix your gadget.',
                    category: 'Security',
                    order: 5,
                    isPublished: true
                }
            ]);
            console.log('[SEED] Default FAQs created successfully');
        }

        // 4. Seed AppContent (Features, How-It-Works, For-Who) if empty
        const contentCount = await AppContent.countDocuments();
        if (contentCount === 0) {
            await AppContent.insertMany([
                // Features
                {
                    section: 'features',
                    title: 'NIN-Linked Ownership Records',
                    subtitle: 'Verifiable Proof of Purchase',
                    icon: 'ShieldCheck',
                    description: 'Every gadget registered on TraceIt is directly bound to a NIN-verified identity, eliminating stolen device trading.',
                    badge: 'Core Security',
                    order: 1
                },
                {
                    section: 'features',
                    title: 'Instant Nationwide Stolen Flagging',
                    subtitle: 'Real-time Theft Alerting',
                    icon: 'ShieldAlert',
                    description: 'Report stolen or missing gadgets in one click. Our national database alerts vendors and repair hubs across Nigeria.',
                    badge: 'Instant Alert',
                    order: 2
                },
                {
                    section: 'features',
                    title: 'Seamless Digital Ownership Transfer',
                    subtitle: 'Hassle-Free Resale',
                    icon: 'ArrowRight',
                    description: 'Sell or gift your device securely. Ownership transfers are logged digitally with instant audit trails.',
                    badge: 'Resale Boost',
                    order: 3
                },

                // How It Works
                {
                    section: 'how_it_works',
                    title: 'Create & Verify Account',
                    subtitle: 'Step 1',
                    icon: 'Users',
                    description: 'Sign up on TraceIt and submit your NIN for automated identity verification to unlock full protection.',
                    badge: '01',
                    order: 1
                },
                {
                    section: 'how_it_works',
                    title: 'Register Your Gadgets',
                    subtitle: 'Step 2',
                    icon: 'Smartphone',
                    description: 'Add your phones, laptops, and tablets by inputting their IMEI or serial numbers and proof of purchase.',
                    badge: '02',
                    order: 2
                },
                {
                    section: 'how_it_works',
                    title: 'Protect, Verify & Transfer',
                    subtitle: 'Step 3',
                    icon: 'ShieldCheck',
                    description: 'Generate ownership certificates, verify devices before buying, or transfer ownership when reselling.',
                    badge: '03',
                    order: 3
                },

                // For Who
                {
                    section: 'for_who',
                    title: 'Individual Gadget Owners',
                    subtitle: 'Personal Protection',
                    icon: 'Smartphone',
                    description: 'Protect your personal phones, laptops, and tablets. Ensure quick recovery and higher resale value when upgrading.',
                    badge: 'Personal',
                    order: 1
                },
                {
                    section: 'for_who',
                    title: 'Phone Dealers & Merchants',
                    subtitle: 'Business Inventory',
                    icon: 'Globe',
                    description: 'Confirm device origin before buying stock. Register inventory and give customers verified proof of clean gadgets.',
                    badge: 'Merchants',
                    order: 2
                },
                {
                    section: 'for_who',
                    title: 'Repair Technicians & Engineers',
                    subtitle: 'Service & Repair Security',
                    icon: 'Zap',
                    description: 'Avoid repairing stolen property by running quick serial/IMEI checks before starting any repair job.',
                    badge: 'Technicians',
                    order: 3
                }
            ]);
            console.log('[SEED] Default overview content (Features, How-It-Works, For-Who) created successfully');
        }
    } catch (error) {
        console.error('[SEED] Failed to seed dynamic data:', error.message);
    }
};
