import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gallery, type GalleryItem } from "@/content/gallery";
import { publicPath, stars } from "@/content/packet";

type Room = { position: [number, number, number]; target: [number, number, number] };

const ROOMS: Record<string, Room> = {
  "/": { position: [0.2, 1.62, 2.05], target: [0.25, 2.2, -4.7] },
  "/need": { position: [11.2, 1.5, 1.3], target: [11.2, 1.7, -5.6] },
  "/stars": { position: [20.5, 1.5, 2.15], target: [20.5, 1.58, -4.85] },
  "/form": { position: [28.6, 1.45, 1.2], target: [28.6, 1.5, -5.3] },
  "/comparison": { position: [36.8, 1.55, 1.5], target: [36.8, 1.7, -5.6] },
  "/contact": { position: [44.2, 1.42, 1.2], target: [44.2, 1.45, -5.2] },
};

type PlateSpec = { src: string; title: string; detail: string; x: number; y: number; z: number; h: number; aspect: number };

const PLATES: PlateSpec[] = [
  { src: publicPath("/plates/set-wood.jpg"), title: "Wood wall", detail: "A set wall from the picture’s reference stills. Swap the plate in the scene list if this frame should be something else.", x: -4.35, y: 2.75, z: -4.45, h: 1.45, aspect: 370 / 477 },
  { src: publicPath("/plates/set-director.jpg"), title: "The director", detail: "A reference still of the director on the floor. It stays part of the room, and it opens like the other pieces.", x: -2.2, y: 2.9, z: -4.35, h: 1.4, aspect: 659 / 413 },
  { src: publicPath("/plates/set-chair.jpg"), title: "The chair", detail: "The empty chair from the set. This is the still behind the title while the room loads.", x: 0.15, y: 2.95, z: -4.2, h: 1.9, aspect: 618 / 573 },
  { src: publicPath("/plates/set-camera.jpg"), title: "The camera", detail: "The camera on the floor. A placeholder exhibit for the apparatus of the picture.", x: 2.2, y: 2.75, z: -4.35, h: 2.2, aspect: 412 / 764 },
  { src: publicPath("/plates/psycho-left.jpg"), title: "House, left", detail: "A tall still from the reference set. Edit the title and this note with the plate list.", x: 6.4, y: 1.9, z: -5.4, h: 3.4, aspect: 412 / 1400 },
  { src: publicPath("/plates/psycho-right.jpg"), title: "House, right", detail: "The matching tall still, hung beside the first.", x: 7.7, y: 1.9, z: -5.45, h: 3.4, aspect: 536 / 1400 },
  { src: publicPath("/plates/open-water.jpg"), title: "Open water", detail: "A wide still further down the room.", x: 11.2, y: 1.85, z: -5.7, h: 4.5, aspect: 1400 / 996 },
  { src: publicPath("/plates/diner-left.jpg"), title: "Diner, left", detail: "The left side of the diner set.", x: 27.15, y: 1.7, z: -5.2, h: 3.3, aspect: 424 / 1242 },
  { src: publicPath("/plates/diner-table.jpg"), title: "Diner table", detail: "The table, low on the wall.", x: 29.15, y: 0.85, z: -5.45, h: 1.55, aspect: 1153 / 510 },
  { src: publicPath("/plates/diner-right.jpg"), title: "Diner, right", detail: "The right side of the diner set.", x: 31.15, y: 1.85, z: -5.25, h: 3.1, aspect: 495 / 987 },
  { src: publicPath("/plates/archive.jpg"), title: "Archive", detail: "The archive wall. Registration and paper live near this stretch of the room.", x: 36.8, y: 1.75, z: -5.7, h: 4.3, aspect: 1400 / 963 },
  { src: publicPath("/plates/lot-left.jpg"), title: "The lot", detail: "The lot, left of the crew still.", x: 43.15, y: 1.7, z: -5.2, h: 2.4, aspect: 577 / 589 },
  { src: publicPath("/plates/lot-crew.jpg"), title: "The crew", detail: "The crew on the lot, at the far end of the room.", x: 45.05, y: 1.65, z: -5.4, h: 3.2, aspect: 576 / 955 },
];

const OBJECT_SPOTS: Record<string, [number, number]> = {
  "the-shape": [8.4, -2.55],
  mask: [11.35, -2.4],
  blade: [33.15, -2.45],
  registration: [47.5, -2.5],
};

