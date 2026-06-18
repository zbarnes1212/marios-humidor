'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        setVisible(false);
        onDone();
      }, 800);
    }, 3000);
    return () => clearTimeout(fadeTimer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#120a02',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadingOut ? 0 : 1,
      transition: 'opacity 800ms ease-out',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:wght@300;400&display=swap');
        @keyframes revealIcon {
          0%   { opacity: 0; transform: scale(0.88); }
          50%  { opacity: 0; transform: scale(0.88); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes revealText {
          0%   { opacity: 0; transform: translateY(10px); }
          60%  { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .splash-icon {
          animation: revealIcon 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }
        .splash-text {
          animation: revealText 3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .splash-marios {
          font-family: 'Cinzel', serif;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: 0.25em;
          background: linear-gradient(160deg, #c9a84c, #f0d080, #b8892a, #e8c050);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
        }
        .splash-humidor {
          font-family: 'Cinzel', serif;
          font-size: 34px;
          font-weight: 500;
          letter-spacing: 0.15em;
          background: linear-gradient(160deg, #c9a84c, #f0d080, #b8892a, #e8c050, #a07020);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
        }
        .splash-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(180, 140, 60, 0.5);
          text-transform: uppercase;
          margin-top: 8px;
        }
      `}</style>

      <div className="splash-icon">
        <svg width="180" height="180" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#c9a84c"/>
              <stop offset="25%"  stopColor="#f0d080"/>
              <stop offset="50%"  stopColor="#b8892a"/>
              <stop offset="75%"  stopColor="#e8c050"/>
              <stop offset="100%" stopColor="#9a6c18"/>
            </linearGradient>
            <linearGradient id="goldGrad2" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%"   stopColor="#d4a83a"/>
              <stop offset="30%"  stopColor="#f5e090"/>
              <stop offset="60%"  stopColor="#b8892a"/>
              <stop offset="100%" stopColor="#e0b840"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="52" stroke="url(#goldGrad)" fill="none" strokeWidth="3.5"/>
          <text
            x="60" y="82"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontSize="72"
            fontWeight="500"
            textAnchor="middle"
            fill="url(#goldGrad2)"
          >M</text>
        </svg>
      </div>

      <div className="splash-text">
        <span className="splash-marios">Mario&apos;s</span>
        <span className="splash-humidor">Humidor</span>
        <span className="splash-tagline">The Cigar Lifestyle Platform</span>
      </div>
    </div>
  );
}
