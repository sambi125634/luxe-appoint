import { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const COLS = 5;
const ROWS = 6;
const CELL_W = 0.72;
const CELL_H = 0.42;
const GAP = 0.08;
const GRID_W = COLS * (CELL_W + GAP) - GAP;
const GRID_H = ROWS * (CELL_H + GAP) - GAP;

const SLOT_COLORS = [
  new THREE.Color("#E91E8C"),
  new THREE.Color("#7c3aed"),
  new THREE.Color("#d4a843"),
  new THREE.Color("#c084fc"),
  new THREE.Color("#f472b6"),
  new THREE.Color("#a78bfa"),
];

interface SlotDef {
  col: number;
  row: number;
  span: number; // 1-3 rows
  colorIndex: number;
}

function generateSlots(): SlotDef[] {
  const occupied = new Set<string>();
  const slots: SlotDef[] = [];
  const order = [];
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++) order.push([c, r]);
  // shuffle
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  for (const [c, r] of order) {
    if (occupied.has(`${c}-${r}`)) continue;
    if (slots.length >= Math.floor(COLS * ROWS * 0.65)) break;
    const maxSpan = Math.min(3, ROWS - r);
    let span = 1;
    if (maxSpan >= 2 && Math.random() > 0.5) span = 2;
    if (maxSpan >= 3 && Math.random() > 0.7) span = 3;
    let canPlace = true;
    for (let s = 0; s < span; s++) {
      if (occupied.has(`${c}-${r + s}`)) { canPlace = false; break; }
    }
    if (!canPlace) continue;
    for (let s = 0; s < span; s++) occupied.add(`${c}-${r + s}`);
    slots.push({ col: c, row: r, span, colorIndex: Math.floor(Math.random() * SLOT_COLORS.length) });
  }
  return slots;
}

const GridCell = ({ col, row }: { col: number; row: number }) => {
  const x = col * (CELL_W + GAP) - GRID_W / 2 + CELL_W / 2;
  const y = -(row * (CELL_H + GAP) - GRID_H / 2 + CELL_H / 2);
  return (
    <RoundedBox args={[CELL_W, CELL_H, 0.04]} radius={0.03} position={[x, y, 0]}>
      <meshPhysicalMaterial
        color="#1a1625"
        transparent
        opacity={0.25}
        roughness={0.8}
        metalness={0.1}
      />
    </RoundedBox>
  );
};

const AppointmentSlot = ({ slot, appearTime }: { slot: SlotDef; appearTime: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const [appeared, setAppeared] = useState(false);
  const scaleRef = useRef(0);

  const x = slot.col * (CELL_W + GAP) - GRID_W / 2 + CELL_W / 2;
  const slotH = slot.span * (CELL_H + GAP) - GAP;
  const y = -(slot.row * (CELL_H + GAP) + slotH / 2 - GRID_H / 2);
  const color = SLOT_COLORS[slot.colorIndex];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (t < appearTime) return;
    if (!appeared) setAppeared(true);

    // Scale in animation
    const age = t - appearTime;
    const targetScale = 1;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.08);

    if (meshRef.current) {
      meshRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
    }

    // Glow pulse
    if (materialRef.current) {
      const pulse = age < 1.5 ? Math.sin(age * 4) * 0.3 + 0.3 : 0.15;
      materialRef.current.emissiveIntensity = pulse;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[CELL_W - 0.04, slotH - 0.02, 0.08]}
      radius={0.03}
      position={[x, y, 0.04]}
      scale={0}
    >
      <meshPhysicalMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.85}
        roughness={0.15}
        metalness={0.2}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        transmission={0.15}
        thickness={0.5}
        ior={1.5}
      />
    </RoundedBox>
  );
};

const CalendarGrid = () => {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const [cycle, setCycle] = useState(0);

  const slots = useMemo(() => generateSlots(), [cycle]);

  // Stagger appear times
  const slotTimings = useMemo(() => {
    return slots.map((_, i) => 0.5 + i * 0.12);
  }, [slots]);

  // Total cycle duration
  const cycleDuration = useMemo(() => {
    const lastAppear = slotTimings[slotTimings.length - 1] || 0;
    return lastAppear + 3; // 3s hold after last slot
  }, [slotTimings]);

  // Mouse tracking
  useMemo(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(({ clock }) => {
    // Mouse parallax
    targetRotation.current.y = mouseRef.current.x * 0.08;
    targetRotation.current.x = mouseRef.current.y * 0.05;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        -0.18 + targetRotation.current.y,
        0.03
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0.25 + targetRotation.current.x,
        0.03
      );
    }

    // Cycle reset
    const elapsed = clock.getElapsedTime();
    const currentCycleTime = elapsed % (cycleDuration + 1.5);
    if (currentCycleTime < 0.05 && elapsed > cycleDuration) {
      setCycle((c) => c + 1);
    }
  });

  const cells = useMemo(() => {
    const result = [];
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS; r++)
        result.push(<GridCell key={`cell-${c}-${r}`} col={c} row={r} />);
    return result;
  }, []);

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.6}>
      <group ref={groupRef} rotation={[0.25, -0.18, 0]}>
        {/* Grid background cells */}
        {cells}

        {/* Animated appointment slots */}
        {slots.map((slot, i) => (
          <AppointmentSlot
            key={`${cycle}-slot-${i}`}
            slot={slot}
            appearTime={slotTimings[i]}
          />
        ))}

        {/* Back glow light */}
        <pointLight position={[0, 0, -1]} intensity={1.2} color="#7c3aed" distance={6} />
        <pointLight position={[1, 1, 1]} intensity={0.4} color="#E91E8C" distance={5} />
      </group>
    </Float>
  );
};

const InnerScene = () => {
  const { viewport } = useThree();
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#e9d5ff" />
      <directionalLight position={[-3, -3, 2]} intensity={0.3} color="#f9a8d4" />

      <CalendarGrid />

      <Sparkles
        count={120}
        scale={viewport.width > 6 ? 10 : 6}
        size={1.5}
        speed={0.3}
        opacity={0.4}
        color="#c084fc"
      />
    </>
  );
};

const Hero3DScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 40 }}
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
