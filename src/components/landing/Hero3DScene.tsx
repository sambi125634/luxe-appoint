import { useRef, useMemo, useState, Suspense, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

// ── Calendar Configuration ──────────────────────────────────────────
const DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt"];
const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const COLS = 5;
const ROWS = HOURS.length;
const CELL_W = 0.82;
const CELL_H = 0.36;
const GAP_X = 0.06;
const GAP_Y = 0.04;
const HEADER_H = 0.32;
const LABEL_W = 0.52;
const GRID_W = COLS * (CELL_W + GAP_X) - GAP_X;
const GRID_H = ROWS * (CELL_H + GAP_Y) - GAP_Y;

// Staff-based colors (pastel, low saturation for readability)
const STAFF_COLORS = [
  { color: new THREE.Color("#d4769a"), name: "Anna" },   // muted rose
  { color: new THREE.Color("#9b7ed8"), name: "Kasia" },  // muted violet
  { color: new THREE.Color("#c9a96e"), name: "Marta" },  // muted gold
  { color: new THREE.Color("#7eb8d8"), name: "Zosia" },  // muted blue
];

// Real beauty service names with durations
const SERVICES = [
  { name: "Manicure hybrydowy", rows: 1 },
  { name: "Pedicure klasyczny", rows: 1 },
  { name: "Masaż relaksacyjny", rows: 2 },
  { name: "Peeling kawitacyjny", rows: 1 },
  { name: "Koloryzacja", rows: 3 },
  { name: "Strzyżenie + modelowanie", rows: 1 },
  { name: "Henna brwi + rzęs", rows: 1 },
  { name: "Depilacja woskiem", rows: 1 },
  { name: "Mikrodermabrazja", rows: 2 },
  { name: "Laminacja brwi", rows: 1 },
  { name: "Przedłużanie rzęs", rows: 3 },
  { name: "Makijaż okolicznościowy", rows: 2 },
  { name: "Oczyszczanie twarzy", rows: 2 },
  { name: "Mezoterapia igłowa", rows: 1 },
  { name: "Keratynowe prostowanie", rows: 3 },
  { name: "Refleksy + tonowanie", rows: 2 },
];

interface SlotDef {
  col: number;
  row: number;
  span: number;
  staffIndex: number;
  serviceName: string;
}

function generateRealisticSlots(): SlotDef[] {
  const occupied = new Set<string>();
  const slots: SlotDef[] = [];

  // Shuffle services
  const shuffled = [...SERVICES].sort(() => Math.random() - 0.5);
  let serviceIdx = 0;

  // Fill each column with some appointments (realistic density)
  for (let c = 0; c < COLS; c++) {
    const staffIdx = c % STAFF_COLORS.length;
    let r = 0;
    // Some days start with a gap
    if (Math.random() > 0.6) r += 1;

    while (r < ROWS && serviceIdx < shuffled.length * 3) {
      const svc = shuffled[serviceIdx % shuffled.length];
      serviceIdx++;
      const span = Math.min(svc.rows, ROWS - r);

      // Check availability
      let canPlace = true;
      for (let s = 0; s < span; s++) {
        if (occupied.has(`${c}-${r + s}`)) { canPlace = false; break; }
      }
      if (!canPlace) { r++; continue; }

      // ~75% chance to place (some gaps = realistic)
      if (Math.random() > 0.25) {
        for (let s = 0; s < span; s++) occupied.add(`${c}-${r + s}`);
        slots.push({
          col: c,
          row: r,
          span,
          staffIndex: staffIdx + (Math.random() > 0.7 ? 1 : 0),
          serviceName: svc.name,
        });
      }

      r += span;
      // Gap between appointments
      if (Math.random() > 0.5) r += 1;
    }
  }

  return slots;
}

// ── Grid Background Cell ────────────────────────────────────────────
const GridCell = ({ col, row }: { col: number; row: number }) => {
  const x = LABEL_W + col * (CELL_W + GAP_X) - GRID_W / 2 + CELL_W / 2;
  const y = -(HEADER_H + row * (CELL_H + GAP_Y) - GRID_H / 2 + CELL_H / 2);
  return (
    <RoundedBox args={[CELL_W, CELL_H, 0.02]} radius={0.02} position={[x, y, 0]}>
      <meshPhysicalMaterial
        color="#1a1625"
        transparent
        opacity={0.15}
        roughness={0.9}
        metalness={0.05}
      />
    </RoundedBox>
  );
};

// ── Day Header ──────────────────────────────────────────────────────
const DayHeader = ({ col, label }: { col: number; label: string }) => {
  const x = LABEL_W + col * (CELL_W + GAP_X) - GRID_W / 2 + CELL_W / 2;
  const y = GRID_H / 2 + HEADER_H * 0.3;
  return (
    <Text
      position={[x, y, 0.05]}
      fontSize={0.12}
      color="#a78bfa"
      anchorX="center"
      anchorY="middle"
      font="/fonts/Inter-Bold.woff"
      letterSpacing={0.05}
    >
      {label}
    </Text>
  );
};

// ── Hour Label ──────────────────────────────────────────────────────
const HourLabel = ({ row, label }: { row: number; label: string }) => {
  const x = -GRID_W / 2 - GAP_X;
  const y = -(HEADER_H + row * (CELL_H + GAP_Y) - GRID_H / 2 + CELL_H / 2);
  return (
    <Text
      position={[x, y, 0.05]}
      fontSize={0.08}
      color="#6b5b8d"
      anchorX="right"
      anchorY="middle"
      font="/fonts/Inter-Medium.woff"
    >
      {label}
    </Text>
  );
};

// ── Appointment Slot with Flip Animation ────────────────────────────
const AppointmentSlot = ({
  slot,
  appearTime,
  cyclePhase,
}: {
  slot: SlotDef;
  appearTime: number;
  cyclePhase: "filling" | "glow" | "fading";
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const x = LABEL_W + slot.col * (CELL_W + GAP_X) - GRID_W / 2 + CELL_W / 2;
  const slotH = slot.span * (CELL_H + GAP_Y) - GAP_Y;
  const y = -(HEADER_H + slot.row * (CELL_H + GAP_Y) + slotH / 2 - GRID_H / 2);
  const staff = STAFF_COLORS[slot.staffIndex % STAFF_COLORS.length];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current || !materialRef.current) return;

    if (cyclePhase === "fading") {
      // Fade out
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0, 0.05);
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0, 0.04));
      return;
    }

    if (t < appearTime) {
      meshRef.current.scale.set(0, 0, 0);
      meshRef.current.rotation.y = Math.PI / 2;
      return;
    }

    const age = t - appearTime;

    // Flip-in animation (Y rotation 90° → 0° + scale)
    const flipProgress = Math.min(age / 0.6, 1);
    const eased = 1 - Math.pow(1 - flipProgress, 3); // ease-out cubic
    meshRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI / 2, 0, eased);
    meshRef.current.scale.setScalar(eased);

    // Glow pulse
    if (cyclePhase === "glow") {
      materialRef.current.emissiveIntensity = 0.3 + Math.sin(t * 3) * 0.15;
    } else {
      const pulse = age < 1.2 ? Math.sin(age * 5) * 0.2 + 0.15 : 0.1;
      materialRef.current.emissiveIntensity = pulse;
    }

    materialRef.current.opacity = 0.82;
  });

  // Truncate service name to fit
  const displayName = slot.serviceName.length > 14
    ? slot.serviceName.substring(0, 13) + "…"
    : slot.serviceName;

  return (
    <group position={[x, y, 0.03]}>
      <RoundedBox
        ref={meshRef}
        args={[CELL_W - 0.06, slotH - 0.02, 0.06]}
        radius={0.025}
        scale={0}
      >
        <meshPhysicalMaterial
          ref={materialRef}
          color={staff.color}
          emissive={staff.color}
          emissiveIntensity={0.1}
          transparent
          opacity={0}
          roughness={0.2}
          metalness={0.15}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>
      {/* Service name label */}
      <Text
        position={[0, slotH > 0.5 ? 0.08 : 0, 0.06]}
        fontSize={0.065}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={CELL_W - 0.14}
        textAlign="center"
      >
        {displayName}
      </Text>
      {/* Staff name (for multi-row slots) */}
      {slot.span >= 2 && (
        <Text
          position={[0, -0.1, 0.06]}
          fontSize={0.05}
          color="#ffffffaa"
          anchorX="center"
          anchorY="middle"
        >
          {staff.name}
        </Text>
      )}
    </group>
  );
};

