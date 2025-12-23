"use client";
import React, { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import { Physics, useBox, usePlane } from "@react-three/cannon";
import * as THREE from "three";

// import model URL (bundler will provide a public URL)
import { useGLTF } from "@react-three/drei";

// model will be served from /assets in `public` directory
const modelUrl = "/assets/merry_christmas.glb";
const snowmanUrl = "/assets/snowman.glb";
const gift1Url = "/assets/wrapped_christmas_gift.glb";
const gift2Url = "/assets/wrapped_christmas_gift.glb";
const cardUrl = "/assets/merry_christmas_greeting_card.glb";


function Model() {
  const gltf = useGLTF(modelUrl) as any;

  useEffect(() => {
    if (!gltf?.scene) return;
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gltf]);

  return (
    <primitive
      object={gltf.scene}
      position={[0, 2, 175]}
      rotation={[0, 0, 0]}
      scale={70}
    />
  );
}

function Snow({ count = 3000 }: { count?: number }) {
  const ref = useRef<THREE.Points | null>(null);
  const hasAdded = useRef(false);

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 500; // x, wider spread
      p[i * 3 + 1] = Math.random() * 100 + 200; // y, random from 200 to 300
      p[i * 3 + 2] = (Math.random() - 0.5) * 500; // z, wider spread
    }
    return p;
  }, [count]);

  const velocities = useMemo(() => {
    const v = new Float32Array(count);
    for (let i = 0; i < count; i++) v[i] = 0.3 + Math.random() * 0.7;
    return v;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const geom = ref.current.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    if (!hasAdded.current && time > 2) {
      for (let i = 0; i < count / 2; i++) {
        pos[i * 3 + 1] = 300 + Math.random() * 50;
      }
      hasAdded.current = true;
      geom.attributes.position.needsUpdate = true;
    }
    const windX = Math.sin(time * 0.3) * 0.5 * delta;
    const windZ = Math.cos(time * 0.3) * 0.3 * delta;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += windX;
      pos[i * 3 + 1] -= velocities[i] * delta * 10;
      pos[i * 3 + 2] += windZ;
      if (pos[i * 3 + 1] < -5) {
        pos[i * 3] = (Math.random() - 0.5) * 500;
        pos[i * 3 + 1] = 400 + Math.random() * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 500;
      }
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.25}
        sizeAttenuation={true}
        depthWrite={false}
        transparent={true}
        opacity={0.95}
      />
    </points>
  );
}

function SnowOnGround({ count = 1000 }: { count?: number }) {
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 150; // x
      p[i * 3 + 1] = -1.49; // y, slightly above ground
      p[i * 3 + 2] = (Math.random() - 0.5) * 150; // z
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.1} sizeAttenuation={false} transparent opacity={0.8} />
    </points>
  );
}

function DirtOnGround({ count = 500 }: { count?: number }) {
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 150; // x
      p[i * 3 + 1] = -1.48; // y, slightly above snow
      p[i * 3 + 2] = (Math.random() - 0.5) * 150; // z
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#8B4513" size={0.05} sizeAttenuation={false} transparent opacity={0.6} />
    </points>
  );
}

function Snowmen({ count = 5 }: { count?: number }) {
  const gltf = useGLTF(snowmanUrl) as any;

  useEffect(() => {
    if (!gltf?.scene) return;
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gltf]);

  const positions = useMemo(() => {
    const pos: { x: number; z: number; rotation: number }[] = [];
    const minDistance = 10; // minimum distance between snowmen
    for (let i = 0; i < count; i++) {
      let x: number, z: number, attempts = 0;
      do {
        x = Math.random() > 0.5 ? 50 + Math.random() * 25 : -50 - Math.random() * 25;
        z = Math.random() > 0.5 ? 50 + Math.random() * 25 : -50 - Math.random() * 25;
        attempts++;
        if (attempts > 100) break; // prevent infinite loop
      } while (pos.some(p => Math.sqrt((p.x - x)**2 + (p.z - z)**2) < minDistance));
      pos.push({
        x,
        z,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return pos;
  }, [count]);

  return (
    <>
      {positions.map((pos, i) => (
        <primitive
          key={i}
          object={gltf.scene.clone()}
          position={[pos.x, -1, pos.z]}
          rotation={[0, pos.rotation, 0]}
          scale={2}
        />
      ))}
    </>
  );
}

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
    material: { friction: 0.4, restitution: 0.3 },
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[150, 150]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

function Gifts({ count = 10 }: { count?: number }) {
  const gift1 = useGLTF(gift1Url);
  const gift2 = useGLTF(gift2Url);

  useEffect(() => {
    [gift1, gift2].forEach(gltf => {
      if (!gltf?.scene) return;
      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    });
  }, [gift1, gift2]);

  const gifts = useMemo(() => {
    const pos: { x: number; z: number; rotation: number; type: number }[] = [];
    const minDistance = 5; // minimum distance between gifts
    for (let i = 0; i < count; i++) {
      let x: number, z: number, attempts = 0;
      do {
        x = (Math.random() - 0.5) * 140;
        z = (Math.random() - 0.5) * 140;
        attempts++;
        if (attempts > 100) break; // prevent infinite loop
      } while (pos.some(p => Math.sqrt((p.x - x)**2 + (p.z - z)**2) < minDistance));
      pos.push({
        x,
        z,
        rotation: Math.random() * Math.PI * 2,
        type: Math.random() > 0.5 ? 1 : 2,
      });
    }
    return pos;
  }, [count]);

  return (
    <>
      {gifts.map((gift, i) => (
        <primitive
          key={i}
          object={(gift.type === 1 ? gift1 : gift2).scene.clone()}
          position={[gift.x, 0, gift.z]}
          rotation={[0, gift.rotation, 0]}
          scale={15}
        />
      ))}
    </>
  );
}

function ChristmasText() {
  const ref = useRef<any>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 4); // blink
    }
  });

  return (
    <Text
      ref={ref}
      position={[0, 10, 0]}
      fontSize={20}
      color="#FFD700"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.5}
      outlineColor="#FF0000"
    >
      Merry Christmas
    </Text>
  );
}