export type Piece =
  | { id: string; kind: "plate"; title: string; credit: string; year: string; detail: string; image?: string }
  | ({ id: string; kind: GalleryItem["kind"]; title: string; credit: string; year: string; detail: string; image?: string });

const dragged = { moved: false, x: 0, y: 0 };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#16110d";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6; i++) {
    const x = i * 86;
    g.fillStyle = i % 2 === 0 ? "#221910" : "#1a140f";
    g.fillRect(x, 0, 84, 512);
    g.strokeStyle = "rgba(90, 62, 36, 0.18)";
    for (let y = 4; y < 512; y += 7) {
      g.beginPath();
      g.moveTo(x + 2, y);
      g.lineTo(x + 80, y + Math.sin(y * 0.05 + i) * 3);
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function curtainGeometry() {
  const geo = new THREE.PlaneGeometry(1.85, 6.4, 28, 48);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const ny = (y + 3.2) / 6.4;
    const gather = 0.22 + Math.sin(ny * Math.PI) * 0.78;
    pos.setZ(i, Math.sin(x * 7.4) * 0.075 * gather);
  }
  geo.computeVertexNormals();
  return geo;
}

function CameraRig() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { camera } = useThree();
  const reduced = useReducedMotion();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const dragging = useRef(false);
  const idle = useRef(0);
  const look = useRef(new THREE.Vector3(0.25, 2.2, -4.7));
  const scratch = useMemo(
    () => ({
      offset: new THREE.Vector3(),
      spherical: new THREE.Spherical(),
      desired: new THREE.Vector3(),
      target: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    const interactive = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest("a, button, input, textarea, select, label, summary, .gallery-dialog"));
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || interactive(event)) return;
      const target = event.target;
      if (event.pointerType === "touch" && target instanceof Element && target.closest(".dossier-panel, header")) return;
      dragging.current = true;
      dragged.moved = false;
      dragged.x = event.clientX;
      dragged.y = event.clientY;
      idle.current = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      document.documentElement.classList.add("is-looking");
      event.preventDefault();
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      if (Math.hypot(event.clientX - dragged.x, event.clientY - dragged.y) > 6) dragged.moved = true;
      yaw.current = THREE.MathUtils.clamp(yaw.current + (event.clientX - lastX) * 0.004, -0.9, 0.9);
      pitch.current = THREE.MathUtils.clamp(pitch.current + (event.clientY - lastY) * 0.003, -0.38, 0.38);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const up = () => {
      dragging.current = false;
      document.documentElement.classList.remove("is-looking");
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.documentElement.classList.remove("is-looking");
    };
  }, []);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const room = ROOMS[pathname] ?? ROOMS["/"];
    if (!dragging.current) idle.current += d;
    if (!dragging.current && idle.current > 1.6) {
      yaw.current = THREE.MathUtils.damp(yaw.current, 0, 1.3, d);
      pitch.current = THREE.MathUtils.damp(pitch.current, 0, 1.3, d);
    }
    const sway = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    const { offset, spherical, desired, target } = scratch;
    offset.set(room.position[0] - room.target[0], room.position[1] - room.target[1], room.position[2] - room.target[2]);
    spherical.setFromVector3(offset);
    const basePhi = spherical.phi;
    spherical.theta += yaw.current + sway;
    spherical.phi = THREE.MathUtils.clamp(basePhi + pitch.current, 0.4, 2.2);
    desired.setFromSpherical(spherical);
    target.set(room.target[0], room.target[1], room.target[2]);
    desired.add(target);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desired.x, 1.5, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desired.y, 1.5, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desired.z, 1.5, d);
    look.current.x = THREE.MathUtils.damp(look.current.x, target.x, 1.5, d);
    look.current.y = THREE.MathUtils.damp(look.current.y, target.y, 1.5, d);
    look.current.z = THREE.MathUtils.damp(look.current.z, target.z, 1.5, d);
    camera.lookAt(look.current);
  });

  return null;
}