// ── Gridlines ───────────────────────────────────────────────────────
const GridLines = () => {
  const lines = useMemo(() => {
    const positions: [number, number, number][][] = [];
    // Horizontal lines
    for (let r = 0; r <= ROWS; r++) {
      const y = -(HEADER_H + r * (CELL_H + GAP_Y) - GRID_H / 2 - GAP_Y / 2);
      const x1 = LABEL_W - GRID_W / 2;
      const x2 = LABEL_W + GRID_W - GRID_W / 2 + GAP_X;
      positions.push([[x1, y, 0.01], [x2, y, 0.01]]);
    }
    // Vertical lines
    for (let c = 0; c <= COLS; c++) {
      const x = LABEL_W + c * (CELL_W + GAP_X) - GRID_W / 2 - GAP_X / 2;
      const y1 = GRID_H / 2;
      const y2 = -(HEADER_H + GRID_H);
      positions.push([[x, y1, 0.01], [x, y2, 0.01]]);
    }
    return positions;
  }, []);

  return (
    <>
      {lines.map((pair, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(
          pair.map(p => new THREE.Vector3(...p))
        );
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#3b2d5e" transparent opacity={0.25} />
          </line>
        );
      })}
    </>
  );
};

// ── Ground Reflection ───────────────────────────────────────────────
const GroundReflection = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -GRID_H / 2 - 1.2, 0]}>
    <planeGeometry args={[8, 4]} />
    <meshPhysicalMaterial
      color="#0a0612"
      transparent
      opacity={0.4}
      roughness={0.3}
      metalness={0.8}
    />
  </mesh>
);

