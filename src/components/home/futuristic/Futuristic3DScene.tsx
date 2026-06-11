import React, { useRef, useMemo, Component, type ReactNode, Suspense, lazy } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* =========================================================
 * Skyscraper — single extruded box building
 * ========================================================= */
interface SkyscraperProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  emissiveColor?: string;
  opacity?: number;
}

function Skyscraper({ position, height, width, depth, emissiveColor = '#0066FF', opacity = 0.85 }: SkyscraperProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    (mesh.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity =
      0.12 + Math.sin(t * 0.4 + position[0]) * 0.06;
  });

  return (
    <mesh ref={mesh} position={[position[0], position[1] + height / 2, position[2]]} castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshPhysicalMaterial
        color="#0A1830"
        emissive={emissiveColor}
        emissiveIntensity={0.15}
        metalness={0.9}
        roughness={0.15}
        transparent
        opacity={opacity}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

/* =========================================================
 * Building windows — grid of emissive quads
 * ========================================================= */
function BuildingWindows({ position, height, width, depth }: SkyscraperProps) {
  const rows = Math.floor(height / 0.32);
  const cols = Math.floor(width / 0.22);
  const windows = useMemo(() => {
    const arr: { x: number; y: number; lit: boolean }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push({ x: c, y: r, lit: Math.random() > 0.35 });
      }
    }
    return arr;
  }, [rows, cols]);

  return (
    <group position={[position[0], position[1], position[2] + depth / 2 + 0.02]}>
      {windows.map((w, i) => (
        <mesh
          key={i}
          position={[
            -width / 2 + 0.11 + w.x * 0.22,
            w.y * 0.32 + 0.16,
            0,
          ]}
        >
          <planeGeometry args={[0.08, 0.12]} />
          <meshBasicMaterial
            color={w.lit ? '#00D4FF' : '#001A3D'}
            transparent
            opacity={w.lit ? 0.8 : 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================
 * City skyline — collection of skyscrapers
 * ========================================================= */
/* Palette logo SIB : orange #F39200 · bleu clair #5E8FBE · bleu moyen #2E5984 · navy #1B365D */
const BUILDINGS: SkyscraperProps[] = [
  { position: [-8, 0, -4],   height: 5.5, width: 0.9, depth: 0.9, emissiveColor: '#2E5984' },
  { position: [-6.5, 0, -3], height: 4.2, width: 0.7, depth: 0.7, emissiveColor: '#5E8FBE' },
  { position: [-5.2, 0, -4.5], height: 7.0, width: 1.1, depth: 1.1, emissiveColor: '#2E5984' },
  { position: [-4, 0, -3.5], height: 3.8, width: 0.8, depth: 0.8, emissiveColor: '#F39200' },
  { position: [-3, 0, -5],   height: 5.0, width: 0.9, depth: 0.9, emissiveColor: '#5E8FBE' },
  { position: [-2, 0, -4],   height: 6.5, width: 1.2, depth: 1.2, emissiveColor: '#2E5984' },
  { position: [-0.8, 0, -5.5], height: 8.5, width: 1.4, depth: 1.4, emissiveColor: '#F39200' },
  { position: [0.5, 0, -4.5], height: 5.8, width: 1.0, depth: 1.0, emissiveColor: '#5E8FBE' },
  { position: [1.8, 0, -3.5], height: 4.5, width: 0.8, depth: 0.8, emissiveColor: '#2E5984' },
  { position: [3.0, 0, -5],  height: 7.2, width: 1.3, depth: 1.3, emissiveColor: '#F39200' },
  { position: [4.5, 0, -4],  height: 5.2, width: 0.9, depth: 0.9, emissiveColor: '#5E8FBE' },
  { position: [6, 0, -5.5],  height: 6.8, width: 1.1, depth: 1.1, emissiveColor: '#2E5984' },
  { position: [7.5, 0, -4],  height: 4.0, width: 0.7, depth: 0.7, emissiveColor: '#F39200' },
  { position: [9, 0, -5],    height: 5.5, width: 0.9, depth: 0.9, emissiveColor: '#5E8FBE' },
  { position: [-1.5, 0, -6], height: 9.5, width: 1.6, depth: 1.6, emissiveColor: '#F39200' },
];

function Cityscape() {
  return (
    <group position={[0, -2.5, 0]}>
      {BUILDINGS.map((b, i) => (
        <React.Fragment key={i}>
          <Skyscraper {...b} />
          <BuildingWindows {...b} />
        </React.Fragment>
      ))}
    </group>
  );
}

/* =========================================================
 * Holographic grid floor
 * ========================================================= */
function HolographicGrid() {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#5E8FBE') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        float gridX = abs(sin(uv.x * 30.0 * 3.14159));
        float gridY = abs(sin(uv.y * 30.0 * 3.14159));
        float grid = max(
          step(0.96, gridX),
          step(0.96, gridY)
        );
        float dist = length(uv - 0.5) * 2.0;
        float fade = 1.0 - smoothstep(0.3, 1.0, dist);
        float pulse = 0.5 + 0.5 * sin(time * 0.6 - dist * 4.0);
        float alpha = grid * fade * (0.25 + 0.12 * pulse);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[40, 40]} />
      <shaderMaterial ref={mat} attach="material" {...shader} />
    </mesh>
  );
}

/* =========================================================
 * Floating blueprint panels
 * ========================================================= */
function Blueprint({ position, rotation, scale }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.003;
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.2;
    if (mat.current) {
      mat.current.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.7 + position[2]) * 0.06;
    }
  });

  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * 2 - 1;
      pts.push(new THREE.Vector3(t, -1, 0), new THREE.Vector3(t, 1, 0));
      pts.push(new THREE.Vector3(-1, t, 0), new THREE.Vector3(1, t, 0));
    }
    const diag = [
      new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(-1, 1, 0),  new THREE.Vector3(1, -1, 0),
      new THREE.Vector3(0, -1, 0),  new THREE.Vector3(1, 0, 0),
    ];
    return [...pts, ...diag];
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(lines);
    return g;
  }, [lines]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.15} />
      </lineSegments>
      <mesh ref={mesh}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial ref={mat} color="#001A60" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* =========================================================
 * Particle field
 * ========================================================= */
