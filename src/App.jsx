import React from 'react'
import './App.css'
import AncientCityJourney, { globalFlags } from './AncientCityJourney'
import { portfolioData } from './portfolioData'
import RotateDeviceScreen from './RotateDeviceScreen'
import { useOrientation } from './hooks/useOrientation'

function App() {
  const { isTouchDevice, isLandscapePhone, isTabletLandscape, shouldShowRotateSplash } = useOrientation();

  return (
    <div className={`minecraft-wrapper ${isLandscapePhone ? 'compact-landscape-phone' : ''}`}>
      {/* Rotate Device Screen (Cinematic Deep Dark splash for touch portrait) */}
      <RotateDeviceScreen isVisible={shouldShowRotateSplash} />

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
        </div>
      </nav>

      {/* Subtle Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="sculk-line"></div>
        <span>DESCEND</span>
      </div>

      <AncientCityJourney 
        isPaused={shouldShowRotateSplash}
        isLandscapePhone={isLandscapePhone}
        isTabletLandscape={isTabletLandscape}
        isTouch={isTouchDevice}
      />

    </div>
  )
}

export default App

