import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, N8AO } from '@react-three/postprocessing';
import { Textures } from './TextureGenerator';
import { WardenEncounter } from './Warden3D';
import { portfolioData } from './portfolioData';

// ============================================================
// ONE shared progress value. Camera and overlay both read this.
// ============================================================
export const scrollProgress = { target: 0, smooth: 0 };
export const globalFlags = { skipWardenCinematic: false };

const AncientCityGeometry = () => {
  const floorRef = useRef();
  const brickRef = useRef();
  const sculkRef = useRef();
  const lanternRef = useRef();

  const materials = useMemo(() => {
    const sculkTex = Textures.Sculk;
    const lanternTex = Textures.SoulLantern;
    return {
      floor: new THREE.MeshStandardMaterial({ map: Textures.DeepslateTiles, roughness: 0.9 }),
      brick: new THREE.MeshStandardMaterial({ map: Textures.DeepslateBricks, roughness: 0.8 }),
      sculk: new THREE.MeshStandardMaterial({
        map: sculkTex.map,
        emissiveMap: sculkTex.emissiveMap,
        emissive: new THREE.Color('#00fcf0'),
        emissiveIntensity: 0.8
      }),
      lantern: new THREE.MeshStandardMaterial({
        map: lanternTex.map,
        emissiveMap: lanternTex.emissiveMap,
        emissive: new THREE.Color('#00ffff'),
        emissiveIntensity: 4.0
      })
    };
  }, []);

  const { fMat, bMat, sMat, lMat } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const fMat = [];
    const bMat = [];
    const sMat = [];
    const lMat = [];

    const addBlock = (arr, x, y, z, scaleY = 1) => {
      dummy.position.set(x, y, z);
      dummy.scale.set(1, scaleY, 1);
      dummy.updateMatrix();
      arr.push(dummy.matrix.clone());
    };

    // 1. FLOOR & PATHWAY
    for (let z = 15; z > -150; z--) {
      for (let x = -30; x <= 30; x++) {
        const dist = Math.sqrt(x * x);

        // Central pathway (X: -4 to 4)
        if (dist <= 4) {
          // pathway is slightly raised and mostly deepslate tiles
          if (Math.random() > 0.05) addBlock(fMat, x, 0, z);
          // Sculk organically creeping into path
          if (Math.random() < 0.1) addBlock(sMat, x, 0.05, z);
        } else {
          // Surrounding ruins floor
          if (Math.random() > 0.3) {
            addBlock(fMat, x, -0.5, z);
          }
          // Sculk patches covering ruins
          if (Math.random() < (15 - dist) * 0.03) {
            addBlock(sMat, x, -0.45, z);
          }
        }
      }
    }

    // 2. MASSIVE RUINS (Left and Right)
    for (let z = 15; z > -150; z -= 12) {
      // Left Ruins
      const leftX = -8 - Math.random() * 5;
      const leftHeight = 8 + Math.random() * 12;
      for (let y = 0; y < leftHeight; y++) {
        [0, 1, 2].forEach(dx => {
          [0, 1, 2].forEach(dz => {
            if (Math.random() > 0.2) {
              addBlock(bMat, leftX + dx, y, z + dz);
              // Vastly reduced sculk creeping up walls organically
              if (Math.random() > 0.97 - (y * 0.005)) {
                addBlock(sMat, leftX + dx + 0.05, y, z + dz + 0.05);
              }
            }
          });
        });
      }

      // Right Ruins
      const rightX = 8 + Math.random() * 5;
      const rightHeight = 5 + Math.random() * 10;
      for (let y = 0; y < rightHeight; y++) {
        [0, 1, 2].forEach(dx => {
          [0, 1, 2].forEach(dz => {
            if (Math.random() > 0.2) {
              addBlock(bMat, rightX + dx, y, z + dz);
              // Vastly reduced sculk creeping up right walls too
              if (Math.random() > 0.98 - (y * 0.005)) {
                addBlock(sMat, rightX + dx - 0.05, y, z + dz + 0.05);
              }
            }
          });
        });
      }

      // Soul Lanterns on structures
      if (Math.random() > 0.3) {
        addBlock(lMat, leftX + 3, 2, z + 1, 0.8);
      }
      if (Math.random() > 0.4) {
        addBlock(lMat, rightX - 1, 3, z, 0.8);
      }
    }

    // 3. WARDEN ARENA (Z = -95 to -115)
    for (let x = -10; x <= 10; x++) {
      for (let z = -95; z >= -115; z--) {
        // Centered around Warden Spawn [-2.5, 0, -106.5]
        const spawnDist = Math.sqrt(Math.pow(x + 2.5, 2) + Math.pow(z + 106.5, 2));

        // Massive sculk patch on the floor around the spawn point
        if (spawnDist < 5 && Math.random() < Math.max(0.1, 1 - spawnDist / 5)) {
          addBlock(sMat, x, 0.1, z);
          // Very rare sculk sensor/shrieker mockups
          if (Math.random() > 0.96 && spawnDist > 1.5) {
            addBlock(sMat, x, 0.5, z);
          }
        }

        // Broken arena pillars (keep clear of the center path and spawn point)
        if (spawnDist > 6 && Math.random() > 0.96 && Math.abs(x) > 3) {
          const pHeight = 1 + Math.random() * 4;
          for (let y = 0; y < pHeight; y++) {
            addBlock(bMat, x, y, z);
            if (Math.random() > 0.7) addBlock(sMat, x + 0.05, y, z + 0.05);
          }
        }
      }
    }

    // 4. DISTANT CENTRAL PORTAL
    for (let x = -15; x <= 15; x++) {
      for (let y = 0; y < 20; y++) {
        // Massive rectangular frame
        if (Math.abs(x) > 10 || y > 15) {
          addBlock(bMat, x, y, -125);
          if (Math.random() > 0.8) addBlock(sMat, x, y, -124.9);
          // Add soul lanterns along the inner edge of the portal
          if ((Math.abs(x) === 10 && y < 15 && y % 4 === 0) || (y === 15 && Math.abs(x) < 10 && x % 4 === 0)) {
            addBlock(lMat, x, y - 0.5, -124.5, 0.8);
          }
        }
      }
    }

    return { fMat, bMat, sMat, lMat };
  }, []);

  useLayoutEffect(() => {
    fMat.forEach((mat, i) => floorRef.current.setMatrixAt(i, mat));
    bMat.forEach((mat, i) => brickRef.current.setMatrixAt(i, mat));
    sMat.forEach((mat, i) => sculkRef.current.setMatrixAt(i, mat));
    lMat.forEach((mat, i) => lanternRef.current.setMatrixAt(i, mat));

    floorRef.current.instanceMatrix.needsUpdate = true;
    brickRef.current.instanceMatrix.needsUpdate = true;
    sculkRef.current.instanceMatrix.needsUpdate = true;
    lanternRef.current.instanceMatrix.needsUpdate = true;
  }, [fMat, bMat, sMat, lMat]);

  return (
    <group>
      <instancedMesh ref={floorRef} args={[null, materials.floor, fMat.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      <instancedMesh ref={brickRef} args={[null, materials.brick, bMat.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      <instancedMesh ref={sculkRef} args={[null, materials.sculk, sMat.length]}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      <instancedMesh ref={lanternRef} args={[null, materials.lantern, lMat.length]}>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
      </instancedMesh>

      {/* Point lights for the first few soul lanterns to dynamically illuminate the path */}
      {lMat.slice(0, 10).map((mat, i) => {
        const position = new THREE.Vector3().setFromMatrixPosition(mat);
        return (
          <pointLight
            key={i}
            position={position}
            color="#28d7d1"
            intensity={2}
            distance={15}
            decay={2}
            castShadow
            shadow-bias={-0.001}
          />
        );
      })}
    </group>
  );
};

// ============================================================
// EnvironmentProgression — Darkens the city and deepens fog as you go deeper
// ============================================================
const EnvironmentProgression = () => {
  const fogRef = useRef();
  const ambientRef = useRef();
  
  useFrame(() => {
    const p = scrollProgress.smooth;
    if (fogRef.current) {
      // Deeper means darker: fog pulls in closer
      fogRef.current.far = THREE.MathUtils.lerp(60, 35, p);
      fogRef.current.near = THREE.MathUtils.lerp(15, 3, p);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.15, 0.02, p);
    }
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={['#020406', 15, 60]} />
      <ambientLight ref={ambientRef} intensity={0.15} color="#4fa3a6" />
      <hemisphereLight skyColor="#001111" groundColor="#000000" intensity={0.2} />
    </>
  );
};

// Very sparse, dark cyan dust
const Particles = () => {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = 10 - Math.random() * 150;
    }
    return pos;
  }, []);

  const pointsRef = useRef();
  useFrame((state) => {
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    // Particles get slightly more noticeable deeper in
    pointsRef.current.material.opacity = THREE.MathUtils.lerp(0.3, 0.7, scrollProgress.smooth);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#00fcf0" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

// ============================================================
// CinematicCamera — reads scrollProgress.smooth, moves forward
// ============================================================
const START_Z = 15;
const LEGACY_Z_AT_75 = 15 - 135 * 0.75; // -86.25 (Ensures original sections stay exactly the same up to 0.75)
const FINAL_CAMERA_Z = -100; // The absolute final stop

const CinematicCamera = () => {
  const lightRef = React.useRef();

  useFrame((state) => {
    // Smooth the progress with lerp for cinematic inertia
    scrollProgress.smooth += (scrollProgress.target - scrollProgress.smooth) * 0.08;

    let targetZ;
    const progress = scrollProgress.smooth;
    const aspect = state.viewport.width / state.viewport.height;

    // Dynamically calculate the final camera distance. 
    // Warden is at Z = -106.5. 
    // Bringing camera closer to make Warden 25-35% larger (Distance ~6.0 instead of 8.0).
    const dynamicFinalZ = aspect < 1.2 ? -99.2 : -100.5;

    if (progress <= 0.75) {
      // Create cinematic deceleration "terraces" near portfolio sections
      const centers = [0.05, 0.20, 0.35, 0.52, 0.68];
      let distortion = 0;
      centers.forEach(c => {
        const dist = progress - c;
        // Apply a gentle curve that opposes the linear progress to slow down the camera
        if (Math.abs(dist) < 0.08) {
          distortion -= 0.018 * Math.sin((dist / 0.08) * Math.PI);
        }
      });
      const pacedProgress = progress + distortion;
      targetZ = THREE.MathUtils.lerp(START_Z, -120, pacedProgress);
    } else if (progress <= 0.94) {
      // 0.75 to 0.94: Approach chamber smoothly, decelerating
      const t = (progress - 0.75) / (0.94 - 0.75);
      // cinematic ease-out curve (deceleration)
      const easeOut = 1 - Math.pow(1 - t, 2.5);
      targetZ = THREE.MathUtils.lerp(LEGACY_Z_AT_75, dynamicFinalZ, easeOut);
    } else {
      // 0.94+: Camera is completely stationary!
      targetZ = dynamicFinalZ;
    }

    // Warden anticipation camera shake (micro-vibration)
    let shakeX = 0;
    let shakeY = 0;
    if (progress > 0.81 && progress < 0.86) {
      // Two subtle thumps in the anticipation zone
      if (Math.abs(progress - 0.82) < 0.005 || Math.abs(progress - 0.85) < 0.005) {
        shakeX = (Math.random() - 0.5) * 0.03;
        shakeY = (Math.random() - 0.5) * 0.03;
      }
    }

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.08);
    state.camera.position.y = 1.6 + shakeY; // Minecraft player eye level STRICTLY maintained

    // Look slightly downwards so the massive Warden isn't clipped at the top
    state.camera.rotation.x = -0.08;

    // Shift slightly to keep Warden on the left side of the screen
    // Subtle pointer parallax when stationary
    const parallaxOffset = (progress > 0.94) ? (state.mouse.x * 0.5) : 0;
    const targetX = (state.mouse.x * 0.3 + 0.5) + parallaxOffset;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.02) + shakeX;

    if (lightRef.current) {
      lightRef.current.position.copy(state.camera.position);
    }
  });

  return <pointLight ref={lightRef} color="#00fcf0" intensity={1.5} distance={40} decay={1.5} />;
};

// ============================================================
// SculkEcho Chatbot
// ============================================================
const SculkEcho = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [messages, setMessages] = React.useState([
    { text: "*Vibration detected...* I am the echo of the deep. What do you seek to know about Ujjwal's journey?", sender: 'paimon' }
  ]);
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');

    setTimeout(() => {
      const lower = input.toLowerCase();
      let reply = "The vibrations are unclear. I only know of Ujjwal's React and WebGL projects, his time at previous guilds, and how to transmit a signal to him.";

      if (lower.includes('project') || lower.includes('relics')) {
        reply = "Ujjwal has forged many ancient relics using React, WebGL, and Three.js. You can view them by exploring further into the ruins.";
      } else if (lower.includes('experience') || lower.includes('work') || lower.includes('ibm')) {
        reply = "He has contributed to ancient archives at various guilds, mastering frontend engineering and UI/UX magic.";
      } else if (lower.includes('contact') || lower.includes('email')) {
        reply = "To transmit a signal to Ujjwal, travel to the deepest part of this city (the TRANSMIT section) and send a pulse.";
      } else if (lower.includes('skill') || lower.includes('tech')) {
        reply = "His sculk network consists of JavaScript, React, Three.js, Node.js, and modern web architectures.";
      }

      setMessages(prev => [...prev, { text: reply, sender: 'paimon' }]);
    }, 1000);
  };

  // Only pointer events for the chatbot wrapper itself
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, pointerEvents: 'none' }}>
      {isOpen && (
        <div style={{
          width: '360px', height: '500px', marginBottom: '1rem',
          background: 'rgba(2, 4, 6, 0.9)', border: '1px solid var(--sculk-blue)',
          borderRadius: '8px', display: 'flex', flexDirection: 'column', pointerEvents: 'auto',
          boxShadow: '0 0 20px rgba(0, 252, 240, 0.1)', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', background: 'rgba(0, 252, 240, 0.1)', borderBottom: '1px solid var(--sculk-blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--sculk-cyan)', fontFamily: 'Cinzel, serif', letterSpacing: '2px' }}>SCULK ECHO</span>
            <button onClick={() => setIsOpen(false)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.sender === 'user' ? 'rgba(0, 252, 240, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: msg.sender === 'user' ? '#fff' : '#c0cdd1',
                padding: '0.75rem 1rem', borderRadius: '4px', maxWidth: '80%', fontSize: '14px', lineHeight: '1.5',
                borderLeft: msg.sender === 'paimon' ? '2px solid var(--sculk-cyan)' : 'none',
                borderRight: msg.sender === 'user' ? '2px solid var(--sculk-blue)' : 'none'
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(0,252,240,0.2)', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Send a vibration..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,252,240,0.3)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', outline: 'none' }}
            />
            <button onClick={handleSend} style={{ background: 'rgba(0,252,240,0.1)', border: '1px solid var(--sculk-cyan)', color: 'var(--sculk-cyan)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>→</button>
          </div>
        </div>
      )}

      {/* Launcher */}
      <div
        style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{
          position: 'absolute',
          right: 'calc(100% + 12px)',
          border: '1px solid var(--sculk-cyan)',
          padding: '10px 16px',
          background: 'rgba(2, 4, 6, 0.95)',
          color: 'var(--sculk-cyan)',
          fontSize: '13px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontFamily: 'Nunito, sans-serif',
          boxShadow: '0 0 10px rgba(0, 252, 240, 0.1)',
          textAlign: 'left',
          lineHeight: '1.6',
          opacity: (!isOpen && isHovered) ? 1 : 0,
          transform: (!isOpen && isHovered) ? 'translateX(0) scale(1)' : 'translateX(10px) scale(0.95)',
          visibility: (!isOpen && isHovered) ? 'visible' : 'hidden',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformOrigin: 'right center'
        }}>
          Sculk Sensor<br />(Click to Transmit!)
        </div>
        <button
          className="chatbot-launcher"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%', background: '#000',
            color: 'var(--sculk-cyan)', fontSize: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto',
            transition: 'all 0.3s ease', overflow: 'hidden', padding: 0
          }}
        >
          <video src="/mini-warden.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      </div>
    </div>
  );
};

