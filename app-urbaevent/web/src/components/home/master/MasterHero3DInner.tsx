import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { PointLight as PointLightType, Mesh as MeshType } from 'three';

function CursorLight() {
  const light = useRef<PointLightType>(null);
  useFrame((state) => {
    if (!light.current) return;
    light.current.position.set(state.pointer.x * 3, state.pointer.y * 2 + 1, 2.5);
  });
  return <pointLight ref={light} intensity={2} color="#F39200" distance={12} />;
}

function HeroSphere() {
  const mesh = useRef<MeshType>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.12;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.15;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.6}>
      <mesh ref={mesh}>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshPhysicalMaterial
          color="#F39200"
          metalness={0.45}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.8}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <spotLight position={[6, 8, 4]} angle={0.35} penumbra={0.5} intensity={1.4} castShadow />
      <CursorLight />
      <HeroSphere />
    </>
  );
}

export default function MasterHero3DScene() {
  return (
    <div className="absolute inset-y-0 right-0 w-full max-w-[520px] pointer-events-none opacity-80 mix-blend-screen hidden lg:block">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