function ImageLighting() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.28;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    return () => {
      env.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

const imageCache = new Map<string, THREE.Texture>();

function useImage(src?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(src ? (imageCache.get(src) ?? null) : null);
  useEffect(() => {
    if (!src) return;
    const cached = imageCache.get(src);
    if (cached) {
      setTex(cached);
      return;
    }
    let live = true;
    const loader = new THREE.TextureLoader();
    loader.load(src, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 8;
      loaded.needsUpdate = true;
      imageCache.set(src, loaded);
      if (live) setTex(loaded);
    });
    return () => {
      live = false;
    };
  }, [src]);
  return tex;
}

function Floor() {
  const tex = useMemo(() => woodTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[22, 0, -2]} receiveShadow>
      <planeGeometry args={[70, 16]} />
      <meshStandardMaterial map={tex} roughness={0.72} metalness={0.04} />
    </mesh>
  );
}

function Curtains() {
  const geo = useMemo(() => curtainGeometry(), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const panels = [];
  for (let i = 0; i < 28; i++) {
    panels.push(
      <mesh key={i} geometry={geo} position={[-4 + i * 1.9, 3.05, -6.35]} rotation={[0, 0, 0]}>
        <meshPhysicalMaterial color={i % 2 === 0 ? "#6d1824" : "#3d0e16"} roughness={0.84} sheen={1} sheenColor={i % 2 === 0 ? "#e7a0a4" : "#9a4048"} sheenRoughness={0.65} side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  return <group>{panels}</group>;
}

function Clickable({ id, onOpen, children }: { id: string; onOpen: (id: string) => void; children: React.ReactNode }) {
  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        if (dragged.moved) return;
        onOpen(id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {children}
    </group>
  );
}

function panelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#120f0c";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4; i++) {
    const x = 18 + i * 122;
    g.fillStyle = i % 2 === 0 ? "#1c1713" : "#16120f";
    g.fillRect(x, 36, 104, 420);
    g.strokeStyle = "rgba(90, 70, 48, 0.45)";
    g.strokeRect(x + 6, 48, 92, 392);
    g.beginPath();
    g.moveTo(x + 52, 48);
    g.lineTo(x + 52, 440);
    g.stroke();
  }
  g.fillStyle = "#2c261e";
  g.fillRect(0, 0, 512, 26);
  g.fillRect(0, 292, 512, 12);
  g.fillRect(0, 478, 512, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 1);
  return tex;
}

const STAGE = new Set(["set-chair.jpg", "set-director.jpg", "set-camera.jpg", "set-wood.jpg"]);

function HeroStage({ onOpen }: { onOpen: (id: string) => void }) {
  const panels = useMemo(() => panelTexture(), []);
  useEffect(() => () => panels.dispose(), [panels]);
  const byName = (name: string) => PLATES.find((plate) => plate.src.endsWith(name));
  const chair = byName("set-chair.jpg");
  const director = byName("set-director.jpg");
  const camera = byName("set-camera.jpg");
  const legs: [number, number][] = [
    [-0.26, -0.24],
    [0.26, -0.24],
    [-0.26, 0.22],
    [0.26, 0.22],
  ];

  return (
    <group>
      <mesh position={[0.2, 2.15, -4.9]}>
        <planeGeometry args={[8.4, 4.4]} />
        <meshStandardMaterial map={panels} roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh position={[-4.0, 2.15, -2.7]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 4.4]} />
        <meshStandardMaterial map={panels} roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh position={[0.2, 0.07, -4.84]}>
        <boxGeometry args={[8.4, 0.14, 0.06]} />
        <meshStandardMaterial color="#2a241c" roughness={0.55} />
      </mesh>
      {chair ? <Plate plate={{ ...chair, x: 0.45, y: 2.25, z: -4.82, h: 2.2, aspect: 618 / 573 }} onOpen={onOpen} /> : null}
      {director ? <Plate plate={{ ...director, x: -2.05, y: 2.55, z: -4.82, h: 1.2, aspect: 659 / 413 }} onOpen={onOpen} /> : null}
      {camera ? <Plate plate={{ ...camera, x: 2.45, y: 2.3, z: -4.82, h: 1.85, aspect: 412 / 764 }} onOpen={onOpen} /> : null}
      <group position={[1.05, 0, -2.15]}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.58, 0.07, 0.54]} />
          <meshStandardMaterial color="#1a1410" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.9, -0.24]}>
          <boxGeometry args={[0.58, 0.78, 0.07]} />
          <meshStandardMaterial color="#1a1410" roughness={0.5} />
        </mesh>
        {legs.map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.22, z]}>
            <boxGeometry args={[0.045, 0.44, 0.045]} />
            <meshStandardMaterial color="#2a241c" roughness={0.45} />
          </mesh>
        ))}
      </group>
      <group position={[-1.7, 0, -2.6]}>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.018, 0.022, 2.1, 8]} />
          <meshStandardMaterial color="#3a3428" metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.15, 0]}>
          <cylinderGeometry args={[0.16, 0.26, 0.32, 16]} />
          <meshStandardMaterial color="#e7c99a" emissive="#c47a32" emissiveIntensity={0.85} roughness={0.45} />
        </mesh>
        <pointLight position={[0, 2.05, 0.15]} color="#e7b56a" intensity={6} distance={6.5} decay={2} />
      </group>
    </group>
  );
}