// Removed getActiveSection since we use continuous interpolation now

// ============================================================
// PortfolioOverlay — pure DOM, reads scrollProgress via rAF
// ============================================================
const PortfolioOverlay = () => {
  const [progress, setProgress] = React.useState(0);
  const [transmitReveal, setTransmitReveal] = React.useState(0);
  const [formFeedback, setFormFeedback] = React.useState({ state: 'idle', message: '' });

  React.useEffect(() => {
    let raf;
    let currentReveal = 0;

    const loop = () => {
      const p = scrollProgress.smooth;
      setProgress(p);

      // Reset skip cinematic if user scrolls back significantly
      if (p < 0.90) {
        globalFlags.skipWardenCinematic = false;
      }

      const isComplete = p >= 0.94 || globalFlags.skipWardenCinematic;

      if (isComplete) {
        if (globalFlags.skipWardenCinematic) {
          currentReveal = 1; // Instant reveal on direct navigation
        } else {
          // Short pause (takes ~1.5s to reach 0), then fast fade in (~800ms to reach 1)
          currentReveal += 0.02;
          if (currentReveal > 1) currentReveal = 1;
        }
      } else {
        // Hide quickly if scrolled backwards
        currentReveal -= 0.1;
        // Floor it at -1.8 so it always waits exactly 1.5 seconds before fading in again (1.8 / 0.02 = 90 frames)
        if (currentReveal < -1.8) currentReveal = -1.8;
      }

      setTransmitReveal(currentReveal);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);



  const basePanelStyle = {
    background: 'rgba(2, 8, 10, 0.72)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 220, 210, 0.15)',
    boxShadow: 'inset 0 0 20px rgba(0, 220, 210, 0.05), 0 20px 60px rgba(0, 0, 0, 0.25)',
    borderRadius: '8px',
    padding: '32px 36px',
    pointerEvents: 'auto'
  };

  const transmitPanelStyle = {
    ...basePanelStyle,
    background: 'rgba(2, 9, 11, 0.78)',
    border: '1px solid rgba(0, 220, 210, 0.18)',
    padding: '36px 40px 34px'
  };

  // Continuous opacity and subtle translation based on camera proximity
  const sectionStyle = (name, align = 'left') => {
    // Custom transmit reveal logic tied directly to Warden completion
    if (name === 'contact') {
      return {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 10vw 0 50vw', textAlign: 'right',
        opacity: transmitReveal,
        transform: `translateY(${16 * (1 - transmitReveal)}px)`,
        pointerEvents: transmitReveal > 0.5 ? 'auto' : 'none',
        visibility: transmitReveal > 0.01 ? 'visible' : 'hidden'
      };
    }

    let center, radius;
    switch(name) {
      case 'hero': center = 0.02; radius = 0.13; break;
      case 'about': center = 0.20; radius = 0.10; break;
      case 'experience': center = 0.35; radius = 0.11; break;
      case 'skills': center = 0.52; radius = 0.10; break;
      case 'projects': center = 0.68; radius = 0.10; break;
      default: center = 0; radius = 0;
    }

    const dist = Math.abs(progress - center);
    let opacity = 0;
    let translateY = 10;
    
    if (dist < radius) {
      const normalized = dist / radius; // 0 (center) to 1 (edge)
      opacity = 1 - Math.pow(normalized, 2.5); // Stays at 1 longer, drops off smoothly
      
      // Depth movement: if arriving (progress < center), move up from 10px. If leaving, move down to -10px.
      translateY = (progress - center) > 0 ? (normalized * -10) : (normalized * 10);
    }

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: align === 'right' ? '0 10vw 0 50vw' : align === 'center' ? '0 15vw' : '0 50vw 0 10vw',
      textAlign: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
      opacity,
      transform: `translateY(${translateY}px)`,
      pointerEvents: opacity > 0.5 ? 'auto' : 'none',
      visibility: opacity > 0.01 ? 'visible' : 'hidden',
      transition: 'opacity 0.1s linear, transform 0.1s linear'
    };
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10 }}>

      {/* HERO — 0 to 14% */}
      <div style={sectionStyle('hero', 'left')}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '60vw', height: '100vh', background: 'linear-gradient(to right, rgba(2,4,6,0.85) 0%, rgba(2,4,6,0) 100%)', zIndex: -1 }}></div>
        <h1 className="hero-title">{portfolioData.hero.title}</h1>
        <h2 className="hero-subtitle">{portfolioData.hero.subtitle}</h2>
        <p className="hero-desc">{portfolioData.hero.desc}</p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--sculk-blue)', letterSpacing: '2px', fontSize: '12px' }}>SCROLL TO EXPLORE ↓</span>
          <a href={portfolioData.hero.resumeUrl} target="_blank" rel="noreferrer" className="cinematic-link" style={{ letterSpacing: '2px', fontSize: '12px', pointerEvents: 'auto' }}>DOWNLOAD RESUME</a>
        </div>
      </div>

      {/* ABOUT — 14 to 28% */}
      <div style={sectionStyle('about', 'right')}>
        <div style={{ ...basePanelStyle, maxWidth: '600px', marginLeft: 'auto', textAlign: 'left' }}>
          <h2 className="section-label">01 / ABOUT</h2>
          <h3 style={{ fontSize: '32px', color: '#fff', fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>{portfolioData.about.title}</h3>
          <p className="hero-desc" style={{ fontSize: '16px', lineHeight: '1.6' }}>{portfolioData.about.desc}</p>
        </div>
      </div>

      {/* EXPERIENCE — 28 to 45% */}
      <div style={sectionStyle('experience', 'left')}>
        <div style={{ ...basePanelStyle, maxWidth: '700px' }}>
          <h2 className="section-label">02 / ANCIENT ARCHIVES</h2>
          {portfolioData.experience.map((exp, i) => (
            <div key={i} style={{ marginTop: i > 0 ? '2rem' : '1rem' }}>
              <h3 style={{ fontSize: '24px', color: '#fff', fontFamily: 'Cinzel, serif', textTransform: 'uppercase' }}>{exp.title}</h3>
              <p style={{ color: 'var(--sculk-cyan)', letterSpacing: '2px', fontSize: '14px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{exp.company}</p>
              <p style={{ color: 'var(--sculk-blue)', fontSize: '12px', letterSpacing: '1px' }}>{exp.date}</p>
              <p style={{ marginTop: '0.5rem', color: '#c0cdd1', fontSize: '15px', lineHeight: '1.7' }}>{exp.desc}</p>
              <p style={{ marginTop: '0.5rem', color: 'var(--sculk-cyan)', fontSize: '12px', letterSpacing: '2px' }}>{exp.tech}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SKILLS — 45 to 60% */}
      <div style={sectionStyle('skills', 'center')}>
        <div style={{ ...basePanelStyle, maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-label">03 / SCULK NETWORK</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            {portfolioData.skills.map((skill, i) => (
              <span key={i} style={{ padding: '0.4rem 1rem', color: '#fff', letterSpacing: '2px', fontSize: '16px', textShadow: '0 0 10px var(--sculk-cyan)', border: '1px solid rgba(0,252,240,0.2)', borderRadius: '2px' }}>{skill}</span>
            ))}
          </div>
        </div>
      </div>

      {/* PROJECTS — 60 to 77% */}
      <div style={sectionStyle('projects', 'center')}>
        <h2 className="section-label" style={{ marginBottom: '2rem' }}>04 / ANCIENT RELICS</h2>
        {portfolioData.projects.map((proj, i) => (
          <div key={i} style={{ ...basePanelStyle, marginTop: i > 0 ? '2.5rem' : '0', textAlign: 'left', maxWidth: '600px', alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
            <h3 style={{ fontSize: '28px', color: '#fff', fontFamily: 'Cinzel, serif', textTransform: 'uppercase' }}>{proj.title}</h3>
            <p style={{ margin: '0.5rem 0', color: '#c0cdd1', fontSize: '15px', lineHeight: '1.7' }}>{proj.desc}</p>
            <p style={{ fontSize: '12px', color: 'var(--sculk-cyan)', letterSpacing: '2px', marginBottom: '1rem' }}>{proj.tech}</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href={proj.link} className="cinematic-link" style={{ fontSize: '13px', letterSpacing: '1px' }}>VIEW PROJECT →</a>
              <a href={proj.source} className="cinematic-link" style={{ fontSize: '13px', letterSpacing: '1px' }}>VIEW SOURCE →</a>
            </div>
          </div>
        ))}
      </div>

      {/* CONTACT — 92 to 100% */}
      <div style={sectionStyle('contact', 'right')}>
        <div style={{ ...transmitPanelStyle, width: 'min(540px, calc(100vw - 48px))', marginLeft: 'auto', textAlign: 'left' }}>
          <h2 className="section-label">05 / TRANSMIT</h2>
          <h3 style={{ fontSize: 'clamp(44px, 3.2vw, 58px)', color: '#fff', fontFamily: 'Cinzel, serif', lineHeight: '1.0', marginBottom: '2rem' }}>LET'S BUILD<br />SOMETHING.</h3>

          {/* Compact Contact Form */}
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginBottom: '2.5rem' }}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const name = form.elements['name']?.value?.trim() || '';
              const email = form.elements['email']?.value?.trim() || '';
              const message = form.elements['message']?.value?.trim() || '';
              const recipientEmail = portfolioData.contact.email;

              setFormFeedback({ state: 'submitting', message: '' });

              if (!recipientEmail || recipientEmail === 'isagi@example.com') {
                setFormFeedback({
                  state: 'notice',
                  message: 'Please update your receiving email address in src/portfolioData.js so FormSubmit can deliver to your inbox.'
                });
                setTimeout(() => {
                  setFormFeedback({ state: 'idle', message: '' });
                }, 7000);
                return;
              }

              try {
                const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    _subject: `New Transmission from ${name} [Portfolio]`,
                    _replyto: email,
                    _captcha: 'false',
                    _template: 'table'
                  })
                });

                const data = await res.json();
                const isSuccess = data.success === 'true' || data.success === true || res.ok;
                if (isSuccess) {
                  setFormFeedback({
                    state: 'success',
                    message: data.message || 'SIGNAL TRANSMITTED! Delivered directly to your inbox.'
                  });
                  form.reset();
                } else {
                  setFormFeedback({
                    state: 'error',
                    message: data.message || 'Signal transmission failed. Please try again.'
                  });
                }
              } catch (err) {
                console.error('Submission error:', err);
                setFormFeedback({
                  state: 'error',
                  message: 'Network error encountered. Please check your connection and try again.'
                });
              } finally {
                setTimeout(() => {
                  setFormFeedback(prev => prev.state === 'submitting' ? { state: 'idle', message: '' } : prev);
                }, 6000);
              }
            }}
          >
            <input
              name="name"
              required
              type="text"
              placeholder="NAME"
              style={{
                background: 'rgba(0,0,0,0.28)',
                border: '1px solid rgba(0,252,240,0.2)',
                padding: '16px',
                fontSize: '15px',
                color: '#fff',
                borderRadius: '2px',
                outline: 'none',
                height: '56px',
                boxSizing: 'border-box'
              }}
            />
            <input
              name="email"
              required
              type="email"
              placeholder="EMAIL"
              style={{
                background: 'rgba(0,0,0,0.28)',
                border: '1px solid rgba(0,252,240,0.2)',
                padding: '16px',
                fontSize: '15px',
                color: '#fff',
                borderRadius: '2px',
                outline: 'none',
                height: '56px',
                boxSizing: 'border-box'
              }}
            />
            <textarea
              name="message"
              required
              placeholder="MESSAGE"
              style={{
                background: 'rgba(0,0,0,0.28)',
                border: '1px solid rgba(0,252,240,0.2)',
                padding: '16px',
                fontSize: '15px',
                color: '#fff',
                borderRadius: '2px',
                outline: 'none',
                resize: 'none',
                height: '145px',
                boxSizing: 'border-box'
              }}
            ></textarea>
            <button
              type="submit"
              disabled={formFeedback.state === 'submitting'}
              style={{
                background: formFeedback.state === 'success' ? 'rgba(0,255,136,0.1)' : 'transparent',
                border: `1px solid ${
                  formFeedback.state === 'success'
                    ? '#00ff88'
                    : formFeedback.state === 'error'
                    ? '#ff4b4b'
                    : 'var(--sculk-cyan)'
                }`,
                color:
                  formFeedback.state === 'success'
                    ? '#00ff88'
                    : formFeedback.state === 'error'
                    ? '#ff4b4b'
                    : 'var(--sculk-cyan)',
                padding: '0',
                height: '56px',
                letterSpacing: '2px',
                fontSize: '15px',
                cursor: formFeedback.state === 'submitting' ? 'wait' : 'pointer',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            >
              {formFeedback.state === 'submitting'
                ? 'TRANSMITTING...'
                : formFeedback.state === 'success'
                ? 'SIGNAL TRANSMITTED ✓'
                : formFeedback.state === 'error'
                ? 'TRANSMISSION FAILED ✕'
                : 'SEND SIGNAL →'}
            </button>
            {formFeedback.message && (
              <p
                style={{
                  margin: '0',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color:
                    formFeedback.state === 'success'
                      ? '#00ff88'
                      : formFeedback.state === 'error'
                      ? '#ff4b4b'
                      : '#00e5ff',
                  letterSpacing: '0.5px'
                }}
              >
                {formFeedback.message}
              </p>
            )}
          </form>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-start' }}>
            <a href={`mailto:${portfolioData.contact.email}`} className="cinematic-link" style={{ fontSize: '14px', letterSpacing: '2px' }}>EMAIL</a>
            <a href={portfolioData.contact.github} className="cinematic-link" style={{ fontSize: '14px', letterSpacing: '2px' }}>GITHUB</a>
            <a href={portfolioData.contact.linkedin} className="cinematic-link" style={{ fontSize: '14px', letterSpacing: '2px' }}>LINKEDIN</a>
          </div>
        </div>
      </div>

      <SculkEcho />
    </div>
  );
};

