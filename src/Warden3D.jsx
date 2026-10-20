import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { Textures } from './TextureGenerator';

// --- Instanced Particles System (GPU Efficient) ---
export const SculkParticles = ({ count = 60 }) => {
  const meshRef = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        t: Math.random() * 100,
        factor: 0.5 + Math.random(),
        speed: 0.1 + Math.random() * 0.3,
        xFactor: -0.6 + Math.random() * 1.2,
        yFactor: -1 + Math.random() * 2,
        zFactor: 0.4 + Math.random() * 0.4,
      });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed * 0.015;
      
      const x = Math.cos(t) * xFactor;
      const y = Math.sin(t) * 0.5 + (t % 5) - 2.5; 
      const z = Math.sin(t) * zFactor + 0.8; 
      
      dummy.position.set(x, y, z);
      const scale = (Math.sin(t * factor * 2) + 1.2) * 0.03;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} position={[0, 0, 0]}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#00A89A" emissive="#00fcf0" emissiveIntensity={0.8} toneMapped={false} />
    </instancedMesh>
  );
};

// --- Helper for Horns ---
const WardenHorn = ({ side, clippingPlane }) => {
  const s = side; // 1 or -1
  const rootRef = useRef();
  const reactionRef = useRef(0);
  const matsRef = useRef({});
  const particlesRef = useRef();

  const { baseMat, midMat, tipMat } = useMemo(() => {
    const planes = clippingPlane ? [clippingPlane] : [];
    return {
      baseMat: new THREE.MeshStandardMaterial({ color: '#07545a', emissive: '#0db7bb', emissiveIntensity: 0.1, roughness: 0.7, toneMapped: false, clippingPlanes: planes }),
      midMat: new THREE.MeshStandardMaterial({ color: '#07545a', emissive: '#0db7bb', emissiveIntensity: 0.05, roughness: 0.7, toneMapped: false, clippingPlanes: planes }),
      tipMat: new THREE.MeshStandardMaterial({ color: '#07545a', emissive: '#0db7bb', emissiveIntensity: 0.02, roughness: 0.7, toneMapped: false, clippingPlanes: planes }),
    };
  }, [clippingPlane]);

  React.useEffect(() => {
    matsRef.current = { baseMat, midMat, tipMat };
  }, [baseMat, midMat, tipMat]);

  React.useEffect(() => {
    const handleSensor = () => {
      // Small offset for right horn to not trigger perfectly synchronously
      const delay = s === 1 ? 50 + Math.random() * 40 : Math.random() * 20;
      setTimeout(() => {
        reactionRef.current = 1.0;
      }, delay);
    };
    window.addEventListener('WARDEN_SENSOR', handleSensor);
    return () => window.removeEventListener('WARDEN_SENSOR', handleSensor);
  }, [s]);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Idle organic movement
    const idleRotX = Math.sin(time * 0.5 + s) * 0.02;
    const idleRotZ = Math.cos(time * 0.4 - s) * 0.03;
    
    // Reaction decay
    if (reactionRef.current > 0) {
      reactionRef.current -= delta * 1.5; // decays over ~660ms
      if (reactionRef.current < 0) reactionRef.current = 0;
    }
    
    const r = reactionRef.current;
    
    // Physical twitch during reaction
    const twitchX = Math.sin(r * Math.PI * 8) * 0.05 * r;
    const twitchZ = Math.cos(r * Math.PI * 6) * 0.08 * r * s;
    
    rootRef.current.rotation.x = idleRotX + twitchX;
    rootRef.current.rotation.z = idleRotZ + twitchZ;
    
    // Emissive wave
    if (matsRef.current.baseMat) {
      const baseWave = THREE.MathUtils.clamp(r * 2.0 - 1.0, 0, 1);
      matsRef.current.baseMat.emissiveIntensity = 0.1 + baseWave * 1.5;
      
      const midWave = THREE.MathUtils.clamp(r * 2.0 - 0.5, 0, 1) * Math.sin(r * Math.PI);
      matsRef.current.midMat.emissiveIntensity = 0.05 + midWave * 1.8;
      
      const tipWave = THREE.MathUtils.clamp(r * 2.5, 0, 1) * Math.pow(Math.sin(r * Math.PI), 2);
      matsRef.current.tipMat.emissiveIntensity = 0.02 + tipWave * 2.5;
    }
    
    // Particles (tiny drifting boxes)
    if (particlesRef.current) {
      particlesRef.current.children.forEach((p, i) => {
        if (r > 0.8) {
          // Burst outward
          if (p.userData.active === false) {
             p.userData.active = true;
             p.position.set(s * 1.3, 0.9, 0); // start at tip
             p.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.05, Math.random() * 0.05, (Math.random() - 0.5) * 0.05);
             p.visible = true;
          }
          p.position.add(p.userData.vel);
          p.scale.setScalar(Math.max(0, (r - 0.8) * 5)); // scales up then down quickly
        } else {
          p.userData.active = false;
          p.visible = false;
        }
      });
    }
  });

  return (
    <group ref={rootRef} position={[s * 1.5, 0.5, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]} material={baseMat}><boxGeometry args={[0.5, 0.4, 0.4]}/></mesh>
      <mesh position={[s * 0.4, 0.2, 0]} material={baseMat}><boxGeometry args={[0.4, 0.4, 0.4]}/></mesh>
      
      {/* Main outward branch (Mid) */}
      <mesh position={[s * 0.7, 0.4, 0]} material={midMat}><boxGeometry args={[0.3, 0.5, 0.3]}/></mesh>
      <mesh position={[s * 0.9, 0.7, 0]} material={midMat}><boxGeometry args={[0.3, 0.5, 0.25]}/></mesh>
      
      {/* Tip */}
      <mesh position={[s * 1.1, 1.0, 0]} material={tipMat}><boxGeometry args={[0.2, 0.4, 0.2]}/></mesh>
      
      {/* Far outer branch (Mid -> Tip) */}
      <mesh position={[s * 1.0, 0.3, 0]} material={midMat}><boxGeometry args={[0.4, 0.3, 0.3]}/></mesh>
      <mesh position={[s * 1.3, 0.5, 0]} material={midMat}><boxGeometry args={[0.3, 0.4, 0.25]}/></mesh>
      <mesh position={[s * 1.5, 0.7, 0]} material={tipMat}><boxGeometry args={[0.2, 0.3, 0.2]}/></mesh>
      
      {/* Inner forward branch */}
      <mesh position={[s * 0.7, 0.6, 0.2]} material={midMat}><boxGeometry args={[0.2, 0.3, 0.4]}/></mesh>
      
      {/* Particles Group */}
      <group ref={particlesRef}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} userData={{ active: false, vel: new THREE.Vector3() }} visible={false} material={tipMat}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// --- Warden Body Hierarchy & Rig ---
