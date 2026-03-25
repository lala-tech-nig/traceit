"use client";

import { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '2348121444306';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%2C%20I%20need%20help%20with%20TraceIt`;

export default function WhatsAppButton() {
    const [showBubble, setShowBubble] = useState(false);
    const [visible, setVisible] = useState(true);

    // Alternately show/hide the chat bubble every 4 seconds
    useEffect(() => {
        // Show the bubble after 2s initial delay
        const initialTimer = setTimeout(() => setShowBubble(true), 2000);
        return () => clearTimeout(initialTimer);
    }, []);

    useEffect(() => {
        if (!showBubble) return;
        const interval = setInterval(() => {
            setShowBubble(prev => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, [showBubble]);

    return (
        <div className="whatsapp-wrapper">

            {/* WhatsApp Floating Button Container */}
            <div className="relative flex items-center justify-center">
                {/* Curved Stationary Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] pointer-events-none z-0">
                    <svg viewBox="0 0 100 100" width="100%" height="100%" className="drop-shadow-lg overflow-visible">
                        <defs>
                            <path
                                id="textCurve"
                                d="M 12, 55 A 38,38 0 0,1 88,55"
                            />
                        </defs>
                        <text
                            fill="#f97316"
                            fontSize="12"
                            fontWeight="900"
                            letterSpacing="2"

                        >
                            <textPath href="#textCurve" startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                                WE ARE HERE
                            </textPath>
                        </text>
                    </svg>
                </div>

                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn relative z-10"
                    aria-label="Chat on WhatsApp"
                    title="Chat with us on WhatsApp"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="white"
                        width="28"
                        height="28"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </a>
            </div>

            <style jsx>{`
                .whatsapp-wrapper {
                    position: fixed;
                    bottom: 28px;
                    right: 28px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                    transition: bottom 0.3s ease;
                }

                @media (max-width: 768px) {
                    .whatsapp-wrapper {
                        bottom: 110px; /* Lifted above the new mobile bottom nav */
                    }
                }

                .whatsapp-btn {
                    width: 58px;
                    height: 58px;
                    background-color: #25D366;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(37, 211, 102, 0.5);
                    animation: wa-bounce 2s infinite;
                    transition: transform 0.2s, box-shadow 0.2s;
                    text-decoration: none;
                }

                .whatsapp-btn:hover {
                    transform: scale(1.12);
                    box-shadow: 0 6px 28px rgba(37, 211, 102, 0.65);
                }

                .whatsapp-bubble {
                    background: white;
                    color: #111;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 10px 14px;
                    border-radius: 18px 18px 4px 18px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                    opacity: 0;
                    transform: translateY(8px) scale(0.95);
                    transition: opacity 0.4s ease, transform 0.4s ease;
                    pointer-events: none;
                }

                .whatsapp-bubble--visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                .whatsapp-wave {
                    display: inline-block;
                    animation: wave 1.4s infinite;
                    transform-origin: 70% 70%;
                }

                @keyframes wave {
                    0%   { transform: rotate(0deg); }
                    10%  { transform: rotate(14deg); }
                    20%  { transform: rotate(-8deg); }
                    30%  { transform: rotate(14deg); }
                    40%  { transform: rotate(-4deg); }
                    50%  { transform: rotate(10deg); }
                    60%  { transform: rotate(0deg); }
                    100% { transform: rotate(0deg); }
                }

                @keyframes wa-bounce {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
}