function ParticleField({ count = 600 }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    /* Palette logo SIB (sans rouge) */
    const palette = [
      new THREE.Color('#F39200'),  /* orange SIB */
      new THREE.Color('#5E8FBE'),  /* bleu clair SIB */
      new THREE.Color('#2E5984'),  /* bleu moyen SIB */
      new THREE.Color('#2E5984'),  /* orange clair */
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

/* =========================================================
 * Central holographic orb
 * ========================================================= */
function CentralOrb() {
  const orb   = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orb.current) {
      orb.current.rotation.y = t * 0.2;
      orb.current.position.y = Math.sin(t * 0.5) * 0.15;
    }
    if (ring1.current) {
      ring1.current.rotation.z = t * 0.3;
      ring1.current.rotation.x = Math.PI / 3 + t * 0.1;
    }
    if (ring2.current) {
      ring2.current.rotation.z = -t * 0.2;
      ring2.current.rotation.x = -Math.PI / 4 + t * 0.08;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
      <group position={[3.5, 0.5, -1]}>
        <mesh ref={orb}>
          <icosahedronGeometry args={[0.6, 3]} />
          <meshPhysicalMaterial
            color="#001A3D"
            emissive="#F39200"
            emissiveIntensity={0.45}
            metalness={0.8}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transparent
            opacity={0.9}
            wireframe={false}
          />
        </mesh>
        <mesh ref={ring1}>
          <torusGeometry args={[1.0, 0.015, 16, 80]} />
          <meshBasicMaterial color="#F39200" transparent opacity={0.55} />
        </mesh>
        <mesh ref={ring2}>
          <torusGeometry args={[1.3, 0.01, 16, 80]} />
          <meshBasicMaterial color="#5E8FBE" transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

/* =========================================================
 * Cursor light
 * ========================================================= */
function CursorLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!light.current) return;
    light.current.position.set(
      state.pointer.x * 6,
      state.pointer.y * 4 + 1,
      3,
    );
  });
  return <pointLight ref={light} intensity={3} color="#F39200" distance={18} />;
}

/* =========================================================
 * Full 3D scene
 * ========================================================= */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.25} color="#001A3D" />
      <directionalLight position={[5, 10, 5]} intensity={0.7} color="#2E5984" />
      <pointLight position={[-8, 6, 2]} intensity={1.5} color="#5E8FBE" distance={20} />
      <pointLight position={[8, 5, 2]}  intensity={1.4} color="#F39200" distance={20} />
      <CursorLight />

      <HolographicGrid />
      <Cityscape />
      <CentralOrb />

      <Blueprint position={[-5.5, 1.5, -0.5]} rotation={[0.1, 0.3, 0.05]} scale={1.4} />
      <Blueprint position={[6.5, 2.0, -1.0]}  rotation={[-0.1, -0.4, 0.1]} scale={1.1} />
      <Blueprint position={[1.5, 3.5, -2.0]}  rotation={[0.2, 0.5, -0.1]} scale={0.9} />

      <Sparkles
        count={120}
        scale={[20, 10, 12]}
        size={1.2}
        speed={0.3}
        opacity={0.45}
        color="#F39200"
        position={[0, 1, -4]}
      />
      <ParticleField count={500} />

      <fog attach="fog" args={['#000912', 15, 35]} />
    </>
  );
}

/* =========================================================
 * Error boundary
 * ========================================================= */
class Scene3DErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#000912] to-[#001A3D]" />
      );
    }
    return this.props.children;
  }
}

/* =========================================================
 * Exported canvas component
 * ========================================================= */
export const Futuristic3DScene: React.FC = () => (
  <Scene3DErrorBoundary>
    <div className="r3f-canvas-wrap">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 55 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 1.5]}
        shadows
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  </Scene3DErrorBoundary>
);