export const WardenBody = ({ clippingPlane }) => {
  const torsoRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  
  const chestCoreRootRef = useRef();
  const heartLightRef = useRef();
  const sensorSpawnTriggered = useRef(false);

  // Materials
  const { darkMat, sculkMat, boneMat, upperArmMat, midArmMat, hornMat, coreGlowMat, coreGlowDimMat, coreSculkMat, coreGlowBrightMat } = useMemo(() => {
    const planes = clippingPlane ? [clippingPlane] : [];
    return {
      darkMat: new THREE.MeshStandardMaterial({ map: Textures.WardenBody, roughness: 0.9, clippingPlanes: planes }),
      sculkMat: new THREE.MeshStandardMaterial({ map: Textures.WardenSculk.map, emissiveMap: Textures.WardenSculk.emissiveMap, emissive: '#00fcf0', emissiveIntensity: 0.5, roughness: 0.8, clippingPlanes: planes }),
      boneMat: new THREE.MeshStandardMaterial({ map: Textures.WardenBone, roughness: 1.0, clippingPlanes: planes }),
      upperArmMat: new THREE.MeshStandardMaterial({ map: Textures.WardenArmUpper, roughness: 0.9, clippingPlanes: planes }),
      midArmMat: new THREE.MeshStandardMaterial({ map: Textures.WardenArmMid, roughness: 0.9, clippingPlanes: planes }),
      hornMat: new THREE.MeshStandardMaterial({ color: '#062d2e', emissive: '#0b9697', emissiveIntensity: 0.4, roughness: 0.7, toneMapped: false, clippingPlanes: planes }),
      coreGlowMat: new THREE.MeshStandardMaterial({ color: '#16c7c7', emissive: '#14cfd0', emissiveIntensity: 0.5, roughness: 0.8, toneMapped: false, clippingPlanes: planes }),
      coreGlowDimMat: new THREE.MeshStandardMaterial({ color: '#13b8b8', emissive: '#0db7bb', emissiveIntensity: 0.4, roughness: 0.8, toneMapped: false, clippingPlanes: planes }),
      coreSculkMat: new THREE.MeshStandardMaterial({ color: '#07545a', emissive: '#08747a', emissiveIntensity: 0.1, roughness: 1.0, clippingPlanes: planes }),
      coreGlowBrightMat: new THREE.MeshStandardMaterial({ color: '#47e7df', emissive: '#47e7df', emissiveIntensity: 0.8, roughness: 0.8, toneMapped: false, clippingPlanes: planes })
    };
  }, [clippingPlane]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const globalProgress = scrollProgress.smooth;
    const isSpawned = globalProgress >= 0.945 || globalFlags.skipWardenCinematic;
    
    let targetX = isSpawned ? (state.mouse.y * Math.PI) / 8 + 0.1 : Math.PI / 8;
    let targetY = isSpawned ? (state.mouse.x * Math.PI) / 6 + 0.3 : 0;
    
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.05);
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.05);

    // Slow breathing curve (4.5s cycle)
    const breathCycle = 4.5;
    const tBreath = time % breathCycle;
    const breath = Math.sin((tBreath / breathCycle) * Math.PI * 2 - Math.PI/2);
    
    // Heartbeat Double Pulse (3.4s cycle)
    const heartCycle = 3.4;
    const tHeart = time % heartCycle;
    
    // Torso Base Y is 5.5
    torsoRef.current.scale.y = 1 + breath * 0.008;
    torsoRef.current.scale.x = 1 + breath * 0.004;
    torsoRef.current.position.y = 5.5 + breath * 0.02;
    
    leftArmRef.current.rotation.z = Math.sin(time * 0.8) * 0.015 + 0.08;
    rightArmRef.current.rotation.z = Math.sin(time * 0.8 + Math.PI) * 0.015 - 0.08;
    leftArmRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
    rightArmRef.current.rotation.x = Math.cos(time * 0.5) * 0.02;

    let pulse = 0;
    // Fade in heartbeat as Warden emerges above sculk
    const heartbeatReveal = THREE.MathUtils.clamp((globalProgress - 0.85) / 0.1, 0, 1);
    // Sensor Loop: trigger every ~3.2 seconds when spawned
    const sensorCycle = 3.2;
    const tSensor = time % sensorCycle;

    if (heartbeatReveal > 0.99) {
      if (tSensor < 0.1 && !sensorSpawnTriggered.current) {
        sensorSpawnTriggered.current = true;
        window.dispatchEvent(new Event('WARDEN_SENSOR'));
      } else if (tSensor >= 0.1) {
        sensorSpawnTriggered.current = false;
      }
    }
    
    if (heartbeatReveal > 0) {
      if (tHeart > 0.25 && tHeart < 0.58) {
        // First pulse (0.33s duration)
        const p = (tHeart - 0.25) / 0.33;
        pulse = Math.sin(p * Math.PI) * 0.7; // First beat (moderate)
      } else if (tHeart > 0.72 && tHeart < 1.15) {
        // Second pulse (0.43s duration)
        const p = (tHeart - 0.72) / 0.43;
        pulse = Math.sin(p * Math.PI) * 1.0; // Second beat (stronger)
      }
    }
    
    pulse *= heartbeatReveal;

    // Breath expansion from 0 to 1
    const breathExpand = (breath + 1) * 0.5; 

    // Combine slow breathing light with heartbeat pulse
    const baseIntensity = 0.45 + breathExpand * 0.25; // 0.45 to 0.70 breathing
    const coreEmissive = baseIntensity + pulse * 0.45; // peak ~1.15
    const lightIntensity = baseIntensity * 0.8 + pulse * 1.5;

    coreGlowMat.emissiveIntensity = coreEmissive;
    coreGlowDimMat.emissiveIntensity = coreEmissive * 0.7;
    coreGlowBrightMat.emissiveIntensity = coreEmissive * 1.5;
    if (heartLightRef.current) heartLightRef.current.intensity = lightIntensity;

    // Subtle physical expansion
    if (chestCoreRootRef.current) {
      chestCoreRootRef.current.scale.x = 1.00 + breathExpand * 0.015;
      chestCoreRootRef.current.scale.y = 1.00 + breathExpand * 0.01;
      chestCoreRootRef.current.scale.z = 1.00 + breathExpand * 0.02;
    }
  });

  // --- STRICT MATHEMATICAL PROPORTIONS ---
  // Rebuilt from the ground up as per instructions. FOOT BOTTOM = 0.
  const FOOT_H = 0.6;
  const LEG_H = 2.2;
  const LOWER_TORSO_H = 1.0;
  const TORSO_H = 3.8;
  const HEAD_H = 1.8;
  
  // Widths
  const FOOT_W = 1.4;
  const LEG_W = 1.2;
  const TORSO_W = 3.6;
  const HEAD_W = 2.8;
  const ARM_W = 1.4;
  
  // Y Centers
  const FOOT_Y = FOOT_H / 2;
  const LEG_Y = FOOT_H + LEG_H / 2;
  const LOWER_TORSO_Y = FOOT_H + LEG_H + LOWER_TORSO_H / 2;
  const TORSO_Y = FOOT_H + LEG_H + LOWER_TORSO_H + TORSO_H / 2;
  const SHOULDER_Y = FOOT_H + LEG_H + LOWER_TORSO_H + TORSO_H - 0.6;
  const ARM_ROOT_Y = SHOULDER_Y;
  const HEAD_Y = FOOT_H + LEG_H + LOWER_TORSO_H + TORSO_H + HEAD_H / 2 - 0.2; // Slight overlap

  return (
    <group>
      {/* Cinematic Rim Light to outline body silhouette against dark background */}
      <pointLight position={[-5, 6, -5]} color="#00fcf0" intensity={1.5} distance={25} decay={1.5} />
      
      {/* HEAD ROOT */}
      <group ref={headRef} position={[0, HEAD_Y, 0.2]}>
        <mesh material={darkMat}><boxGeometry args={[HEAD_W, HEAD_H, 2.0]} /></mesh>
        {/* Face Cavity */}
        <group position={[0, -0.1, 1.01]}>
          <mesh position={[0, 0.3, 0]} material={sculkMat}><boxGeometry args={[1.8, 0.2, 0.2]} /></mesh>
          <mesh position={[-0.8, -0.15, 0]} material={sculkMat}><boxGeometry args={[0.2, 0.7, 0.2]} /></mesh>
          <mesh position={[0.8, -0.15, 0]} material={sculkMat}><boxGeometry args={[0.2, 0.7, 0.2]} /></mesh>
          <mesh position={[0, -0.6, 0]} material={sculkMat}><boxGeometry args={[1.8, 0.2, 0.2]} /></mesh>
          <mesh position={[0, -0.15, -0.1]}><boxGeometry args={[1.4, 0.7, 0.1]} /><meshStandardMaterial color="#000000" roughness={1} /></mesh>
          <mesh position={[0, -0.4, -0.05]}><boxGeometry args={[1.0, 0.1, 0.1]} /><meshStandardMaterial color="#003b38" emissive="#00A89A" emissiveIntensity={0.2} /></mesh>
        </group>
        <WardenHorn side={-1} clippingPlane={clippingPlane} />
        <WardenHorn side={1} clippingPlane={clippingPlane} />
      </group>

      {/* TORSO ROOT */}
      <group ref={torsoRef} position={[0, TORSO_Y, 0]}>
        {/* Main Torso Mass - Shifted slightly back to create a physical cavity for the heart */}
        <mesh position={[0, 0, -0.4]} material={darkMat}>
          <boxGeometry args={[TORSO_W, TORSO_H, 1.4]} />
        </mesh>
        
        {/* Shoulders */}
        <mesh position={[-2.3, 1.3, -0.2]} material={darkMat}><boxGeometry args={[1.0, 1.2, 1.8]} /></mesh>
        <mesh position={[2.3, 1.3, -0.2]} material={darkMat}><boxGeometry args={[1.0, 1.2, 1.8]} /></mesh>

        {/* Rib Cage */}
        <group position={[0, 0.2, 0.7]}>
          {[1.2, 0.4, -0.4, -1.2].map((y, i) => (
            <group key={i} position={[0, y, 0]}>
              <mesh position={[-0.9, 0, 0]} material={boneMat}><boxGeometry args={[1.2, 0.5, 0.5]} /></mesh>
              <mesh position={[0.9, 0, 0]} material={boneMat}><boxGeometry args={[1.2, 0.5, 0.5]} /></mesh>
            </group>
          ))}
        </group>

        {/* Chest Cavity / Core */}
        <group position={[0, 0.2, 0.3]}>
          {/* Dark inner cavity wall */}
          <mesh position={[0, 0, -0.1]}><boxGeometry args={[2.0, 3.0, 0.2]} /><meshStandardMaterial color="#010304" roughness={1} clippingPlanes={clippingPlane ? [clippingPlane] : []} /></mesh>
          
          {/* ChestCoreRoot - Animated for breathing */}
          <group ref={chestCoreRootRef} position={[0, 0, 0.1]}>
            {/* Center column */}
            <mesh position={[0, 0, 0]} material={coreGlowBrightMat}><boxGeometry args={[0.2, 1.6, 0.2]} /></mesh>
            
            {/* Left inner fragments */}
            <mesh position={[-0.2, 0.2, 0]} material={coreGlowMat}><boxGeometry args={[0.2, 1.0, 0.2]} /></mesh>
            <mesh position={[-0.2, -0.5, 0]} material={coreGlowDimMat}><boxGeometry args={[0.2, 0.4, 0.2]} /></mesh>
            
            {/* Right inner fragments */}
            <mesh position={[0.2, -0.1, 0]} material={coreGlowMat}><boxGeometry args={[0.2, 1.2, 0.2]} /></mesh>
            <mesh position={[0.2, 0.7, 0]} material={coreGlowDimMat}><boxGeometry args={[0.2, 0.2, 0.2]} /></mesh>
            
            {/* Left outer fragments */}
            <mesh position={[-0.4, -0.1, 0]} material={coreGlowDimMat}><boxGeometry args={[0.2, 0.6, 0.2]} /></mesh>
            
            {/* Right outer fragments */}
            <mesh position={[0.4, 0.2, 0]} material={coreGlowDimMat}><boxGeometry args={[0.2, 0.4, 0.2]} /></mesh>
            
            {/* Dark teal surrounding blocks / pixels */}
            <mesh position={[-0.4, 0.6, 0]} material={coreSculkMat}><boxGeometry args={[0.2, 0.4, 0.2]} /></mesh>
            <mesh position={[0.4, -0.4, 0]} material={coreSculkMat}><boxGeometry args={[0.2, 0.6, 0.2]} /></mesh>
            <mesh position={[0, -0.9, 0]} material={coreSculkMat}><boxGeometry args={[0.4, 0.2, 0.2]} /></mesh>
            <mesh position={[0, 0.9, 0]} material={coreSculkMat}><boxGeometry args={[0.4, 0.2, 0.2]} /></mesh>

            {/* Central PointLight for internal chest glow */}
            <pointLight ref={heartLightRef} color="#42e2dc" distance={4} decay={2.5} position={[0, 0, 0.2]} />
          </group>
        </group>
      </group>

      {/* LEFT ARM ROOT */}
      <group ref={leftArmRef} position={[-3.3, ARM_ROOT_Y, 0]}>
        <mesh position={[0, -0.8, 0]} material={upperArmMat}><boxGeometry args={[ARM_W, 1.6, 1.6]} /></mesh>
        <mesh position={[0, -2.4, 0]} material={midArmMat}><boxGeometry args={[ARM_W, 1.6, 1.6]} /></mesh>
        <mesh position={[0, -4.0, 0]} material={darkMat}><boxGeometry args={[ARM_W+0.1, 1.6, 1.7]} /></mesh>
      </group>

      {/* RIGHT ARM ROOT */}
      <group ref={rightArmRef} position={[3.3, ARM_ROOT_Y, 0]}>
        <mesh position={[0, -0.8, 0]} material={upperArmMat}><boxGeometry args={[ARM_W, 1.6, 1.6]} /></mesh>
        <mesh position={[0, -2.4, 0]} material={midArmMat}><boxGeometry args={[ARM_W, 1.6, 1.6]} /></mesh>
        <mesh position={[0, -4.0, 0]} material={darkMat}><boxGeometry args={[ARM_W+0.1, 1.6, 1.7]} /></mesh>
      </group>

      {/* LOWER BODY ROOT */}
      <group>
        {/* Hip Connection */}
        <mesh position={[0, LOWER_TORSO_Y, -0.2]} material={darkMat}>
          <boxGeometry args={[TORSO_W - 0.4, LOWER_TORSO_H, 1.4]} />
        </mesh>

        {/* LEFT LEG ROOT */}
        <group position={[-1.2, 0, -0.2]}>
          {/* LEFT LEG */}
          <mesh position={[0, LEG_Y, 0]} material={darkMat}>
            <boxGeometry args={[LEG_W, LEG_H, 1.4]} />
          </mesh>
          {/* LEFT FOOT */}
          <mesh position={[0, FOOT_Y, 0.1]} material={darkMat}>
            <boxGeometry args={[FOOT_W, FOOT_H, 1.8]} />
          </mesh>
        </group>

        {/* RIGHT LEG ROOT */}
        <group position={[1.2, 0, -0.2]}>
          {/* RIGHT LEG */}
          <mesh position={[0, LEG_Y, 0]} material={darkMat}>
            <boxGeometry args={[LEG_W, LEG_H, 1.4]} />
          </mesh>
          {/* RIGHT FOOT */}
          <mesh position={[0, FOOT_Y, 0.1]} material={darkMat}>
            <boxGeometry args={[FOOT_W, FOOT_H, 1.8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

import { scrollProgress, globalFlags } from './AncientCityJourney';

export const WardenEncounter = () => {
  const spawnRootRef = useRef();
  const normalizedRootRef = useRef();
  const wardenBodyRef = useRef();
  
  // Keep Y > 0 visible.
  const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const [mounted, setMounted] = React.useState(false);
  const [modelHeight, setModelHeight] = React.useState(7); // fallback

  // Mount/unmount logic
  useFrame(() => {
    const globalProgress = scrollProgress.smooth;
    if (globalProgress >= 0.72 && !mounted) {
      setMounted(true);
    } else if (globalProgress < 0.72 && mounted) {
      setMounted(false);
    }
  });

  // Normalize model bounds on mount
  React.useLayoutEffect(() => {
    if (!mounted || !wardenBodyRef.current || !normalizedRootRef.current) return;
    
    // With the new layout, Y=0 is exactly the bottom of the feet!
    const height = 11.2; // FOOT (0.6) + LEG (2.2) + L_TORSO (1.0) + TORSO (3.8) + HEAD (1.8) + HORNS (1.8)
    const targetHeight = 2.8;
    const scaleFactor = targetHeight / height;
    
    // Simply set scale, feet remain at exact local Y=0
    normalizedRootRef.current.position.y = 0;
    normalizedRootRef.current.scale.setScalar(scaleFactor);
    
    setModelHeight(targetHeight);
  }, [mounted]);

  // Handle emergence animation
  useFrame(() => {
    if (!spawnRootRef.current) return;
    const globalProgress = scrollProgress.smooth;
    
    const SPAWN_START = 0.75;
    const SPAWN_END = 0.94;
    // VERY IMPORTANT: The Warden spawns through a raised sculk patch block in AncientCityJourney.
    // That block is positioned at Y=0.1 with height 1.0 (so its top surface is Y=0.6).
    // The Warden must stand perfectly on top of it.
    const SCULK_TOP_Y = 0.6;

    let spawnProgress;
    if (globalFlags.skipWardenCinematic) {
      spawnProgress = 1;
    } else {
      spawnProgress = THREE.MathUtils.clamp(
        (globalProgress - SPAWN_START) / (SPAWN_END - SPAWN_START),
        0,
        1
      );
    }
    
    // Easing (smoothstep)
    const easedProgress = spawnProgress * spawnProgress * (3 - 2 * spawnProgress);
    
    // Spawn animation drives the model up from beneath the sculk block
    const spawnStartY = SCULK_TOP_Y - modelHeight - 0.2;
    const currentY = THREE.MathUtils.lerp(spawnStartY, SCULK_TOP_Y, easedProgress);
    
    spawnRootRef.current.position.y = currentY;
    
    // Disable clipping after fully spawned by moving the plane completely out of the way
    if (globalProgress >= 0.941 || globalFlags.skipWardenCinematic) {
      clippingPlane.constant = 9999;
    } else {
      // Keep clipping plane aligned exactly to the sculk top surface during spawn
      clippingPlane.constant = SCULK_TOP_Y;
    }
  });

  if (!mounted) return null;

  return (
    <group ref={spawnRootRef} position={[0, -999, 0]}>
      <group ref={normalizedRootRef}>
        <group ref={wardenBodyRef}>
          <WardenBody clippingPlane={clippingPlane} />
        </group>
      </group>
    </group>
  );
};
