import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import AncientCityJourney, { globalFlags } from './AncientCityJourney'
import { portfolioData } from './portfolioData'

function App() {
  const [formStatus, setFormStatus] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'paimon', text: '*Sculk sensor clicks* A vibration detected... Do you seek the archives?' }
  ])
  const [chatInput, setChatInput] = useState('')

  const handleMailSubmit = (e) => {
    e.preventDefault()
    setFormStatus('Sending message...')
    setTimeout(() => {
      setFormStatus('Message transmitted successfully!')
      e.target.reset()
    }, 1500)
  }

  const toggleChat = () => setIsChatOpen(!isChatOpen)

  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    setChatMessages([...chatMessages, { sender: 'user', text: chatInput }])
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        sender: 'paimon', 
        text: '*Vibration echoes* I have recorded your signal. The Deep Dark listens.' 
      }])
    }, 1000)
    
    setChatInput('')
  }

  return (
    <div className="minecraft-wrapper">
      {/* 3D Cinematic Scroll Journey Wrapper */}

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



      <AncientCityJourney />

    </div>
  )
}

export default App
