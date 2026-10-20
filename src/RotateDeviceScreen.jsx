import React from 'react';

/**
 * RotateDeviceScreen
 * Cinematic Ancient City-themed splash displayed strictly on mobile/tablet portrait.
 * Asks user to rotate device to landscape for the full widescreen cinematic experience.
 */
export default function RotateDeviceScreen({ isVisible }) {
  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Device rotation required"
      className={`rotate-device-screen ${isVisible ? 'active' : 'hidden'}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999,
        background: '#020406',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(1.5rem, env(safe-area-inset-top)) max(1.5rem, env(safe-area-inset-right)) max(1.5rem, env(safe-area-inset-bottom)) max(1.5rem, env(safe-area-inset-left))',
        boxSizing: 'border-box',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.45s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Subtle Sculk Teal Radial Illumination */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 46%, rgba(0, 168, 154, 0.16) 0%, rgba(2, 6, 10, 0.75) 55%, #010203 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Very Faint Sculk Texture/Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: `radial-gradient(rgba(0, 252, 240, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }}
      />

      {/* Floating Cyan Specks (Decorative & Minimal) */}
      <div className="rotate-particles" aria-hidden="true">
        <span className="sculk-speck speck-1" />
        <span className="sculk-speck speck-2" />
        <span className="sculk-speck speck-3" />
        <span className="sculk-speck speck-4" />
        <span className="sculk-speck speck-5" />
      </div>

      {/* Main Center Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 'min(420px, 90vw)',
          width: '100%'
        }}
      >
        {/* Animated Phone Silhouette with Sculk Pulse */}
        <div className="phone-anim-wrapper" style={{ position: 'relative', marginBottom: '2rem' }}>
          {/* Subtle cyan sculk pulse ring */}
          <div className="sculk-pulse-ring" />

          {/* Phone SVG Silhouette */}
          <div className="phone-icon-anim">
            <svg
              className="phone-svg"
              width="58"
              height="88"
              viewBox="0 0 58 88"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Outer phone body */}
              <rect
                x="2"
                y="2"
                width="54"
                height="84"
                rx="10"
                stroke="rgba(0, 252, 240, 0.85)"
                strokeWidth="2.5"
                fill="rgba(5, 15, 22, 0.8)"
              />
              {/* Screen outline */}
              <rect
                x="7"
                y="9"
                width="44"
                height="70"
                rx="5"
                stroke="rgba(0, 168, 154, 0.4)"
                strokeWidth="1.2"
                fill="rgba(0, 252, 240, 0.04)"
              />
              {/* Speaker notch */}
              <line
                x1="23"
                y1="5.5"
                x2="35"
                y2="5.5"
                stroke="rgba(0, 252, 240, 0.6)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Screen horizontal preview indicator */}
              <rect
                x="14"
                y="34"
                width="30"
                height="20"
                rx="2"
                stroke="rgba(0, 252, 240, 0.6)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                fill="none"
              />
              {/* Home indicator bar */}
              <line
                x1="22"
                y1="82.5"
                x2="36"
                y2="82.5"
                stroke="rgba(0, 252, 240, 0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Copy: ENTER THE DEEP DARK */}
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(22px, 5.5vw, 28px)',
            fontWeight: 700,
            letterSpacing: 'clamp(3px, 1vw, 5px)',
            color: '#ffffff',
            margin: '0 0 0.75rem 0',
            textShadow: '0 0 16px rgba(0, 252, 240, 0.35)',
            textTransform: 'uppercase'
          }}
        >
          ENTER THE DEEP DARK
        </h1>

        {/* Subtext: This experience was built for a wider view. */}
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'clamp(14px, 3.8vw, 16px)',
            lineHeight: 1.5,
            color: 'var(--text-secondary, #c5d4d8)',
            margin: '0 0 1.5rem 0',
            maxWidth: '340px'
          }}
        >
          This experience was built for a wider view.
        </p>

        {/* ROTATE YOUR DEVICE */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.6rem 1.4rem',
            background: 'rgba(0, 168, 154, 0.1)',
            border: '1px solid rgba(0, 252, 240, 0.35)',
            borderRadius: '3px',
            boxShadow: '0 0 15px rgba(0, 252, 240, 0.15)'
          }}
        >
          <span
            style={{
              color: 'var(--sculk-cyan, #00fcf0)',
              fontSize: '16px',
              display: 'inline-block',
              animation: 'spinPrompt 3s linear infinite'
            }}
          >
            ↻
          </span>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(14px, 3.8vw, 17px)',
              fontWeight: 700,
              letterSpacing: '2.5px',
              color: 'var(--sculk-cyan, #00fcf0)',
              margin: 0,
              textTransform: 'uppercase'
            }}
          >
            ROTATE YOUR DEVICE
          </h2>
        </div>

        {/* Microcopy: Best experienced in landscape */}
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '12px',
            letterSpacing: '1px',
            color: 'rgba(0, 252, 240, 0.65)',
            marginTop: '0.8rem',
            marginBottom: '1.8rem'
          }}
        >
          ↻ Best experienced in landscape
        </p>

        {/* Footer: The Ancient City awaits. */}
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(11px, 3vw, 13px)',
            letterSpacing: '2px',
            color: 'rgba(143, 174, 179, 0.55)',
            margin: 0,
            textTransform: 'uppercase'
          }}
        >
          The Ancient City awaits.
        </p>
      </div>

      {/* Component-scoped Styles for Smooth Animations & Reduced Motion */}
      <style>{`
        /* Phone silhouette rotation loop */
        .phone-icon-anim {
          animation: rotatePhone 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: center center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes rotatePhone {
          0%, 15% {
            transform: rotate(0deg);
          }
          45%, 75% {
            transform: rotate(90deg);
          }
          95%, 100% {
            transform: rotate(90deg);
          }
        }

        /* Sculk pulse ring */
        .sculk-pulse-ring {
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 1px solid rgba(0, 252, 240, 0.4);
          animation: sculkPulse 3.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          pointer-events: none;
        }

        @keyframes sculkPulse {
          0% {
            transform: scale(0.7);
            opacity: 0.1;
          }
          40% {
            transform: scale(1.15);
            opacity: 0.45;
          }
          70%, 100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }

        @keyframes spinPrompt {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }

        /* Subtle ambient specks */
        .rotate-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .sculk-speck {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #00fcf0;
          border-radius: 50%;
          opacity: 0.35;
          box-shadow: 0 0 6px #00fcf0;
        }
        .speck-1 { top: 22%; left: 18%; animation: floatSpeck 6s ease-in-out infinite alternate; }
        .speck-2 { top: 68%; left: 82%; animation: floatSpeck 8s ease-in-out infinite alternate-reverse; }
        .speck-3 { top: 38%; left: 78%; animation: floatSpeck 7s ease-in-out infinite alternate; }
        .speck-4 { top: 80%; left: 25%; animation: floatSpeck 9s ease-in-out infinite alternate-reverse; }
        .speck-5 { top: 15%; left: 62%; animation: floatSpeck 5s ease-in-out infinite alternate; }

        @keyframes floatSpeck {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          100% { transform: translateY(-16px) translateX(8px); opacity: 0.6; }
        }

        /* Accessibility: Respect Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .phone-icon-anim {
            animation: none !important;
            transform: rotate(90deg) !important;
          }
          .sculk-pulse-ring {
            animation: none !important;
            opacity: 0.25 !important;
            transform: scale(1) !important;
          }
          .rotate-particles {
            display: none !important;
          }
          span[style*="animation: spinPrompt"] {
            animation: none !important;
          }
        }
      `}</style>
    </aside>
  );
}