function Plate({ plate, onOpen }: { plate: PlateSpec; onOpen: (id: string) => void }) {
  const tex = useImage(plate.src);
  const w = plate.h * plate.aspect;
  if (!tex) return null;
  return (
    <Clickable id={plate.src} onOpen={onOpen}>
      <group position={[plate.x, plate.y, plate.z]}>
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[w + 0.06, plate.h + 0.06, 0.04]} />
          <meshStandardMaterial color="#1a120e" roughness={0.5} metalness={0.15} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, plate.h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Clickable>
  );
}

function CatalogPiece({
  item,
  x,
  z = -3.15,
  onOpen,
}: {
  item: GalleryItem;
  x: number;
  z?: number;
  onOpen: (id: string) => void;
}) {
  const tex = useImage(item.image);
  if (item.kind === "sculpture") {
    return (
      <Clickable id={item.id} onOpen={onOpen}>
        <group position={[x, 0, z]}>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.7, 0.84, 0.7]} />
            <meshStandardMaterial color="#d9d0c4" roughness={0.55} />
          </mesh>
          {item.form === "mask" ? (
            <mesh position={[0, 1.32, 0]}>
              <sphereGeometry args={[0.32, 28, 20]} />
              <meshStandardMaterial color="#efeae2" roughness={0.35} />
            </mesh>
          ) : null}
          {item.form === "blade" ? (
            <mesh position={[0, 1.4, 0]} rotation={[0, 0, 0.12]}>
              <boxGeometry args={[0.05, 1.05, 0.16]} />
              <meshStandardMaterial color="#c5ccd2" metalness={0.8} roughness={0.2} />
            </mesh>
          ) : null}
          {item.form !== "mask" && item.form !== "blade" ? (
            <>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.85, 18]} />
                <meshStandardMaterial color="#1a1816" metalness={0.3} roughness={0.45} />
              </mesh>
              <mesh position={[0, 1.95, 0]}>
                <sphereGeometry args={[0.15, 20, 14]} />
                <meshStandardMaterial color="#1a1816" metalness={0.3} roughness={0.45} />
              </mesh>
            </>
          ) : null}
        </group>
      </Clickable>
    );
  }
  if (item.kind === "exhibit") {
    return (
      <Clickable id={item.id} onOpen={onOpen}>
        <group position={[x, 0, z]}>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.86, 0.72, 0.66]} />
            <meshStandardMaterial color="#2c261f" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.1, 0.02]}>
            <planeGeometry args={[0.48, 0.6]} />
            <meshStandardMaterial map={tex ?? undefined} color={tex ? "#ffffff" : "#4a433d"} />
          </mesh>
        </group>
      </Clickable>
    );
  }
  if (!tex) return null;
  return (
    <Clickable id={item.id} onOpen={onOpen}>
      <group position={[x, 1.62, z]}>
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[1.02, 1.36, 0.05]} />
          <meshStandardMaterial color="#1c140f" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.88, 1.2]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Clickable>
  );
}

