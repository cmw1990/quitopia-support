import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useKeyboardControls } from '@react-three/drei';

interface CarPhysicsProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  onUpdate?: (position: THREE.Vector3, rotation: THREE.Euler) => void;
}

export const CarPhysics = ({ position, rotation, scale = 1, onUpdate }: CarPhysicsProps) => {
  const rigidBodyRef = useRef(null);
  const velocityRef = useRef(new THREE.Vector3());
  const angularVelocityRef = useRef(0);
  const driftFactorRef = useRef(0);
  const tireTracks = useRef<THREE.Vector3[]>([]);

  const [subscribeKeys, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;

    const { forward, backward, left, right, drift } = getKeys();

    // Absolute Drift-style physics constants
    const acceleration = 20; // Increased for snappier response
    const deceleration = 0.95; // Slightly increased friction
    const turnSpeed = 2.5; // Increased for tighter turns
    const maxSpeed = 30; // Higher top speed
    const driftDecay = 0.98; // Slower drift decay for longer slides
    const lateralFriction = drift ? 0.98 : 0.7; // More pronounced drift
    const driftBoost = 1.2; // Speed boost during drift

    // Handle acceleration with drift boost
    if (forward) {
      const boostFactor = drift && driftFactorRef.current > 0.5 ? driftBoost : 1;
      velocityRef.current.z -= acceleration * delta * boostFactor;
    } else if (backward) {
      velocityRef.current.z += acceleration * delta * 0.7; // Slower reverse speed
    }
    
    // Apply deceleration and friction
    velocityRef.current.z *= deceleration;
    velocityRef.current.x *= lateralFriction;

    // Clamp speed
    const currentSpeed = velocityRef.current.length();
    if (currentSpeed > maxSpeed) {
      velocityRef.current.multiplyScalar(maxSpeed / currentSpeed);
    }

    // Enhanced drifting mechanics
    if (drift) {
      // Increase drift factor more quickly when turning
      const turnFactor = (left || right) ? 2 : 1;
      driftFactorRef.current = Math.min(
        driftFactorRef.current + delta * 2 * turnFactor, 
        1
      );

      // Apply lateral force during drift
      const driftForce = new THREE.Vector3(
        -Math.sin(rigidBodyRef.current.rotation().y) * currentSpeed * driftFactorRef.current,
        0,
        -Math.cos(rigidBodyRef.current.rotation().y) * currentSpeed * driftFactorRef.current * 0.4
      );
      velocityRef.current.add(driftForce);

      // Store tire tracks during drift
      if (currentSpeed > 5) {
        tireTracks.current.push(rigidBodyRef.current.translation());
        if (tireTracks.current.length > 100) {
          tireTracks.current.shift();
        }
      }
    } else {
      driftFactorRef.current *= driftDecay;
      if (driftFactorRef.current < 0.1) {
        driftFactorRef.current = 0;
      }
    }

    // Enhanced turning mechanics
    const turnMultiplier = drift ? 1.5 : 1; // Sharper turns during drift
    if (left) {
      angularVelocityRef.current -= turnSpeed * delta * turnMultiplier * 
        (1 + driftFactorRef.current * 0.5);
    }
    if (right) {
      angularVelocityRef.current += turnSpeed * delta * turnMultiplier * 
        (1 + driftFactorRef.current * 0.5);
    }

    // Update physics body
    const currentTransform = rigidBodyRef.current.translation();
    const nextPosition = new THREE.Vector3(
      currentTransform.x,
      currentTransform.y,
      currentTransform.z
    ).add(velocityRef.current.clone().multiplyScalar(delta));

    rigidBodyRef.current.setTranslation(nextPosition);
    rigidBodyRef.current.setRotation(new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, rigidBodyRef.current.rotation().y + angularVelocityRef.current * delta, 0)
    ));

    // Natural angular velocity decay
    angularVelocityRef.current *= 0.93; // Slightly increased decay for more responsive steering

    if (onUpdate) {
      onUpdate(nextPosition, new THREE.Euler(0, rigidBodyRef.current.rotation().y, 0));
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} position={position} rotation={rotation} colliders={false}>
      <CuboidCollider args={[1, 0.5, 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
          emissive="#ff3300"
          emissiveIntensity={driftFactorRef.current * 0.5}
        />
      </mesh>
    </RigidBody>
  );
};