function    FallingText({ text, initialY }: { text: string; initialY: number }) {
  const ref = useRef<any>(null);
  const [y, setY] = useState(initialY);
  const x = useMemo(() => Math.random() * 400 - 200, []);
  const z = useMemo(() => Math.random() * 400 - 200, []);

  useFrame((_, delta) => {
    setY(prev => prev - 5 * delta); // slow fall
    if (y < -10) setY(initialY + Math.random() * 50);
  });

  return (
    <Text
      ref={ref}
      position={[x, y, z]}
      fontSize={5}
      color="#FFD700"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.2}
      outlineColor="#FF0000"
    >
      {text}
    </Text>
  );
}

function Cards({ count = 4, setEnableRotate, setShowModal, clickedCard, setClickedCard }: { 
  count?: number; 
  setEnableRotate: (enable: boolean) => void;
  setShowModal: (show: boolean) => void;
  clickedCard: number | null;
  setClickedCard: (id: number | null) => void;
 }) {
  const card = useGLTF(cardUrl);
  const [cardPositions, setCardPositions] = useState(() =>
    Array.from({ length: count }, (_, index) => ({
      id: index,
      x: (Math.random() - 0.5) * 500,
      y: 400 + Math.random() * 10,
      z: (Math.random() - 0.5) * 500,
      rotationX: Math.random() * Math.PI * 2,
      rotationY: Math.random() * Math.PI * 2,
      rotationZ: Math.random() * Math.PI * 2,
      rotationSpeedX: (Math.random() - 0.5) * 0.5,
      rotationSpeedY: (Math.random() - 0.5) * 0.5,
      rotationSpeedZ: (Math.random() - 0.5) * 0.5,
      fallSpeed: 15 + Math.random() * 10,
      scale: 5,
      isAnimating: false,
    }))
  );
  const [wind, setWind] = useState([0, 0, 0]);

  useEffect(() => {
    if (!card?.scene) return;
    card.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [card]);

  useFrame((state, delta) => {
    // wind
    setWind([Math.sin(state.clock.elapsedTime * 0.5) * 2, 0, Math.cos(state.clock.elapsedTime * 0.5) * 2]);

    setCardPositions(prev =>
      prev.map(pos => {
        let newY = pos.y - pos.fallSpeed * delta;
        let newX = pos.x + wind[0] * delta;
        let newZ = pos.z + wind[2] * delta;
        let newRotationX = pos.rotationX + pos.rotationSpeedX * delta;
        let newRotationY = pos.rotationY + pos.rotationSpeedY * delta;
        let newRotationZ = pos.rotationZ + pos.rotationSpeedZ * delta;
        let newScale = pos.scale;
        
        // Animate clicked card
        if (clickedCard === pos.id && !pos.isAnimating) {
          newScale = Math.min(pos.scale + delta * 20, 15); // grow to 3x size
          newRotationY += delta * 10; // spin faster
          if (newScale >= 14) {
            setShowModal(true);
            return { ...pos, scale: newScale, rotationY: newRotationY, isAnimating: true };
          }
        }
        
        if (newY < -5) {
          // reset like snow
          newY = 400 + Math.random() * 10;
          newX = (Math.random() - 0.5) * 500;
          newZ = (Math.random() - 0.5) * 500;
          newRotationX = Math.random() * Math.PI * 2;
          newRotationY = Math.random() * Math.PI * 2;
          newRotationZ = Math.random() * Math.PI * 2;
          newScale = 5;
          if (clickedCard === pos.id) setClickedCard(null);
        }
        return { ...pos, x: newX, y: newY, z: newZ, rotationX: newRotationX, rotationY: newRotationY, rotationZ: newRotationZ, scale: newScale };
      })
    );
  });

  return (
    <>
      {cardPositions.map((pos, i) => (
        <group
          key={i}
          position={[pos.x, pos.y, pos.z]}
          rotation={[pos.rotationX, pos.rotationY, pos.rotationZ]}
          scale={pos.scale}
          onPointerOver={() => setEnableRotate(false)}
          onPointerOut={() => setEnableRotate(true)}
          onPointerDown={(e: any) => { 
            e.stopPropagation(); 
            setClickedCard(pos.id);
          }}
        >
          <primitive object={card.scene.clone()} />
        </group>
      ))}
    </>
  );
}

export default function SnowScene() {
  const [enableRotate, setEnableRotate] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clickedCard, setClickedCard] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3; // Set volume to 30%
      // Try to play automatically, but handle autoplay policy
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, will need user interaction
          console.log("Autoplay prevented, click anywhere to start music");
        });
      }
    }
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  const startMusic = () => {
    const audio = audioRef.current;
    if (audio && audio.paused) {
      audio.play();
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }} onContextMenu={(e) => e.preventDefault()} onClick={startMusic}>
      <Canvas
        shadows
        camera={{ position: [0, 100, 400], fov: 90 }}
        gl={{ alpha: true }}
        // background will be set via <color attach="background" /> for better control
      >
        <Physics gravity={[0, -9.82, 0]}>
          <color attach="background" args={["#000000"]} />

          {/* Static starfield */}
          {/* <Stars count={400} /> */}

          <Suspense fallback={null}>
            <Model />
            <Snowmen />
            <Gifts />
            <Cards setEnableRotate={setEnableRotate} setShowModal={setShowModal} clickedCard={clickedCard} setClickedCard={setClickedCard} />
          </Suspense>
          <ambientLight intensity={2.0} color="#E0F6FF" />
          
          {/* Main pointlight from center high above */}
          <pointLight
            position={[0, 100, 0]}
            intensity={20.0}
            color="#FFD700"
            distance={400}
            decay={0.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Pyramid pointlights at 4 corners */}
          <pointLight
            position={[75, 100, 75]}
            intensity={10.0}
            color="#FFD700"
            distance={200}
            decay={0.5}
            castShadow
          />
          <pointLight
            position={[75, 100, -75]}
            intensity={10.0}
            color="#FFD700"
            distance={200}
            decay={0.5}
            castShadow
          />
          <pointLight
            position={[-75, 100, 75]}
            intensity={10.0}
            color="#FFD700"
            distance={200}
            decay={0.5}
            castShadow
          />
          <pointLight
            position={[-75, 100, -75]}
            intensity={10.0}
            color="#FFD700"
            distance={200}
            decay={0.5}
            castShadow
          />

          <Ground />

          {/* <SnowOnGround count={20000} /> */}

          {/* <DirtOnGround count={500} /> */}

          <Snow count={6000} />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={enableRotate}
            enableDamping={true}
            dampingFactor={0.05}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={200}
            target={[0, 100, 0]}            mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY }}          />
        </Physics>
      </Canvas>
      
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src="/assets/christmas-music.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
      
      {/* Mute Button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '1.5em',
          cursor: 'pointer',
          zIndex: 999,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'scale(1.1)'}
        onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
        title={isMuted ? 'Unmute Music' : 'Mute Music'}
      >
        {isMuted ? '🔇' : '🎵'}
      </button>
      
      {/* Christmas Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24, #feca57)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'bounce 0.5s ease-in-out',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <h1 style={{
              fontSize: '3em',
              margin: '0 0 20px 0',
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontFamily: 'Arial, sans-serif'
            }}>🎄 MERRY CHRISTMAS! 🎄</h1>
            <p style={{
              fontSize: '1.5em',
              margin: '20px 0',
              color: '#fff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>Chúc bạn một mùa Giáng sinh an lành và hạnh phúc!</p>
            <p style={{
              fontSize: '1.2em',
              margin: '20px 0',
              color: '#fff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>🎁 May your days be merry and bright! 🎁</p>
            <button
              onClick={() => {
                setShowModal(false);
                setClickedCard(null);
              }}
              style={{
                background: '#fff',
                color: '#ee5a24',
                border: 'none',
                padding: '15px 30px',
                fontSize: '1.2em',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'scale(1.1)'}
              onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
            >
              🌟 Close 🌟
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

useGLTF.preload(modelUrl);
useGLTF.preload(snowmanUrl);
useGLTF.preload(gift1Url);
useGLTF.preload(gift2Url);
useGLTF.preload(cardUrl);
