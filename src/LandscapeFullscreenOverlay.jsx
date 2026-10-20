import React, { useState, useEffect } from 'react';
import { requestFullscreenSafe, isFullscreenActive } from './hooks/useOrientation';

/**
 * LandscapeFullscreenOverlay
 * Minimal, cinematic Deep Dark overlay specifically for mobile phones in landscape.
 * Guides the user to enter fullscreen for maximum vertical viewport breathing room.
 * Does NOT auto-force fullscreen; triggers cleanly directly from user gesture.
 */
export default function LandscapeFullscreenOverlay({ 
  isVisible = false, 
  onDismiss = () => {} 
}) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isReturnPrompt, setIsReturnPrompt] = useState(false);
  const [hasDismissedLocal, setHasDismissedLocal] = useState(false);

  useEffect(() => {
    try {
      const choice = sessionStorage.getItem('sculk_fullscreen_choice');
      if (choice === 'windowed') {
        setHasDismissedLocal(true);
      } else if (choice === 'entered') {
        setIsReturnPrompt(true);
      }
    } catch {
      // sessionStorage not accessible in rare environments
    }
  }, []);

  // Listen to fullscreenchange; if fullscreen becomes active, dismiss smoothly
  useEffect(() => {
    const handleFsChange = () => {
      if (isFullscreenActive()) {
        setIsFadingOut(true);
        setTimeout(() => {
          setHasDismissedLocal(true);
          onDismiss();
          window.dispatchEvent(new Event('resize'));
        }, 450);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [onDismiss]);

  if (!isVisible || hasDismissedLocal) {
    return null;
  }

  const handleEnter = (e) => {
    e.preventDefault();
    setIsPulsing(true);

    // Call Fullscreen API directly within this user gesture
    requestFullscreenSafe();

    try {
      sessionStorage.setItem('sculk_fullscreen_choice', 'entered');
    } catch {}

    // Subtle cinematic fadeout after brief sculk pulse
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setHasDismissedLocal(true);
        onDismiss();
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }, 220);
  };

  const handleContinueWithout = (e) => {
    e.preventDefault();
    try {
      sessionStorage.setItem('sculk_fullscreen_choice', 'windowed');
    } catch {}

    setIsFadingOut(true);
    setTimeout(() => {
      setHasDismissedLocal(true);
      onDismiss();
      window.dispatchEvent(new Event('resize'));
    }, 400);
  };

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen Experience Entry"
      className="landscape-fullscreen-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99990,
        background: 'rgba(2, 6, 10, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(16px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))',
        boxSizing: 'border-box',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Background radial sculk glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 168, 154, 0.14) 0%, rgba(2, 6, 10, 0.8) 60%, #010203 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Center Cinematic Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 'min(440px, 86vw)',
          width: '100%',
          textAlign: 'center',
          background: 'rgba(4, 12, 18, 0.82)',
          border: '1px solid rgba(0, 220, 210, 0.25)',
          borderRadius: '8px',
          boxShadow: '0 0 35px rgba(0, 252, 240, 0.12), inset 0 0 15px rgba(0, 220, 210, 0.05)',
          padding: '20px 24px 18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '11px',
            letterSpacing: '3px',
            color: 'var(--sculk-blue, #00A89A)',
            textTransform: 'uppercase',
            marginBottom: '6px',
            display: 'block'
          }}
        >
          {isReturnPrompt ? 'EXPEDITION RESUMED' : 'DEEP DARK EXPEDITION'}
        </span>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(17px, 4.2vw, 21px)',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#ffffff',
            margin: '0 0 4px 0',
            textShadow: '0 0 15px rgba(0, 252, 240, 0.35)',
            textTransform: 'uppercase',
            lineHeight: 1.2
          }}
        >
          ENTER THE ANCIENT CITY
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '13px',
            lineHeight: 1.4,
            color: 'var(--ancient-text-dim, #8faeb3)',
            margin: '0 0 16px 0',
            maxWidth: '360px'
          }}
        >
          {isReturnPrompt 
            ? 'Return to fullscreen for the optimal widescreen view.'
            : 'Best experienced in fullscreen.'}
        </p>

        {/* Action Button Wrapper */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          {/* Subtle Sculk Pulse Ring on click */}
          {isPulsing && (
            <span
              style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '6px',
                border: '1.5px solid var(--sculk-cyan, #00fcf0)',
                animation: 'fsPulseRing 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                pointerEvents: 'none'
              }}
            />
          )}

          <button
            onClick={handleEnter}
            style={{
              width: '100%',
              background: 'rgba(0, 252, 240, 0.12)',
              border: '1px solid var(--sculk-cyan, #00fcf0)',
              color: 'var(--sculk-cyan, #00fcf0)',
              fontFamily: "'Cinzel', serif",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
              padding: '10px 18px',
              borderRadius: '3px',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(0, 252, 240, 0.2)',
              transition: 'all 0.25s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minHeight: '40px',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>⛶</span>
            {isReturnPrompt ? 'RETURN TO FULLSCREEN' : 'ENTER FULLSCREEN'}
          </button>
        </div>

        {/* Secondary link */}
        <button
          onClick={handleContinueWithout}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(143, 174, 179, 0.75)',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '12px',
            letterSpacing: '1px',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginTop: '12px',
            padding: '4px 8px',
            transition: 'color 0.2s ease'
          }}
        >
          CONTINUE WITHOUT FULLSCREEN
        </button>
      </div>

      <style>{`
        @keyframes fsPulseRing {
          0% {
            transform: scale(0.96);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.08);
            opacity: 0;
          }
        }
      `}</style>
    </aside>
  );
}