// ── Main Calendar Group ─────────────────────────────────────────────
const CYCLE_FILL_DURATION = 8;
const CYCLE_GLOW_DURATION = 2.5;
const CYCLE_FADE_DURATION = 1.5;
const TOTAL_CYCLE = CYCLE_FILL_DURATION + CYCLE_GLOW_DURATION + CYCLE_FADE_DURATION;

const CalendarGrid = () => {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [cycle, setCycle] = useState(0);
  const lastCycleRef = useRef(0);

  const slots = useMemo(() => generateRealisticSlots(), [cycle]);

  const slotTimings = useMemo(() => {
    return slots.map((_, i) => 0.3 + i * (CYCLE_FILL_DURATION / (slots.length + 1)));
  }, [slots]);

  const [cyclePhase, setCyclePhase] = useState<"filling" | "glow" | "fading">("filling");

  // Mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const cycleTime = elapsed % TOTAL_CYCLE;

    // Determine phase
    if (cycleTime < CYCLE_FILL_DURATION) {
      if (cyclePhase !== "filling") setCyclePhase("filling");
    } else if (cycleTime < CYCLE_FILL_DURATION + CYCLE_GLOW_DURATION) {
      if (cyclePhase !== "glow") setCyclePhase("glow");
    } else {
      if (cyclePhase !== "fading") setCyclePhase("fading");
    }

    // Cycle reset
    const currentCycle = Math.floor(elapsed / TOTAL_CYCLE);
    if (currentCycle > lastCycleRef.current) {
      lastCycleRef.current = currentCycle;
      setCycle(c => c + 1);
    }

    // Mouse parallax
    const targetRotY = -0.2 + mouseRef.current.x * 0.06;
    const targetRotX = 0.22 + mouseRef.current.y * 0.04;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, targetRotY, 0.025
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, targetRotX, 0.025
      );
    }
  });

  // Grid cells
  const cells = useMemo(() => {
    const result = [];
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS; r++)
        result.push(<GridCell key={`cell-${c}-${r}`} col={c} row={r} />);
    return result;
  }, []);

  return (
    <Float speed={0.8} rotationIntensity={0.06} floatIntensity={0.4}>
      <group ref={groupRef} rotation={[0.22, -0.2, 0]} position={[0.6, -0.2, 0]}>
        {/* Day headers */}
        {DAYS.map((day, i) => (
          <DayHeader key={day} col={i} label={day} />
        ))}

        {/* Hour labels */}
        {HOURS.map((hour, i) => (
          <HourLabel key={hour} row={i} label={hour} />
        ))}

        {/* Grid lines */}
        <GridLines />

        {/* Background cells */}
        {cells}

        {/* Animated appointment slots */}
        {slots.map((slot, i) => (
          <AppointmentSlot
            key={`${cycle}-slot-${i}`}
            slot={slot}
            appearTime={slotTimings[i]}
            cyclePhase={cyclePhase}
          />
        ))}

        {/* Lighting */}
        <pointLight position={[0, 0, -1.5]} intensity={0.8} color="#7c3aed" distance={7} />
        <pointLight position={[2, 1, 1]} intensity={0.3} color="#d4769a" distance={5} />
        <pointLight position={[-1, -1, 1]} intensity={0.2} color="#c9a96e" distance={4} />
      </group>
    </Float>
  );
};

// ── Inner Scene ─────────────────────────────────────────────────────
const InnerScene = () => {
  const { viewport } = useThree();
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#e9d5ff" />
      <directionalLight position={[-3, -3, 2]} intensity={0.2} color="#f9a8d4" />

      <CalendarGrid />
      <GroundReflection />

      <Sparkles
        count={80}
        scale={viewport.width > 6 ? 10 : 6}
        size={1.2}
        speed={0.2}
        opacity={0.3}
        color="#a78bfa"
      />
    </>
  );
};

// ── Exported Component ──────────────────────────────────────────────
const Hero3DScene = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-70 md:opacity-100">
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 38 }}
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
