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

      {/* Minimal Top Navigation */}
      <nav className="minimal-nav">
        <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>{portfolioData.hero.title.toUpperCase()}</div>
        <div className="nav-links">
          <span onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.20, behavior: 'smooth' }); }} style={{cursor:'pointer', color:'var(--sculk-blue)'}}>ABOUT</span>
          <span onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.35, behavior: 'smooth' }); }} style={{cursor:'pointer', color:'var(--sculk-blue)'}}>ARCHIVES</span>
          <span onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.52, behavior: 'smooth' }); }} style={{cursor:'pointer', color:'var(--sculk-blue)'}}>NETWORK</span>
          <span onClick={() => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: max * 0.68, behavior: 'smooth' }); }} style={{cursor:'pointer', color:'var(--sculk-blue)'}}>RELICS</span>
          <span onClick={() => { 
            const max = document.documentElement.scrollHeight - window.innerHeight; 
            globalFlags.skipWardenCinematic = true;
            window.scrollTo({ top: max, behavior: 'smooth' }); 
          }} style={{cursor:'pointer', color:'var(--sculk-blue)'}}>TRANSMIT</span>

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

      {/* Subtle Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="sculk-line"></div>
        <span>DESCEND</span>
      </div>

      <AncientCityJourney 
        experienceMode={experienceMode}
        isPaused={shouldShowRotateSplash}
        isLandscapePhone={isLandscapePhone}
        isTabletLandscape={isTabletLandscape}
        isTouch={isTouchDevice}
      />

    </div>
  )
}

export default App