function DynamicLights() {
  const lamp = useRef<THREE.PointLight>(null);
  const ember = useRef<THREE.PointLight>(null);
  const follow = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 2.1) * 0.08 + Math.sin(t * 6.7) * 0.04;
    if (lamp.current) {
      lamp.current.position.x = camera.position.x;
      lamp.current.intensity = 5.5 * flicker;
    }
    if (ember.current) {
      ember.current.position.x = camera.position.x - 1.4;
      ember.current.intensity = 1.6 + Math.sin(t * 1.3) * 0.7;
    }
    if (follow.current) {
      follow.current.position.set(camera.position.x, 3.15, 0.2);
      follow.current.intensity = 16 + Math.sin(t * 0.7) * 3;
      target.position.set(camera.position.x, 1.6, -5.1);
    }
  });

  return (
    <>
      <primitive object={target} />
      <pointLight ref={lamp} position={[0.4, 2.45, 0.35]} color="#e7b56a" distance={12} decay={2} />
      <pointLight ref={ember} position={[-1, 2.1, -4.2]} color="#c4232c" distance={7} decay={2} />
      <spotLight ref={follow} target={target} angle={0.62} penumbra={0.85} color="#f3e2c8" distance={14} />
      <pointLight position={[0.4, 2.3, -1]} color="#e7b56a" intensity={2.2} distance={8} />
      <pointLight position={[29, 2.3, -1]} color="#e7b56a" intensity={2.4} distance={9} />
      <pointLight position={[44, 2.2, -0.6]} color="#e7b56a" intensity={2} distance={8} />
    </>
  );
}

function Scene({ onOpen }: { onOpen: (id: string) => void }) {
  const portraits = stars.map((star) => ({
    id: star.name,
    kind: "painting" as const,
    title: star.name,
    credit: star.origin,
    year: "",
    detail: star.body,
    wall: "north" as const,
    along: 0,
    image: star.image,
  }));
  const objects = gallery.filter((item) => item.kind !== "painting");
  const portraitStart = 15.45;
  const portraitEnd = 25.55;
  const step = portraits.length > 1 ? (portraitEnd - portraitStart) / (portraits.length - 1) : 0;

  return (
    <>
      <fog attach="fog" args={["#090807", 14, 28]} />
      <ambientLight intensity={0.16} color="#f4ead7" />
      <DynamicLights />
      <ImageLighting />
      <CameraRig />
      <Floor />
      <Curtains />
      <HeroStage onOpen={onOpen} />
      {PLATES.filter((plate) => !STAGE.has(plate.src.slice(plate.src.lastIndexOf("/") + 1))).map((plate) => (
        <Plate key={plate.src} plate={plate} onOpen={onOpen} />
      ))}
      {portraits.map((item, index) => (
        <CatalogPiece key={item.id} item={item} x={portraitStart + step * index} z={-4.85} onOpen={onOpen} />
      ))}
      {objects.map((item) => {
        const spot = OBJECT_SPOTS[item.id] ?? [20, -2.5];
        return <CatalogPiece key={item.id} item={item} x={spot[0]} z={spot[1]} onOpen={onOpen} />;
      })}
    </>
  );
}

function Dialog({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="gallery-dialog" role="presentation" onClick={onClose}>
      <article className="gallery-card" role="dialog" aria-modal="true" aria-labelledby="gallery-title" onClick={(event) => event.stopPropagation()}>
        <p className="gallery-kicker">{piece.kind} · {piece.year}</p>
        <h2 id="gallery-title">{piece.title}</h2>
        <p className="gallery-credit">{piece.credit}</p>
        {piece.image ? <img src={piece.image} alt="" /> : null}
        <p>{piece.detail}</p>
        <button type="button" className="gallery-close" onClick={onClose}>Close</button>
      </article>
    </div>
  );
}

export default function LodgeCanvas() {
  const [openId, setOpenId] = useState<string | null>(null);
  const plate = PLATES.find((item) => item.src === openId);
  const star = stars.find((item) => item.name === openId);
  const extra = gallery.find((item) => item.id === openId);
  const piece: Piece | null = plate
    ? { id: plate.src, kind: "plate", title: plate.title, credit: "Room still", year: "Reference", detail: plate.detail, image: plate.src }
    : star
      ? { id: star.name, kind: "painting", title: star.name, credit: star.origin, year: "", detail: star.body, image: star.image }
      : extra
        ? { id: extra.id, kind: extra.kind, title: extra.title, credit: extra.credit, year: extra.year, detail: extra.detail, image: extra.image }
        : null;

  return (
    <>
      <Canvas className="lodge-canvas" camera={{ position: [0.2, 1.62, 2.05], fov: 42, near: 0.1, far: 60 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <Scene onOpen={setOpenId} />
      </Canvas>
      {piece ? createPortal(<Dialog piece={piece} onClose={() => setOpenId(null)} />, document.body) : null}
    </>
  );
}
