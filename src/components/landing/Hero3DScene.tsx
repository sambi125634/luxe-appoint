import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const Crystal = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color="#7c3aed"
          metalness={0.3}
          roughness={0.1}
          transmission={0.6}
          thickness={1.5}
          ior={2.4}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
          iridescence={1}
          iridescenceIOR={1.8}
          iridescenceThicknessRange={[100, 800]}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
};

const GlowRing = () => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.2;
      const scale = 1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={ringRef} position={[0, -0.3, 0]}>
      <torusGeometry args={[2.2, 0.03, 16, 100]} />
      <meshBasicMaterial color="#c084fc" transparent opacity={0.6} />
    </mesh>
  );
};

const ParticleField = () => {
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const handlePointerMove = (e: { clientX: number; clientY: number }) => {
    mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  };

  // Attach global listener
  useMemo(() => {
    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  return (
    <Sparkles
      count={200}
      scale={viewport.width > 6 ? 10 : 6}
      size={2}
      speed={0.4}
      opacity={0.5}
      color="#c084fc"
    />
  );
};

const InnerScene = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#e9d5ff" />
      <directionalLight position={[-3, -3, 2]} intensity={0.5} color="#f9a8d4" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#c084fc" distance={10} />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#d4a843" distance={8} />

      <Crystal />
      <GlowRing />
      <ParticleField />
    </>
  );
};

const Hero3DScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <InnerScene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3DScene;