// ============================================================
// Main Export — native scroll, no drei ScrollControls
// ============================================================
export default function AncientCityJourney() {
  // Listen to native window scroll
  React.useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      scrollProgress.target = progress;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initialize
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Scroll driver — creates 800vh of native scroll distance */}
      <div className="scroll-driver" style={{ height: '800vh', width: '100%', position: 'relative', zIndex: -1 }} />

      {/* 3D Canvas layer — fixed viewport */}
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, background: '#020406' }}>
        <Canvas shadows camera={{ position: [0, 1.6, 15], fov: 65 }} gl={{ antialias: false, powerPreference: "high-performance", localClippingEnabled: true }}>

          {/* Dynamic Environment Progression handles fog and ambient lighting */}
          <EnvironmentProgression />

          <React.Suspense fallback={null}>

            <CinematicCamera />

            {/* The 3D environment is FIXED in world space */}
            <AncientCityGeometry />
            <Particles />

            {/* Warden Encounter at Z = -106.5, Middle-Left */}
            <group position={[-2.5, 0, -106.5]}>
              <WardenEncounter />
            </group>

            {/* Post Processing for Shader Quality */}
            <EffectComposer disableNormalPass>
              <N8AO aoRadius={2.0} intensity={3.0} />
              <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
            </EffectComposer>
          </React.Suspense>
        </Canvas>
      </div>

      {/* Portfolio HTML overlay — COMPLETELY outside Canvas */}
      <PortfolioOverlay />
    </>
  );
}