import React, { useState } from 'react'
import './App.css'
import AncientCityJourney, { globalFlags } from './AncientCityJourney'
import { portfolioData } from './portfolioData'
import RotateDeviceScreen from './RotateDeviceScreen'
import LandscapeFullscreenOverlay from './LandscapeFullscreenOverlay'
import { useOrientation, requestFullscreenSafe, exitFullscreenSafe } from './hooks/useOrientation'

function App() {
  const { experienceMode, isTouchDevice, isLandscapePhone, isTabletLandscape, shouldShowRotateSplash, isFullscreen } = useOrientation();
  const [isFullscreenOverlayDismissed, setIsFullscreenOverlayDismissed] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Active section indicator tracking
  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const p = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
          if (p >= 0.78) {
            setActiveSection('transmit');
          } else if (p >= 0.60) {
            setActiveSection('relics');
          } else if (p >= 0.43) {
            setActiveSection('network');
          } else if (p >= 0.27) {
            setActiveSection('archives');
          } else if (p >= 0.13) {
            setActiveSection('about');
          } else {
            setActiveSection('');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shouldShowFullscreenOverlay = isLandscapePhone && !shouldShowRotateSplash && !isFullscreen && !isFullscreenOverlayDismissed;

  const handleToggleFullscreen = (e) => {
    e.preventDefault();
    if (isFullscreen) {
      exitFullscreenSafe();
    } else {
      requestFullscreenSafe();
    }
  };

  return (
    <div className={`minecraft-wrapper ${isLandscapePhone ? 'compact-landscape-phone' : ''}`}>
      {/* Rotate Device Screen (Cinematic Deep Dark splash for touch portrait) */}
      <RotateDeviceScreen isVisible={shouldShowRotateSplash} />

      {/* Landscape Fullscreen Entry Overlay (Mobile landscape only) */}
      <LandscapeFullscreenOverlay 
        isVisible={shouldShowFullscreenOverlay}
        onDismiss={() => setIsFullscreenOverlayDismissed(true)}
      />

      {/* 3D Journey & Portfolio Cards / Vignette (Canvas at z-index: 0, Overlay at z-index: 10) */}
      <AncientCityJourney 
        experienceMode={experienceMode}
        isPaused={shouldShowRotateSplash}
        isLandscapePhone={isLandscapePhone}
        isTabletLandscape={isTabletLandscape}
        isTouch={isTouchDevice}
      />

      {/* Subtle Scroll Indicator — Layered ABOVE cinematic tint / cards (z-index: 50) */}
      <div className="scroll-indicator">
        <div className="sculk-line"></div>
        <span>DESCEND</span>
      </div>

      {/* Minimal Top Navigation — Highest UI layer (z-index: 100) */}
      <nav className="minimal-nav">
        <div className="nav-brand ui-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>{portfolioData.hero.title.toUpperCase()}</div>
        <div className="nav-links">
          <span className={`ui-nav ${activeSection === 'about' ? 'active' : ''}`} onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.20, behavior: 'smooth' }); }}>ABOUT</span>
          <span className={`ui-nav ${activeSection === 'archives' ? 'active' : ''}`} onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.35, behavior: 'smooth' }); }}>ARCHIVES</span>
          <span className={`ui-nav ${activeSection === 'network' ? 'active' : ''}`} onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.52, behavior: 'smooth' }); }}>NETWORK</span>
          <span className={`ui-nav ${activeSection === 'relics' ? 'active' : ''}`} onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.68, behavior: 'smooth' }); }}>RELICS</span>
          <span className={`ui-nav ${activeSection === 'transmit' ? 'active' : ''}`} onClick={() => { 
            const max = document.documentElement.scrollHeight - window.innerHeight; 
            globalFlags.skipWardenCinematic = true;
            window.scrollTo({ top: max, behavior: 'smooth' }); 
          }}>TRANSMIT</span>

          {/* Unobtrusive Fullscreen Control for Mobile Landscape */}
          {isLandscapePhone && (
            <button
              className="fullscreen-toggle-btn"
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}

export default App

