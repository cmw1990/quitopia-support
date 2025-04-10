import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration } from '@react-three/postprocessing';
import { usePufferfishAssets } from '../PufferfishAssets';
import { setupBreathDetection } from '@/utils/breathDetection';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Vector2 } from 'three';

interface PufferfishScene3DProps {
  breathPhase: 'inhale' | 'hold' | 'exhale' | 'rest';
}

function Pufferfish({ scale, position, texture }: { scale: number; position: [number, number, number]; texture: THREE.Texture }) {
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position} scale={[scale, scale, scale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.2} />
      </mesh>
    </Float>
  );
}

function Seaweed({ position, texture }: { position: [number, number, number]; texture: THREE.Texture }) {
  const [swayOffset] = useState(Math.random() * Math.PI);
  
  return (
    <Float 
      speed={0.5} 
      rotationIntensity={0.2} 
      floatIntensity={2}
      position={position}
    >
      <mesh>
        <planeGeometry args={[1, 3]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          side={THREE.DoubleSide}
          alphaTest={0.5}
        />
      </mesh>
    </Float>
  );
}

function Bubbles({ count = 30 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Float 
          key={i}
          speed={2} 
          rotationIntensity={0.5} 
          floatIntensity={2}
          position={[
            (Math.random() - 0.5) * 15,
            Math.random() * 15,
            (Math.random() - 0.5) * 15
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.6} 
              roughness={0.1} 
              metalness={0.8} 
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function Coral({ position, texture }: { position: [number, number, number]; texture: THREE.Texture }) {
  return (
    <Float speed={0.2} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh position={position}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          side={THREE.DoubleSide}
          alphaTest={0.5}
        />
      </mesh>
    </Float>
  );
}

const PufferfishScene3D = ({ breathPhase }: PufferfishScene3DProps) => {
  const { assets } = usePufferfishAssets();
  const [scale, setScale] = useState(1);
  const [isBreathDetected, setIsBreathDetected] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  const textures = useTexture({
    pufferfish: assets.pufferfish,
    seaweed: assets.seaweed,
    coral: assets.coral,
    background: assets.background,
  });

  useEffect(() => {
    const initBreathDetection = async () => {
      try {
        const cleanup = await setupBreathDetection(
          (volume) => {
            if (breathPhase === 'inhale') {
              setScale(1 + volume * 0.5);
              setIsBreathDetected(true);
            }
          },
          (volume) => {
            if (breathPhase === 'exhale') {
              setScale(Math.max(1 - volume * 0.3, 0.7));
              setIsBreathDetected(true);
            }
          }
        );
        cleanupRef.current = cleanup;
      } catch (error) {
        console.error('Failed to setup breath detection:', error);
      }
    };

    initBreathDetection();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [breathPhase]);

  useEffect(() => {
    if (breathPhase === 'rest') {
      setScale(1);
      setIsBreathDetected(false);
    }
  }, [breathPhase]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-blue-900/20 backdrop-blur-sm">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={['#1e3799']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        {/* Background */}
        <mesh position={[0, 0, -10]} scale={[30, 15, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={textures.background} transparent opacity={0.8} />
        </mesh>

        <Pufferfish 
          scale={scale} 
          position={[0, 0, 0]}
          texture={textures.pufferfish}
        />
        
        {/* Seaweed Forest */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Seaweed 
            key={i} 
            position={[
              (i - 4) * 2,
              -3,
              Math.sin(i) * 2
            ]}
            texture={textures.seaweed}
          />
        ))}
        
        {/* Coral Formations */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Coral
            key={i}
            position={[
              (i - 2) * 4,
              -4,
              Math.cos(i) * 2
            ]}
            texture={textures.coral}
          />
        ))}
        
        <Bubbles />

        <Environment preset="sunset" />
        <EffectComposer>
          <DepthOfField
            focusDistance={0}
            focalLength={0.02}
            bokehScale={2}
            height={480}
          />
          <Bloom 
            luminanceThreshold={0.5} 
            intensity={1.5}
            radius={0.4}
          />
          <ChromaticAberration 
            offset={new Vector2(0.002, 0.002)}
            radialModulation={false}
            modulationOffset={0.0}
          />
        </EffectComposer>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full">
        <p className="text-white font-medium">
          {breathPhase === 'inhale' ? 'Breathe In' :
           breathPhase === 'hold' ? 'Hold' :
           breathPhase === 'exhale' ? 'Breathe Out' : 'Get Ready...'}
        </p>
      </div>

      {!isBreathDetected && breathPhase !== 'rest' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full">
          <p className="text-white text-sm">
            Breathe {breathPhase === 'inhale' ? 'in' : 'out'} to control the pufferfish
          </p>
        </div>
      )}
    </div>
  );
};

export default PufferfishScene3D;
